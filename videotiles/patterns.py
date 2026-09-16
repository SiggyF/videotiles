from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw


def generate_vortex_frame(frame: int, total_frames: int, size: int = 256) -> Image.Image:
    """Generate a single frame of the 2x2 vortex cascade with alpha transparency."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    phase = (frame / total_frames) * 2 * np.pi
    num_rings = 5
    quad_size = size // 2
    max_r = quad_size // 2

    for qx in range(2):
        for qy in range(2):
            cx = int((qx + 0.5) * quad_size)
            cy = int((qy + 0.5) * quad_size)
            spin = 1 if (qx + qy) % 2 == 0 else -1

            for r in range(1, num_rings + 1):
                radius = int((r / num_rings) * max_r * 0.95)
                color = (0, 180 + r * 15, 255, int(40 + (r / num_rings) * 160))
                draw.ellipse(
                    [cx - radius, cy - radius, cx + radius, cy + radius],
                    outline=color,
                    width=2,
                )

            # Core
            draw.ellipse([cx - 3, cy - 3, cx + 3, cy + 3], fill=(0, 255, 220, 220))

    return img


def generate_river_frame(frame: int, total_frames: int, size: int = 256) -> Image.Image:
    """Generate a single frame of the branching river network with alpha transparency."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    mid = size * 0.5

    # 1. Main North-South river: (0.5, 0) -> (0.5, 1)
    draw.line([(mid, 0), (mid, size)], fill=(0, 180, 216, 230), width=5)

    # 2. Tributaries from West (0, 0.5) and East (1, 0.5) merging into (0.5, 0.6)
    draw.line([(0, mid), (mid * 0.6, mid * 1.1), (mid, size * 0.6)], fill=(72, 202, 228, 210), width=3)
    draw.line([(size, mid), (size - mid * 0.6, mid * 1.1), (mid, size * 0.6)], fill=(72, 202, 228, 210), width=3)

    # 3. Moving water pulse markers along the main river
    pulse_y = int((frame / total_frames) * size)
    draw.ellipse([mid - 4, pulse_y - 4, mid + 4, pulse_y + 4], fill=(202, 240, 248, 255))

    return img


def generate_hilbert_frame(frame: int, total_frames: int, size: int = 256) -> Image.Image:
    """Generate a single frame of the space-filling Hilbert curve."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    order = 3
    n = 1 << order
    total_pts = n * n
    step = size / n

    pts = []
    for i in range(total_pts):
        # Hilbert coordinate
        rx, ry, s, t = 0, 0, 1, i
        x, y = 0, 0
        while s < n:
            rx = 1 & (t // 2)
            ry = 1 & (t ^ rx)
            if ry == 0:
                if rx == 1:
                    x = s - 1 - x
                    y = s - 1 - y
                x, y = y, x
            x += s * rx
            y += s * ry
            t //= 4
            s *= 2
        pts.append(((x + 0.5) * step, (y + 0.5) * step))

    # Base curve
    draw.line(pts, fill=(120, 80, 220, 90), width=2)

    # Animated traveling pulse
    pulse_idx = int((frame / total_frames) * total_pts) % total_pts
    px, py = pts[pulse_idx]
    draw.ellipse([px - 6, py - 6, px + 6, py + 6], fill=(0, 255, 200, 240))

    return img


def generate_truchet_frame(frame: int, total_frames: int, size: int = 256) -> Image.Image:
    """Generate a single frame of the Truchet flow arcs."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    r = size // 2

    # Draw two opposing arcs
    draw.arc([-r, -r, r, r], start=0, end=90, fill=(255, 50, 100, 220), width=4)
    draw.arc([r, r, size + r, size + r], start=180, end=270, fill=(255, 50, 100, 220), width=4)

    # Pulsing marker
    angle = (frame / total_frames) * (np.pi / 2)
    px = int(r * np.cos(angle))
    py = int(r * np.sin(angle))
    draw.ellipse([px - 4, py - 4, px + 4, py + 4], fill=(255, 220, 230, 255))

    return img


PATTERNS = {
    "vortex": generate_vortex_frame,
    "river": generate_river_frame,
    "hilbert": generate_hilbert_frame,
    "truchet": generate_truchet_frame,
}
