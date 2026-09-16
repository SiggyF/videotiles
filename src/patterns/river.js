// 2. Branching River (Vormverandering via Vertakkingsgroei / Bifurcatie)
// Bij inzoomen (t: 0 -> 1) ontkiemen en groeien nieuwe zijtakken fysiek uit de hoofdstroom.
// Op t=0 is er alleen de hoofdstroom; op t=1 zijn de zijtakken volgroeid en monden ze uit
// in de randen, klaar om op het volgende niveau de hoofdstroom van de kinderen te voeden.

export function drawRiver(ctx, pNW, width, height, tile, frame, totalFrames, morphT = 0) {
  const dashLength = 16;
  const dashGap = 8;
  const period = dashLength + dashGap;
  const flowOffset = (frame / totalFrames) * period;
  const t = morphT; // lineair of smoothstep

  ctx.save();
  ctx.translate(pNW.x, pNW.y);

  // 1. Hoofdstroom van Noord naar Zuid: (0.5, 0) -> (0.5, 1)
  const midX = width * 0.5;
  ctx.beginPath();
  ctx.moveTo(midX, 0);
  ctx.lineTo(midX, height);
  ctx.strokeStyle = '#00b4d8';
  ctx.lineWidth = 3.5 + (1 - t) * 2;
  ctx.lineCap = 'round';
  ctx.setLineDash([dashLength, dashGap]);
  ctx.lineDashOffset = -flowOffset;
  ctx.stroke();

  // 2. Groeiende Westelijke zijtak: groeit van (0.5, 0.6) terug naar (0, 0.5)
  if (t > 0.05) {
    const grow = Math.min(1, (t - 0.05) / 0.95);
    const startX = midX;
    const startY = height * 0.6;
    const targetX = 0;
    const targetY = height * 0.5;

    // Actueel groeipunt langs de curve
    const currentX = startX + (targetX - startX) * grow;
    const currentY = startY + (targetY - startY) * grow;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(width * 0.3, height * 0.55, currentX, currentY);
    ctx.strokeStyle = '#48cae4';
    ctx.lineWidth = 1 + grow * 2;
    ctx.setLineDash([dashLength * 0.75, dashGap]);
    ctx.lineDashOffset = -flowOffset;
    ctx.stroke();
  }

  // 3. Groeiende Oostelijke zijtak: groeit van (0.5, 0.6) terug naar (1, 0.5)
  if (t > 0.05) {
    const grow = Math.min(1, (t - 0.05) / 0.95);
    const startX = midX;
    const startY = height * 0.6;
    const targetX = width;
    const targetY = height * 0.5;

    const currentX = startX + (targetX - startX) * grow;
    const currentY = startY + (targetY - startY) * grow;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(width * 0.7, height * 0.55, currentX, currentY);
    ctx.strokeStyle = '#48cae4';
    ctx.lineWidth = 1 + grow * 2;
    ctx.setLineDash([dashLength * 0.75, dashGap]);
    ctx.lineDashOffset = -flowOffset;
    ctx.stroke();
  }

  // 4. Sub-takjes in kwadranten ontkiemen pas als t > 0.5
  if (t > 0.4) {
    const subGrow = (t - 0.4) / 0.6;
    const subBranches = [
      { x0: midX, y0: height * 0.3, tx: width * 0.2, ty: height * 0.15 },
      { x0: midX, y0: height * 0.3, tx: width * 0.8, ty: height * 0.15 },
      { x0: midX, y0: height * 0.75, tx: width * 0.25, ty: height * 0.9 },
      { x0: midX, y0: height * 0.75, tx: width * 0.75, ty: height * 0.9 }
    ];

    ctx.strokeStyle = '#90e0ef';
    ctx.lineWidth = subGrow * 1.8;
    ctx.setLineDash([dashLength * 0.5, dashGap]);
    ctx.lineDashOffset = -flowOffset * 0.8;

    for (const b of subBranches) {
      const curX = b.x0 + (b.tx - b.x0) * subGrow;
      const curY = b.y0 + (b.ty - b.y0) * subGrow;
      ctx.beginPath();
      ctx.moveTo(b.x0, b.y0);
      ctx.lineTo(curX, curY);
      ctx.stroke();
    }
  }

  // Knooppunt pulsering
  ctx.beginPath();
  ctx.fillStyle = '#caf0f8';
  ctx.arc(midX, height * 0.6, 2 + t * 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
