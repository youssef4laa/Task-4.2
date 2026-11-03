import React, { useId } from 'react';
import Icon from '../icons.jsx';
import { conditions, cap, money } from '../data.js';

// The advanced filters behind "More filters": a budget slider and the item's condition.
// The slider's scale is fixed by the dearest listing, so it does not jump when the category changes.
export default function MoreFilters({id, top, budget, setBudget, picked, setPicked}){
 const budgetId = useId();
 const value = budget ?? top;
 const toggleCondition = c => setPicked(picked.includes(c) ? picked.filter(x => x !== c) : [...picked, c]);
 return <div id={id} className="more-filters glass">
  <div className="filter-group budget">
   <label className="filter-head" htmlFor={budgetId}>Budget <output htmlFor={budgetId}>{budget === null ? 'Any price' : money(budget)}</output></label>
   <input id={budgetId} type="range" min="0" max={top} step="10" value={value}
    aria-valuetext={budget === null ? 'Any price' : `${money(budget)} or less`}
    style={{'--fill':`${value / top * 100}%`}}
    onChange={e => { const n = Number(e.target.value); setBudget(n >= top ? null : n); }} />
  </div>
  <fieldset className="filter-group">
   <legend>Condition</legend>
   <div className="chip-grid">{conditions.map(c => <button type="button" key={c} className="chip chip-lg" aria-pressed={picked.includes(c)} onClick={() => toggleCondition(c)}>{picked.includes(c) && <Icon name="check" size={16} />}{cap(c)}</button>)}</div>
  </fieldset>
 </div>;
}
