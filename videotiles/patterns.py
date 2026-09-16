from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw


def generate_vortex_frame(frame: int, total_frames: int, size: int = 512) -> Image.Image:
    """Generate a single frame of the calm vortex with 2x supersampling for antialiasing."""
    # 2x supersampling for high-quality antialiased lines
    scale = 2
    render_size = size * scale
    img = Image.new("RGBA", (render_size, render_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    base_angle = (frame / total_frames) * 2 * np.pi
    cx, cy = render_size / 2, render_size / 2
    max_r = render_size * 0.38

    # 2 graceful spiral arms (180 degrees apart)
    for arm in range(2):
        arm_offset = arm * np.pi
        pts = []
        steps = 60
        for s in range(steps + 1):
            frac = s / steps
            r = frac * max_r
            theta = base_angle + arm_offset + frac * 2.0
            px = cx + r * np.cos(theta)
            py = cy + r * np.sin(theta)
            pts.append((px, py))

        # Glowing outer stream
        draw.line(pts, fill=(0, 210, 255, 140), width=4 * scale)
        # Bright inner core stream
        draw.line(pts, fill=(180, 245, 255, 220), width=2 * scale)

    # Glowing center core
    core_r = 4 * scale
    draw.ellipse(
        [cx - core_r * 2, cy - core_r * 2, cx + core_r * 2, cy + core_r * 2],
        fill=(0, 210, 255, 80),
    )
    draw.ellipse(
        [cx - core_r, cy - core_r, cx + core_r, cy + core_r],
        fill=(220, 250, 255, 255),
    )

    # Downsample to target size with Lanczos filter for smooth edges
    return img.resize((size, size), Image.Resampling.LANCZOS)


PATTERNS = {
    "vortex": generate_vortex_frame,
}
