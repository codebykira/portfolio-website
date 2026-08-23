"""Build the cat's armature, bind it, and author clips.

Bone names avoid dots on purpose: USD sanitises identifiers, so `ear.L` arrives
in SceneKit as `ear_L` and `childNode(withName: "ear.L")` returns nil. Blender
still recognises the _L/_R suffix for its mirror and symmetrize tools.

Bones follow the mesh's own back line, sampled from the geometry, rather than
being placed by eye.

    blender --background blender/scenes/cat_blink.blend \
            --python blender/rig_cat.py -- <out.blend>
"""

import sys
from pathlib import Path

import bpy
import numpy as np
from mathutils import Vector

BINS = 14


def world_coords(obj):
    n = len(obj.data.vertices)
    a = np.empty(n * 3, dtype=np.float32)
    obj.data.vertices.foreach_get("co", a)
    a = a.reshape(n, 3)
    m = np.array(obj.matrix_world.to_4x4(), dtype=np.float32)
    return a @ m[:3, :3].T + m[:3, 3]


def back_line(pts, y0, y1):
    """Centroid of the upper half of each Y slice — approximates the spine."""
    edges = np.linspace(y0, y1, BINS + 1)
    line = []
    for a, b in zip(edges, edges[1:]):
        sl = pts[(pts[:, 1] >= min(a, b)) & (pts[:, 1] < max(a, b))]
        if len(sl) < 8:
            continue
        upper = sl[sl[:, 2] > np.percentile(sl[:, 2], 55)]
        if not len(upper):
            continue
        line.append(Vector((0.0, float((a + b) / 2), float(upper[:, 2].mean()))))
    return line


def main():
    dst = Path(sys.argv[sys.argv.index("--") + 1:][0])
    body = bpy.data.objects["sculpt.001"]
    eyes = bpy.data.objects["Eye1"]

    pts = world_coords(body)
    head_y, tail_y = float(pts[:, 1].min()), float(pts[:, 1].max())
    top = float(pts[:, 2].max())
    eye_pts = world_coords(eyes)
    eye_y, eye_z = float(eye_pts[:, 1].mean()), float(eye_pts[:, 2].mean())
    print(f"[rig] head_y={head_y:.3f} tail_y={tail_y:.3f} top={top:.3f} eye=({eye_y:.3f},{eye_z:.3f})")

    line = back_line(pts, head_y, tail_y)
    print(f"[rig] back line sampled at {len(line)} points")

    def at(y):
        """Back-line height nearest a given Y."""
        return min(line, key=lambda p: abs(p.y - y))

    bpy.ops.object.armature_add(enter_editmode=True, location=(0, 0, 0))
    arm = bpy.context.object
    arm.name = "CatRig"
    eb = arm.data.edit_bones
    eb.remove(eb[0])

    def bone(name, head, tail, parent=None):
        b = eb.new(name)
        b.head, b.tail = Vector(head), Vector(tail)
        b.parent = parent
        b.use_connect = False
        return b

    # Spine runs tail-end -> shoulders, then neck -> head, then ears.
    hips_y = tail_y - (tail_y - head_y) * 0.22
    mid_y = (head_y + tail_y) / 2
    shoulder_y = head_y + (tail_y - head_y) * 0.28
    neck_y = head_y + (tail_y - head_y) * 0.14

    spine_01 = bone("spine_01", (0, hips_y, at(hips_y).z), (0, mid_y, at(mid_y).z))
    spine_02 = bone("spine_02", (0, mid_y, at(mid_y).z), (0, shoulder_y, at(shoulder_y).z), spine_01)
    neck = bone("neck", (0, shoulder_y, at(shoulder_y).z), (0, neck_y, eye_z + 0.012), spine_02)
    head = bone("head", (0, neck_y, eye_z + 0.012), (0, head_y + 0.01, eye_z + 0.004), neck)
    bone("ear_L", (0.016, eye_y + 0.022, top - 0.045), (0.024, eye_y + 0.020, top + 0.004), head)
    bone("ear_R", (-0.016, eye_y + 0.022, top - 0.045), (-0.024, eye_y + 0.020, top + 0.004), head)

    # Tail: three links from the hips back along the remaining body.
    prev, y = spine_01, hips_y
    step = (tail_y - hips_y) / 3.0
    for i in range(3):
        nxt_y = y + step
        prev = bone(f"tail_{i+1:02d}", (0, y, at(y).z), (0, nxt_y, at(nxt_y).z), prev)
        y = nxt_y

    bpy.ops.object.mode_set(mode="OBJECT")
    print(f"[rig] bones={[b.name for b in arm.data.bones]}")

    for obj in (body, eyes):
        bpy.ops.object.select_all(action="DESELECT")
        obj.select_set(True)
        arm.select_set(True)
        bpy.context.view_layer.objects.active = arm
        try:
            bpy.ops.object.parent_set(type="ARMATURE_AUTO")
            print(f"[rig] {obj.name}: automatic weights")
        except RuntimeError as exc:
            bpy.ops.object.parent_set(type="ARMATURE_ENVELOPE")
            print(f"[rig] {obj.name}: envelope fallback ({exc})")

    # Two clips, so multi-clip export can be tested in one file.
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="POSE")
    scene = bpy.context.scene

    def clip(name, frames, bone_name, axis):
        arm.animation_data_clear()
        action = bpy.data.actions.new(name)
        arm.animation_data_create()
        arm.animation_data.action = action
        pb = arm.pose.bones[bone_name]
        pb.rotation_mode = "XYZ"
        for frame, angle in frames:
            scene.frame_set(frame)
            setattr(pb.rotation_euler, axis, angle)
            pb.keyframe_insert(data_path="rotation_euler", frame=frame)
        action.use_fake_user = True
        return action

    scene.frame_start, scene.frame_end = 1, 24
    nod = clip("nod", ((1, 0.0), (10, -0.30), (24, 0.0)), "head", "x")
    flick = clip("tail_flick", ((1, 0.0), (8, 0.45), (16, -0.35), (24, 0.0)), "tail_01", "y")

    # Stack both as NLA strips; USD may only carry one, which is the thing to find out.
    arm.animation_data.action = None
    for i, action in enumerate((nod, flick)):
        track = arm.animation_data.nla_tracks.new()
        track.name = action.name
        track.strips.new(action.name, 1, action)
    bpy.ops.object.mode_set(mode="OBJECT")
    print(f"[rig] actions={[a.name for a in bpy.data.actions]} "
          f"nla={[t.name for t in arm.animation_data.nla_tracks]}")

    bpy.ops.wm.save_as_mainfile(filepath=str(dst))
    print(f"[rig] -> {dst}")


if __name__ == "__main__":
    main()
