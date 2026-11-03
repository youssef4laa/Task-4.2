import React, { useEffect, useRef } from 'react';
import Icon from '../icons.jsx';
import { ListingCard } from './Listing.jsx';
import { isBuyable } from '../data.js';

const DEALS = 5; // the cheapest one large, the next four beside it

// The home page answers "what's cheap right now?" and offers the two ways on: explore or sell.
export default function Home({items, compare, onToggleCompare, onOpen}){
 const heading = useRef(null);
 useEffect(() => heading.current?.focus({preventScroll:true}), []);
 const forSale = items.filter(x => x.status === 'active');
 const deals = items.filter(isBuyable).sort((a, b) => a.price - b.price).slice(0, DEALS);
 const sellers = new Set(forSale.map(x => x.seller)).size;
 return <div className="page home">
  <section className="home-head" aria-labelledby="home-title">
   <div>
    <h1 id="home-title" ref={heading} tabIndex={-1}>Lowest prices right now</h1>
    <p>Second-hand finds from students around campus, cheapest first. {forSale.length} items for sale from {sellers} {sellers === 1 ? 'student' : 'students'}, all prices in EGP.</p>
   </div>
   <div className="home-actions">
    <a href="#/explore" className="button-ink">Explore all items <Icon name="arrow" size={16} /></a>
    <a href="#/sell" className="button-accent"><Icon name="plus" size={16} /> Sell an item</a>
   </div>
  </section>
  {deals.length
   ? <div className="listing-grid deals-grid">{deals.map((item, i) => <ListingCard key={item.id} item={item} featured={i === 0} lowest={i === 0 && deals.length > 1} onOpen={() => onOpen(item.id)} compared={compare.includes(item.id)} onToggleCompare={onToggleCompare} />)}</div>
   : <div className="noresults glass"><p>Nothing for sale from other students yet.</p><div className="noresults-actions"><a href="#/sell" className="button-accent"><Icon name="plus" size={16} /> Sell an item</a></div></div>}
 </div>;
}
