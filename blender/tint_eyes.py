"""Shift the cat's iris colour toward green, in texture space.

The model is one mesh with a single 2048^2 base-colour atlas, so the eyes are
pixels rather than a separate material. Selection is therefore spatial (the two
UV islands holding the eyes) intersected with a colour test, plus a soft radial
falloff so the edit blends instead of leaving a hard disc.

    blender --background blender/scenes/cat.blend \
            --python blender/tint_eyes.py -- blender/scenes/cat_green.blend
"""

import sys
from pathlib import Path

import bpy
import numpy as np

# --------------------------------------------------------------- tweak me --
TARGET_HUE = 0.20      # turns; 0.20 ~= 72deg, a green that still reads feline
SAT_BOOST = 1.25       # irises are pale; lift a little, not into neon
STRENGTH = 0.85        # 0..1 blend of the whole effect
IRIS_SAT_FLOOR = 0.22  # cream fur sits near 0.15, so this keeps green off it
# -----------------------------------------------------------------------------

# UV islands containing the eyes, as (x0, x1, y_top0, y_top1). Found by mapping
# amber/yellow-green candidate pixels across the atlas and clustering them.
EYE_REGIONS = [(1930, 2048, 840, 958), (40, 190, 1640, 1790)]

TEXTURE_DIR = Path(__file__).parent / "textures"


def rgb_to_hsv(rgb):
    mx = rgb.max(axis=-1); mn = rgb.min(axis=-1); d = mx - mn
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    hue = np.zeros_like(mx); nz = d > 1e-6
    ir = nz & (mx == r); ig = nz & (mx == g); ib = nz & (mx == b)
    hue[ir] = ((g - b)[ir] / d[ir]) % 6
    hue[ig] = ((b - r)[ig] / d[ig]) + 2
    hue[ib] = ((r - g)[ib] / d[ib]) + 4
    hue = (hue / 6.0) % 1.0
    sat = np.where(mx > 1e-6, d / np.maximum(mx, 1e-6), 0.0)
    return hue, sat, mx


def hsv_to_rgb(h, s, v):
    i = np.floor(h * 6.0)
    f = h * 6.0 - i
    p = v * (1.0 - s); q = v * (1.0 - f * s); t = v * (1.0 - (1.0 - f) * s)
    i = (i % 6).astype(np.int32)
    out = np.stack([
        np.select([i == 0, i == 1, i == 2, i == 3, i == 4, i == 5], [v, q, p, p, t, v]),
        np.select([i == 0, i == 1, i == 2, i == 3, i == 4, i == 5], [t, v, v, q, p, p]),
        np.select([i == 0, i == 1, i == 2, i == 3, i == 4, i == 5], [p, p, q, v, v, t]),
    ], axis=-1)
    return out


def iris_weight(hue, sat, val, shape):
    """Soft 0..1 mask over the iris within one eye region."""
    # Seed: unambiguously iris-coloured pixels.
    seed = (hue > 0.04) & (hue < 0.30) & (sat > 0.25) & (val > 0.25) & (val < 0.99)
    if not seed.any():
        return np.zeros(shape, dtype=np.float32)

    ys, xs = np.nonzero(seed)
    cy, cx = ys.mean(), xs.mean()
    dist = np.hypot(ys - cy, xs - cx)
    radius = float(np.percentile(dist, 92))

    yy, xx = np.mgrid[0:shape[0], 0:shape[1]]
    d = np.hypot(yy - cy, xx - cx) / max(radius, 1.0)
    radial = np.clip(1.0 - (d - 0.55) / 0.40, 0.0, 1.0)   # smooth edge past the iris
    radial = radial * radial * (3 - 2 * radial)            # smoothstep

    # Stay off the pupil (near-black), the specular highlight (near-white) and
    # the neutral fur, none of which should turn green.
    colour = ((sat > IRIS_SAT_FLOOR) & (val > 0.18) & (val < 0.97) &
              (hue > 0.0) & (hue < 0.34)).astype(np.float32)
    return (radial * colour).astype(np.float32)


def main():
    argv = sys.argv[sys.argv.index("--") + 1:]
    dst = Path(argv[0])
    target_hue = float(argv[1]) if len(argv) > 1 else TARGET_HUE
    sat_boost = float(argv[2]) if len(argv) > 2 else SAT_BOOST
    strength = float(argv[3]) if len(argv) > 3 else STRENGTH
    print(f"[tint] hue->{target_hue:.3f} ({target_hue*360:.0f}deg) "
          f"sat x{sat_boost} strength {strength}")

    img = bpy.data.images["base_color"]
    w, h = img.size
    buf = np.empty(w * h * 4, dtype=np.float32)
    img.pixels.foreach_get(buf)
    px = buf.reshape(h, w, 4)

    total = 0
    for x0, x1, t0, t1 in EYE_REGIONS:
        y0, y1 = h - t1, h - t0                     # atlas rows are bottom-up
        region = px[y0:y1, x0:x1, :3]
        hue, sat, val = rgb_to_hsv(region)

        weight = iris_weight(hue, sat, val, region.shape[:2]) * strength
        if not weight.any():
            print(f"[tint] WARNING no iris found in region x={x0}-{x1} y_top={t0}-{t1}")
            continue

        before = hue[weight > 0.5].mean()
        delta = (target_hue - before + 0.5) % 1.0 - 0.5   # shortest way round
        new_hue = (hue + delta * weight) % 1.0
        new_sat = np.clip(sat * (1.0 + (sat_boost - 1.0) * weight), 0.0, 1.0)

        px[y0:y1, x0:x1, :3] = hsv_to_rgb(new_hue, new_sat, val)
        after = rgb_to_hsv(px[y0:y1, x0:x1, :3])[0][weight > 0.5].mean()
        n = int((weight > 0.5).sum()); total += n
        print(f"[tint] region x={x0}-{x1}: {n} px, hue {before*360:.1f}deg -> {after*360:.1f}deg")

    TEXTURE_DIR.mkdir(parents=True, exist_ok=True)
    out_png = TEXTURE_DIR / "base_color_green.png"

    tinted = bpy.data.images.new("base_color_green", width=w, height=h)
    tinted.colorspace_settings.name = img.colorspace_settings.name
    tinted.pixels.foreach_set(px.reshape(-1))
    tinted.filepath_raw = str(out_png)
    tinted.file_format = "PNG"
    tinted.save()

    # Re-point the material at the edited atlas, then pack so the .blend is
    # self-contained like the original import was.
    for mat in bpy.data.materials:
        if not mat.use_nodes:
            continue
        for node in mat.node_tree.nodes:
            if node.type == "TEX_IMAGE" and node.image is img:
                node.image = bpy.data.images.load(str(out_png))
                node.image.colorspace_settings.name = img.colorspace_settings.name
                print(f"[tint] repointed {mat.name} -> {out_png.name}")

    bpy.ops.file.pack_all()
    bpy.ops.wm.save_as_mainfile(filepath=str(dst))
    print(f"[tint] {total} iris px tinted -> {dst}")


if __name__ == "__main__":
    main()
