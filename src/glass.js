import { useEffect } from 'react';

// Liquid glass edge refraction. Chromium can run an SVG filter as a backdrop-filter, so we draw a
// displacement map per element that bends the backdrop near the rounded edges, like a lens rim.
// Other browsers keep the plain frosted blur from CSS (--lens stays empty).
const NS = 'http://www.w3.org/2000/svg';
let defs = null;
let counter = 0;

const supportsLens = () => typeof window !== 'undefined'
  && !!navigator.userAgentData?.brands?.some(b => /Chromium/.test(b.brand))
  && CSS.supports('backdrop-filter', 'url(#a) blur(1px)')
  && !matchMedia('(prefers-reduced-transparency: reduce)').matches;

function ensureDefs(){
 if(defs?.isConnected)return defs;
 const svg = document.createElementNS(NS, 'svg');
 svg.setAttribute('aria-hidden', 'true');
 svg.setAttribute('width', '0');
 svg.setAttribute('height', '0');
 svg.style.position = 'absolute';
 defs = document.createElementNS(NS, 'defs');
 svg.appendChild(defs);
 document.body.appendChild(svg);
 return defs;
}

// R/G channels hold the x/y push (128 = none). Pixels inside the rim are pulled towards the centre,
// strongest at the edge and easing to zero `band` px in, so the middle of the panel stays sharp.
function drawMap(w, h, radius, band){
 const canvas = document.createElement('canvas');
 canvas.width = w; canvas.height = h;
 const ctx = canvas.getContext('2d');
 const img = ctx.createImageData(w, h);
 const r = Math.min(radius, w / 2, h / 2);
 for(let y = 0; y < h; y++){
  for(let x = 0; x < w; x++){
   // Signed distance to the rounded rectangle and the outward normal at the nearest edge.
   const px = x + .5 - w / 2, py = y + .5 - h / 2;
   const qx = Math.abs(px) - (w / 2 - r), qy = Math.abs(py) - (h / 2 - r);
   let nx = 0, ny = 0, dist;
   if(qx > 0 && qy > 0){ const l = Math.hypot(qx, qy); dist = r - l; nx = qx / l; ny = qy / l; }
   else if(qx > qy){ dist = r - qx; nx = 1; } else { dist = r - qy; ny = 1; }
   nx *= Math.sign(px) || 1; ny *= Math.sign(py) || 1;
   const t = Math.max(0, 1 - dist / band);
   const k = t * t;
   const i = (y * w + x) * 4;
   img.data[i] = 128 - nx * k * 127;
   img.data[i + 1] = 128 - ny * k * 127;
   img.data[i + 2] = 128;
   img.data[i + 3] = 255;
  }
 }
 ctx.putImageData(img, 0, 0);
 return canvas.toDataURL();
}

export function useLiquidLens(ref, {radius = 24, band = 22, depth = 28} = {}){
 useEffect(() => {
  const el = ref.current;
  if(!el || !supportsLens())return;
  const id = `liquid-lens-${++counter}`;
  const filter = document.createElementNS(NS, 'filter');
  filter.setAttribute('id', id);
  filter.setAttribute('filterUnits', 'userSpaceOnUse');
  filter.setAttribute('primitiveUnits', 'userSpaceOnUse');
  filter.setAttribute('color-interpolation-filters', 'sRGB');
  const image = document.createElementNS(NS, 'feImage');
  image.setAttribute('result', 'map');
  image.setAttribute('preserveAspectRatio', 'none');
  const displace = document.createElementNS(NS, 'feDisplacementMap');
  displace.setAttribute('in', 'SourceGraphic');
  displace.setAttribute('in2', 'map');
  displace.setAttribute('scale', String(depth));
  displace.setAttribute('xChannelSelector', 'R');
  displace.setAttribute('yChannelSelector', 'G');
  filter.append(image, displace);
  ensureDefs().appendChild(filter);
  let size = '';
  const update = () => {
   const w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight);
   if(!w || !h || `${w}x${h}` === size)return;
   size = `${w}x${h}`;
   for(const node of [filter, image]){
    node.setAttribute('x', '0'); node.setAttribute('y', '0');
    node.setAttribute('width', String(w)); node.setAttribute('height', String(h));
   }
   image.setAttribute('href', drawMap(w, h, radius, band));
   el.style.setProperty('--lens', `url(#${id})`);
  };
  const observer = new ResizeObserver(update);
  observer.observe(el);
  update();
  return () => { observer.disconnect(); filter.remove(); el.style.removeProperty('--lens'); };
 }, [ref, radius, band, depth]);
}
