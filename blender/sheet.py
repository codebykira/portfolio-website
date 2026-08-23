"""Turntable contact sheet: four angles of the same scene in one PNG.

A single still hides 3D form -- you cannot tell a bevel from a texture, and
"great from camera, broken from the side" costs the most iterations. Four
angles in one image kills that class of bug in a single look.

    ./blender/render.sh sheet
    ./blender/render.sh sheet scenes/cat.blend
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

import lib  # noqa: E402
import scene as playground  # noqa: E402

ANGLES = (-135, -45, 45, 135)
OUT = Path(__file__).parent / "out"


def main():
    args = playground.parse_args()
    scene, framing = playground.build_or_load(args["blend"], portrait=args["portrait"])
    lib.use_preview(scene)

    stem = Path(args["blend"]).stem + "_" if args["blend"] else ""
    frames = []
    for i, angle in enumerate(ANGLES):
        lib.orbit_camera(scene.camera, angle, framing["radius"],
                         framing["height"], framing["center"])
        frames.append(lib.render_to(scene, OUT / f"{stem}angle_{i}.png"))
        print(f"[sheet] angle {angle}deg -> {frames[-1]}")

    out = lib.contact_sheet(frames, OUT / f"{stem}sheet.png", cols=2)
    print(f"\n[sheet] wrote {out}")


if __name__ == "__main__":
    main()
