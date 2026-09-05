(() => {
  'use strict';

  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
  const state = { source: null, previousFocus: null, location: null };
  const shell = qs('.app-shell');
  const taskPanel = qs('#task-panel');
  const taskContent = qs('#task-content');
  const status = qs('#status');

  const icon = (name) => {
    const paths = {
      reach: '<path d="M10 3c8-1 13 5 12 12s-6 10-13 9C3 23 1 18 3 12s3-8 7-9Z"/><path d="M11 8c5 0 8 3 7 7s-3 6-7 6-6-3-5-7 2-6 5-6Z"/>',
      route: '<circle cx="5" cy="19" r="2"/><circle cx="19" cy="5" r="2"/><path d="M7 18c3-8 6-3 9-10l1-1"/>',
      need: '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5M10 7v6M7 10h6"/>',
      park: '<path d="M12 22V9M12 12l-5 5M12 14l5 4M5 14c-3-4 1-8 4-6 0-5 7-6 9-2 4 0 5 6 2 8"/>'
    };
    return `<svg class="panel-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.reach}</svg>`;
  };

  const templates = {
    reach: () => `${icon('reach')}<h2 id="task-title">Where can I go?</h2><p class="lead">Choose a time. Your journey preferences will shape a different reachable area.</p><div class="segmented" aria-label="Travel time">${[5,10,15,20,30].map(n => `<button type="button" aria-pressed="${n === 20}">${n}</button>`).join('')}</div><div class="inline-warning"><strong>Data-aware by design.</strong><br>The live reach engine is not connected yet. The preview will never treat missing access data as suitable.</div><button class="primary demo-action" type="button">Preview 20-minute reach</button>`,
    route: () => `${icon('route')}<h2 id="task-title">Take me there</h2><p class="lead">Compare the quickest option with a route that better matches your preferences.</p><label class="panel-label" for="from">From</label><input class="panel-input" id="from" placeholder="Current place or postcode"><label class="panel-label" for="to">To</label><input class="panel-input" id="to" placeholder="Destination"><div class="route-preview"><div><span>Fastest</span><strong>Waiting for route data</strong></div><div class="recommended"><span>Easier</span><strong>Explains every trade-off</strong></div></div><button class="primary demo-action" type="button">Compare routes</button>`,
    need: () => `${icon('need')}<h2 id="task-title">What do you need?</h2><p class="lead">Start with one clear need. Results will show distance, known facilities and data confidence.</p><div class="option-grid">${['Seat','Toilet','Accessible toilet','Changing Places','Safe Place','Pharmacy','Community hub'].map(x => `<label class="choice"><input type="radio" name="need"><span><strong>${x}</strong><small>Find nearest with known evidence</small></span></label>`).join('')}</div><button class="primary demo-action" type="button">Find nearest</button>`,
    park: () => `${icon('park')}<h2 id="task-title">Find a park</h2><p class="lead">Choose what matters. Unknown details stay visible instead of becoming a false match.</p><div class="option-grid">${['Gentle known paths','Regular benches','Accessible toilet','Changing Places','Accessible parking','Café'].map(x => `<label class="choice"><input type="checkbox"><span><strong>${x}</strong><small>Known match, mismatch or unknown</small></span></label>`).join('')}</div><button class="primary demo-action" type="button">Show park matches</button>`,
    preferences: () => `<h2 id="task-title">How do you like to move?</h2><p class="lead">These are journey choices, not medical questions. They stay on this device.</p><div class="option-grid"><label class="choice"><input type="radio" name="speed" checked><span><strong>Comfortable pace</strong><small>Use a steady everyday walking or wheeling speed</small></span></label><label class="choice"><input type="checkbox" checked><span><strong>Avoid steps</strong><small>Known steps will not be used</small></span></label><label class="choice"><input type="checkbox" checked><span><strong>Prefer flatter routes</strong><small>Estimated hills add route cost</small></span></label><label class="choice"><input type="checkbox"><span><strong>I prefer regular seats</strong><small>Highlight long gaps without known seating</small></span></label><label class="choice"><input type="checkbox"><span><strong>Accessible toilet is important</strong><small>Show known facilities along the journey</small></span></label></div><button class="primary save-preferences" type="button">Save preferences</button>`,
    data: () => `<h2 id="task-title">What the data can tell you</h2><p class="lead">The page uses the existing Leeds source register. No live accessibility release is active yet.</p><ul class="source-list" id="source-list"><li><span>Loading source register…</span></li></ul><div class="inline-warning">Old official data is not automatically current. Quarantined sources cannot appear in live results.</div>`
  };

  const announce = (message) => { status.textContent = ''; requestAnimationFrame(() => { status.textContent = message; }); };

  function openTask(name, trigger) {
    const render = templates[name] || templates.reach;
    state.previousFocus = trigger || document.activeElement;
    taskContent.innerHTML = render();
    taskPanel.hidden = false;
    shell.classList.add('task-open');
    qsa('.rail-link').forEach(button => button.classList.toggle('is-active', button.dataset.task === name));
    if (name === 'data') renderSources();
    qs('#task-title', taskPanel)?.focus?.();
    taskPanel.scrollTop = 0;
    announce(`${qs('#task-title', taskPanel)?.textContent || 'Task'} opened`);
  }

  function closeTask() {
    taskPanel.hidden = true;
    shell.classList.remove('task-open');
    state.previousFocus?.focus?.();
    announce('Returned to the map');
  }

  function renderSources() {
    const list = qs('#source-list');
    if (!list || !state.source) return;
    list.replaceChildren(...state.source.sources.map(source => {
      const li = document.createElement('li');
      const text = document.createElement('span');
      const strong = document.createElement('strong');
      const small = document.createElement('small');
      const badge = document.createElement('span');
      strong.textContent = source.label;
      small.textContent = source.status.replaceAll('_', ' ');
      text.append(strong, small);
      badge.className = `badge ${source.status.includes('prohibited') ? 'blocked' : source.status.includes('quarantined') || source.status.includes('stale') ? 'caution' : 'candidate'}`;
      badge.textContent = source.confidence;
      li.append(text, badge);
      return li;
    }));
  }

  async function loadDataStatus() {
    const mode = qs('#data-mode');
    const detail = qs('#data-detail');
    const dot = qs('.status-dot');
    try {
      const apiResponse = await fetch('/api/v1/meta', { headers: { Accept: 'application/json' } });
      if (!apiResponse.ok) throw new Error('API unavailable');
      const api = await apiResponse.json();
      mode.textContent = 'Live API connected';
      detail.textContent = `Data release ${api.dataReleaseId || 'not active'}`;
      qs('#text-data-status').textContent = detail.textContent;
      dot.classList.add('live');
    } catch {
      try {
        const localResponse = await fetch('./data/leeds.json');
        if (!localResponse.ok) throw new Error('Local register unavailable');
        state.source = await localResponse.json();
        mode.textContent = 'Leeds source register loaded';
        detail.textContent = 'No validated live accessibility release is active yet.';
        qs('#text-data-status').textContent = 'Source register only; no live accessibility release';
      } catch {
        mode.textContent = 'Data status unavailable';
        detail.textContent = 'The interface remains available. Try again later.';
        dot.classList.add('error');
      }
    }
  }

  qsa('[data-task]').forEach(button => button.addEventListener('click', () => openTask(button.dataset.task, button)));
  qs('#close-task').addEventListener('click', closeTask);

  qs('#task-panel').addEventListener('click', event => {
    if (event.target.matches('.segmented button')) {
      qsa('.segmented button', taskPanel).forEach(button => button.setAttribute('aria-pressed', String(button === event.target)));
      qs('#comfort-field').classList.add('is-changing');
      setTimeout(() => qs('#comfort-field').classList.remove('is-changing'), 250);
      announce(`${event.target.textContent} minutes selected`);
    }
    if (event.target.matches('.demo-action')) announce('Interface preview only. The live API must pass its data gates before results are shown.');
    if (event.target.matches('.save-preferences')) {
      localStorage.setItem('within-reach-preferences-set', 'true');
      announce('Journey preferences saved on this device');
      closeTask();
    }
  });

  qs('#place-form').addEventListener('submit', event => { event.preventDefault(); openTask('reach', qs('#place')); });
  qs('#location-button').addEventListener('click', () => {
    if (!navigator.geolocation) return announce('This browser does not provide location. Enter a place or postcode instead.');
    announce('Waiting for location permission');
    navigator.geolocation.getCurrentPosition(position => {
      state.location = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      qs('#place').value = 'Current location ready';
      announce('Location ready for this session. It has not been saved.');
    }, () => announce('Location is off. Enter a place or postcode instead.'), { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 });
  });

  qs('#map-list-toggle').addEventListener('click', event => {
    const button = event.currentTarget;
    const showText = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(showText));
    qs('#map-canvas').hidden = showText;
    qs('#text-map-view').hidden = !showText;
    qs('span', button).textContent = showText ? 'Show map' : 'Text view';
    button.setAttribute('aria-label', showText ? 'Show visual map' : 'Show text map view');
    if (showText) qs('#text-map-view').focus();
    announce(showText ? 'Text map view shown' : 'Map view shown');
  });

  qs('#fullscreen-map').addEventListener('click', event => {
    const button = event.currentTarget;
    const active = !document.body.classList.contains('map-fullscreen');
    document.body.classList.toggle('map-fullscreen', active);
    button.setAttribute('aria-pressed', String(active));
    qs('span', button).textContent = active ? 'Exit full map' : 'Full map';
    button.setAttribute('aria-label', active ? 'Exit full screen map' : 'Open full screen map');
    if (active && !taskPanel.hidden) closeTask();
    announce(active ? 'Full screen map opened. Use Exit full map to return.' : 'Returned to journey planning');
  });

  qs('#menu-toggle').addEventListener('click', event => {
    const button = event.currentTarget;
    if (window.matchMedia('(max-width: 960px)').matches) {
      const open = document.body.classList.toggle('mobile-menu-open');
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      announce(open ? 'Navigation opened' : 'Navigation closed');
      return;
    }
    const collapsed = document.body.classList.toggle('nav-collapsed');
    button.setAttribute('aria-expanded', String(!collapsed));
    button.setAttribute('aria-label', collapsed ? 'Expand navigation' : 'Collapse navigation');
    announce(collapsed ? 'Navigation collapsed' : 'Navigation expanded');
  });

  qs('#contrast-toggle').addEventListener('click', event => {
    const active = document.body.classList.toggle('high-contrast');
    event.currentTarget.setAttribute('aria-pressed', String(active));
    announce(active ? 'High contrast on' : 'High contrast off');
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (document.body.classList.contains('map-fullscreen')) qs('#fullscreen-map').click();
      else if (!taskPanel.hidden) closeTask();
    }
  });

  loadDataStatus();
  if (window.matchMedia('(max-width: 960px)').matches) {
    qs('#menu-toggle').setAttribute('aria-expanded', 'false');
    qs('#menu-toggle').setAttribute('aria-label', 'Open navigation');
  }
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(() => {});
})();
