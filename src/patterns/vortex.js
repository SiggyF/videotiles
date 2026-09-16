// 1. Vortex Cascade (Hardware-accelerated WebCodecs Video Tiles)
// Rendert rechtstreeks de frames uit de vooraf gerenderde VP9 WebM video ('tiles/vortex.webm').
// Bij inzoomen (t: 0 -> 1) splitst de centrale video zich via mitose in 4 kwadrant-videotegels.

export function drawVortex(ctx, pNW, width, height, tile, frame, totalFrames, morphT = 0, decoder = null) {
  const t = morphT * morphT * (3 - 2 * morphT); // Smoothstep

  ctx.save();
  ctx.translate(pNW.x, pNW.y);

  // Bepaal de wervelposities
  const centers = [];
  if (t < 0.05) {
    // 1 enkele centrale videotile
    centers.push({
      cx: width * 0.5,
      cy: height * 0.5,
      radius: width * 0.38,
      spin: (tile.x + tile.y) % 2 === 0 ? 1 : -1,
      opacity: 1.0,
    });
  } else {
    // 4 dochter-videotiles in mitose
    for (let qx = 0; qx < 2; qx++) {
      for (let qy = 0; qy < 2; qy++) {
        const targetX = (qx + 0.5) * (width / 2);
        const targetY = (qy + 0.5) * (height / 2);
        const cx = (1 - t) * (width * 0.5) + t * targetX;
        const cy = (1 - t) * (height * 0.5) + t * targetY;
        const radius = (1 - t) * (width * 0.38) + t * (width * 0.20);
        const spin = (qx + qy + tile.x + tile.y) % 2 === 0 ? 1 : -1;

        centers.push({ cx, cy, radius, spin, opacity: 0.5 + t * 0.5 });
      }
    }
  }

  for (const v of centers) {
    const size = v.radius * 2.6;
    if (decoder && decoder.isReady) {
      decoder.drawFrame(frame, ctx, v.cx - size / 2, v.cy - size / 2, size, size, v.spin, v.opacity);
    }
  }

  ctx.restore();
}
