"""Shared helpers for the Blender playground.

Imported by the entry scripts (scene.py, sheet.py) which Blender runs via
`blender --background --python <script>`.
"""

import math

import bpy
import numpy as np

# Blender renamed the EEVEE engine identifier across versions (4.2 shipped
# BLENDER_EEVEE_NEXT, 5.x folded it back into BLENDER_EEVEE), so try each name
# rather than hardcoding one.
EEVEE_CANDIDATES = ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE")


def set_engine(scene, candidates):
    """Assign the first engine this build accepts.

    `render.engine` is a *dynamic* enum: introspecting it via bl_rna reports
    only the static items and omits add-on engines like Cycles. Assignment is
    the only reliable probe.
    """
    for name in candidates:
        try:
            scene.render.engine = name
            return name
        except TypeError:
            continue
    raise RuntimeError(f"this Blender accepts none of {candidates}")


def enable_gpu(scene):
    """Point Cycles at the GPU. Silently stays on CPU when unavailable."""
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
        for backend in ("METAL", "OPTIX", "CUDA", "HIP", "ONEAPI"):
            try:
                prefs.compute_device_type = backend
            except TypeError:
                continue
            prefs.get_devices()
            if any(d.type == backend for d in prefs.devices):
                for device in prefs.devices:
                    device.use = device.type == backend
                scene.cycles.device = "GPU"
                return backend
        return None
    except (KeyError, AttributeError):
        return None


def reset_scene():
    """Empty the default scene so scripts always start from the same state."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    return bpy.context.scene


def use_preview(scene, percent=25, samples=16):
    """Fast look: EEVEE at quarter res. Seconds, not minutes."""
    set_engine(scene, EEVEE_CANDIDATES)
    scene.render.resolution_percentage = percent
    scene.eevee.taa_render_samples = samples


def use_final(scene, percent=100, samples=256):
    """Slow look: Cycles at full res, GPU when the build supports it."""
    set_engine(scene, ("CYCLES",))
    scene.render.resolution_percentage = percent
    scene.cycles.samples = samples
    enable_gpu(scene)


def setup_render(scene, width=1920, height=1080, transparent=False):
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    scene.render.image_settings.file_format = "PNG"
    scene.render.film_transparent = transparent


def add_camera(scene, target, location=(7.0, -7.0, 4.5)):
    """Camera that always aims at `target`, so moving it never breaks framing."""
    cam_data = bpy.data.cameras.new("Camera")
    cam = bpy.data.objects.new("Camera", cam_data)
    cam.location = location
    scene.collection.objects.link(cam)
    scene.camera = cam

    track = cam.constraints.new(type="TRACK_TO")
    track.target = target
    track.track_axis = "TRACK_NEGATIVE_Z"
    track.up_axis = "UP_Y"
    return cam


def orbit_camera(cam, angle_deg, radius, height, center=(0.0, 0.0, 0.0)):
    """Place the camera on a circle around `center`."""
    angle = math.radians(angle_deg)
    cam.location = (center[0] + radius * math.cos(angle),
                    center[1] + radius * math.sin(angle),
                    height)


def add_area_light(scene, name, location, energy, size=5.0, color=(1.0, 1.0, 1.0)):
    data = bpy.data.lights.new(name, type="AREA")
    data.energy = energy
    data.size = size
    data.color = color
    light = bpy.data.objects.new(name, data)
    light.location = location
    scene.collection.objects.link(light)

    target = bpy.data.objects.get("Focus")
    if target is not None:
        track = light.constraints.new(type="TRACK_TO")
        track.target = target
        track.track_axis = "TRACK_NEGATIVE_Z"
        track.up_axis = "UP_Y"
    return light


def set_world(scene, color=(0.02, 0.02, 0.03), strength=1.0):
    world = bpy.data.worlds.new("World")
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (*color, 1.0)
    bg.inputs["Strength"].default_value = strength
    scene.world = world
    return world


def principled(name, base_color, metallic=0.0, roughness=0.5):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*base_color, 1.0)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    return mat


def render_to(scene, path):
    scene.render.filepath = str(path)
    bpy.ops.render.render(write_still=True)
    return path


def contact_sheet(paths, out_path, cols=2):
    """Tile rendered frames into one grid PNG.

    A single still hides 3D form; four angles side by side do not. numpy ships
    with Blender, so this needs no external image library.
    """
    tiles = []
    for path in paths:
        img = bpy.data.images.load(str(path))
        w, h = img.size
        buf = np.empty(w * h * 4, dtype=np.float32)
        img.pixels.foreach_get(buf)
        tiles.append(buf.reshape(h, w, 4))
        bpy.data.images.remove(img)

    rows = [np.hstack(tiles[i:i + cols]) for i in range(0, len(tiles), cols)]
    # Blender stores pixels bottom-up, so stack rows in reverse to read top-down.
    grid = np.vstack(list(reversed(rows)))

    sheet = bpy.data.images.new("sheet", width=grid.shape[1], height=grid.shape[0])
    sheet.pixels.foreach_set(grid.reshape(-1))
    sheet.filepath_raw = str(out_path)
    sheet.file_format = "PNG"
    sheet.save()
    bpy.data.images.remove(sheet)
    return out_path


# --- staging an existing .blend ------------------------------------------
# Asset-library models arrive at arbitrary scale, position and orientation, so
# the shot rig has to be derived from the geometry rather than hardcoded.

def open_blend(path):
    bpy.ops.wm.open_mainfile(filepath=str(path))
    return bpy.context.scene


def mesh_objects(scene):
    """Renderable meshes belonging to the model.

    Objects staged in by this module (the ground plane) are tagged and excluded,
    otherwise re-measuring after staging picks up the huge backdrop and throws
    every framing calculation off by orders of magnitude.
    """
    return [o for o in scene.objects
            if o.type == "MESH" and not o.hide_render and not o.get("staged_prop")]


def world_bounds(objects):
    """Axis-aligned bounds of `objects` in world space."""
    from mathutils import Vector

    lo = Vector((float("inf"),) * 3)
    hi = Vector((float("-inf"),) * 3)
    for obj in objects:
        for corner in obj.bound_box:
            point = obj.matrix_world @ Vector(corner)
            for axis in range(3):
                lo[axis] = min(lo[axis], point[axis])
                hi[axis] = max(hi[axis], point[axis])
    return lo, hi


def add_ground_plane(scene, center, radius, z, color):
    # Large enough that the plane edge never crosses the horizon at any
    # orbit angle; the camera only ever sits ~3x radius away.
    bpy.ops.mesh.primitive_plane_add(size=radius * 200.0, location=(center.x, center.y, z))
    ground = bpy.context.active_object
    ground.name = "Ground"
    ground["staged_prop"] = True
    ground.data.materials.append(principled("Ground", color, 0.0, 0.4))
    return ground


def stage(scene, ground_color=(0.05, 0.05, 0.06), rim_color=(0.25, 0.5, 1.0),
          add_ground=True, relight=None):
    """Give an imported model a camera, a focus target and (usually) lights.

    Returns the framing dict that sheet.py orbits with. Lighting is left alone
    when the file already ships its own, since asset authors usually lit it.
    """
    objects = mesh_objects(scene)
    if not objects:
        raise RuntimeError("no renderable mesh objects in this .blend")

    lo, hi = world_bounds(objects)
    center = (lo + hi) / 2.0
    radius = max((hi - lo).length / 2.0, 1e-3)

    focus = bpy.data.objects.new("Focus", None)
    focus.location = center
    scene.collection.objects.link(focus)

    if add_ground:
        add_ground_plane(scene, center, radius, lo.z, ground_color)

    # Inverse-square falloff: energy tuned for the default scene has to grow
    # with the square of the distance once the rig scales up to the model.
    scale = radius / 1.4
    if relight is None:
        relight = not any(o.type == "LIGHT" for o in scene.objects)
    if relight:
        power = scale ** 2
        add_area_light(scene, "Key", center + _v(5, -4, 6) * scale, 900 * power, 6 * scale)
        add_area_light(scene, "Fill", center + _v(-6, -3, 2) * scale, 220 * power, 8 * scale)
        add_area_light(scene, "Rim", center + _v(-3, 5, 4) * scale,
                       700 * power, 4 * scale, rim_color)

    if scene.world is None:
        set_world(scene)

    distance = radius * 3.2
    height = center.z + radius * 1.1
    cam = add_camera(scene, focus, (center.x + distance * 0.7,
                                    center.y - distance * 0.7, height))
    scene.camera = cam

    return {"center": tuple(center), "radius": distance, "height": height}


def _v(x, y, z):
    from mathutils import Vector

    return Vector((float(x), float(y), float(z)))


def head_point(scene, top_fraction=0.18):
    """Centroid of the highest slice of geometry -- a decent 'head' guess.

    Framing a portrait off the bounding-box top alone puts the camera on empty
    air when the head is off-centre, so use the actual vertices up there.
    """
    from mathutils import Vector

    objects = mesh_objects(scene)
    lo, hi = world_bounds(objects)
    cutoff = hi.z - (hi.z - lo.z) * top_fraction

    total = np.zeros(3, dtype=np.float64)
    count = 0
    for obj in objects:
        n = len(obj.data.vertices)
        if not n:
            continue
        co = np.empty(n * 3, dtype=np.float32)
        obj.data.vertices.foreach_get("co", co)
        co = co.reshape(n, 3)

        m = np.array(obj.matrix_world.to_4x4()).astype(np.float32)
        world = co @ m[:3, :3].T + m[:3, 3]

        top = world[world[:, 2] >= cutoff]
        if len(top):
            total += top.sum(axis=0)
            count += len(top)

    if not count:
        return Vector(((lo.x + hi.x) / 2, (lo.y + hi.y) / 2, hi.z))
    return Vector((total / count).tolist())


def frame_portrait(scene, tightness=1.9):
    """Re-aim the existing rig at the head for a close portrait."""
    objects = mesh_objects(scene)
    lo, hi = world_bounds(objects)
    head = head_point(scene)
    span = (hi - lo).length
    reach = span * 0.16 * tightness

    focus = scene.objects.get("Focus")
    if focus is not None:
        focus.location = head

    distance = reach * 3.0
    if scene.camera is not None:
        scene.camera.location = (head.x + distance * 0.62,
                                 head.y - distance * 0.62,
                                 head.z + reach * 0.35)
    return {"center": tuple(head), "radius": distance, "height": head.z + reach * 0.35}
