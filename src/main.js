import { VideoTileDecoder } from './decoder.js';

// Initialiseer de WebCodecs decoder voor de WebM videotile
const videoDecoder = new VideoTileDecoder();
await videoDecoder.load('./tiles/vortex.webm?v=alpha1');

// MapLibre GL kaart initialisatie met pure zwarte achtergrond
const map = new maplibregl.Map({
  container: 'map',
  style: {
    version: 8,
    sources: {},
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: {
          'background-color': '#000000',
        },
      },
    ],
  },
  center: [4.9, 52.37], // Amsterdam
  zoom: 3,
  minZoom: 0,
  maxZoom: 18,
});

// Canvas overlay voor frame-gesynchroniseerd renderen van de videotiles
const canvas = document.createElement('canvas');
canvas.id = 'videotile-canvas';
canvas.style.position = 'absolute';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.pointerEvents = 'none';
canvas.style.zIndex = '1';
map.getCanvasContainer().appendChild(canvas);

const ctx = canvas.getContext('2d');

function resizeCanvas() {
  const rect = map.getCanvas().getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// LngLat naar Web Mercator tegelcoördinaten
function lngLatToTile(lng, lat, zoom) {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x: Math.max(0, Math.min(n - 1, x)), y: Math.max(0, Math.min(n - 1, y)) };
}

// Web Mercator tegel naar LngLat
function tileToLngLat(x, y, zoom) {
  const n = Math.pow(2, zoom);
  const lng = (x / n) * 360 - 180;
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n)));
  const lat = (latRad * 180) / Math.PI;
  return [lng, lat];
}

// Bepaal de zichtbare tegels voor een specifiek zoomniveau
function getVisibleTilesForZoom(zoom) {
  const bounds = map.getBounds();
  const nw = bounds.getNorthWest();
  const se = bounds.getSouthEast();

  const minTile = lngLatToTile(nw.lng, nw.lat, zoom);
  const maxTile = lngLatToTile(se.lng, se.lat, zoom);

  const tiles = [];
  const minX = Math.min(minTile.x, maxTile.x);
  const maxX = Math.max(minTile.x, maxTile.x);
  const minY = Math.min(minTile.y, maxTile.y);
  const maxY = Math.max(minTile.y, maxTile.y);

  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      tiles.push({ z: zoom, x, y });
    }
  }
  return tiles;
}

const hudDim = document.getElementById('hud-dim');
const hudWord = document.getElementById('hud-word');

function formatPixelQuantity(pixels) {
  if (pixels >= 1e15) {
    return `${(pixels / 1e15).toLocaleString('nl-NL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Petapixels`;
  }
  if (pixels >= 1e12) {
    return `${(pixels / 1e12).toLocaleString('nl-NL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Terapixels`;
  }
  if (pixels >= 1e9) {
    return `${(pixels / 1e9).toLocaleString('nl-NL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Gigapixels`;
  }
  if (pixels >= 1e6) {
    return `${(pixels / 1e6).toLocaleString('nl-NL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Megapixels`;
  }
  return `${(pixels / 1e3).toLocaleString('nl-NL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Kilopixels`;
}

// Renderloop: vloeiende geometrische wervelcascade (mitose / morphing)
function render() {
  const rect = map.getCanvas().getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);

  const zFloat = map.getZoom();
  const zBase = Math.floor(zFloat);
  const zoomFraction = zFloat - zBase; // 0.0 tot 1.0 (transitie naar hoger zoomniveau)

  // Bereken totale wereldresolutie op dit continue zoomniveau
  const worldDim = Math.round(256 * Math.pow(2, zFloat));
  const totalPixels = worldDim * worldDim;
  const dimStr = worldDim.toLocaleString('nl-NL');

  if (hudDim) hudDim.textContent = `${dimStr} px × ${dimStr} px`;
  if (hudWord) hudWord.textContent = formatPixelQuantity(totalPixels);

  const totalFrames = videoDecoder.frames.length || 90;
  const frameIndex = Math.min(totalFrames - 1, Math.max(0, Math.floor(zoomFraction * totalFrames)));

  const tiles = getVisibleTilesForZoom(zBase);

  for (const tile of tiles) {
    const nw = tileToLngLat(tile.x, tile.y, tile.z);
    const se = tileToLngLat(tile.x + 1, tile.y + 1, tile.z);

    const pNW = map.project(nw);
    const pSE = map.project(se);
    const width = pSE.x - pNW.x;
    const height = pSE.y - pNW.y;

    // Teken het WebCodecs videotile-frame direct op de tegelcoördinaten
    videoDecoder.drawTile(frameIndex, ctx, pNW.x, pNW.y, width, height);
  }
}

map.on('resize', () => {
  resizeCanvas();
  render();
});

map.on('move', render);
map.on('zoom', render);
map.on('render', render);

resizeCanvas();
render();
