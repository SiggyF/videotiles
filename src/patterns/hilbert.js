// 3. Hilbert Subdivisie (Vormverandering via Fractale Vouwing)
// Bij inzoomen (t: 0 -> 1) vouwt elk lijnsegment van de Hilbert-curve zich soepel uit
// van een simpele macro-boog naar 4 fijnere micro-lussen (subdivisie).

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

export function drawHilbert(ctx, pNW, width, height, tile, frame, totalFrames, morphT = 0) {
  const t = morphT;
  const nHigh = 8; // 8x8 = 64 punten (orde 3)
  const nLow = 4;  // 4x4 = 16 punten (orde 2)
  const totalPoints = nHigh * nHigh;

  const stepXHigh = width / nHigh;
  const stepYHigh = height / nHigh;
  const stepXLow = width / nLow;
  const stepYLow = height / nLow;

  ctx.save();
  ctx.translate(pNW.x, pNW.y);

  // Bereken gevouwen posities geïnterpoleerd tussen orde 2 en orde 3
  const points = [];
  for (let i = 0; i < totalPoints; i++) {
    // Orde 3 doelpositie
    const [xh, yh] = d2xy(nHigh, i);
    const targetX = (xh + 0.5) * stepXHigh;
    const targetY = (yh + 0.5) * stepYHigh;

    // Orde 2 ouderpositie (4 punten van orde 3 horen bij 1 punt van orde 2)
    const lowIdx = Math.floor(i / 4);
    const [xl, yl] = d2xy(nLow, lowIdx);
    const sourceX = (xl + 0.5) * stepXLow;
    const sourceY = (yl + 0.5) * stepYLow;

    // Morf: van samengevouwen ouder naar ontplooide kind-vorm
    const px = (1 - t) * sourceX + t * targetX;
    const py = (1 - t) * sourceY + t * targetY;
    points.push([px, py]);
  }

  // Teken de dynamisch morpherende curve
  ctx.beginPath();
  for (let i = 0; i < totalPoints; i++) {
    const [px, py] = points[i];
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.strokeStyle = `hsla(${(260 + t * 40) % 360}, 80%, 65%, 0.45)`;
  ctx.lineWidth = 1.5 + (1 - t) * 1.5;
  ctx.stroke();

  // Lichtgolf over de curve
  const pulseHead = ((frame / totalFrames) * totalPoints) % totalPoints;
  const pulseLength = 12;

  ctx.beginPath();
  let started = false;
  for (let k = 0; k < pulseLength; k++) {
    const idx = (Math.floor(pulseHead - k + totalPoints)) % totalPoints;
    const [px, py] = points[idx];
    if (!started) {
      ctx.moveTo(px, py);
      started = true;
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.strokeStyle = '#00ffcc';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.stroke();

  ctx.restore();
}
