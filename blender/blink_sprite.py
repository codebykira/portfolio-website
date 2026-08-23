"""Paint the eyes shut on a rendered sprite, producing its blink frame.

Doing this in the render rather than the UV atlas: the sprite is upright and the
eyes are two obvious clusters, so the edit can be seen and checked directly. The
mesh has no rig, so this is the only way to close the lids.

    blender --background --python blender/blink_sprite.py -- <in.png> <out.png>
"""

import sys
from pathlib import Path

import bpy
import numpy as np

CREASE_DARKEN = 0.55     # lid seam, relative to the cloned skin
EYE_GAP = 25             # px gap that separates the two eye clusters


def load(path):
    img = bpy.data.images.load(str(path))
    w, h = img.size
    buf = np.empty(w * h * 4, dtype=np.float32)
    img.pixels.foreach_get(buf)
    bpy.data.images.remove(img)
    return buf.reshape(h, w, 4)


def save(px, path):
    h, w = px.shape[:2]
    out = bpy.data.images.new(Path(path).stem, width=w, height=h, alpha=True)
    out.alpha_mode = "STRAIGHT"
    out.pixels.foreach_set(px.reshape(-1))
    out.filepath_raw = str(path)
    out.file_format = "PNG"
    out.save()
    bpy.data.images.remove(out)


def hsv(rgb):
    mx = rgb.max(axis=-1); mn = rgb.min(axis=-1); d = mx - mn
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    hue = np.zeros_like(mx); nz = d > 1e-6
    ir = nz & (mx == r); ig = nz & (mx == g); ib = nz & (mx == b)
    hue[ir] = ((g - b)[ir] / d[ir]) % 6
    hue[ig] = ((b - r)[ig] / d[ig]) + 2
    hue[ib] = ((r - g)[ib] / d[ib]) + 4
    return (hue / 6.0) % 1.0, np.where(mx > 1e-6, d / np.maximum(mx, 1e-6), 0.0), mx


def span_fill(mask):
    out = mask.copy()
    for i in range(out.shape[0]):
        idx = np.nonzero(out[i])[0]
        if len(idx):
            out[i, idx[0]:idx[-1] + 1] = True
    return out


def smooth(a, iters):
    for _ in range(iters):
        a = (a + np.roll(a, 1, 0) + np.roll(a, -1, 0)
               + np.roll(a, 1, 1) + np.roll(a, -1, 1)) / 5.0
    return a


def eye_clusters(mask):
    """Split the green pixels into left/right eyes on the horizontal gap."""
    cols = np.nonzero(mask.any(axis=0))[0]
    if not len(cols):
        return []
    groups, start = [], cols[0]
    for a, b in zip(cols, cols[1:]):
        if b - a > EYE_GAP:
            groups.append((start, a)); start = b
    groups.append((start, cols[-1]))
    return groups


def main():
    argv = sys.argv[sys.argv.index("--") + 1:]
    src, dst = Path(argv[0]), Path(argv[1])

    px = load(src)
    rgb, alpha = px[:, :, :3], px[:, :, 3]
    hue, sat, val = hsv(rgb)

    # Measured from the render: the tinted irises sit in a narrow band at
    # hue 0.16-0.22. A wider gate also catches warm key-lit fur across the whole
    # body, which is not green at all -- it just leans yellow.
    green = (hue > 0.15) & (hue < 0.24) & (sat > 0.22) & (alpha > 0.5)
    print(f"[blink] {int(green.sum())} iris px found")
    if green.sum() < 20:
        raise RuntimeError("no green iris pixels found in sprite")

    for x0, x1 in eye_clusters(green):
        band = np.zeros_like(green)
        band[:, x0:x1 + 1] = green[:, x0:x1 + 1]
        ys = np.nonzero(band.any(axis=1))[0]
        y0, y1 = ys.min(), ys.max()

        # The hue gate only catches the saturated core of the iris; the pale rim
        # and the lid around it fall outside it. So take the detected cluster as
        # a seed and cover the whole socket with an ellipse grown around it.
        cx, cy = (x0 + x1) / 2.0, (y0 + y1) / 2.0
        ew = (x1 - x0 + 1) / 2.0 * 1.5
        eh = (y1 - y0 + 1) / 2.0 * 1.45

        yy, xx = np.mgrid[0:rgb.shape[0], 0:rgb.shape[1]]
        r = np.sqrt(((xx - cx) / ew) ** 2 + ((yy - cy) / eh) ** 2)
        mask = np.clip((1.12 - r) / 0.28, 0.0, 1.0)
        mask = smooth(mask, 2) * (alpha > 0.5)

        # Clone fur from above the socket, then seat it with a lid seam.
        offset = int(eh * 2.6)
        clone = np.roll(rgb, -offset, axis=0) * 0.97

        crease = np.exp(-((yy - cy) ** 2) / (2 * max(eh * 0.22, 1.0) ** 2))
        lid = clone * (1.0 - (crease * mask)[..., None] * (1.0 - CREASE_DARKEN))

        m = mask[..., None]
        rgb[:] = rgb * (1 - m) + lid * m
        print(f"[blink]   eye x={x0}-{x1} y={y0}-{y1} "
              f"ellipse {ew*2:.0f}x{eh*2:.0f} cloned from {offset}px above")

    px[:, :, :3] = rgb
    save(px, dst)
    print(f"[blink] -> {dst}")


if __name__ == "__main__":
    main()
