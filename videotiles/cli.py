from pathlib import Path
import click
from videotiles.patterns import PATTERNS
from videotiles.encoder import encode_frames_to_webm


@click.group()
def cli() -> None:
    """VideoTiles CLI: Generate and encode synchronized recursive video map tiles."""


@cli.command("generate")
@click.option(
    "--pattern",
    "-p",
    type=click.Choice(list(PATTERNS.keys())),
    default="vortex",
    help="Recursive pattern name.",
)
@click.option("--frames", "-f", default=60, help="Total number of frames.")
@click.option("--size", "-s", default=256, help="Tile resolution in pixels.")
@click.option(
    "--output-dir",
    "-o",
    type=click.Path(path_type=Path),
    default=Path("output/frames"),
    help="Directory to save generated frames.",
)
def generate(pattern: str, frames: int, size: int, output_dir: Path) -> None:
    """Generate PNG frame sequence for a recursive pattern."""
    generator = PATTERNS[pattern]
    output_dir.mkdir(parents=True, exist_ok=True)

    click.echo(f"Generating {frames} frames for '{pattern}' in {output_dir}...")
    for frame_idx in range(frames):
        img = generator(frame=frame_idx, total_frames=frames, size=size)
        frame_file = output_dir / f"frame_{frame_idx:04d}.png"
        img.save(frame_file)

    click.echo(f"Successfully generated {frames} frames.")


@cli.command("encode")
@click.option(
    "--frames-dir",
    "-i",
    type=click.Path(path_type=Path),
    default=Path("output/frames"),
    help="Directory containing frame PNGs.",
)
@click.option(
    "--output-file",
    "-o",
    type=click.Path(path_type=Path),
    default=Path("output/tile.webm"),
    help="Output WebM file path.",
)
@click.option("--fps", default=30, help="Frames per second.")
def encode(frames_dir: Path, output_file: Path, fps: int) -> None:
    """Encode PNG frames into transparent VP9 WebM."""
    input_pattern = frames_dir / "frame_%04d.png"
    click.echo(f"Encoding {input_pattern} -> {output_file} at {fps} fps...")
    encode_frames_to_webm(input_pattern, output_file, fps=fps)
    click.echo(f"Successfully encoded: {output_file}")


def main() -> None:
    cli()


if __name__ == "__main__":
    main()
