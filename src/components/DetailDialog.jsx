import React, { useState } from 'react';
import Dialog from './Dialog.jsx';
import { ListingImage } from './Listing.jsx';
import Icon from '../icons.jsx';
import { cap, money, priceRange, COMPARE_MAX } from '../data.js';

export default function DetailDialog({item, items, onClose, onEdit, compared, compareFull, onToggleCompare}){
 const [activePhoto, setActivePhoto] = useState(0);
 const range = priceRange(items, item.category, item.id);
 const images = item.photos || [];
 const subject = encodeURIComponent(`Campus Exchange: ${item.title}`);
 const body = encodeURIComponent(`Hi ${item.seller},\n\nI'm interested in your listing "${item.title}" (EGP ${item.price}). Is it still available?\n\n`);
 return <Dialog label="Item details" onClose={onClose} className="detail-panel">
  <div className="detail-layout">
  <div className="detail-media">
  <div className="detail-visual">
   <ListingImage src={images[activePhoto] || images[0]} alt={`${item.title} photo ${activePhoto+1}`} emoji={item.emoji} className="detail-img" />
  </div>
  {images.length>1&&<div className="detail-thumbs" aria-label="Item photos">{images.map((src,index)=><button type="button" key={index} className={activePhoto===index?'thumb active':'thumb'} aria-label={`Show photo ${index+1} of ${images.length}`} aria-pressed={activePhoto===index} onClick={()=>setActivePhoto(index)}><ListingImage src={src} alt="" emoji={item.emoji} className="thumb-img" /></button>)}</div>}
  </div>
  <div className="detail-body">
  <p className="detail-kicker">{cap(item.category)} · {cap(item.condition)}</p>
  <h2>{item.title}</h2>
  <p className="detail-price">{money(item.price)}</p>
  <p className="price-context">{range
    ? <>Other active listings in {cap(item.category)}: {range.min === range.max ? money(range.min) : `${money(range.min)} to ${money(range.max)}`} ({range.count} {range.count === 1 ? 'listing' : 'listings'})</>
    : <>No other active listings in {cap(item.category)}.</>}</p>
  <p className="item-description">{item.description||'No description supplied.'}</p>
  <dl className="detail-meta">
   <div><dt><Icon name="pin" size={16} /> Pickup</dt><dd>{item.pickup || 'Arrange directly with seller'}</dd></div>
   <div><dt><Icon name="user" size={16} /> Seller</dt><dd>{item.seller}</dd></div>
  </dl>
  {item.status==='sold'&&<p className="detail-status"><span className="soldstatus">Sold</span> · only you can see this listing now.</p>}
  <div className="detail-actions">
   {item.status==='active'&&<button type="button" className="button-glass" aria-pressed={compared} disabled={!compared && compareFull} onClick={()=>onToggleCompare(item.id)}><Icon name={compared?'check':'compare'} size={16} /> {compared ? 'In compare' : compareFull ? `Compare is full (${COMPARE_MAX})` : 'Add to compare'}</button>}
   {item.owner==='you'
     ? <button type="button" className="button-accent" onClick={()=>onEdit(item)}><Icon name="edit" size={16} /> Edit your listing</button>
     : item.status==='sold'
       ? <p className="fineprint">This item is marked as sold.</p>
       : <a className="button-accent contact-seller" href={`mailto:${item.sellerEmail}?subject=${subject}&body=${body}`}><Icon name="mail" size={16} /> Contact seller</a>}
  </div>
  </div>
  </div>
 </Dialog>;
}
