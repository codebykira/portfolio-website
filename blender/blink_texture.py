"""Bake an eyes-closed variant of the cat's base-colour atlas.

The Meshy model is one merged mesh with the eyes painted into the texture —
there is no eyeball geometry, so a shape key cannot close them. The blink is
therefore a second texture, swapped in at runtime.

Same algorithm that worked on the sprite: find the green iris, fit an ellipse
over it, clone skin from above the socket, and darken a lid seam.

    blender --background blender/scenes/cat_meshy_lite.blend \
            --python blender/blink_texture.py -- <out.png>
"""

import sys
from pathlib import Path

import bpy
import numpy as np

# Eye islands in the 2048^2 atlas, as (x0, x1, y_top0, y_top1). Found by mapping
# saturated yellow-green pixels across the atlas and clustering them.
EYE_REGIONS = [(1930, 2048, 840, 958), (40, 190, 1640, 1790)]
CREASE_DARKEN = 0.55


def base_colour_image():
    for mat in bpy.data.materials:
        if not mat.use_nodes:
            continue
        for link in mat.node_tree.links:
            if (link.to_node.type == "BSDF_PRINCIPLED"
                    and link.to_socket.name == "Base Color"
                    and link.from_node.type == "TEX_IMAGE"):
                return link.from_node.image
    raise RuntimeError("no image driving Base Color")


def hsv(rgb):
    mx = rgb.max(axis=-1); mn = rgb.min(axis=-1); d = mx - mn
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    hue = np.zeros_like(mx); nz = d > 1e-6
    ir = nz & (mx == r); ig = nz & (mx == g); ib = nz & (mx == b)
    hue[ir] = ((g - b)[ir] / d[ir]) % 6
    hue[ig] = ((b - r)[ig] / d[ig]) + 2
    hue[ib] = ((r - g)[ib] / d[ib]) + 4
    return (hue / 6.0) % 1.0, np.where(mx > 1e-6, d / np.maximum(mx, 1e-6), 0.0), mx


def smooth(a, iters):
    for _ in range(iters):
        a = (a + np.roll(a, 1, 0) + np.roll(a, -1, 0)
               + np.roll(a, 1, 1) + np.roll(a, -1, 1)) / 5.0
    return a


def main():
    out = Path(sys.argv[sys.argv.index("--") + 1:][0])
    img = base_colour_image()
    w, h = img.size
    print(f"[blink] atlas {img.name} {w}x{h}")

    buf = np.empty(w * h * 4, dtype=np.float32)
    img.pixels.foreach_get(buf)
    px = buf.reshape(h, w, 4)

    for x0, x1, t0, t1 in EYE_REGIONS:
        y0, y1 = h - t1, h - t0
        region = px[y0:y1, x0:x1, :3]
        hue, sat, val = hsv(region)

        # The tinted irises sit in a narrow green band; a wider gate also picks
        # up warm fur, which is not green at all, just yellow-leaning.
        iris = (hue > 0.15) & (hue < 0.30) & (sat > 0.22) & (val > 0.15)
        if iris.sum() < 30:
            print(f"[blink] WARNING only {int(iris.sum())} iris px in x={x0}-{x1}")
            continue

        ys, xs = np.nonzero(iris)
        cy, cx = ys.mean(), xs.mean()
        # Grow an ellipse over the whole socket: the hue gate only catches the
        # saturated core, not the pale rim or the lid around it.
        ew = max((xs.max() - xs.min() + 1) / 2.0 * 1.55, 4.0)
        eh = max((ys.max() - ys.min() + 1) / 2.0 * 1.5, 4.0)

        yy, xx = np.mgrid[0:region.shape[0], 0:region.shape[1]]
        r = np.sqrt(((xx - cx) / ew) ** 2 + ((yy - cy) / eh) ** 2)
        mask = smooth(np.clip((1.12 - r) / 0.28, 0.0, 1.0), 2)

        # No positional clone here. The atlas is a shredded patchwork, so there
        # is no anatomical "above" to copy from — and np.roll wraps, which on a
        # crop this small copies the eye straight back onto itself.
        # Instead: take the skin colour from the ring around the socket and keep
        # the local fur grain so the lid does not read as a flat patch.
        ring = (r > 1.15) & (r < 1.9)
        if ring.sum() < 40:
            ring = r > 1.05
        skin = region[ring].mean(axis=0)

        detail = region - smooth(region.copy(), 6)
        fill = np.clip(skin[None, None, :] + detail * 0.6, 0.0, 1.0)

        crease = np.exp(-((yy - cy) ** 2) / (2 * max(eh * 0.20, 1.0) ** 2))
        lid = fill * (1.0 - (crease * mask)[..., None] * (1.0 - CREASE_DARKEN))

        m = mask[..., None]
        px[y0:y1, x0:x1, :3] = region * (1 - m) + lid * m
        print(f"[blink] closed eye x={x0}-{x1}: {int(iris.sum())} iris px, "
              f"ellipse {ew*2:.0f}x{eh*2:.0f}, skin from {int(ring.sum())} ring px "
              f"rgb {skin.round(3)}")

    closed = bpy.data.images.new("base_color_blink", width=w, height=h)
    closed.colorspace_settings.name = img.colorspace_settings.name
    closed.pixels.foreach_set(px.reshape(-1))
    closed.filepath_raw = str(out)
    closed.file_format = "PNG"
    closed.save()
    print(f"[blink] -> {out}")


if __name__ == "__main__":
    main()
