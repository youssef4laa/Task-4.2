import React, { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '../icons.jsx';
import Dropdown from './Dropdown.jsx';
import MoreFilters from './Filters.jsx';
import { ListingCard } from './Listing.jsx';
import { categories, cap, money, isBuyable, conditionRank } from '../data.js';

const sorts = [
 {value:'featured', label:'Featured'},
 {value:'low', label:'Price: low to high'},
 {value:'high', label:'Price: high to low'},
 {value:'condition', label:'Best condition first'},
];
const text = x => `${x.title} ${x.category} ${x.description} ${x.pickup || ''} ${x.seller}`.toLowerCase();

// Everything for sale. Sold items never show here, so every card is available. One category
// dropdown replaces the old tabs; budget and condition live behind "More filters".
// Filters belong to this page, so they start fresh each time the page opens (and after publishing).
export default function Explore({items, compare, onToggleCompare, onOpen, fresh}){
 const heading = useRef(null);
 const [query, setQuery] = useState('');
 const [category, setCategory] = useState('all');
 const [sort, setSort] = useState('featured');
 const [budget, setBudget] = useState(null); // null = any price
 const [picked, setPicked] = useState([]); // conditions
 const [more, setMore] = useState(false);
 useEffect(() => heading.current?.focus({preventScroll:true}), []);

 const forSale = useMemo(() => items.filter(x => x.status === 'active'), [items]);
 const q = query.trim().toLowerCase();
 const matches = x => text(x).includes(q) && (!picked.length || picked.includes(x.condition));
 const inCategory = x => category === 'all' || x.category === category;
 const pool = forSale.filter(x => matches(x) && inCategory(x));
 const listing = useMemo(() => {
  const a = pool.filter(x => budget === null || x.price <= budget);
  if(sort === 'low')a.sort((a, b) => a.price - b.price);
  if(sort === 'high')a.sort((a, b) => b.price - a.price);
  if(sort === 'condition')a.sort((a, b) => conditionRank(a.condition) - conditionRank(b.condition) || a.price - b.price);
  return a;
 }, [forSale, q, picked, category, budget, sort]);
 const categoryOptions = categories.map(c => ({value:c, label:c === 'all' ? 'All items' : cap(c), count:forSale.filter(x => matches(x) && (c === 'all' || x.category === c) && (budget === null || x.price <= budget)).length}));
 const top = Math.max(500, Math.ceil(Math.max(0, ...forSale.map(x => x.price)) / 100) * 100);
 const buyable = listing.filter(isBuyable);
 const lowestId = buyable.length > 1 ? buyable.reduce((a, b) => b.price < a.price ? b : a).id : null;
 const advanced = (budget !== null) + picked.length;
 const filtered = advanced > 0 || q || category !== 'all';
 const clear = () => { setBudget(null); setPicked([]); setQuery(''); setCategory('all'); };
 const scope = [category !== 'all' && cap(category), budget !== null && `${money(budget)} or less`, picked.length && picked.map(cap).join(' or '), q && `matching "${query.trim()}"`].filter(Boolean).join(', ');

 return <div className="page explore">
  <header className="page-head">
   <h1 ref={heading} tabIndex={-1}>Explore items</h1>
   <p>Everything students are selling around campus right now. All prices in EGP.</p>
  </header>
  <div className="explore-bar">
   <label className="search glass"><Icon name="search" /><input type="search" aria-label="Search listings" placeholder="Search listings" value={query} onChange={e => setQuery(e.target.value)} /></label>
   <Dropdown label="Category" value={category} options={categoryOptions} onChange={setCategory} />
   <Dropdown label="Sort" value={sort} options={sorts} onChange={setSort} align="end" />
   <button type="button" className="more-toggle glass" aria-label={advanced ? `More filters, ${advanced} on` : 'More filters'} aria-expanded={more} aria-controls="more-filters" onClick={() => setMore(m => !m)}>
    <Icon name="sliders" /><span>More filters</span>{advanced > 0 && <span className="badge">{advanced}</span>}<Icon name="chevron" size={16} className="chev" />
   </button>
  </div>
  {more && <MoreFilters id="more-filters" top={top} budget={budget} setBudget={setBudget} picked={picked} setPicked={setPicked} />}
  <div className="results-line" aria-live="polite">
   <p><strong>{listing.length}</strong> {listing.length === 1 ? 'item' : 'items'}{scope && <span>, {scope}</span>}</p>
   {filtered ? <button type="button" className="text-button" onClick={clear}>Clear filters</button>
     : listing.length > 1 && <p className="hint">Tick <strong>Compare</strong> on two or more to see them side by side.</p>}
  </div>
  <div className="listing-grid">
   {listing.map(item => <ListingCard key={item.id} item={item} onOpen={() => onOpen(item.id)} compared={compare.includes(item.id)} onToggleCompare={onToggleCompare} lowest={item.id === lowestId} fresh={item.id === fresh} />)}
   {listing.length === 0 && <div className="noresults glass">
    <p>No items match {filtered ? 'your search and filters' : 'yet'}.</p>
    {budget !== null && pool.length > 0 && <p>The cheapest one here is {money(Math.min(...pool.map(x => x.price)))}.</p>}
    <div className="noresults-actions">
     {filtered && <button type="button" className="button-glass" onClick={clear}>Show all items</button>}
     <a href="#/sell" className="button-accent"><Icon name="plus" size={16} /> Sell an item</a>
    </div>
   </div>}
  </div>
 </div>;
}
