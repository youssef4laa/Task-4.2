import React from 'react';

// One outline set, 1.75 stroke, drawn on a 24px grid.
const paths = {
 search: <><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></>,
 close: <path d="M6 6l12 12M18 6 6 18"/>,
 plus: <path d="M12 5v14M5 12h14"/>,
 check: <path d="m5 12.5 4.5 4.5L19 7.5"/>,
 compare: <><rect x="3.5" y="5" width="7" height="14" rx="2"/><rect x="13.5" y="5" width="7" height="14" rx="2"/></>,
 arrow: <path d="M7 17 17 7M9 7h8v8"/>,
 chevron: <path d="m9 6 6 6-6 6"/>,
 mail: <><rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="m4.5 7 7.5 6 7.5-6"/></>,
 pin: <><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.3"/></>,
 user: <><circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.9-3.6 3.6-5.5 7-5.5s6.1 1.9 7 5.5"/></>,
 edit: <path d="M4.5 19.5h4l10-10a2.8 2.8 0 0 0-4-4l-10 10v4ZM13.5 6.5l4 4"/>,
 image: <><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="9.5" r="1.6"/><path d="m4 17 4.5-4.5 3.5 3.5 2.5-2.5L20 19"/></>,
 trash: <path d="M5 7h14M9.5 7V5h5v2M7 7l.8 12h8.4L17 7"/>,
 sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/></>,
 moon: <path d="M19.5 14.5A7.5 7.5 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10Z"/>,
 auto: <><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor"/></>,
 tag: <><path d="M3.5 12.6V4.5h8.1l8.9 8.9-8.1 8.1-8.9-8.9Z"/><circle cx="8" cy="9" r="1.4"/></>,
 sliders: <path d="M4 7h10M18 7h2M4 17h4M12 17h8M16 4.5v5M10 14.5v5"/>,
};

export default function Icon({name, size = 18, className = ''}){
 return <svg className={`icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}
