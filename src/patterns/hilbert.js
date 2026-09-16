// 3. Hilbert Subdivisie (Vloeiende Fractale Ontvouwing met Continue Lichtstroom)
// - Traploze (sub-pixel) interpolatie van de lichtgolf langs de lijnstukken (geen haperingen)
// - Continue morf-interpolatie tussen orde 2 (16 punten) en orde 3 (64 punten)

function rot(n, x, y, rx, ry) {
  if (ry === 0) {
    if (rx === 1) {
      x = n - 1 - x;
      y = n - 1 - y;
    }
    return [y, x];
  }
  return [x, y];
}

function d2xy(n, d) {
  let rx, ry, s, t = d;
  let x = 0;
  let y = 0;
  for (s = 1; s < n; s *= 2) {
    rx = 1 & (Math.floor(t / 2));
    ry = 1 & (t ^ rx);
    [x, y] = rot(s, x, y, rx, ry);
    x += s * rx;
    y += s * ry;
    t = Math.floor(t / 4);
  }
  return [x, y];
}

// Berekent een exact geïnterpoleerd punt langs het pad op continue positie s in [0, totalPoints]
function getContinuousPoint(points, s) {
  const total = points.length;
  const clampedS = ((s % total) + total) % total;
  const idx = Math.floor(clampedS);
  const frac = clampedS - idx;
  const nextIdx = (idx + 1) % total;

  const p0 = points[idx];
  const p1 = points[nextIdx];

  return [
    p0[0] + (p1[0] - p0[0]) * frac,
    p0[1] + (p1[1] - p0[1]) * frac
  ];
}

export function drawHilbert(ctx, pNW, width, height, tile, frame, totalFrames, morphT = 0) {
  const t = morphT * morphT * (3 - 2 * morphT); // Smoothstep voor vloeiende vouwing
  const nHigh = 8; // Orde 3 (64 punten)
  const nLow = 4;  // Orde 2 (16 punten)
  const totalPoints = nHigh * nHigh;

  const stepXHigh = width / nHigh;
  const stepYHigh = height / nHigh;
  const stepXLow = width / nLow;
  const stepYLow = height / nLow;

  ctx.save();
  ctx.translate(pNW.x, pNW.y);

  // 1. Bereken hoekpunten geïnterpoleerd tussen orde 2 en orde 3
  const points = [];
  for (let i = 0; i < totalPoints; i++) {
    const [xh, yh] = d2xy(nHigh, i);
    const targetX = (xh + 0.5) * stepXHigh;
    const targetY = (yh + 0.5) * stepYHigh;

    const lowIdx = Math.floor(i / 4);
    const [xl, yl] = d2xy(nLow, lowIdx);
    const sourceX = (xl + 0.5) * stepXLow;
    const sourceY = (yl + 0.5) * stepYLow;

    const px = (1 - t) * sourceX + t * targetX;
    const py = (1 - t) * sourceY + t * targetY;
    points.push([px, py]);
  }

  // 2. Teken de basisstructuur
  ctx.beginPath();
  for (let i = 0; i < totalPoints; i++) {
    const [px, py] = points[i];
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.strokeStyle = `hsla(${(260 + t * 45) % 360}, 75%, 60%, 0.35)`;
  ctx.lineWidth = 1.5 + (1 - t) * 1.5;
  ctx.stroke();

  // 3. Traploze, continue lopende lichtgolf (glijdt vloeiend over de segmenten)
  const continuousHead = (frame / totalFrames) * totalPoints;
  const trailLength = 14; // Aantal segmenten lengte van de lichtstaart
  const subSamples = 40;  // Fijne sub-sampling voor volmaakt vloeiende curve

  ctx.beginPath();
  for (let k = subSamples; k >= 0; k--) {
    const s = continuousHead - (k / subSamples) * trailLength;
    const [px, py] = getContinuousPoint(points, s);
    if (k === subSamples) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.strokeStyle = '#00ffd5';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Gloeiende kop van de lichtgolf
  const [headX, headY] = getContinuousPoint(points, continuousHead);
  ctx.beginPath();
  ctx.fillStyle = '#ffffff';
  ctx.arc(headX, headY, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = 'rgba(0, 255, 213, 0.4)';
  ctx.arc(headX, headY, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
