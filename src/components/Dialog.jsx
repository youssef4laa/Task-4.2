import React, { useEffect, useRef, useState } from 'react';
import Icon from '../icons.jsx';

const stack = [];
const inertHolds = new Map(); // element -> number of open dialogs keeping it inert
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
const EXIT_MS = 160;

// Modal sheet: Escape and the backdrop close it, Tab stays inside, focus returns to the opener.
// Stacks, so a detail sheet can open on top of the comparison and Escape closes only the top one.
// Everything beside the open sheet is made inert, so neither Tab nor a screen reader reaches the page behind.
export default function Dialog({label, onClose, className = '', children}){
 const ref = useRef(null);
 const [closing, setClosing] = useState(false);
 const closeRef = useRef(onClose);
 closeRef.current = onClose;
 const requestClose = () => { setClosing(true); setTimeout(() => closeRef.current(), EXIT_MS); };
 const requestRef = useRef(requestClose);
 requestRef.current = requestClose;

 useEffect(() => {
  const node = ref.current;
  const opener = document.activeElement;
  stack.push(node);
  document.body.classList.add('has-dialog');
  const overlay = node.parentElement;
  const held = [...overlay.parentElement.children].filter(el => el !== overlay);
  held.forEach(el => { inertHolds.set(el, (inertHolds.get(el) || 0) + 1); el.inert = true; });
  (node.querySelector('[data-autofocus]') || node).focus({preventScroll:true});
  function onKey(event){
   if(stack[stack.length - 1] !== node)return;
   if(event.key === 'Escape'){ event.stopPropagation(); requestRef.current(); }
   if(event.key !== 'Tab')return;
   const items = [...node.querySelectorAll(FOCUSABLE)].filter(el => el.offsetParent !== null);
   if(!items.length)return;
   const first = items[0], last = items[items.length - 1];
   // Focus starts on the sheet itself, which is not in the list, so wrap from there too.
   if(document.activeElement === node || !node.contains(document.activeElement)){ event.preventDefault(); (event.shiftKey ? last : first).focus(); return; }
   if(event.shiftKey && document.activeElement === first){ event.preventDefault(); last.focus(); }
   else if(!event.shiftKey && document.activeElement === last){ event.preventDefault(); first.focus(); }
  }
  document.addEventListener('keydown', onKey);
  return () => {
   document.removeEventListener('keydown', onKey);
   stack.splice(stack.indexOf(node), 1);
   held.forEach(el => { const n = (inertHolds.get(el) || 1) - 1; if(n > 0)inertHolds.set(el, n); else { inertHolds.delete(el); el.inert = false; } });
   if(!stack.length)document.body.classList.remove('has-dialog');
   if(opener?.isConnected)opener.focus({preventScroll:true});
  };
 }, []);

 return <div className="overlay" data-closing={closing || undefined} onMouseDown={e => e.target === e.currentTarget && requestClose()}>
  <section ref={ref} className={`sheet glass glass-strong ${className}`} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}>
   <button type="button" className="close glass-button" aria-label={`Close ${label.toLowerCase()}`} onClick={requestClose}><Icon name="close" /></button>
   {typeof children === 'function' ? children(requestClose) : children}
  </section>
 </div>;
}
