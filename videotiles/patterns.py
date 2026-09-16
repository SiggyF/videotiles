from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw


def generate_vortex_frame(frame: int, total_frames: int, size: int = 256) -> Image.Image:
    """Generate a single frame of the calm vortex cascade with alpha transparency."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    base_angle = (frame / total_frames) * 2 * np.pi
    cx, cy = size / 2, size / 2
    max_r = size * 0.38

    # 2 graceful spiral arms
    for arm in range(2):
        arm_offset = arm * np.pi
        pts = []
        steps = 30
        for s in range(steps + 1):
            frac = s / steps
            r = frac * max_r
            theta = base_angle + arm_offset + frac * 2.0
            px = cx + r * np.cos(theta)
            py = cy + r * np.sin(theta)
            pts.append((px, py))

        draw.line(pts, fill=(0, 210, 255, 120), width=2)

    # Core
    draw.ellipse([cx - 3, cy - 3, cx + 3, cy + 3], fill=(200, 245, 255, 220))

    return img


PATTERNS = {
    "vortex": generate_vortex_frame,
}
