// 1. Vortex Cascade (Rustige, Elegante Hydrodynamische Wervels)
// Minimalistisch en rustig: 2 vloeiende stroomlijnen per wervel met een rustige rotatie.
// Geen drukke deeltjes of felle flitsen, maar een kalme, majestueuze wervelbeweging.
// Bij inzoomen (t: 0 -> 1) splitst de centrale wervel zich geleidelijk in 4 kwadrant-wervels.

export function drawVortex(ctx, pNW, width, height, tile, frame, totalFrames, morphT = 0) {
  // Rustige, statige rotatie: 1 omwenteling per 180 frames
  const baseAngle = (frame / totalFrames) * 2 * Math.PI;
  const t = morphT * morphT * (3 - 2 * morphT); // Smoothstep

  ctx.save();
  ctx.translate(pNW.x, pNW.y);

  // Bepaal de wervels die we moeten tekenen:
  // Als t heel klein is (macro-weergave), tekenen we 1 rustige wervel in het midden.
  // Naarmate t toeneemt, bewegen 4 dochterwervels zachtjes uit elkaar.
  const centers = [];
  if (t < 0.05) {
    // 1 enkele centrale wervel
    centers.push({
      cx: width * 0.5,
      cy: height * 0.5,
      radius: width * 0.38,
      spin: (tile.x + tile.y) % 2 === 0 ? 1 : -1,
      opacity: 1.0,
    });
  } else {
    // 4 dochterwervels in mitose
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
    const rot = baseAngle * v.spin;

    // 2 sierlijke, tegenovergestelde wervelarmen (180 graden verschoven)
    for (let arm = 0; arm < 2; arm++) {
      const armOffset = arm * Math.PI;
      ctx.beginPath();

      const steps = 24;
      for (let s = 0; s <= steps; s++) {
        const frac = s / steps;
        const r = frac * v.radius;
        // Zachte logaritmische kromming naar buiten
        const theta = rot + armOffset + frac * 2.0 * v.spin;
        const px = v.cx + r * Math.cos(theta);
        const py = v.cy + r * Math.sin(theta);

        if (s === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }

      ctx.strokeStyle = `rgba(0, 210, 255, ${0.45 * v.opacity})`;
      ctx.lineWidth = 2.0;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // Rustig, klein oplichtend centrum (zonder hysterisch knipperen)
    ctx.beginPath();
    ctx.fillStyle = `rgba(200, 245, 255, ${0.8 * v.opacity})`;
    ctx.arc(v.cx, v.cy, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
