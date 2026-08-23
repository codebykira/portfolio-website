"""Give the Meshy cat ear bones so the ears can flick.

Only the ears need bones: the blink is a texture swap (this mesh has no eyeball
geometry), and breathing/sway are root transforms. A `root` bone holds the rest
of the body so automatic weights do not smear ear influence across the cat.

    blender --background blender/scenes/cat_meshy_lite.blend \
            --python blender/rig_meshy_ears.py -- <out.glb>
"""

import sys
from pathlib import Path

import bpy
import numpy as np
from mathutils import Vector

EAR_TOP_FRACTION = 0.88     # ears are the topmost geometry on a sitting cat


def world_coords(obj):
    n = len(obj.data.vertices)
    a = np.empty(n * 3, dtype=np.float32)
    obj.data.vertices.foreach_get("co", a)
    a = a.reshape(n, 3)
    m = np.array(obj.matrix_world.to_4x4(), dtype=np.float32)
    return a @ m[:3, :3].T + m[:3, 3]


def main():
    out = Path(sys.argv[sys.argv.index("--") + 1:][0])
    body = max((o for o in bpy.data.objects if o.type == "MESH"),
               key=lambda o: len(o.data.vertices))
    pts = world_coords(body)
    lo, hi = pts.min(axis=0), pts.max(axis=0)
    print(f"[ears] body={body.name} bounds lo={lo.round(3)} hi={hi.round(3)}")

    cut = lo[2] + (hi[2] - lo[2]) * EAR_TOP_FRACTION
    top = pts[pts[:, 2] >= cut]
    mid_x = (lo[0] + hi[0]) / 2
    left, right = top[top[:, 0] > mid_x], top[top[:, 0] < mid_x]
    print(f"[ears] top slice above z={cut:.3f}: {len(top)} verts "
          f"(L={len(left)} R={len(right)})")
    if len(left) < 20 or len(right) < 20:
        raise RuntimeError("could not separate the two ears")

    lc, rc = left.mean(axis=0), right.mean(axis=0)
    base_z = cut - (hi[2] - lo[2]) * 0.06
    print(f"[ears] ear_L centre={lc.round(3)} ear_R centre={rc.round(3)}")

    bpy.ops.object.armature_add(enter_editmode=True, location=(0, 0, 0))
    arm = bpy.context.object
    arm.name = "CatRig"
    eb = arm.data.edit_bones
    eb.remove(eb[0])

    root = eb.new("root")
    root.head = Vector((0.0, float((lo[1] + hi[1]) / 2), float(lo[2])))
    root.tail = Vector((0.0, float((lo[1] + hi[1]) / 2), float(base_z)))

    for name, c in (("ear_L", lc), ("ear_R", rc)):
        b = eb.new(name)
        b.head = Vector((float(c[0]), float(c[1]), float(base_z)))
        b.tail = Vector((float(c[0]), float(c[1]), float(hi[2])))
        b.parent = root
        b.use_connect = False

    bpy.ops.object.mode_set(mode="OBJECT")
    print(f"[ears] bones={[b.name for b in arm.data.bones]}")

    bpy.ops.object.select_all(action="DESELECT")
    body.select_set(True)
    arm.select_set(True)
    bpy.context.view_layer.objects.active = arm
    try:
        bpy.ops.object.parent_set(type="ARMATURE_AUTO")
        print("[ears] automatic weights")
    except RuntimeError as exc:
        bpy.ops.object.parent_set(type="ARMATURE_ENVELOPE")
        print(f"[ears] envelope fallback ({exc})")

    for img in bpy.data.images:
        if img.size[0] > 1024:
            img.scale(1024, 1024)

    bpy.ops.export_scene.gltf(filepath=str(out), export_format="GLB",
                              export_materials="EXPORT", export_apply=False,
                              export_skins=True, export_animations=False)
    print(f"[ears] exported {out}")


if __name__ == "__main__":
    main()
