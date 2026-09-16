from pathlib import Path
import subprocess


def encode_frames_to_webm(
    input_pattern: Path,
    output_path: Path,
    fps: int = 30,
    crf: int = 15,
) -> None:
    """Encode a sequence of PNG frames into transparent VP9 WebM.
    
    Strictly applies fail-fast: raises CalledProcessError if FFmpeg fails.
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)

    cmd = [
        "ffmpeg",
        "-y",
        "-framerate", str(fps),
        "-i", str(input_pattern),
        "-c:v", "libvpx-vp9",
        "-pix_fmt", "yuva420p",
        "-crf", str(crf),
        "-b:v", "0",
        "-auto-alt-ref", "0",
        str(output_path),
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"FFmpeg encoding failed:\n{result.stderr}")
