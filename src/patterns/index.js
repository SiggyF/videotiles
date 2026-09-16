import { drawVortex } from './vortex.js';
import { drawRiver } from './river.js';
import { drawHilbert } from './hilbert.js';
import { drawTruchet } from './truchet.js';

export const PATTERNS = {
  vortex: {
    id: 'vortex',
    name: '1. Wervelcascade (Vortex Cascade)',
    draw: drawVortex,
  },
  river: {
    id: 'river',
    name: '2. Fractale Rivierdelta (Branching River)',
    draw: drawRiver,
  },
  hilbert: {
    id: 'hilbert',
    name: '3. Hilbert-Curve (Space-filling Flow)',
    draw: drawHilbert,
  },
  truchet: {
    id: 'truchet',
    name: '4. Truchet Labyrint (Continuous Arcs)',
    draw: drawTruchet,
  },
};
