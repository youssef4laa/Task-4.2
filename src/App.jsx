import React, { useEffect, useRef, useState } from 'react';
import { KEY, COMPARE_MAX, currentUser, seed, saved, money, categoryEmoji, isMine } from './data.js';
import { parseRoute, go, titles } from './router.js';
import { useLiquidLens } from './glass.js';
import Icon from './icons.jsx';
import Home from './components/Home.jsx';
import Explore from './components/Explore.jsx';
import Profile from './components/Profile.jsx';
import ListingForm from './components/ListingForm.jsx';
import { CompareTray, CompareDialog } from './components/Compare.jsx';
import DetailDialog from './components/DetailDialog.jsx';

const THEME_KEY = 'acl-marketplace-theme';
const themes = ['system', 'light', 'dark'];
function savedTheme(){try {return themes.includes(localStorage.getItem(THEME_KEY))?localStorage.getItem(THEME_KEY):'system';}catch{return 'system';}}
const TOAST_MS = 7000;

export default function App(){
 const [items,setItems] = useState(saved);
 const [route,setRoute] = useState(parseRoute);
 const [compare,setCompare] = useState([]);
 const [comparing,setComparing] = useState(false);
 const [selected,setSelected] = useState(null);
 const [notice,setNotice] = useState(null); // null or {text, id?}
 const [fresh,setFresh] = useState(null);
 const [theme,setTheme] = useState(savedTheme);
 const [resetKey,setResetKey] = useState(0);
 const from = useRef('#/'); // the page before this one: where Cancel and Save go back to
 const nav = useRef(null);
 useLiquidLens(nav, {radius:26, band:20, depth:34});

 useEffect(()=>{try {localStorage.setItem(KEY,JSON.stringify(items));}catch{setNotice({text:'Your browser storage is full, so the latest change was not saved. Try fewer or smaller photos.'});}},[items]);
 useEffect(()=>{
  const root=document.documentElement;
  if(theme==='system')root.removeAttribute('data-theme');else root.setAttribute('data-theme',theme);
  try {localStorage.setItem(THEME_KEY,theme);}catch{}
 },[theme]);
 useEffect(()=>{
  let current=location.hash||'#/';
  const onHash=()=>{
   from.current=current; current=location.hash||'#/';
   setRoute(parseRoute()); setSelected(null); setComparing(false);
   window.scrollTo(0,0);
  };
  window.addEventListener('hashchange',onHash);
  return ()=>window.removeEventListener('hashchange',onHash);
 },[]);
 useEffect(()=>{document.title=titles[route.page];},[route.page]);
 // Only items still for sale can be compared, so anything sold or removed drops out.
 useEffect(()=>setCompare(ids=>ids.filter(id=>items.some(x=>x.id===id&&x.status==='active'))),[items]);
 // However items leave the comparison, the sheet closes once fewer than two remain.
 useEffect(()=>{if(compare.length<2)setComparing(false);},[compare.length]);
 // A just-published listing is scrolled into view on its new page and glows for a moment.
 useEffect(()=>{
  if(!fresh)return;
  const frame=requestAnimationFrame(()=>(document.getElementById(`listing-${fresh}`)||document.getElementById(`mine-${fresh}`))?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'}));
  const timer=setTimeout(()=>setFresh(null),2600);
  return ()=>{cancelAnimationFrame(frame);clearTimeout(timer);};
 },[fresh,route.page]);
 useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(null),TOAST_MS);return ()=>clearTimeout(timer);},[notice]);

 // Back to the page the student came from, unless that was another form.
 function leave(fallback){const prev=from.current;go(prev&&prev!==location.hash&&!/^#\/(sell|edit)/.test(prev)?prev:fallback);}
 function toggleCompare(id){
  if(!compare.includes(id)&&compare.length>=COMPARE_MAX)setNotice({text:`Compare holds ${COMPARE_MAX} items. Remove one from the tray to add another.`});
  setCompare(ids=>ids.includes(id)?ids.filter(x=>x!==id):ids.length>=COMPARE_MAX?ids:[...ids,id]);
 }
 function startEdit(item){if(item&&isMine(item))go(`#/edit/${encodeURIComponent(item.id)}`);}
 function save(f){
  const id=route.page==='edit'?route.id:null;
  const original=id?items.find(x=>x.id===id):null;
  if(id&&!(original&&isMine(original)))return;
  const next={...f,title:f.title.trim(),price:Number(f.price),description:f.description.trim(),pickup:f.pickup.trim(),photos:f.photos||[],emoji:original?.emoji || categoryEmoji[f.category] || '📦',owner:'you',seller:currentUser.name,sellerEmail:currentUser.email};
  if(id){setItems(items.map(x=>x.id===id?{...x,...next}:x));setNotice({text:'Changes saved.',id});leave('#/profile');}
  else{
   const newId=`m-${Date.now()}`;
   setItems([{...next,id:newId,status:'active'},...items]);
   setFresh(newId);
   setNotice({text:`Item listed. "${next.title}" is now live for ${money(next.price)}.`,id:newId});
   go('#/explore');
  }
 }
 function setStatus(item,status){
  if(!isMine(item))return;
  setItems(items.map(x=>x.id===item.id?{...x,status}:x));
  setNotice({text:status==='sold'?`"${item.title}" is marked as sold.`:`"${item.title}" is for sale again.`,id:item.id});
 }
 function reset(){setItems(seed);setSelected(null);setComparing(false);setCompare([]);setResetKey(k=>k+1);setNotice({text:'Example items restored.'});}

 const selectedItem = selected && items.find(x=>x.id===selected);
 const compared = compare.map(id=>items.find(x=>x.id===id)).filter(Boolean);
 const onForm = route.page==='sell'||route.page==='edit';
 const showTray = compared.length>0&&!onForm&&!(comparing&&compared.length>1);
 const nextTheme = themes[(themes.indexOf(theme)+1)%themes.length];
 const editing = route.page==='edit'&&items.find(x=>x.id===route.id);

 let page;
 if(route.page==='explore')page=<Explore key={resetKey} items={items} compare={compare} onToggleCompare={toggleCompare} onOpen={setSelected} fresh={fresh} />;
 else if(route.page==='sell')page=<ListingForm key="sell" items={items} onSave={save} onCancel={()=>leave('#/')} backLabel="Back" />;
 else if(route.page==='edit')page=editing&&isMine(editing)
  ? <ListingForm key={editing.id} item={editing} items={items} onSave={save} onCancel={()=>leave('#/profile')} backLabel="Back" />
  : <div className="page"><header className="page-head"><h1>Listing not found</h1><p>You can only edit listings you own, and this one is not among them. It may have been removed by Reset demo.</p></header><a href="#/profile" className="button-glass">Go to your profile</a></div>;
 else if(route.page==='profile')page=<Profile key={resetKey} items={items} fresh={fresh} onOpen={setSelected} onEdit={startEdit} onSetStatus={setStatus} />;
 else page=<Home items={items} compare={compare} onToggleCompare={toggleCompare} onOpen={setSelected} />;

 return <div className="market-app" data-tray={showTray||undefined}>
  <div className="backdrop" aria-hidden="true"><span className="field field-nile"/><span className="field field-pyrite"/><span className="field field-sea"/><span className="field field-peach"/></div>
  <header className="navigation glass" ref={nav}>
   <a href="#/" className="brand" aria-current={route.page==='home'?'page':undefined} onClick={e=>{if(route.page==='home'){e.preventDefault();window.scrollTo({top:0,behavior:'smooth'});}}}><span className="brand-icon" aria-hidden="true"><Icon name="tag" size={16} /></span>Campus<span className="brand-alt">exchange</span></a>
   <div className="nav-actions">
    <button type="button" className="icon-button glass-button" onClick={()=>setTheme(nextTheme)} aria-label={`Colour theme: ${theme}. Switch to ${nextTheme}`} title={`Theme: ${theme}`}><Icon name={theme==='system'?'auto':theme==='light'?'sun':'moon'} /></button>
    <a href="#/profile" className="usercircle" aria-label="Your profile" title={`Signed in as ${currentUser.name}`} aria-current={route.page==='profile'?'page':undefined}>{currentUser.name[0]}</a>
   </div>
  </header>
  <main>
   {page}
   <footer><strong>Campus exchange</strong><span>From students, for students.</span><span className="credit">Colours from Sanzo Wada's plate 250, <i>A Dictionary of Color Combinations</i> (1933).</span><button type="button" onClick={reset}>Reset demo</button></footer>
  </main>
  <div className="toast-region" aria-live="polite">
   {notice&&<div className="toast glass glass-strong" key={`${notice.text}${notice.id||''}`}>
    <span>{notice.text}</span>
    {notice.id&&items.some(x=>x.id===notice.id)&&<button type="button" className="text-button" onClick={()=>{setSelected(notice.id);setNotice(null);}}>View listing</button>}
    <button type="button" className="notice-close" aria-label="Dismiss message" onClick={()=>setNotice(null)}><Icon name="close" size={16} /></button>
   </div>}
  </div>
  {showTray&&<CompareTray items={compared} onRemove={toggleCompare} onClear={()=>setCompare([])} onOpen={()=>setComparing(true)} />}
  {comparing&&compared.length>1&&<CompareDialog items={compared} onClose={()=>setComparing(false)} onView={setSelected} onRemove={toggleCompare} onEdit={startEdit} />}
  {selectedItem&&<DetailDialog key={selectedItem.id} item={selectedItem} items={items} onClose={()=>setSelected(null)} onEdit={startEdit} compared={compare.includes(selectedItem.id)} compareFull={compare.length>=COMPARE_MAX} onToggleCompare={toggleCompare} />}
 </div>;
}
