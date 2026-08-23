"""Throwaway rig, purely to test whether USDZ carries skeleton + shape keys.

Anatomy is not the point here: the point is to find out if bones, a named
action and a blend shape survive Blender -> USDZ -> SceneKit before any real
weight-painting time is spent.

    blender --background blender/scenes/cat_kit.blend --python blender/rig_probe.py -- <out.usdz>
"""

import sys
from pathlib import Path

import bpy
from mathutils import Vector

BONES = ["spine", "neck", "head", "ear.L", "ear.R", "tail.001", "tail.002", "tail.003"]


def body_and_eyes():
    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    body = max(meshes, key=lambda o: len(o.data.vertices))
    eyes = next((o for o in meshes if o is not body), None)
    return body, eyes


def main():
    out = Path(sys.argv[sys.argv.index("--") + 1:][0])
    body, eyes = body_and_eyes()
    print(f"[rig] body={body.name} eyes={eyes.name if eyes else None}")

    lo = Vector((min(( body.matrix_world @ v.co)[i] for v in body.data.vertices) for i in range(3)))
    hi = Vector((max(( body.matrix_world @ v.co)[i] for v in body.data.vertices) for i in range(3)))
    print(f"[rig] bounds lo={tuple(round(v,3) for v in lo)} hi={tuple(round(v,3) for v in hi)}")

    # Head end = whichever end of the long axis the eyes sit nearer.
    mid_y = (lo.y + hi.y) / 2
    head_y = hi.y
    if eyes is not None:
        ec = sum((eyes.matrix_world @ v.co for v in eyes.data.vertices), Vector()) / len(eyes.data.vertices)
        head_y = hi.y if ec.y > mid_y else lo.y
    tail_y = lo.y if head_y == hi.y else hi.y
    sign = 1.0 if head_y > tail_y else -1.0
    top = hi.z
    print(f"[rig] head_y={head_y:.3f} tail_y={tail_y:.3f}")

    bpy.ops.object.armature_add(enter_editmode=True, location=(0, 0, 0))
    arm = bpy.context.object
    arm.name = "CatRig"
    eb = arm.data.edit_bones
    eb.remove(eb[0])   # drop the default bone

    def bone(name, head, tail, parent=None):
        b = eb.new(name)
        b.head, b.tail = Vector(head), Vector(tail)
        if parent is not None:
            b.parent, b.use_connect = parent, False
        return b

    spine = bone("spine", (0, tail_y + sign * 0.10, top * 0.55), (0, mid_y, top * 0.6))
    neck = bone("neck", (0, mid_y, top * 0.6), (0, mid_y + sign * 0.10, top * 0.72), spine)
    head = bone("head", (0, mid_y + sign * 0.10, top * 0.72), (0, head_y, top * 0.78), neck)
    bone("ear.L", (0.02, head_y - sign * 0.03, top * 0.86), (0.03, head_y - sign * 0.03, top * 1.0), head)
    bone("ear.R", (-0.02, head_y - sign * 0.03, top * 0.86), (-0.03, head_y - sign * 0.03, top * 1.0), head)

    prev, y = spine, tail_y + sign * 0.10
    step = (tail_y - y) / 3.0
    for i in range(3):
        nxt = bone(f"tail.{i+1:03d}", (0, y, top * 0.55), (0, y + step, top * 0.55 + 0.01 * i), prev)
        prev, y = nxt, y + step

    bpy.ops.object.mode_set(mode="OBJECT")
    print(f"[rig] bones={[b.name for b in arm.data.bones]}")

    # Bind the mesh. Heat weighting fails on some meshes; envelopes still prove
    # transport, which is all this probe needs.
    for obj in (body, eyes):
        if obj is None:
            continue
        bpy.ops.object.select_all(action="DESELECT")
        obj.select_set(True)
        arm.select_set(True)
        bpy.context.view_layer.objects.active = arm
        try:
            bpy.ops.object.parent_set(type="ARMATURE_AUTO")
            print(f"[rig] {obj.name}: automatic weights")
        except RuntimeError as e:
            bpy.ops.object.parent_set(type="ARMATURE_ENVELOPE")
            print(f"[rig] {obj.name}: envelope weights ({e})")

    # A blend shape named 'blink'. Geometry is arbitrary; the name is the test.
    target = eyes if eyes is not None else body
    target.shape_key_add(name="Basis", from_mix=False)
    blink = target.shape_key_add(name="blink", from_mix=False)
    for v in blink.data:
        v.co.z -= 0.004
    print(f"[rig] shape keys on {target.name}: {[k.name for k in target.data.shape_keys.key_blocks]}")

    # A short named action so there is animation to look for.
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="POSE")
    pb = arm.pose.bones["head"]
    pb.rotation_mode = "XYZ"
    scene = bpy.context.scene
    scene.frame_start, scene.frame_end = 1, 24
    for frame, angle in ((1, 0.0), (12, -0.35), (24, 0.0)):
        scene.frame_set(frame)
        pb.rotation_euler.x = angle
        pb.keyframe_insert(data_path="rotation_euler", frame=frame)
    if arm.animation_data and arm.animation_data.action:
        arm.animation_data.action.name = "nod"
    bpy.ops.object.mode_set(mode="OBJECT")
    print(f"[rig] actions={[a.name for a in bpy.data.actions]}")

    bpy.ops.wm.usd_export(filepath=str(out), export_materials=True,
                          export_textures_mode='NEW', relative_paths=False,
                          usdz_downscale_size='1024',
                          export_animation=True, export_armatures=True,
                          export_shapekeys=True)
    print(f"[rig] exported {out}")


if __name__ == "__main__":
    main()
