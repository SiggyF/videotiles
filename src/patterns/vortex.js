// 1. Vortex Mitose (Vormverandering via Celdeling)
// Als je inzoomt (t: 0 -> 1) deelt de centrale wervel zich via mitose in 4 dochterwervels.
// Op t=1 bevinden de 4 wervels zich exact in de 4 kwadranten, waar ze naadloos overgaan
// in de centrale wervel van het volgende zoomniveau.

export function drawVortex(ctx, pNW, width, height, tile, frame, totalFrames, morphT = 0) {
  const phase = (frame / totalFrames) * 2 * Math.PI;
  // Smooth easing voor morf-parameter
  const t = morphT * morphT * (3 - 2 * morphT);

  ctx.save();
  ctx.translate(pNW.x, pNW.y);

  const numRings = 4;
  // Radius schaalt van macro (1 grote wervel op t=0) naar micro (4 kwadrant-wervels op t=1)
  const maxR = (1 - t) * (width * 0.42) + t * (width * 0.22);

  // 4 dochterkernen die uit elkaar bewegen
  for (let qx = 0; qx < 2; qx++) {
    for (let qy = 0; qy < 2; qy++) {
      // Doelpositie in kwadrant
      const targetX = (qx + 0.5) * (width / 2);
      const targetY = (qy + 0.5) * (height / 2);

      // Positie beweegt van centrum (0.5, 0.5) naar kwadrantcentrum
      const cx = (1 - t) * (width * 0.5) + t * targetX;
      const cy = (1 - t) * (height * 0.5) + t * targetY;

      const spin = (qx + qy + tile.x + tile.y) % 2 === 0 ? 1 : -1;

      for (let r = 1; r <= numRings; r++) {
        const radius = (r / numRings) * maxR;
        const ringPhase = phase * spin * (1 + (numRings - r) * 0.2);

        ctx.beginPath();
        // Kleur verschuift subtiel met de celdeling
        const hue = (190 + r * 20 + t * 40) % 360;
        ctx.strokeStyle = `hsla(${hue}, 85%, 55%, ${0.25 + (r / numRings) * 0.55})`;
        ctx.lineWidth = 1.5 + (1 - t) * 1.5;
        ctx.setLineDash([8, 6]);
        ctx.lineDashOffset = -ringPhase * radius;
        ctx.arc(cx, cy, Math.max(1, radius), 0, Math.PI * 2);
        ctx.stroke();
      }

      // Kern van de wervel
      ctx.beginPath();
      ctx.fillStyle = `hsla(${(180 + t * 60) % 360}, 95%, 65%, ${0.5 + t * 0.4})`;
      ctx.arc(cx, cy, 2 + t * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}
