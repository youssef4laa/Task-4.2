import React, { useEffect, useRef, useState } from 'react';
import Icon from '../icons.jsx';
import Segmented from './Segmented.jsx';
import { ListingImage } from './Listing.jsx';
import { currentUser, cap, money, isMine, priceRange } from '../data.js';

const tabs = [{value:'active', label:'For sale'}, {value:'sold', label:'Sold'}, {value:'all', label:'All'}];
const empty = {active:'Nothing of yours is for sale right now.', sold:'You have not sold anything yet.', all:'You have not listed anything yet.'};

// The signed-in student's own corner: who buyers will contact, and every listing they own with the
// actions an owner needs (edit, mark as sold, relist). Every figure is counted from the listings.
export default function Profile({items, fresh, onOpen, onEdit, onSetStatus}){
 const heading = useRef(null);
 const [tab, setTab] = useState('active');
 useEffect(() => heading.current?.focus({preventScroll:true}), []);
 // A listing just published is for sale, so make sure the tab shows it.
 useEffect(() => { if(fresh)setTab(t => t === 'sold' ? 'active' : t); }, [fresh]);

 const mine = items.filter(isMine);
 const active = mine.filter(x => x.status === 'active');
 const sold = mine.filter(x => x.status === 'sold');
 const shown = tab === 'all' ? mine : tab === 'active' ? active : sold;
 const asking = active.reduce((sum, x) => sum + x.price, 0);

 return <div className="page profile">
  <a href="#/" className="text-button back-link"><Icon name="chevron" size={16} className="flip" /> Home</a>
  <section className="profile-head" aria-labelledby="profile-title">
   <span className="profile-avatar" aria-hidden="true">{currentUser.name[0]}</span>
   <div className="profile-who">
    <h1 id="profile-title" ref={heading} tabIndex={-1}>Your profile</h1>
    <p>Signed in as <strong>{currentUser.name}</strong> · {currentUser.email}</p>
    <p className="profile-note">Buyers who press Contact seller on one of your listings email this address.</p>
   </div>
   <a href="#/sell" className="button-accent"><Icon name="plus" size={16} /> Sell an item</a>
  </section>

  <dl className="profile-stats glass">
   <div><dt>For sale</dt><dd>{active.length}</dd></div>
   <div><dt>Sold</dt><dd>{sold.length}</dd></div>
   <div><dt>Asking total, for sale</dt><dd>{money(asking)}</dd></div>
  </dl>

  <section className="mine" aria-labelledby="mine-title">
   <div className="mine-top">
    <h2 id="mine-title">Your listings</h2>
    <Segmented label="Show" options={tabs} value={tab} onChange={setTab} counts={{active:active.length, sold:sold.length, all:mine.length}} />
   </div>
   {shown.length ? <ul className="mine-list">
    {shown.map(item => {
     const range = item.status === 'active' ? priceRange(items, item.category, item.id) : null;
     return <li key={item.id} id={`mine-${item.id}`} className="mine-row glass" data-fresh={fresh === item.id || undefined}>
      <button type="button" className="mine-thumb" onClick={() => onOpen(item.id)} aria-label={`View ${item.title}`}><ListingImage src={item.photos?.[0]} alt="" emoji={item.emoji} /></button>
      <div className="mine-info">
       <h3><button type="button" onClick={() => onOpen(item.id)}>{item.title}</button></h3>
       <p>{cap(item.category)} · {cap(item.condition)} · <span className={item.status === 'sold' ? 'soldstatus' : 'instock'}>{item.status === 'sold' ? 'Sold' : 'For sale'}</span></p>
       {item.status === 'active' && <p className="mine-market">{range
         ? <>Others in {cap(item.category)}: {range.min === range.max ? money(range.min) : `${money(range.min)} to ${money(range.max)}`}</>
         : <>No other {cap(item.category)} listings for sale</>}</p>}
      </div>
      <strong className="mine-price">{money(item.price)}</strong>
      <div className="mine-actions">
       <button type="button" className="button-glass" onClick={() => onEdit(item)}><Icon name="edit" size={16} /> Edit</button>
       <button type="button" className="button-glass" onClick={() => onSetStatus(item, item.status === 'active' ? 'sold' : 'active')}>{item.status === 'active' ? <><Icon name="check" size={16} /> Mark as sold</> : 'Relist'}</button>
      </div>
     </li>;
    })}
   </ul> : <div className="noresults glass"><p>{empty[tab]}</p><div className="noresults-actions"><a href="#/sell" className="button-accent"><Icon name="plus" size={16} /> Sell an item</a></div></div>}
  </section>
 </div>;
}
