import React, { useLayoutEffect, useRef, useState } from 'react';

// A row of options with a glass droplet that slides to the chosen one (categories, profile tabs).
export default function Segmented({options, value, onChange, counts = {}, label}){
 const row = useRef(null);
 const [drop, setDrop] = useState(null);
 useLayoutEffect(() => {
  const place = () => {
   const on = row.current?.querySelector('[aria-pressed="true"]');
   if(on)setDrop({x:on.offsetLeft, w:on.offsetWidth});
  };
  place();
  const observer = new ResizeObserver(place);
  observer.observe(row.current);
  return () => observer.disconnect();
 }, [value, counts]);
 return <div className="category-row glass" ref={row} role="group" aria-label={label}>
  {drop&&<span className="category-drop" aria-hidden="true" style={{transform:`translateX(${drop.x}px)`, width:drop.w}} />}
  {options.map(o=><button type="button" key={o.value} aria-pressed={value===o.value} onClick={()=>onChange(o.value)}>
   {o.label}<span className="count">{counts[o.value] ?? 0}</span>
  </button>)}
 </div>;
}
