// 2. Branching River Network (Fractale Rivier / Hydrologisch Netwerk)
// Sluit naadloos aan op alle buurtegels:
// - Noord-Zuid: hoofdstroom loopt van (0.5, 0) naar (0.5, 1)
// - Oost-West: zijtakken komen binnen op (0, 0.5) en (1, 0.5) en monden uit in de hoofdstroom
// - Kwadranten: zelfgelijkende subtakken die binnen elk kwadrant ontspringen

export function drawRiver(ctx, pNW, width, height, tile, frame, totalFrames) {
  const dashLength = 16;
  const dashGap = 8;
  const period = dashLength + dashGap;
  const flowOffset = (frame / totalFrames) * period;

  ctx.save();
  ctx.translate(pNW.x, pNW.y);

  // 1. Hoofdstroom van Noord naar Zuid: (0.5, 0) -> (0.5, 1)
  const midX = width * 0.5;
  ctx.beginPath();
  ctx.moveTo(midX, 0);
  ctx.lineTo(midX, height);
  ctx.strokeStyle = '#00b4d8';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.setLineDash([dashLength, dashGap]);
  ctx.lineDashOffset = -flowOffset;
  ctx.stroke();

  // 2. Westelijke zijrivier: (0, 0.5) mondt uit in de hoofdstroom (0.5, 0.5)
  ctx.beginPath();
  ctx.moveTo(0, height * 0.5);
  ctx.bezierCurveTo(
    width * 0.25, height * 0.5,
    width * 0.35, height * 0.55,
    midX, height * 0.6
  );
  ctx.strokeStyle = '#48cae4';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([dashLength * 0.75, dashGap]);
  ctx.lineDashOffset = -flowOffset;
  ctx.stroke();

  // 3. Oostelijke zijrivier: (1, 0.5) mondt uit in de hoofdstroom (0.5, 0.5)
  ctx.beginPath();
  ctx.moveTo(width, height * 0.5);
  ctx.bezierCurveTo(
    width * 0.75, height * 0.5,
    width * 0.65, height * 0.55,
    midX, height * 0.6
  );
  ctx.strokeStyle = '#48cae4';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([dashLength * 0.75, dashGap]);
  ctx.lineDashOffset = -flowOffset;
  ctx.stroke();

  // 4. Subtakken in de 4 kwadranten (orde 2 en 3 in Horton-Strahler schaal)
  const subBranches = [
    // Linksboven: ontspringt in hoek en voedt de noordstroom
    { x0: width * 0.15, y0: height * 0.15, cx: width * 0.3, cy: height * 0.2, x1: midX, y1: height * 0.3 },
    // Rechtsboven: ontspringt in hoek en voedt de noordstroom
    { x0: width * 0.85, y0: height * 0.15, cx: width * 0.7, cy: height * 0.2, x1: midX, y1: height * 0.3 },
    // Linksonder: ontspringt en voedt de zuidstroom
    { x0: width * 0.2, y0: height * 0.85, cx: width * 0.3, cy: height * 0.8, x1: midX, y1: height * 0.75 },
    // Rechtsonder: ontspringt en voedt de zuidstroom
    { x0: width * 0.8, y0: height * 0.85, cx: width * 0.7, cy: height * 0.8, x1: midX, y1: height * 0.75 }
  ];

  ctx.strokeStyle = '#90e0ef';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([dashLength * 0.5, dashGap]);
  ctx.lineDashOffset = -flowOffset * 0.8;

  for (const b of subBranches) {
    ctx.beginPath();
    ctx.moveTo(b.x0, b.y0);
    ctx.quadraticCurveTo(b.cx, b.cy, b.x1, b.y1);
    ctx.stroke();
  }

  // 5. Gloeiende knooppunt-marker op de samenvloeiing
  ctx.beginPath();
  ctx.fillStyle = '#caf0f8';
  ctx.arc(midX, height * 0.6, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
