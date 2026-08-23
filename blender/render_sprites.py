"""Render the cat as transparent-background sprites for the 'claude cat' app.

    blender --background blender/scenes/cat_green.blend \
            --python blender/render_sprites.py -- blender/out/sprites

Each entry names an asset in the app's catalog and the camera view used for it.
Heights match the original hand-drawn sprites, because CatArt.swift scales every
pose against a shared `referenceHeight`, so changing pixel heights would silently
change how big each pose draws on screen.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

import bpy  # noqa: E402
import numpy as np  # noqa: E402
import lib  # noqa: E402

RES = 1400          # render square, then crop to the alpha bounds
SAMPLES = 96

# name, (orbit angle, distance x radius, height as fraction of model, target), height
SPRITES = [
    ("CatStand",      (-55, 2.9,  0.92, "body"), 1176),
    ("CatSleep",      (-95, 2.7,  0.12, "body"),  660),
    ("CatPlay",       (-20, 2.9,  0.72, "body"),  358),
    ("CatKnead",      (-60, 1.75, 1.00, "body"),  581),
    ("CatKneadL",     (-67, 1.75, 1.00, "body"),  581),
    ("CatKneadR",     (-53, 1.75, 1.00, "body"),  581),
    ("CatMeow",       (-60, 2.15, 0.00, "head"),  406),
    ("CatMeowClosed", (-60, 2.30, 0.00, "head"),  406),
    ("CatMeowMid",    (-60, 2.22, 0.00, "head"),  406),
]


def place_camera(scene, angle, dist_factor, height_frac, target):
    import math
    from mathutils import Vector

    objects = lib.mesh_objects(scene)
    lo, hi = lib.world_bounds(objects)
    centre = (lo + hi) / 2.0
    radius = max((hi - lo).length / 2.0, 1e-3)

    if target == "head":
        aim = lib.head_point(scene)
        reach = radius * 0.42
    else:
        aim = centre
        reach = radius

    focus = scene.objects.get("Focus")
    if focus is not None:
        focus.location = aim

    rad = math.radians(angle)
    dist = reach * dist_factor
    z = lo.z + (hi.z - lo.z) * height_frac if target == "body" else aim.z + reach * 0.25
    scene.camera.location = Vector((aim.x + dist * math.cos(rad),
                                    aim.y + dist * math.sin(rad), z))


def crop_to_alpha(path, pad=6):
    """Trim transparent margins so each sprite is tight, like the originals."""
    img = bpy.data.images.load(str(path))
    w, h = img.size
    buf = np.empty(w * h * 4, dtype=np.float32)
    img.pixels.foreach_get(buf)
    px = buf.reshape(h, w, 4)

    ys, xs = np.nonzero(px[:, :, 3] > 0.02)
    if not len(ys):
        raise RuntimeError(f"{path.name} rendered fully transparent")
    y0, y1 = max(0, ys.min() - pad), min(h, ys.max() + 1 + pad)
    x0, x1 = max(0, xs.min() - pad), min(w, xs.max() + 1 + pad)
    crop = px[y0:y1, x0:x1]

    out = bpy.data.images.new(path.stem + "_crop", width=crop.shape[1],
                              height=crop.shape[0], alpha=True)
    out.alpha_mode = "STRAIGHT"
    out.pixels.foreach_set(crop.reshape(-1))
    out.filepath_raw = str(path)
    out.file_format = "PNG"
    out.save()
    bpy.data.images.remove(img)
    bpy.data.images.remove(out)
    return crop.shape[1], crop.shape[0]


def main():
    out_dir = Path(sys.argv[sys.argv.index("--") + 1:][0])
    out_dir.mkdir(parents=True, exist_ok=True)

    scene = bpy.context.scene
    # No ground and no world: a sprite must composite over the menu bar.
    lib.stage(scene, add_ground=False)
    lib.setup_render(scene, width=RES, height=RES, transparent=True)
    lib.use_preview(scene, percent=100, samples=SAMPLES)

    for name, view, target_h in SPRITES:
        place_camera(scene, *view)
        path = out_dir / f"{name}.png"
        lib.render_to(scene, path)
        w, h = crop_to_alpha(path)
        print(f"[sprite] {name}: cropped {w}x{h} -> resample to h={target_h}")


if __name__ == "__main__":
    main()
