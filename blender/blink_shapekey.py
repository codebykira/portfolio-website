"""Add a 'blink' shape key that closes the eyelids over the eyeballs.

The eyeballs are a separate mesh, so the lid geometry lives on the body. This
collapses the socket opening vertically toward the eye centre and nudges it
forward, which reads as a closed lid.

    blender --background blender/scenes/cat_kit.blend \
            --python blender/blink_shapekey.py -- <out.blend>
"""

import sys
from pathlib import Path

import bpy
import numpy as np
from mathutils import Vector

REACH = 2.4          # lid region, in eye radii
CLOSE = 1.0          # how far lid verts travel toward the eye centre line
FORWARD = 0.42       # nudge along the face normal so the lid clears the eyeball,
                     # which otherwise pokes through as a green slit


def world_coords(obj):
    n = len(obj.data.vertices)
    a = np.empty(n * 3, dtype=np.float32)
    obj.data.vertices.foreach_get("co", a)
    a = a.reshape(n, 3)
    m = np.array(obj.matrix_world.to_4x4(), dtype=np.float32)
    return a @ m[:3, :3].T + m[:3, 3]


def eye_centres(eyes):
    pts = world_coords(eyes)
    out = []
    for side in (pts[pts[:, 0] > 0], pts[pts[:, 0] < 0]):
        if len(side):
            c = side.mean(axis=0)
            r = float(np.linalg.norm(side - c, axis=1).max())
            out.append((Vector(c.tolist()), r))
    return out


def main():
    dst = Path(sys.argv[sys.argv.index("--") + 1:][0])
    body = bpy.data.objects["sculpt.001"]
    eyes = bpy.data.objects["Eye1"]

    centres = eye_centres(eyes)
    print(f"[blink] eyes: {[(tuple(round(v,4) for v in c), round(r,4)) for c, r in centres]}")

    if body.data.shape_keys is None:
        body.shape_key_add(name="Basis", from_mix=False)
    key = body.shape_key_add(name="blink", from_mix=False)

    inv = body.matrix_world.inverted()
    moved = 0
    for centre, radius in centres:
        local_c = inv @ centre
        reach = radius * REACH
        # Head faces -Y, so "forward" out of the face is -Y.
        for i, v in enumerate(key.data):
            d = (v.co - local_c).length
            if d >= reach:
                continue
            w = 1.0 - d / reach
            w = w * w * (3 - 2 * w)              # smoothstep
            v.co.z += (local_c.z - v.co.z) * CLOSE * w
            v.co.y -= radius * FORWARD * w
            moved += 1
    print(f"[blink] moved {moved} lid vertices")

    key.value = 0.0
    bpy.ops.wm.save_as_mainfile(filepath=str(dst))
    print(f"[blink] -> {dst}")


if __name__ == "__main__":
    main()
