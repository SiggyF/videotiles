// 2. Branching River Tree (Fractale Rivierdelta)
// Water stroomt van de bovenrand (x=0.5) en splitst in twee armen naar beneden (x=0.25 en x=0.75).

export function drawRiver(ctx, pNW, width, height, tile, frame, totalFrames) {
  const flowOffset = (frame / totalFrames) * 32;

  ctx.save();
  ctx.translate(pNW.x, pNW.y);

  const topX = width * 0.5;
  const topY = 0;
  const midX = width * 0.5;
  const midY = height * 0.45;
  const leftBottomX = width * 0.25;
  const rightBottomX = width * 0.75;
  const bottomY = height;

  // Hoofdstroom
  ctx.beginPath();
  ctx.moveTo(topX, topY);
  ctx.lineTo(midX, midY);
  ctx.strokeStyle = '#00aaff';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.setLineDash([12, 6]);
  ctx.lineDashOffset = -flowOffset;
  ctx.stroke();

  // Linkertak
  ctx.beginPath();
  ctx.moveTo(midX, midY);
  ctx.bezierCurveTo(midX - width * 0.1, midY + height * 0.2, leftBottomX, midY + height * 0.3, leftBottomX, bottomY);
  ctx.strokeStyle = '#33ccff';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([10, 5]);
  ctx.lineDashOffset = -flowOffset * 1.2;
  ctx.stroke();

  // Rechtertak
  ctx.beginPath();
  ctx.moveTo(midX, midY);
  ctx.bezierCurveTo(midX + width * 0.1, midY + height * 0.2, rightBottomX, midY + height * 0.3, rightBottomX, bottomY);
  ctx.strokeStyle = '#33ccff';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([10, 5]);
  ctx.lineDashOffset = -flowOffset * 1.2;
  ctx.stroke();

  // Sub-vertakkingen in de onderste kwadranten voor diepe zelfgelijkendheid
  const subBranches = [
    { startX: leftBottomX, endX1: width * 0.125, endX2: width * 0.375, y: height * 0.75 },
    { startX: rightBottomX, endX1: width * 0.625, endX2: width * 0.875, y: height * 0.75 }
  ];

  for (const branch of subBranches) {
    ctx.beginPath();
    ctx.moveTo(branch.startX, branch.y);
    ctx.lineTo(branch.endX1, bottomY);
    ctx.moveTo(branch.startX, branch.y);
    ctx.lineTo(branch.endX2, bottomY);
    ctx.strokeStyle = '#70dbff';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.lineDashOffset = -flowOffset * 1.5;
    ctx.stroke();
  }

  ctx.restore();
}
