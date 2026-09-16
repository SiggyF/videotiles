// 1. Vortex Cascade (Dynamische Wervels met Spiraalarmen & Stromende Deeltjes)
// Duidelijke, dynamische rotatie met logaritmische spiraalarmen en omlopende vloeistofdeeltjes.
// Bij inzoomen (t: 0 -> 1) deelt de centrale wervel zich via mitose in 4 dochterwervels.

export function drawVortex(ctx, pNW, width, height, tile, frame, totalFrames, morphT = 0) {
  // Rotatiesnelheid: 2 volledige omwentelingen per cyclus voor duidelijke, krachtige dynamiek
  const basePhase = (frame / totalFrames) * 2 * Math.PI * 2;
  const t = morphT * morphT * (3 - 2 * morphT); // Smoothstep

  ctx.save();
  ctx.translate(pNW.x, pNW.y);

  const numSpiralArms = 3;
  const maxR = (1 - t) * (width * 0.42) + t * (width * 0.22);

  for (let qx = 0; qx < 2; qx++) {
    for (let qy = 0; qy < 2; qy++) {
      const targetX = (qx + 0.5) * (width / 2);
      const targetY = (qy + 0.5) * (height / 2);

      // Positie beweegt van centrum (0.5, 0.5) naar kwadrantcentrum
      const cx = (1 - t) * (width * 0.5) + t * targetX;
      const cy = (1 - t) * (height * 0.5) + t * targetY;

      // Wisselende draairichting per kwadrant
      const spin = (qx + qy + tile.x + tile.y) % 2 === 0 ? 1 : -1;
      const rotAngle = basePhase * spin;

      // 1. Spiraalarmen (Cyclone / Galaxy streamlines)
      for (let a = 0; a < numSpiralArms; a++) {
        const armOffset = (a * 2 * Math.PI) / numSpiralArms;
        ctx.beginPath();

        const steps = 30;
        for (let s = 0; s <= steps; s++) {
          const frac = s / steps;
          const r = frac * maxR;
          // Spiraalhoek: draait naar buiten toe
          const theta = rotAngle + armOffset + frac * 2.5 * spin;
          const px = cx + r * Math.cos(theta);
          const py = cy + r * Math.sin(theta);

          if (s === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }

        const hue = (195 + a * 30 + t * 40) % 360;
        ctx.strokeStyle = `hsla(${hue}, 90%, 55%, ${0.3 + (1 - t) * 0.3})`;
        ctx.lineWidth = 2 + (1 - t) * 1.5;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // 2. Omlopende vloeistofdeeltjes met kometenstaartjes (verschillende snelheden / afschuiving)
      const numParticles = 4;
      for (let p = 0; p < numParticles; p++) {
        // Binnenste deeltjes draaien sneller dan buitenste (kepler / vortex wet)
        const orbitR = ((p + 1) / (numParticles + 1)) * maxR;
        const speedMultiplier = 1.0 + (numParticles - p) * 0.4;
        const particleAngle = rotAngle * speedMultiplier + (p * Math.PI * 0.5);

        const px = cx + orbitR * Math.cos(particleAngle);
        const py = cy + orbitR * Math.sin(particleAngle);

        // Deeltjeskern
        ctx.beginPath();
        ctx.fillStyle = '#00f7ff';
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Kometenstaart (fading motion trail)
        ctx.beginPath();
        ctx.moveTo(px, py);
        const tailAngle = particleAngle - spin * 0.4;
        const tx = cx + orbitR * Math.cos(tailAngle);
        const ty = cy + orbitR * Math.sin(tailAngle);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = 'rgba(0, 247, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 3. Wervelkern (Oog van de storm)
      const pulse = 1 + 0.25 * Math.sin(basePhase * 2 + qx + qy);
      ctx.beginPath();
      ctx.fillStyle = `hsla(${(180 + t * 50) % 360}, 100%, 70%, 0.9)`;
      ctx.arc(cx, cy, (3 + t * 2) * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Halo rond de kern
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(0, 255, 220, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.arc(cx, cy, (7 + t * 3) * pulse, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  ctx.restore();
}
