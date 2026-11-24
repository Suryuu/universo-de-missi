/* Pequeños signos interactivos del cuento. El texto de cada control está en el HTML. */
(() => {
  "use strict";
  const shapes = {
    map:'<path d="m2.5 5.5 6.2-2 6.5 2.7 6.3-2.1v14.8l-6.2 2.1-6.5-2.8-6.3 2.2z"/><path d="M8.7 3.6v14.5m6.5-11.9v14.5"/>',
    compass:'<circle cx="12" cy="12" r="9.1"/><path d="m16.8 7.2-3.1 6.5-6.5 3.1 3.1-6.5Z"/><path d="m10.3 10.3 3.4 3.4"/>',
    moon:'<path d="M20.8 14.4A9 9 0 0 1 9.5 3.2 9 9 0 1 0 20.8 14.4Z"/><path d="m17.4 2 .7 2.2 2.2.7-2.2.7-.7 2.2-.7-2.2-2.1-.7 2.1-.7z" stroke-width="1.25"/>',
    star:'<path d="m12 2.4 2.7 6.2 6.8.7-5.1 4.5 1.5 6.7-5.9-3.4-5.9 3.4 1.5-6.7-5.1-4.5 6.8-.7z"/>',
    sparkle:'<path d="m11 2 1.7 6.8L19 11l-6.3 2-1.7 7-2-7-6-2 6-2.2z"/><path d="m19 14 .8 2.4L22 17l-2.2.7-.8 2.3-.7-2.3L16 17l2.3-.6z" stroke-width="1.2"/>',
    paw:'<path d="M8.4 13.7c1.1-2 1.9-3.4 3.6-3.4s2.5 1.4 3.6 3.4c1.2 1.8 3.5 2.4 3.2 4.6-.3 2.1-2.1 2.3-3.9 1.6a7.2 7.2 0 0 0-5.8 0c-1.8.7-3.5.5-3.9-1.6-.3-2.2 2-2.8 3.2-4.6Z"/><ellipse cx="4.6" cy="10" rx="1.7" ry="2.5" transform="rotate(-24 4.6 10)"/><ellipse cx="9.3" cy="6.2" rx="1.65" ry="2.55" transform="rotate(-9 9.3 6.2)"/><ellipse cx="14.7" cy="6.2" rx="1.65" ry="2.55" transform="rotate(9 14.7 6.2)"/><ellipse cx="19.5" cy="10" rx="1.65" ry="2.5" transform="rotate(24 19.5 10)"/>',
    music:'<path d="M9 17.6V5.9l11-2.5v12"/><path d="m9 9 11-2.5"/><ellipse cx="6" cy="18" rx="3" ry="2.3"/><ellipse cx="17" cy="15.9" rx="3" ry="2.3"/>',
    play:'<path d="m8 4.5 11 7.5-11 7.5z" fill="currentColor" stroke-width="1.1"/>',
    pause:'<path d="M8 5v14m8-14v14" stroke-width="3.6"/>',
    next:'<path d="m5 5.5 10 6.5-10 6.5z"/><path d="M19 5v14"/>',
    prev:'<path d="M19 5.5 9 12l10 6.5z"/><path d="M5 5v14"/>',
    x:'<path d="m6 6 12 12M18 6 6 18"/>',
    check:'<path d="m4.5 12.5 4.4 4.6L19.5 6.7"/>',
    chevron:'<path d="m6.5 9.5 5.5 5 5.5-5"/>',
    door:'<path d="M4 21h16M6 20V5l12-2v17M6 5h9"/><circle cx="14.7" cy="12" r=".7"/>',
    cat:'<path d="m4 11 .5-7L10 8q2-.7 4 0l5.4-4 .6 7q3.2 9-8 9.5Q1 20 4 11Z"/><path d="M7.5 13q1.3 1 2.5 0m4 0q1.3 1 2.5 0M11 16l1 .8 1-.8M1 14l3.7.8m-.5 2L1.7 18M20 15l3-1m-3 2.8 2.5 1"/>',
    grid:'<rect x="3" y="3.5" width="7" height="7" rx="1.4"/><rect x="14" y="3.5" width="7" height="7" rx="1.4"/><rect x="3" y="14" width="7" height="7" rx="1.4"/><rect x="14" y="14" width="7" height="7" rx="1.4"/>',
    radio:'<circle cx="10" cy="12" r="7"/><circle cx="10" cy="12" r="2.1"/><path d="M19 3h2v10l-4 4"/>',
    window:'<path d="M4 21V10a8 8 0 0 1 16 0v11zM12 2v19M4 12h16M2.5 21h19"/>',
    book:'<path d="M3 4.5q4.5-2 9 1 4.5-3 9-1v14q-4.5-2-9 1-4.5-3-9-1zM12 5.5v14"/>',
    soda:'<path d="M10 2.5h4M10.4 3v4c0 1.8-2.9 4.2-2.9 6.6v6.1q0 1.5 1.5 1.5h6q1.5 0 1.5-1.5v-6.1c0-2.4-2.9-4.8-2.9-6.6V3M7.8 13.2h8.4m-8.4 4.3h8.4"/>',
    gift:'<path d="M4 11v10h16V11M12 8.5V21"/><rect x="2.5" y="7.5" width="19" height="4.5" rx=".8"/><path d="M12 7.3c-5.8.2-7.1-2-5.5-3.6 1.5-1.6 4.1.3 5.5 3.6Zm0 0c5.8.2 7.1-2 5.5-3.6-1.5-1.6-4.1.3-5.5 3.6Z"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
    ham:'<path d="M8.8 6.4c3.2-2.3 7.8-2.1 10.1 1.1 3.4 4.7-.3 10.5-5.9 11-4.9.5-8.2-3.6-7.8-7.2.2-1.9 1.4-3.8 3.6-4.9Z"/><path d="M7.7 9.5c2.5-2.6 6.2-3.4 8.9-1.5"/><circle cx="13.5" cy="13" r="2"/>',
    hat:'<path d="m5 18 6-15 8.3 14.2M5 18q6.4 4.5 14.3-.8"/><path d="m8 11 7-1m-8.4 5 10.2-1"/>',
    joystick:'<path d="M7 7.5h10c3.5 0 6.4 9.2 3.4 10.4-2 .8-4-2.7-5.6-2.7H9.2c-1.6 0-3.6 3.5-5.6 2.7-3-1.2-.1-10.4 3.4-10.4Z"/><path d="M8 9.7v4m-2-2h4"/><circle cx="16" cy="11.6" r=".7"/><circle cx="18.3" cy="10.1" r=".65"/>',
    phones:'<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="12" width="4" height="8" rx="1.8"/><rect x="17" y="12" width="4" height="8" rx="1.8"/>',
    cake:'<path d="M3 20h18M5 19v-7q3.5-3.5 7 0 3.5-3.5 7 0v7M7 10V7m5 3V6m5 4V7M7 4l.4-1M12 3l.5-1M17 4l.5-1"/>',
    mail:'<rect x="2.6" y="5" width="18.8" height="14" rx="1.8"/><path d="m3.4 6 8.6 7 8.6-7M3.8 18l6-6m10.4 6-6-6"/>',
    house:'<path d="m2 11 10-8 10 8M5 9.3v11h14v-11M10 20v-7h4v7"/>',
    bulb:'<path d="M8.5 16c0-3-3.2-3.6-3.2-7.5a6.7 6.7 0 0 1 13.4 0c0 3.9-3.2 4.5-3.2 7.5zm1 3h5m-4 2h3"/>',
    replay:'<path d="M4 7v5h5M4.3 11.5A8 8 0 1 1 6 18"/>',
    sun:'<circle cx="12" cy="12" r="4.1"/><path d="M12 1.5v3m0 15v3M1.5 12h3m15 0h3M4.6 4.6l2.1 2.1m10.6 10.6 2.1 2.1m0-14.8-2.1 2.1M6.7 17.3l-2.1 2.1"/>',
    shell:'<path d="M4 16c-5-10 6-17 13-11 7 5 4 14-3 16l-3-6-7 1Z"/><path d="M9 13c-1-4 3-7 6-5 3 2 1 6-2 5"/>',
    ribbon:'<path d="m12 2 2.5 2 3.2.5.6 3.1 1.8 2.5-1.8 2.5-.6 3.1-3.2.5-2.5 2-2.5-2-3.2-.5-.6-3.1-1.8-2.5 1.8-2.5.6-3.1L9.5 4Z"/><path d="m7 16-1.4 5.6 3.2-1.5 2.2 2 1-4m4.8-2 1.8 5.5-3.3-1.3-1.6 1.9-1-3.9"/>'
  };
  window.signo = (key, more = '') => '<svg class="icon '+more+'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+(shapes[key] || shapes.sparkle)+'</svg>';
  document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = window.signo(el.dataset.icon); });
})();
