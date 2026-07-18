/* ============================================================
   cms-content.js  –  Loads JSON content files and populates the
   Rader's Waldschänke & Bootsvermietung page at runtime.
   The CMS (Sveltia) edits these JSON files via GitHub; the static
   host serves the resulting page.
   ============================================================ */
'use strict';

(async function () {

  // ── Fetch helper ─────────────────────────────────────────
  async function fetchJSON(path) {
    try {
      const r = await fetch(path);
      if (!r.ok) throw new Error(r.status);
      return r.json();
    } catch (e) {
      console.warn('[CMS] Could not load', path, e.message);
      return null;
    }
  }

  // ── Replace the text after an inline <svg> icon, keeping ─
  // ── the icon markup itself untouched. ────────────────────
  function setTextAfterIcon(el, text) {
    if (!el || text == null) return;
    const svg = el.querySelector('svg');
    el.innerHTML = (svg ? svg.outerHTML : '') + '\n      ' + text;
  }

  // ── Formatting helpers ───────────────────────────────────
  // Compact price for the boat-card chips, e.g. 6 -> "6 €", 6.5 -> "6,50 €"
  function euroShort(n) {
    const num = Number(n);
    if (Number.isNaN(num)) return '';
    const s = Number.isInteger(num) ? String(num) : num.toFixed(2).replace('.', ',');
    return `${s} €`;
  }
  // Full price for the price table, e.g. 6 -> "6,00 €"
  function euroFull(n) {
    const num = Number(n);
    if (Number.isNaN(num)) return '';
    return `${num.toFixed(2).replace('.', ',')} €`;
  }
  // "bis 4 Personen" -> "bis 4", "1 Person" -> "1" (for the price table)
  function kurzKapazitaet(text) {
    return (text || '').replace(/\s*Personen?\s*$/i, '').trim();
  }
  function capFirst(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }

  // ── Boat card (keeps the hand-drawn SVG icon untouched, ──
  // ── only text/number content is updated) ─────────────────
  function fillBoatCard(id, b) {
    if (!b) return;
    const li = document.querySelector(`.boat-card[data-boat-id="${id}"]`);
    if (!li) return;

    const nameEl = li.querySelector('.boat-card__name');
    if (nameEl && b.name != null) nameEl.textContent = b.name;

    const capEl = li.querySelector('.boat-card__capacity');
    if (capEl && b.kapazitaet != null) setTextAfterIcon(capEl, b.kapazitaet);

    const descEl = li.querySelector('.boat-card__desc');
    if (descEl && b.beschreibung != null) descEl.textContent = b.beschreibung;

    const pricesEl = li.querySelector('.boat-card__prices');
    if (pricesEl) {
      if (b.aufAnfrage) {
        pricesEl.innerHTML =
          `<div class="price-chip price-chip--wide"><span>Preis</span><strong>auf Anfrage</strong></div>`;
      } else {
        const chips = [];
        if (b.preis30 != null) chips.push(['30 Min.', b.preis30]);
        if (b.preis60 != null) chips.push(['60 Min.', b.preis60]);
        const wideClass = chips.length === 1 ? ' price-chip--wide' : '';
        pricesEl.innerHTML = chips
          .map(([label, price]) => `<div class="price-chip${wideClass}"><span>${label}</span><strong>${euroShort(price)}</strong></div>`)
          .join('');
      }
    }

    li.classList.toggle('boat-card--featured', !!b.featured);
    const badge = li.querySelector('.boat-card__badge');
    if (badge) badge.hidden = !b.featured;
    const cta = li.querySelector('.boat-card__cta');
    if (cta) {
      cta.classList.toggle('btn--primary', !!b.featured);
      cta.classList.toggle('btn--outline', !b.featured);
    }
  }

  // ── Price table row (same content/boote.json entry as the ─
  // ── card above, so editing the price once updates both) ──
  function fillPriceRow(id, b) {
    if (!b) return;
    const tr = document.querySelector(`.price-table tbody tr[data-boat-id="${id}"]`);
    if (!tr) return;

    tr.classList.toggle('price-table__featured', !!b.featured);
    const personen = kurzKapazitaet(b.kapazitaet);
    const nameCell = `<th scope="row">${b.name}</th>`;

    if (b.aufAnfrage) {
      tr.innerHTML = `${nameCell}<td>${personen}</td><td colspan="2" style="text-align:center">auf Anfrage</td>`;
    } else {
      const p30 = b.preis30 != null ? euroFull(b.preis30) : '—';
      const p60 = b.preis60 != null ? euroFull(b.preis60) : '—';
      tr.innerHTML = `${nameCell}<td>${personen}</td><td>${p30}</td><td>${p60}</td>`;
    }
  }

  // ── Biergarten feature card (unique SVG icon stays put, ───
  // ── only title + bullet texts are updated) ────────────────
  function fillFeatureCard(id, c) {
    if (!c) return;
    const card = document.querySelector(`.feature-card[data-feature-id="${id}"]`);
    if (!card) return;

    const titleEl = card.querySelector('.feature-card__title');
    if (titleEl && c.title != null) titleEl.textContent = c.title;

    const items = card.querySelectorAll('.feature-card__list li');
    const values = [c.item_1, c.item_2, c.item_3, c.item_4];
    items.forEach((li, i) => { if (values[i] != null) li.textContent = values[i]; });
  }

  // ── Fetch everything in parallel ─────────────────────────
  const [siteinfo, hero, boote, biergarten, familie, kontakt] = await Promise.all([
    fetchJSON('content/siteinfo.json'),
    fetchJSON('content/hero.json'),
    fetchJSON('content/boote.json'),
    fetchJSON('content/biergarten.json'),
    fetchJSON('content/familie.json'),
    fetchJSON('content/kontakt.json'),
  ]);

  // ── 1. Site meta ──────────────────────────────────────────
  if (siteinfo) {
    if (siteinfo.title != null) document.title = siteinfo.title;

    const desc = document.querySelector('meta[name="description"]');
    if (desc && siteinfo.meta_description != null) desc.setAttribute('content', siteinfo.meta_description);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && siteinfo.og_title != null) ogTitle.setAttribute('content', siteinfo.og_title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && siteinfo.og_description != null) ogDesc.setAttribute('content', siteinfo.og_description);
  }

  // ── 2. Hero ───────────────────────────────────────────────
  if (hero) {
    const eyebrowEl = document.querySelector('.hero__eyebrow');
    if (eyebrowEl && hero.eyebrow != null) setTextAfterIcon(eyebrowEl, hero.eyebrow);

    const headlineEl = document.querySelector('.hero__headline');
    if (headlineEl && hero.headline_line1 != null && hero.headline_line2 != null) {
      headlineEl.innerHTML = `${hero.headline_line1}<br>\n          <em>${hero.headline_line2}</em>`;
    }

    const subEl = document.querySelector('.hero__sub');
    if (subEl && hero.sub != null) subEl.textContent = hero.sub;

    if (hero.badges) {
      const badgeEls = document.querySelectorAll('.hero__badges .hero__badge');
      const values = [hero.badges.badge_1, hero.badges.badge_2, hero.badges.badge_3, hero.badges.badge_4];
      badgeEls.forEach((el, i) => { if (values[i] != null) setTextAfterIcon(el, values[i]); });
    }

    if (hero.stats) {
      const statEls = document.querySelectorAll('.hero__stats .hero__stat');
      const values = [hero.stats.stat_1, hero.stats.stat_2, hero.stats.stat_3];
      statEls.forEach((el, i) => {
        const s = values[i];
        if (!s) return;
        const numEl = el.querySelector('.hero__stat-num');
        const labelEl = el.querySelector('.hero__stat-label');
        if (numEl && s.num != null) numEl.textContent = s.num;
        if (labelEl && s.label != null) labelEl.textContent = s.label;
      });
    }
  }

  // ── 3. Boote & Preise (Karten + Tabelle, eine Quelle) ────
  if (boote) {
    ['ruderboot', 'tretboot', 'rutsche', 'sup'].forEach(id => {
      fillBoatCard(id, boote[id]);
      fillPriceRow(id, boote[id]);
    });
  }

  // ── 4. Biergarten ─────────────────────────────────────────
  if (biergarten) {
    if (biergarten.cards) {
      fillFeatureCard('essen', biergarten.cards.essen);
      fillFeatureCard('liegewiese', biergarten.cards.liegewiese);
      fillFeatureCard('events', biergarten.cards.events);
    }

    if (biergarten.stats) {
      const statEls = document.querySelectorAll('.biergarten-highlight__stat');
      const values = [biergarten.stats.stat_1, biergarten.stats.stat_2];
      statEls.forEach((el, i) => {
        const s = values[i];
        if (!s) return;
        const numEl = el.querySelector('.biergarten-highlight__num');
        const labelEl = el.querySelector('.biergarten-highlight__label');
        if (numEl && s.num != null) numEl.textContent = s.num;
        if (labelEl && s.label != null) labelEl.textContent = s.label;
      });
    }

    const quoteEl = document.querySelector('.biergarten-quote p');
    if (quoteEl && biergarten.zitat != null) quoteEl.textContent = `„${biergarten.zitat}"`;
  }

  // ── 5. Familie Rader ──────────────────────────────────────
  if (familie) {
    const seitEl = document.querySelector('.familie-since');
    if (seitEl && familie.seit != null) seitEl.textContent = familie.seit;

    const headingEl = document.getElementById('familie-heading');
    if (headingEl && familie.heading != null) headingEl.textContent = familie.heading;

    const paras = document.querySelectorAll('.familie-desc');
    const texts = [familie.absatz1, familie.absatz2];
    paras.forEach((p, i) => { if (texts[i] != null) p.textContent = texts[i]; });

    const namenEl = document.querySelector('.familie-names');
    if (namenEl && familie.namen != null) namenEl.textContent = familie.namen;
  }

  // ── 6. Kontakt / Anfahrt / Footer (eine Quelle, mehrere ──
  // ── Anzeigeorte) ──────────────────────────────────────────
  if (kontakt) {
    // Anfahrt: Adresse
    const anfahrtAddr = document.querySelector('.info-block__address');
    if (anfahrtAddr && kontakt.betriebsname != null) {
      anfahrtAddr.innerHTML =
        `${kontakt.betriebsname}<br>${kontakt.strasse}<br>${kontakt.ort}<br>${kontakt.bundesland}`;
    }

    // Anfahrt: Saison + Hinweistext
    const seasonEl = document.querySelector('.info-block__season');
    if (seasonEl && kontakt.saison != null) {
      seasonEl.innerHTML = `Saison: <strong>${kontakt.saison}</strong>`;
    }
    const seasonNoteEl = document.getElementById('anfahrt-season-note');
    if (seasonNoteEl && kontakt.saison_hinweis != null) {
      seasonNoteEl.textContent = `${capFirst(kontakt.saison_hinweis)} geöffnet.`;
    }

    // Anfahrt: Öffnungszeiten-Tabelle
    const bootsRow = document.querySelector('.hours-table tr[data-row="bootsvermietung"] td');
    if (bootsRow && kontakt.bootsvermietung_lage != null) bootsRow.textContent = kontakt.bootsvermietung_lage;

    const biergartenRow = document.querySelector('.hours-table tr[data-row="biergarten"] td');
    if (biergartenRow && kontakt.biergarten_lage != null) biergartenRow.textContent = kontakt.biergarten_lage;

    // Kontakt-Sidebar
    const emailLink = document.getElementById('contact-email-link');
    if (emailLink && kontakt.email != null) {
      emailLink.href = `mailto:${kontakt.email}`;
      emailLink.textContent = kontakt.email;
    }
    const addressValue = document.getElementById('contact-address-value');
    if (addressValue && kontakt.strasse != null && kontakt.ort != null) {
      addressValue.innerHTML = `${kontakt.strasse}<br>${kontakt.ort}`;
    }
    const seasonValue = document.getElementById('contact-season-value');
    if (seasonValue && kontakt.saison != null && kontakt.saison_hinweis != null) {
      seasonValue.innerHTML = `${kontakt.saison}<br>${kontakt.saison_hinweis}`;
    }

    // Footer
    const footerAddrText = document.getElementById('footer-address-text');
    if (footerAddrText && kontakt.strasse != null && kontakt.ort != null) {
      footerAddrText.textContent = `${kontakt.strasse} · ${kontakt.ort}`;
    }
    const footerEmailLink = document.getElementById('footer-email-link');
    if (footerEmailLink && kontakt.email != null) {
      footerEmailLink.href = `mailto:${kontakt.email}`;
      footerEmailLink.textContent = kontakt.email;
    }
  }

  // ── Re-observe any newly toggled .reveal elements ────────
  if (typeof window.cmsObserveReveal === 'function') {
    window.cmsObserveReveal();
  }

  // ── Signal that content is in the DOM ────────────────────
  document.dispatchEvent(new Event('cms-ready'));

})();
