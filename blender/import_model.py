"""Import a model file (glb/gltf/fbx/obj) and cache it as a .blend.

Re-parsing a large GLB on every render is slow, so this runs once:

    blender --background --python blender/import_model.py -- <model> <out.blend>
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

import bpy  # noqa: E402

IMPORTERS = {
    ".glb": lambda p: bpy.ops.import_scene.gltf(filepath=p),
    ".gltf": lambda p: bpy.ops.import_scene.gltf(filepath=p),
    ".fbx": lambda p: bpy.ops.import_scene.fbx(filepath=p),
    ".obj": lambda p: bpy.ops.wm.obj_import(filepath=p),
}


def main():
    argv = sys.argv[sys.argv.index("--") + 1:]
    src, dst = Path(argv[0]), Path(argv[1])

    suffix = src.suffix.lower()
    if suffix not in IMPORTERS:
        raise SystemExit(f"no importer for {suffix}; have {sorted(IMPORTERS)}")

    bpy.ops.wm.read_factory_settings(use_empty=True)
    IMPORTERS[suffix](str(src))

    # Textures live inside the .glb container, so pack them into the .blend or
    # they vanish the moment the original file moves.
    bpy.ops.file.pack_all()

    dst.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(dst))
    print(f"[import] {src.name} -> {dst}")


if __name__ == "__main__":
    main()
