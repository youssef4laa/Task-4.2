import React, { useEffect, useState } from 'react';
import Icon from '../icons.jsx';
import { cap, money } from '../data.js';

export function ListingImage({src, alt, emoji, className=''}) {
 const [broken, setBroken] = useState(false);
 useEffect(() => setBroken(false), [src]);
 return src && !broken
   ? <img className={className} src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} />
   : <span className="item-emoji" role="img" aria-label="Photo unavailable">{emoji || '📦'}</span>;
}

// A pointer-following highlight on the glass rim; CSS only shows it on devices that hover.
const trackSheen = event => {
 const box = event.currentTarget.getBoundingClientRect();
 event.currentTarget.style.setProperty('--mx', `${event.clientX - box.left}px`);
 event.currentTarget.style.setProperty('--my', `${event.clientY - box.top}px`);
};

// The whole card opens the item: the title button stretches over the card, and only the Compare
// toggle sits above it as a separate control.
export function ListingCard({item, onOpen, compared, onToggleCompare, lowest, fresh, preview, featured}){
 return <article id={preview ? undefined : `listing-${item.id}`} className="product glass" data-compared={compared || undefined} data-fresh={fresh || undefined} data-preview={preview || undefined} data-featured={featured || undefined} onPointerMove={trackSheen}>
  <div className="photo-wrap">
   <ListingImage src={item.photos?.[0]} alt="" emoji={item.emoji} className="listing-img" />
   <span className="stamp glass-chip">{cap(item.condition)}</span>
   {!preview && <button type="button" className="compare-toggle glass-chip" aria-pressed={!!compared}
    aria-label={compared ? `Remove ${item.title} from compare` : `Add ${item.title} to compare`}
    onClick={() => onToggleCompare(item.id)}><Icon name={compared ? 'check' : 'plus'} size={16} /><span>{compared ? 'Comparing' : 'Compare'}</span></button>}
  </div>
  <div className="prod-details">
   <p className="prod-topline">{cap(item.category)}</p>
   <h3>{preview ? item.title : <button type="button" className="card-link" onClick={onOpen}>{item.title}</button>}</h3>
   <p className="prod-desc">{item.description}</p>
   {(lowest || item.owner==='you') && <div className="pill-row">
    {lowest && <span className="pill pill-good"><Icon name="tag" size={12} /> Lowest price here</span>}
    {item.owner==='you' && <span className="pill pill-mine">Your listing</span>}
   </div>}
   <div className="costline"><strong>{money(item.price)}</strong><span>{item.owner==='you'?'You':item.seller}</span></div>
  </div>
 </article>;
}
