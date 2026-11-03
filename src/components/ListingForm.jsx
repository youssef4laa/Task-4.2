import React, { useEffect, useRef, useState } from 'react';
import { ListingCard } from './Listing.jsx';
import Icon from '../icons.jsx';
import { categories, conditions, currentUser, emptyForm, cap, money, findErrors, priceRange, categoryEmoji } from '../data.js';

const MAX_PHOTOS = 4;
const order = ['title', 'price', 'category', 'condition', 'status'];

// Photos are stored in this browser, so each one is scaled down to keep localStorage small.
function shrink(file, max = 1000){
 return new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
   const k = Math.min(1, max / Math.max(img.width, img.height));
   const canvas = document.createElement('canvas');
   canvas.width = Math.round(img.width * k); canvas.height = Math.round(img.height * k);
   canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
   URL.revokeObjectURL(url);
   resolve(canvas.toDataURL('image/jpeg', .8));
  };
  img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('unreadable')); };
  img.src = url;
 });
}

const toForm = item => item ? {title:item.title, price:String(item.price), category:item.category, condition:item.condition, description:item.description, pickup:item.pickup || '', status:item.status, photos:item.photos || []} : {...emptyForm};

// Selling and editing are pages of their own (#/sell, #/edit/<id>): the form on the left, and on wide
// screens a live preview of the card buyers will see.
export default function ListingForm({item, items, onSave, onCancel, backLabel}){
 const heading = useRef(null);
 const [form, setForm] = useState(() => toForm(item));
 useEffect(() => heading.current?.focus({preventScroll:true}), []);
 const [errors, setErrors] = useState({});
 const [photoNote, setPhotoNote] = useState('');
 const [dragging, setDragging] = useState(false);
 const [resizing, setResizing] = useState(0);
 const formRef = useRef(null);
 // Resizing is async; once the page has been left its results must be dropped.
 const open = useRef(true);
 useEffect(() => () => { open.current = false; }, []);
 const range = form.category ? priceRange(items, form.category, item?.id) : null;

 const update = (field, value) => {
  const next = {...form, [field]:value};
  setForm(next);
  if(errors[field])setErrors(e => ({...e, [field]:findErrors(next)[field]}));
 };
 const set = field => e => update(field, e.target.value);
 const fieldProps = field => ({'aria-invalid':!!errors[field] || undefined, 'aria-describedby':errors[field] ? `${field}-error` : undefined});
 const errorText = field => errors[field] && <small className="field-error" id={`${field}-error`}><Icon name="close" size={14} />{errors[field]}</small>;

 async function addPhotos(files){
  const images = [...files].filter(f => f.type.startsWith('image/'));
  const room = MAX_PHOTOS - form.photos.length;
  if(!images.length){ setPhotoNote('Choose image files (JPG, PNG, WebP or HEIC your browser can open).'); return; }
  if(room <= 0){ setPhotoNote(`You can add up to ${MAX_PHOTOS} photos.`); return; }
  const batch = images.slice(0, room);
  setResizing(n => n + batch.length);
  const added = [];
  for(const file of batch){
   try { added.push(await shrink(file)); } catch { if(open.current)setPhotoNote(`${file.name} could not be opened.`); }
   if(open.current)setResizing(n => n - 1);
  }
  if(!open.current)return;
  if(images.length > room)setPhotoNote(`Only the first ${room} ${room === 1 ? 'photo was' : 'photos were'} added; the limit is ${MAX_PHOTOS}.`);
  else if(added.length === images.length)setPhotoNote('');
  setForm(f => ({...f, photos:[...f.photos, ...added].slice(0, MAX_PHOTOS)}));
 }
 const removePhoto = index => setForm(f => ({...f, photos:f.photos.filter((_, i) => i !== index)}));
 const makeCover = index => setForm(f => ({...f, photos:[f.photos[index], ...f.photos.filter((_, i) => i !== index)]}));

 function submit(event){
  event.preventDefault();
  if(resizing)return;
  const found = findErrors(form);
  setErrors(found);
  const first = order.find(f => found[f]);
  if(first){ formRef.current?.querySelector(`[name="${first}"]`)?.focus(); return; }
  onSave(form);
 }

 const preview = {id:'preview', title:form.title.trim() || 'Your item title', price:Number(form.price) >= 0 && String(form.price).trim() !== '' ? Number(form.price) : 0, category:form.category || 'other', condition:form.condition || 'used', description:form.description.trim() || 'Your description shows here.', status:form.status, owner:'you', seller:currentUser.name, photos:form.photos, emoji:categoryEmoji[form.category] || '📦'};
 const count = Object.values(errors).filter(Boolean).length;

 return <div className="page form-page">
  <button type="button" className="text-button back-link" onClick={onCancel}><Icon name="chevron" size={16} className="flip" /> {backLabel}</button>
  <header className="page-head">
   <h1 ref={heading} tabIndex={-1}>{item ? 'Edit your listing' : 'Sell an item'}</h1>
   <p>{item ? <>Changes show to buyers as soon as you save. Mark it as sold once it has gone.</> : <>Add the details and we'll take care of the rest. Fields marked * are required.</>}</p>
  </header>
   <div className="sell-layout">
    <form ref={formRef} className="form-panel glass" onSubmit={submit} noValidate>
     <div className="field-grid">
      <label className="wide"><span>Item title *</span><input name="title" value={form.title} onChange={set('title')} placeholder="What are you selling?" maxLength={80} {...fieldProps('title')} />{errorText('title')}</label>
      <label><span>Category *</span><select name="category" value={form.category} onChange={set('category')} {...fieldProps('category')}><option value="">Select</option>{categories.slice(1).map(c => <option value={c} key={c}>{cap(c)}</option>)}</select>{errorText('category')}</label>
      <label><span>Condition *</span><select name="condition" value={form.condition} onChange={set('condition')} {...fieldProps('condition')}><option value="">Select</option>{conditions.map(c => <option value={c} key={c}>{cap(c)}</option>)}</select>{errorText('condition')}</label>
      <label className="wide"><span>Price (EGP) *</span>
       <span className="price-input"><span aria-hidden="true">EGP</span><input name="price" type="number" min="0" step="0.01" inputMode="decimal" value={form.price} onChange={set('price')} placeholder="0" aria-describedby={[errors.price && 'price-error', 'price-help'].filter(Boolean).join(' ')} aria-invalid={!!errors.price || undefined} /></span>
       {errorText('price')}
       <small className="field-help" id="price-help">{!form.category ? 'Pick a category to see what similar items sell for on campus.' : range ? <>Other active listings in {cap(form.category)}: <strong>{range.min === range.max ? money(range.min) : `${money(range.min)} to ${money(range.max)}`}</strong> ({range.count} {range.count === 1 ? 'listing' : 'listings'}).</> : <>No other active listings in {cap(form.category)} yet, so yours will be the first.</>}</small>
      </label>
      <div className="field wide">
       <span id="photos-label">Photos <small className="field-help">optional, up to {MAX_PHOTOS}; the first one is the cover</small></span>
       <div className="photo-picker" aria-labelledby="photos-label">
        {form.photos.map((src, i) => <div className="photo-slot" key={i}>
         <img src={src} alt={`Photo ${i + 1}${i === 0 ? ', cover' : ''}`} />
         {i === 0 ? <span className="cover-tag glass-chip">Cover</span> : <button type="button" className="cover-tag glass-chip" onClick={() => makeCover(i)}>Make cover</button>}
         <button type="button" className="slot-remove glass-chip" aria-label={`Remove photo ${i + 1}`} onClick={() => removePhoto(i)}><Icon name="trash" size={16} /></button>
        </div>)}
        {form.photos.length + resizing < MAX_PHOTOS && <label className={`photo-drop${dragging ? ' dragging' : ''}`}
         onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
         onDrop={e => { e.preventDefault(); setDragging(false); addPhotos(e.dataTransfer.files); }}>
         <input type="file" accept="image/*" multiple className="sr-only" onChange={e => { addPhotos(e.target.files); e.target.value = ''; }} />
         <Icon name="image" size={22} /><span>Add photos</span>
        </label>}
        {Array.from({length:resizing}, (_, i) => <div className="photo-slot pending" key={`pending-${i}`} role="status">Adding…</div>)}
       </div>
       {photoNote && <small className="field-help" role="status">{photoNote}</small>}
      </div>
      <label className="wide"><span>Description</span><textarea name="description" value={form.description} onChange={set('description')} placeholder="Size, what's included, any marks or faults" rows="4"/></label>
      <label className="wide"><span>Pickup / meetup location</span><input name="pickup" value={form.pickup} onChange={set('pickup')} placeholder="e.g. Library entrance or arrange on campus" /></label>
      <label className="wide"><span>Seller contact email</span><input value={currentUser.email} readOnly aria-readonly="true" className="readonly-input" aria-describedby="email-help"/><small className="field-help" id="email-help">Taken from your registered account, so buyers can contact you about this item.</small></label>
      {item && <label><span>Status</span><select name="status" value={form.status} onChange={set('status')} {...fieldProps('status')}><option value="active">For sale</option><option value="sold">Sold</option></select>{errorText('status')}</label>}
     </div>
     {count > 0 && <p className="alert" role="alert">Unable to save item. Fix the {count === 1 ? 'highlighted field' : `${count} highlighted fields`}.</p>}
     <div className="form-actions"><button type="button" className="button-glass" onClick={onCancel}>Cancel</button><button className="button-accent" type="submit" disabled={resizing > 0}>{resizing ? 'Adding photos…' : item ? 'Save changes' : 'Publish item'}</button></div>
    </form>
    <aside className="sell-preview" aria-label="Listing preview">
     <p className="preview-label">How buyers will see it</p>
     <div aria-hidden="true"><ListingCard item={preview} preview /></div>
    </aside>
   </div>
 </div>;
}
