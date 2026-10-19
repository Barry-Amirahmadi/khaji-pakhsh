// Line icons on a 24px grid, drawn for this site. Stroke follows currentColor.
const paths = {
  // category icons
  cable: '<circle cx="10" cy="12" r="7"/><circle cx="10" cy="12" r="2.5"/><path d="M17 12h3a1 1 0 0 1 1 1v6"/>',
  switch: '<rect x="4" y="2.5" width="16" height="19" rx="3"/><rect x="8.5" y="6.5" width="7" height="11" rx="1.5"/><path d="M8.5 12h7"/>',
  breaker: '<rect x="6" y="2.5" width="12" height="19" rx="2"/><rect x="9.5" y="7" width="5" height="7" rx="1"/><path d="M12 8.5v2.5M9 18h6"/>',
  bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2v.2h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
  contactor: '<rect x="4" y="4.5" width="16" height="15" rx="2"/><circle cx="8" cy="8" r="1"/><circle cx="12" cy="8" r="1"/><circle cx="16" cy="8" r="1"/><circle cx="8" cy="16" r="1"/><circle cx="12" cy="16" r="1"/><circle cx="16" cy="16" r="1"/><path d="M7 12h10"/>',
  panel: '<rect x="4" y="2.5" width="16" height="19" rx="2"/><path d="M4 8.5h16M7 5.5h3M7.5 12v5M10.5 12v5M13.5 12v5"/><circle cx="17" cy="14.5" r="1"/>',
  conduit: '<path d="M3 4.5h8a9 9 0 0 1 9 9v7"/><path d="M3 9h8a4.5 4.5 0 0 1 4.5 4.5v7"/><path d="M3 4.5V9M15.5 20.5H20"/>',
  lug: '<circle cx="7" cy="12" r="4"/><circle cx="7" cy="12" r="1.5"/><path d="M11 10.5h6l3.5 1.5-3.5 1.5h-6"/>',
  // interface icons
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.5-4.5"/>',
  list: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  chevron: '<path d="m15 18-6-6 6-6"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  store: '<path d="M3 9l1.5-5h15L21 9M4 9v11h16V9M9.5 20v-6h5v6M3 9h18"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
};

export function icon(name, cls = 'i') {
  return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
}
