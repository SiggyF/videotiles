// 5. Truchet Flow Labyrinth
// Cirkelbogen waarvan de uiteinden precies in het midden van elke rand liggen (x=0.5, y=0.5).
// Hierdoor ontstaat over alle tegelgrenzen en zoomniveaus heen een oneindig vloeiend netwerk.

export function drawTruchet(ctx, pNW, width, height, tile, frame, totalFrames) {
  const flowOffset = (frame / totalFrames) * 20;

  ctx.save();
  ctx.translate(pNW.x, pNW.y);

  // We verdelen elke videotegel in een 2x2 grid van Truchet-cellen voor quadtree-afstemming
  const cells = 2;
  const cellSize = width / cells;
  const r = cellSize / 2;

  for (let cx = 0; cx < cells; cx++) {
    for (let cy = 0; cy < cells; cy++) {
      const ox = cx * cellSize;
      const oy = cy * cellSize;

      // Bepaal oriëntatie op basis van hash van absolute tegelpositie + subcel
      const seed = (tile.x * cells + cx) * 31 + (tile.y * cells + cy) * 17 + tile.z * 13;
      const orientation = seed % 2 === 0;

      ctx.save();
      ctx.translate(ox, oy);

      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ff3366';
      ctx.setLineDash([8, 6]);
      ctx.lineDashOffset = -flowOffset;

      if (orientation) {
        // Bogen vanuit linksboven en rechtsonder
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI / 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cellSize, cellSize, r, Math.PI, (3 * Math.PI) / 2);
        ctx.stroke();
      } else {
        // Bogen vanuit rechtsboven en linksonder
        ctx.beginPath();
        ctx.arc(cellSize, 0, r, Math.PI / 2, Math.PI);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, cellSize, r, (3 * Math.PI) / 2, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  ctx.restore();
}
