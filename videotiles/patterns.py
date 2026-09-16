from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw


def _draw_single_vortex(
    draw: ImageDraw.ImageDraw,
    cx: float,
    cy: float,
    radius: float,
    angle: float,
    spin: int,
    opacity: float,
    scale: int,
) -> None:
    """Draw a single glowing 2-arm spiral vortex with alpha transparency."""
    if opacity <= 0.001 or radius <= 1.0:
        return

    # 2 graceful spiral arms (180 degrees apart)
    for arm in range(2):
        arm_offset = arm * np.pi
        pts = []
        steps = 50
        for s in range(steps + 1):
            frac = s / steps
            r = frac * radius
            theta = (angle * spin) + arm_offset + (frac * 2.0 * spin)
            px = cx + r * np.cos(theta)
            py = cy + r * np.sin(theta)
            pts.append((px, py))

        # Glowing outer stream
        alpha_outer = int(np.clip(140 * opacity, 0, 255))
        draw.line(pts, fill=(0, 210, 255, alpha_outer), width=int(4 * scale))

        # Bright inner core stream
        alpha_inner = int(np.clip(220 * opacity, 0, 255))
        draw.line(pts, fill=(180, 245, 255, alpha_inner), width=int(2 * scale))

    # Glowing center core
    core_r = max(2.0, radius * 0.04)
    alpha_glow = int(np.clip(80 * opacity, 0, 255))
    alpha_core = int(np.clip(255 * opacity, 0, 255))

    draw.ellipse(
        [cx - core_r * 2, cy - core_r * 2, cx + core_r * 2, cy + core_r * 2],
        fill=(0, 210, 255, alpha_glow),
    )
    draw.ellipse(
        [cx - core_r, cy - core_r, cx + core_r, cy + core_r],
        fill=(220, 250, 255, alpha_core),
    )


def generate_vortex_transition_frame(
    frame: int, total_frames: int, size: int = 512
) -> Image.Image:
    """Generate a video frame capturing the smooth zoom transition from 1 tile into 4 child tiles.
    
    t: 0.0 (zoom z) -> 1.0 (zoom z+1).
    At t=0: 1 central vortex of radius 0.38 * size.
    At t=1: 4 daughter vortices positioned at quadrant centers with radius 0.19 * size (matching child tiles).
    """
    scale = 2
    render_size = size * scale
    img = Image.new("RGBA", (render_size, render_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    t = frame / max(1, total_frames - 1)
    # Smoothstep interpolation
    tau = t * t * (3 - 2 * t)
    angle = tau * 2 * np.pi

    r_parent = render_size * 0.38
    r_child = render_size * 0.19

    # Early exit for the exact start state: single parent vortex
    if tau <= 0.001:
        _draw_single_vortex(
            draw,
            cx=render_size * 0.5,
            cy=render_size * 0.5,
            radius=r_parent,
            angle=0.0,
            spin=1,
            opacity=1.0,
            scale=scale,
        )
        return img.resize((size, size), Image.Resampling.LANCZOS)

    # If tau < 0.4, fade out parent vortex
    if tau < 0.4:
        parent_opacity = (0.4 - tau) / 0.4
        _draw_single_vortex(
            draw,
            cx=render_size * 0.5,
            cy=render_size * 0.5,
            radius=(1 - tau) * r_parent,
            angle=angle,
            spin=1,
            opacity=parent_opacity,
            scale=scale,
        )

    # 4 daughter vortices splitting into quadrants
    for qx in range(2):
        for qy in range(2):
            target_x = (qx + 0.5) * (render_size / 2)
            target_y = (qy + 0.5) * (render_size / 2)

            cx = (1 - tau) * (render_size * 0.5) + tau * target_x
            cy = (1 - tau) * (render_size * 0.5) + tau * target_y
            radius = (1 - tau) * r_parent * 0.7 + tau * r_child

            spin = 1 if (qx + qy) % 2 == 0 else -1
            child_opacity = min(1.0, 0.4 + 0.6 * tau)

            _draw_single_vortex(
                draw,
                cx=cx,
                cy=cy,
                radius=radius,
                angle=angle,
                spin=spin,
                opacity=child_opacity,
                scale=scale,
            )

    return img.resize((size, size), Image.Resampling.LANCZOS)


PATTERNS = {
    "vortex": generate_vortex_transition_frame,
}
