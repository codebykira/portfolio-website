"""The playground scene. Tweak PARAMS, re-render, look. That is the whole loop.

    ./blender/render.sh                        # fast EEVEE preview
    ./blender/render.sh final                  # full-res Cycles
    ./blender/render.sh preview scenes/cat.blend   # stage an imported model
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

import bpy  # noqa: E402
import lib  # noqa: E402

# ---------------------------------------------------------------- tweak me --
PARAMS = {
    "shape": "cube",           # cube | sphere | torus | monkey
    "base_color": (0.85, 0.35, 0.18),
    "metallic": 0.85,
    "roughness": 0.25,
    "ground_color": (0.05, 0.05, 0.06),
    "rim_color": (0.25, 0.5, 1.0),
    "key_energy": 900.0,
    "fill_energy": 220.0,
    "rim_energy": 700.0,
    "world_color": (0.02, 0.02, 0.03),
    "camera": (7.0, -7.0, 4.5),
}
# -----------------------------------------------------------------------------

OUT = Path(__file__).parent / "out"

# Orbit framing for the hand-built scene; staged .blend files compute their own.
FRAMING = {"center": (0.0, 0.0, 1.2), "radius": 9.5, "height": 4.5}


def add_hero(scene, shape):
    """One hero object, rounded and smooth-shaded so the lighting reads."""
    builders = {
        "cube": lambda: bpy.ops.mesh.primitive_cube_add(size=2.0),
        "sphere": lambda: bpy.ops.mesh.primitive_ico_sphere_add(radius=1.4, subdivisions=3),
        "torus": lambda: bpy.ops.mesh.primitive_torus_add(major_radius=1.4, minor_radius=0.5),
        "monkey": lambda: bpy.ops.mesh.primitive_monkey_add(size=2.4),
    }
    if shape not in builders:
        raise ValueError(f"unknown shape {shape!r}; pick one of {sorted(builders)}")

    builders[shape]()
    hero = bpy.context.active_object
    hero.name = "Hero"
    hero.location = (0.0, 0.0, 1.4)

    if shape == "cube":
        bevel = hero.modifiers.new("Bevel", "BEVEL")
        bevel.width = 0.12
        bevel.segments = 4
    subsurf = hero.modifiers.new("Subsurf", "SUBSURF")
    subsurf.levels = 2
    subsurf.render_levels = 2

    bpy.ops.object.shade_smooth()
    hero.data.materials.append(
        lib.principled("Hero", PARAMS["base_color"], PARAMS["metallic"], PARAMS["roughness"])
    )
    return hero


def add_ground(scene):
    bpy.ops.mesh.primitive_plane_add(size=40.0)
    ground = bpy.context.active_object
    ground.name = "Ground"
    ground.data.materials.append(lib.principled("Ground", PARAMS["ground_color"], 0.0, 0.4))
    return ground


def build():
    scene = lib.reset_scene()
    lib.setup_render(scene)
    lib.set_world(scene, PARAMS["world_color"])

    # Everything aims at this empty, so re-framing means moving one object.
    focus = bpy.data.objects.new("Focus", None)
    focus.location = (0.0, 0.0, 1.2)
    scene.collection.objects.link(focus)

    add_ground(scene)
    add_hero(scene, PARAMS["shape"])

    lib.add_area_light(scene, "Key", (5.0, -4.0, 7.0), PARAMS["key_energy"], size=6.0)
    lib.add_area_light(scene, "Fill", (-6.0, -3.0, 3.0), PARAMS["fill_energy"], size=8.0)
    lib.add_area_light(
        scene, "Rim", (-3.0, 5.0, 5.0), PARAMS["rim_energy"], size=4.0, color=PARAMS["rim_color"]
    )

    lib.add_camera(scene, focus, PARAMS["camera"])
    return scene


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    blend = next((a for a in argv if a.endswith(".blend")), None)
    return {"final": "final" in argv, "blend": blend, "portrait": "portrait" in argv}


def build_or_load(blend=None, portrait=False):
    """Either build the playground scene or stage a model from a .blend."""
    if blend is None:
        return build(), dict(FRAMING)

    scene = lib.open_blend(blend)
    lib.setup_render(scene)
    framing = lib.stage(scene, ground_color=PARAMS["ground_color"],
                        rim_color=PARAMS["rim_color"])
    if portrait:
        framing = lib.frame_portrait(scene)
    return scene, framing


def main():
    args = parse_args()
    final = args["final"]

    scene, _ = build_or_load(args["blend"], portrait=args["portrait"])
    stem = Path(args["blend"]).stem + "_" if args["blend"] else ""
    if args["portrait"]:
        stem += "portrait_"
    if final:
        lib.use_final(scene)
        out = OUT / f"{stem}final.png"
    else:
        lib.use_preview(scene)
        out = OUT / f"{stem}render.png"

    lib.render_to(scene, out)
    print(f"\n[playground] wrote {out}")


if __name__ == "__main__":
    main()
