// 1. Vortex Cascade (Turbulente Wervelcascade)
// In elk kwadrant roteert een wervel met tegengestelde spin, met 0-snelheid op de randen

export function drawVortex(ctx, pNW, width, height, tile, frame, totalFrames) {
  const phase = (frame / totalFrames) * 2 * Math.PI;
  const numRings = 5;

  ctx.save();
  ctx.translate(pNW.x, pNW.y);

  // We tekenen 4 wervels (1 per sub-kwadrant) zodat ze naadloos aansluiten op zoom z+1
  for (let qx = 0; qx < 2; qx++) {
    for (let qy = 0; qy < 2; qy++) {
      const cx = (qx + 0.5) * (width / 2);
      const cy = (qy + 0.5) * (height / 2);
      const maxR = Math.min(width, height) / 4;
      const spin = (qx + qy + tile.x + tile.y) % 2 === 0 ? 1 : -1;

      for (let r = 1; r <= numRings; r++) {
        const radius = (r / numRings) * maxR * 0.95;
        const ringPhase = phase * spin * (1 + (numRings - r) * 0.2);

        ctx.beginPath();
        ctx.strokeStyle = `hsla(${(200 + r * 20 + tile.z * 15) % 360}, 85%, 55%, ${0.2 + (r / numRings) * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 6]);
        ctx.lineDashOffset = -ringPhase * radius;
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Wervelkern
      ctx.beginPath();
      ctx.fillStyle = `hsla(${(180 + tile.z * 20) % 360}, 90%, 65%, 0.8)`;
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}
