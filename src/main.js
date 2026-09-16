import { drawVortex } from './patterns/vortex.js';

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

let currentFrame = 0;
const totalFrames = 180;
const isPlaying = true;
let animationId = null;

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

const hudWord = document.getElementById('hud-word');

function getScaleWord(pixels) {
  if (pixels >= 1e15) return 'Petapixels';
  if (pixels >= 1e12) return 'Terapixels';
  if (pixels >= 1e9) return 'Gigapixels';
  if (pixels >= 1e6) return 'Megapixels';
  return 'Kilopixels';
}

// Renderloop: vloeiende geometrische wervelcascade (mitose / morphing)
function render() {
  const rect = map.getCanvas().getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);

  const zFloat = map.getZoom();
  const zBase = Math.floor(zFloat);
  const morphT = zFloat - zBase; // Fractie 0.0 tot 1.0 voor vormverandering

  // Bereken totale wereldresolutie op dit continue zoomniveau
  const worldDim = Math.round(256 * Math.pow(2, zFloat));
  const totalPixels = worldDim * worldDim;

  if (hudWord) hudWord.textContent = getScaleWord(totalPixels);

  const tiles = getVisibleTilesForZoom(zBase);

  for (const tile of tiles) {
    const nw = tileToLngLat(tile.x, tile.y, tile.z);
    const se = tileToLngLat(tile.x + 1, tile.y + 1, tile.z);

    const pNW = map.project(nw);
    const pSE = map.project(se);
    const width = pSE.x - pNW.x;
    const height = pSE.y - pNW.y;

    // Teken de wervelcascade met continue mitose
    drawVortex(ctx, pNW, width, height, tile, currentFrame, totalFrames, morphT);
  }
}

// Centrale continue renderloop (autoplay)
function tick() {
  if (isPlaying) {
    currentFrame = (currentFrame + 1) % totalFrames;
    render();
    animationId = requestAnimationFrame(tick);
  }
}

map.on('resize', () => {
  resizeCanvas();
  render();
});

map.on('move', render);
map.on('load', () => {
  resizeCanvas();
  render();
  tick();
});
