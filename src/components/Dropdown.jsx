import React, { useEffect, useId, useRef, useState } from 'react';
import Icon from '../icons.jsx';

// A glass select: a trigger button and a listbox that drops from it. Arrow keys move, Enter or
// Space chooses, Escape closes, and a click anywhere else closes it too.
export default function Dropdown({label, value, options, onChange, align = 'start'}){
 const id = useId();
 const [open, setOpen] = useState(false);
 const [active, setActive] = useState(0);
 const wrap = useRef(null), list = useRef(null), trigger = useRef(null);
 const current = options.find(o => o.value === value) || options[0];

 useEffect(() => {
  if(!open)return;
  setActive(Math.max(0, options.findIndex(o => o.value === value)));
  list.current?.focus({preventScroll:true});
  const outside = e => { if(!wrap.current?.contains(e.target))setOpen(false); };
  document.addEventListener('pointerdown', outside);
  return () => document.removeEventListener('pointerdown', outside);
 }, [open]);

 const choose = option => { onChange(option.value); setOpen(false); trigger.current?.focus(); };
 function onListKey(e){
  const last = options.length - 1;
  if(e.key === 'ArrowDown'){ e.preventDefault(); setActive(i => Math.min(last, i + 1)); }
  else if(e.key === 'ArrowUp'){ e.preventDefault(); setActive(i => Math.max(0, i - 1)); }
  else if(e.key === 'Home'){ e.preventDefault(); setActive(0); }
  else if(e.key === 'End'){ e.preventDefault(); setActive(last); }
  else if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); choose(options[active]); }
  else if(e.key === 'Escape'){ e.preventDefault(); setOpen(false); trigger.current?.focus(); }
  else if(e.key === 'Tab')setOpen(false);
 }

 return <div className="dropdown" ref={wrap}>
  <button ref={trigger} type="button" className="dropdown-trigger glass" aria-label={`${label}: ${current.label}`} aria-haspopup="listbox" aria-expanded={open} aria-controls={`${id}-list`}
   onClick={() => setOpen(o => !o)} onKeyDown={e => { if(e.key === 'ArrowDown' || e.key === 'ArrowUp'){ e.preventDefault(); setOpen(true); } }}>
   <span className="dropdown-label">{label}</span><span className="dropdown-value">{current.label}</span>
   <Icon name="chevron" size={16} className="chev" />
  </button>
  {open && <ul ref={list} id={`${id}-list`} role="listbox" tabIndex={-1} aria-label={label} aria-activedescendant={`${id}-${active}`}
   className={`dropdown-list glass glass-strong align-${align}`} onKeyDown={onListKey}>
   {options.map((o, i) => <li key={o.value} id={`${id}-${i}`} role="option" aria-selected={o.value === value} className={i === active ? 'active' : undefined}
    onPointerMove={() => setActive(i)} onClick={() => choose(o)}>
    <span>{o.label}</span>{o.count !== undefined && <span className="count">{o.count}</span>}
    <Icon name="check" size={16} className="tick" />
   </li>)}
  </ul>}
 </div>;
}
