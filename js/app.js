
(function(){
  const data = window.SESSION_DATA;
  if(!data){ console.error('SESSION_DATA missing'); return; }
  const cardsEl = document.getElementById('cards');
  const tocEl = document.getElementById('toc');
  const tocMobileEl = document.getElementById('tocMobile');
  const progressText = document.getElementById('progressText');
  const progressBar = document.getElementById('progressBar');
  const progressKey = 'linguistik-progress-' + data.session.replace(/\s+/g,'-').toLowerCase();
  function esc(s){return String(s ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function slug(s){return String(s).replace(/[^a-zA-Z0-9_-]/g,'-');}
  function learningCards(){ return data.cards.filter(c => c.type !== 'info'); }
  function getProgress(){ try { return JSON.parse(localStorage.getItem(progressKey)) || {}; } catch(e){ return {}; } }
  function setProgress(obj){ localStorage.setItem(progressKey, JSON.stringify(obj)); updateProgress(); }
  function updateProgress(){
    const p = getProgress(); const cards = learningCards(); const total = cards.length; const done = cards.filter(c => p[c.id]).length;
    const pct = total ? Math.round(done/total*100) : 0; progressText.textContent = `${pct}% (${done}/${total})`; progressBar.style.width = pct + '%';
  }
  function renderList(items){ if(!items || !items.length) return ''; return `<ul class="content-list">${items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`; }
  function renderPairs(pairs, mode){
    if(!pairs || !pairs.length) return '';
    const title = mode === 'definition' ? 'Definition zuerst' : 'Begriff zuerst';
    return `<div class="mt-3"><div class="level-title mb-2">Kartenmodus: ${title}</div><div class="flash-grid">${pairs.map(pair=>{
      const [term,def] = pair;
      if(mode === 'definition') return `<button type="button" class="flash-card text-start" data-flash><div class="definition-prompt">${esc(def)}</div><div class="answer-term">${esc(term)}</div><div class="small-muted mt-2"><i class="bi bi-hand-index-thumb me-1"></i>klicken: Begriff anzeigen</div></button>`;
      return `<button type="button" class="flash-card text-start" data-flash><div class="term">${esc(term)}</div><div class="definition">${esc(def)}</div><div class="small-muted mt-2"><i class="bi bi-hand-index-thumb me-1"></i>klicken: Definition anzeigen</div></button>`;
    }).join('')}</div></div>`;
  }
  function renderSlides(slides){
    if(!slides || !slides.length) return '<p class="small-muted mb-0">Kein Folienbild für diesen Zusatzblock.</p>';
    const base = data.slideBase || 'assets/slides';
    return `<div class="slide-grid">${slides.map(n => { const file = String(n).padStart(3,'0'); return `<figure class="mb-0"><img class="slide-img" loading="lazy" src="${base}/slide-${file}.jpg" alt="Folie ${n}"><figcaption class="small text-muted mt-2">Folie / Seite ${n}</figcaption></figure>`; }).join('')}</div>`;
  }
  function metaLine(card){
    const slides = (card.slides || []).map(n => `Folie/Seite ${n}`).join(', ');
    return `<div class="meta-grid mt-2"><div><span class="meta-label">Quelle</span><span>${esc(card.preparation)}</span></div><div><span class="meta-label">Repère checklist</span><span>${esc(card.check)}</span></div><div><span class="meta-label">Bild</span><span>${esc(slides || '—')}</span></div></div>`;
  }
  function infoHtml(card){ const id=slug(card.id); return `<section class="card info-card rounded-4 shadow-sm border-0 mb-4" id="${id}"><div class="card-body p-3 p-lg-4"><div class="d-flex flex-column flex-lg-row justify-content-between gap-3 align-items-lg-center"><div><span class="badge text-bg-light border mb-2">Information générale</span><h2 class="h5 fw-bold mb-1">${esc(card.title)}</h2><p class="text-muted mb-0 small">Ces informations sont gardées, mais elles ne comptent pas dans la progression.</p>${metaLine(card)}</div><div class="d-flex flex-wrap gap-2"><button class="btn btn-sm btn-outline-secondary" data-bs-toggle="collapse" data-bs-target="#${id}-level2"><i class="bi bi-info-circle me-1"></i>Voir</button><button class="btn btn-sm btn-outline-dark" data-french-title="${esc(card.title)}" data-french="${esc(card.french)}"><i class="bi bi-translate me-1"></i>Traduction française</button></div></div><div class="collapse" id="${id}-level2" data-section="level2"><div class="level-box level-2"><div class="level-title">${esc(card.level2Title || 'Information')}</div>${renderList(card.level2)}${renderSlides(card.slides)}</div></div></div></section>`; }
  function cardHtml(card){
    if(card.type === 'info') return infoHtml(card); const id=slug(card.id); const progress=getProgress(); const checked=progress[card.id]?'checked':''; const number=learningCards().findIndex(c=>c.id===card.id)+1;
    return `<article class="card learning-card rounded-4 shadow-sm border-0" id="${id}"><div class="card-body p-3 p-lg-4"><div class="d-flex flex-column flex-lg-row gap-3 justify-content-between align-items-lg-start mb-3"><div class="flex-grow-1"><div class="d-flex gap-2 align-items-start mb-2"><span class="card-number">${number}</span><div class="w-100"><h2 class="h4 fw-bold mb-1">${esc(card.title)}</h2>${metaLine(card)}</div></div></div><div class="form-check form-switch check-toggle"><input class="form-check-input" type="checkbox" role="switch" id="done-${id}" data-done="${esc(card.id)}" ${checked}><label class="form-check-label small" for="done-${id}">Ich kann das</label></div></div><div class="question-box mb-3"><div class="level-title">Frage / Ausgangspunkt</div><div class="fw-semibold">${esc(card.question)}</div></div><div class="d-flex flex-wrap gap-2 action-row mb-3"><button class="btn btn-sm btn-outline-primary" data-bs-toggle="collapse" data-bs-target="#${id}-level1"><i class="bi bi-layers me-1"></i>Niveau 1</button><button class="btn btn-sm btn-outline-success" data-bs-toggle="collapse" data-bs-target="#${id}-level2"><i class="bi bi-card-text me-1"></i>Niveau 2</button>${card.examples&&card.examples.length?`<button class="btn btn-sm btn-outline-warning" data-bs-toggle="collapse" data-bs-target="#${id}-examples"><i class="bi bi-pencil-square me-1"></i>Aufgabe / Beispiel</button>`:''}<button class="btn btn-sm btn-outline-secondary" data-bs-toggle="collapse" data-bs-target="#${id}-slides"><i class="bi bi-images me-1"></i>Folienbild</button><button class="btn btn-sm btn-outline-dark" data-french-title="${esc(card.title)}" data-french="${esc(card.french)}"><i class="bi bi-translate me-1"></i>Traduction française</button></div><div class="collapse" id="${id}-level1" data-section="level1"><div class="level-box level-1"><div class="level-title">${esc(card.level1Title || 'Niveau 1')}</div>${renderList(card.level1)}${renderPairs(card.pairs,'term')}</div></div><div class="collapse" id="${id}-level2" data-section="level2"><div class="level-box level-2"><div class="level-title">${esc(card.level2Title || 'Niveau 2')}</div>${renderList(card.level2)}${renderPairs(card.pairs,'definition')}</div></div>${card.examples&&card.examples.length?`<div class="collapse" id="${id}-examples" data-section="examples"><div class="level-box level-examples"><div class="level-title">${esc(card.examplesTitle || 'Aufgabe / Beispiel')}</div>${renderList(card.examples)}</div></div>`:''}<div class="collapse" id="${id}-slides" data-section="slides"><div class="level-box level-slides"><div class="level-title">Folienbild(er)</div>${renderSlides(card.slides)}</div></div><div class="source-line mt-4 pt-3">Quelle: ${esc(card.preparation)}. Le bouton français donne la traduction du bloc; le texte allemand reste la base exacte de révision.</div></div></article>`;
  }
  function tocItem(card){ if(card.type==='info') return `<a class="list-group-item list-group-item-action" href="#${slug(card.id)}"><span class="fw-bold me-1">Info</span>${esc(card.title)}</a>`; const number=learningCards().findIndex(c=>c.id===card.id)+1; return `<a class="list-group-item list-group-item-action" href="#${slug(card.id)}"><span class="fw-bold me-1">${number}.</span>${esc(card.title)}</a>`; }
  function render(){ cardsEl.innerHTML=data.cards.map(cardHtml).join(''); const toc=data.cards.map(tocItem).join(''); if(tocEl) tocEl.innerHTML=toc; if(tocMobileEl) tocMobileEl.innerHTML=toc; updateProgress(); }
  render();
  document.getElementById('sessionBadge').textContent = data.session + ' · vollständige Version';
  document.getElementById('sessionTitle').textContent = data.title;
  document.getElementById('sessionLead').textContent = data.subtitle + ' — mit Niveau 1, Niveau 2, Folienbildern und französischer Übersetzung.';
  document.getElementById('tocCanvasTitle').textContent = data.session + ' – Inhalt';
  document.addEventListener('click', function(e){ const flash=e.target.closest('[data-flash]'); if(flash){flash.classList.toggle('revealed');} const fr=e.target.closest('[data-french]'); if(fr){document.getElementById('frenchTitle').textContent=fr.dataset.frenchTitle||''; document.getElementById('frenchText').textContent=fr.dataset.french||''; new bootstrap.Modal(document.getElementById('frenchModal')).show();} const openBtn=e.target.closest('[data-open]'); if(openBtn){const kind=openBtn.dataset.open; document.querySelectorAll(`[data-section="${kind}"]`).forEach(el=>bootstrap.Collapse.getOrCreateInstance(el,{toggle:false}).show());} if(e.target.closest('[data-close-all]')){document.querySelectorAll('.collapse.show').forEach(el=>bootstrap.Collapse.getOrCreateInstance(el,{toggle:false}).hide());} });
  document.addEventListener('change', function(e){ const done=e.target.closest('[data-done]'); if(done){const p=getProgress(); p[done.dataset.done]=done.checked; setProgress(p);} });
  document.getElementById('resetProgress')?.addEventListener('click',()=>{localStorage.removeItem(progressKey); document.querySelectorAll('[data-done]').forEach(cb=>cb.checked=false); updateProgress();});
})();
