import React, { useRef } from 'react';
import Dialog from './Dialog.jsx';
import { ListingImage } from './Listing.jsx';
import Icon from '../icons.jsx';
import { useLiquidLens } from '../glass.js';
import { COMPARE_MAX, cap, money, conditionRank, isMine } from '../data.js';

// Floating tray that collects listings to compare; it stays put while the student keeps browsing.
export function CompareTray({items, onRemove, onClear, onOpen}){
 const ref = useRef(null);
 useLiquidLens(ref, {radius:30, band:18, depth:30});
 const slots = Array.from({length:COMPARE_MAX}, (_, i) => items[i]);
 return <aside className="compare-tray glass" ref={ref} aria-label="Compare listings">
  <ul className="tray-slots">
   {slots.map((item, i) => <li key={item?.id || `empty-${i}`} className={item ? 'filled' : 'empty'}>
    {item && <><ListingImage src={item.photos?.[0]} alt="" emoji={item.emoji} /><button type="button" className="tray-remove" aria-label={`Remove ${item.title} from compare`} onClick={() => onRemove(item.id)}><Icon name="close" size={12} /></button></>}
   </li>)}
  </ul>
  <p className="tray-copy" aria-live="polite">{items.length < 2 ? <><strong>{items.length} selected.</strong> Add one more to compare.</> : <><strong>{items.length} of {COMPARE_MAX}</strong> ready to compare</>}</p>
  <button type="button" className="text-button" onClick={onClear}>Clear</button>
  <button type="button" className="button-accent" disabled={items.length < 2} onClick={onOpen}><Icon name="compare" size={16} /> Compare</button>
 </aside>;
}

const mailto = item => `mailto:${item.sellerEmail}?subject=${encodeURIComponent(`Campus Exchange: ${item.title}`)}&body=${encodeURIComponent(`Hi ${item.seller},\n\nI'm interested in your listing "${item.title}" (EGP ${item.price}). Is it still available?\n\n`)}`;

// Side-by-side table. Lowest price and best condition are worked out among the listings still for
// sale, and every other price shows how much more it costs than the cheapest.
export function CompareDialog({items, onClose, onView, onRemove, onEdit}){
 const live = items.filter(x => x.status === 'active');
 const lowest = live.length ? Math.min(...live.map(x => x.price)) : null;
 const best = live.length ? Math.min(...live.map(x => conditionRank(x.condition))) : null;
 const priceTie = live.every(x => x.price === lowest);
 const conditionTie = live.every(x => conditionRank(x.condition) === best);
 const row = (label, render) => <tr key={typeof label === 'string' ? label : 'actions'}><th scope="row">{label}</th>{items.map(item => <td key={item.id}>{render(item)}</td>)}</tr>;
 return <Dialog label="Compare listings" onClose={onClose} className="compare-sheet">
  <div className="modal-head"><h2>Compare {items.length} listings</h2><p>The lowest price and the best condition are marked.</p></div>
  <div className="compare-scroll" tabIndex={0} aria-label="Comparison table, scrolls sideways">
   <table className="compare-table" style={{'--cols':items.length}}>
    <thead><tr><td />{items.map(item => <th scope="col" key={item.id}>
     <div className="compare-photo"><ListingImage src={item.photos?.[0]} alt="" emoji={item.emoji} /></div>
     <span className="compare-title">{item.title}</span>
     <button type="button" className="text-button" onClick={() => onRemove(item.id)}>Remove</button>
    </th>)}</tr></thead>
    <tbody>
     {row('Price', item => <>
      <strong className="compare-price">{money(item.price)}</strong>
      {item.status === 'active' && !priceTie && (item.price === lowest
        ? <span className="pill pill-good"><Icon name="check" size={12} /> Lowest price</span>
        : <span className="compare-diff">{money(item.price - lowest)} more</span>)}
     </>)}
     {row('Condition', item => <>{cap(item.condition)}{item.status === 'active' && !conditionTie && conditionRank(item.condition) === best && <span className="pill pill-good"><Icon name="check" size={12} /> Best condition</span>}</>)}
     {row('Category', item => cap(item.category))}
     {row('Seller', item => isMine(item) ? 'You' : item.seller)}
     {row('Pickup', item => item.pickup || 'Arrange directly with seller')}
     {row('Description', item => <span className="compare-desc">{item.description || 'No description supplied.'}</span>)}
     {row(<span className="sr-only">Actions</span>, item => <div className="compare-actions">
      <button type="button" className="button-glass" onClick={() => onView(item.id)}>Details</button>
      {isMine(item)
        ? <button type="button" className="button-glass" onClick={() => onEdit(item)}><Icon name="edit" size={16} /> Edit</button>
        : item.status === 'active' && <a className="button-accent" href={mailto(item)}><Icon name="mail" size={16} /> Contact</a>}
     </div>)}
    </tbody>
   </table>
  </div>
 </Dialog>;
}
