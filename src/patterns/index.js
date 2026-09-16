import { drawVortex } from './vortex.js';
import { drawRiver } from './river.js';
import { drawHilbert } from './hilbert.js';
import { drawDroste } from './droste.js';
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
  droste: {
    id: 'droste',
    name: '4. Continu Droste-Zoom (Tunnel)',
    draw: drawDroste,
  },
  truchet: {
    id: 'truchet',
    name: '5. Truchet Labyrint (Continuous Arcs)',
    draw: drawTruchet,
  },
};
