import { PATTERNS } from './patterns/index.js';

// MapLibre GL kaart initialisatie met CartoDB Dark Matter / Positron of OSM
const map = new maplibregl.Map({
  container: 'map',
  style: {
    version: 8,
    sources: {
      carto: {
        type: 'raster',
        tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors, © CARTO',
      },
    },
    layers: [
      {
        id: 'carto-layer',
        type: 'raster',
        source: 'carto',
        minzoom: 0,
        maxzoom: 19,
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
const totalFrames = 60;
let isPlaying = false;
let animationId = null;
let currentPatternKey = 'vortex';
let showGrid = true;

// UI elementen
const patternSelect = document.getElementById('pattern-select');
const zoomLabel = document.getElementById('zoom-level');
const tileCountLabel = document.getElementById('tile-count');
const frameDisplay = document.getElementById('frame-display');
const statusDisplay = document.getElementById('status-display');
const frameSlider = document.getElementById('frame-slider');
const playBtn = document.getElementById('play-btn');
const toggleGrid = document.getElementById('toggle-grid');

// Vul de select-opties met de 5 patronen
Object.values(PATTERNS).forEach((pattern) => {
  const opt = document.createElement('option');
  opt.value = pattern.id;
  opt.textContent = pattern.name;
  patternSelect.appendChild(opt);
});

patternSelect.value = currentPatternKey;

patternSelect.addEventListener('change', (e) => {
  currentPatternKey = e.target.value;
  render();
});

toggleGrid.addEventListener('change', (e) => {
  showGrid = e.target.checked;
  render();
});

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

// Bepaal de momenteel zichtbare tegels in de viewport
function getVisibleTiles() {
  const zoom = Math.floor(map.getZoom());
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
  return { zoom, tiles };
}

// Renderloop: synchroon frame N tekenen voor alle zichtbare tegels
function render() {
  const rect = map.getCanvas().getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);

  const { zoom, tiles } = getVisibleTiles();
  zoomLabel.textContent = `${map.getZoom().toFixed(2)} (Z: ${zoom})`;
  tileCountLabel.textContent = tiles.length;
  frameDisplay.textContent = `${currentFrame} / ${totalFrames}`;
  statusDisplay.textContent = isPlaying ? 'Afspelen (60fps)' : 'Gepauzeerd';

  const pattern = PATTERNS[currentPatternKey];
  if (!pattern) return;

  for (const tile of tiles) {
    const nw = tileToLngLat(tile.x, tile.y, tile.z);
    const se = tileToLngLat(tile.x + 1, tile.y + 1, tile.z);

    const pNW = map.project(nw);
    const pSE = map.project(se);
    const width = pSE.x - pNW.x;
    const height = pSE.y - pNW.y;

    // Teken het geselecteerde recursieve patroon
    pattern.draw(ctx, pNW, width, height, tile, currentFrame, totalFrames);

    // Optionele tegelgrenzen en XYZ-labels
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(pNW.x, pNW.y, width, height);
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.font = '10px monospace';
      ctx.fillText(`${tile.z}/${tile.x}/${tile.y}`, pNW.x + 6, pNW.y + 14);
    }
  }
}

// Centrale synchrone tijdlijn
function tick() {
  if (isPlaying) {
    currentFrame = (currentFrame + 1) % totalFrames;
    frameSlider.value = currentFrame;
    render();
    animationId = requestAnimationFrame(tick);
  }
}

playBtn.addEventListener('click', () => {
  isPlaying = !isPlaying;
  playBtn.textContent = isPlaying ? 'Pause' : 'Play';
  if (isPlaying) {
    tick();
  } else if (animationId) {
    cancelAnimationFrame(animationId);
    statusDisplay.textContent = 'Gepauzeerd';
  }
});

frameSlider.addEventListener('input', (e) => {
  currentFrame = parseInt(e.target.value, 10);
  render();
});

map.on('resize', () => {
  resizeCanvas();
  render();
});

map.on('move', render);
map.on('load', () => {
  resizeCanvas();
  render();
});
