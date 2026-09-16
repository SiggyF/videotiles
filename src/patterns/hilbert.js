// 3. Hilbert Curve (Ruimtevullende kromme)
// Quadtree-gebaseerde fractale curve met een pulserende golf van licht/energie

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

export function drawHilbert(ctx, pNW, width, height, tile, frame, totalFrames) {
  const order = 3; // 2^3 = 8x8 grid = 64 punten
  const n = 1 << order;
  const totalPoints = n * n;
  const stepX = width / n;
  const stepY = height / n;

  ctx.save();
  ctx.translate(pNW.x, pNW.y);

  // Teken de basiscurve
  ctx.beginPath();
  for (let i = 0; i < totalPoints; i++) {
    const [x, y] = d2xy(n, i);
    const px = (x + 0.5) * stepX;
    const py = (y + 0.5) * stepY;
    if (i === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.strokeStyle = 'rgba(120, 80, 220, 0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Animerende lopende golf / pulse over de curve
  const pulseHead = ((frame / totalFrames) * totalPoints) % totalPoints;
  const pulseLength = 12;

  ctx.beginPath();
  let started = false;
  for (let k = 0; k < pulseLength; k++) {
    const idx = (Math.floor(pulseHead - k + totalPoints)) % totalPoints;
    const [x, y] = d2xy(n, idx);
    const px = (x + 0.5) * stepX;
    const py = (y + 0.5) * stepY;
    if (!started) {
      ctx.moveTo(px, py);
      started = true;
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.strokeStyle = '#00ffcc';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.shadowColor = '#00ffcc';
  ctx.shadowBlur = 8;
  ctx.stroke();

  ctx.restore();
}
