// 5. Truchet Pinch & Split (Vormverandering via Topologische Splitsing)
// Bij inzoomen (t: 0 -> 1) krimpen en splitsen de grote macro-bogen zich
// in 4 kleinere sub-cellen die precies in de kwadranten passen.

export function drawTruchet(ctx, pNW, width, height, tile, frame, totalFrames, morphT = 0) {
  const dashLength = 8;
  const dashGap = 6;
  const period = dashLength + dashGap; // 14
  const flowOffset = (frame / totalFrames) * period * 2;
  const t = morphT;

  ctx.save();
  ctx.translate(pNW.x, pNW.y);

  // t=0: 1 macrocel (straal width/2)
  // t=1: 2x2 microcellen (straal width/4)
  const cells = 2;
  const targetCellSize = width / cells;

  for (let cx = 0; cx < cells; cx++) {
    for (let cy = 0; cy < cells; cy++) {
      // Positie beweegt van macro-oorsprong (0, 0) naar kwadrant-oorsprong
      const ox = t * (cx * targetCellSize);
      const oy = t * (cy * targetCellSize);
      const curCellSize = (1 - t) * width + t * targetCellSize;
      const r = curCellSize / 2;

      const seed = (tile.x * cells + cx) * 31 + (tile.y * cells + cy) * 17 + tile.z * 13;
      const orientation = seed % 2 === 0;

      ctx.save();
      ctx.translate(ox, oy);

      ctx.lineWidth = 2 + (1 - t) * 1.5;
      ctx.strokeStyle = `hsla(${(340 + t * 30) % 360}, 90%, 60%, ${0.5 + t * 0.4})`;
      ctx.setLineDash([dashLength, dashGap]);
      ctx.lineDashOffset = -flowOffset;

      if (orientation) {
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(1, r), 0, Math.PI / 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(curCellSize, curCellSize, Math.max(1, r), Math.PI, (3 * Math.PI) / 2);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(curCellSize, 0, Math.max(1, r), Math.PI / 2, Math.PI);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, curCellSize, Math.max(1, r), (3 * Math.PI) / 2, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();

      // Bij t=0 tekenen we maar 1 cel (cx=0, cy=0) om overlapping te voorkomen
      if (t < 0.05) break;
    }
    if (t < 0.05) break;
  }

  ctx.restore();
}
