// 4. Droste Zoom (Oneindige Logaritmische Spiraal / Zoomtunnel)
// Naarmate tijd vordert van frame 0 naar totalFrames groeit de schaal met factor 2 (exact 1 zoomniveau).

export function drawDroste(ctx, pNW, width, height, tile, frame, totalFrames) {
  const cx = pNW.x + width / 2;
  const cy = pNW.y + height / 2;
  const zoomFactor = Math.pow(2, frame / totalFrames); // verdubbelt in 1 cyclus

  ctx.save();
  ctx.translate(cx, cy);

  const arms = 3;
  const turns = 4;
  const maxR = Math.max(width, height) * 0.75;

  for (let arm = 0; arm < arms; arm++) {
    const armOffset = (arm * 2 * Math.PI) / arms;
    ctx.beginPath();

    const steps = 100;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const theta = t * turns * 2 * Math.PI + armOffset;
      // Logaritmische radius vermenigvuldigd met zoomFactor
      const rawR = 4 * Math.exp(1.5 * theta);
      const r = (rawR * zoomFactor) % maxR;

      const px = r * Math.cos(theta);
      const py = r * Math.sin(theta);

      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }

    ctx.strokeStyle = `hsla(${(arm * 90 + frame * 4 + tile.z * 25) % 360}, 85%, 60%, 0.75)`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Droste rechthoeken die naar binnen trekken
  const numBoxes = 6;
  for (let b = 0; b < numBoxes; b++) {
    const boxScale = (Math.pow(2, (b + (frame / totalFrames)) % numBoxes) / Math.pow(2, numBoxes)) * width;
    ctx.strokeStyle = `rgba(255, 204, 0, ${0.15 + (b / numBoxes) * 0.35})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(-boxScale / 2, -boxScale / 2, boxScale, boxScale);
  }

  ctx.restore();
}
