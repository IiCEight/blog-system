const surface = document.querySelector('[data-search-index]');
if (surface) {
  const input = surface.querySelector('#query');
  const form = surface.querySelector('#search-form');
  const status = surface.querySelector('#search-status');
  const results = surface.querySelector('#search-results');
  let indexPromise;
  let sequence = 0;
  let timer;
  async function search() {
    const current = ++sequence;
    const query = input.value.trim();
    results.replaceChildren();
    if (!query) { status.textContent = 'Enter a word to find a note.'; return; }
    status.textContent = 'Looking through your notes…';
    try {
      indexPromise ??= fetch(surface.dataset.searchIndex, { credentials: 'same-origin', cache: 'no-store' })
        .then(response => { if (!response.ok) throw new Error('Search unavailable'); return response.json(); })
        .catch(error => { indexPromise = undefined; throw error; });
      const entries = await indexPromise;
      if (current !== sequence) return;
      const terms = query.toLocaleLowerCase().split(/\s+/);
      const matches = entries.filter(entry => {
        const text = `${entry.title} ${entry.content} ${(entry.tags || []).join(' ')}`.toLocaleLowerCase();
        return terms.every(term => text.includes(term));
      });
      status.textContent = matches.length ? `${matches.length} ${matches.length === 1 ? 'note' : 'notes'} found.` : 'No matching notes. Try another word.';
      for (const entry of matches) {
        const article = document.createElement('article'); article.className = 'search-result';
        const time = document.createElement('time'); time.dateTime = entry.date; time.textContent = entry.date;
        const heading = document.createElement('h2'); const link = document.createElement('a');
        const url = new URL(entry.url, location.origin);
        if (url.origin !== location.origin) continue;
        link.href = url.pathname + url.search + url.hash; link.textContent = entry.title; heading.append(link);
        const summary = document.createElement('p'); summary.textContent = entry.summary;
        article.append(time, heading, summary); results.append(article);
      }
    } catch {
      if (current === sequence) status.textContent = 'Search could not load. Your query is still here; press Search to try again.';
    }
  }
  input.addEventListener('input', () => { clearTimeout(timer); sequence++; timer = setTimeout(search, 160); });
  form.addEventListener('submit', event => { event.preventDefault(); clearTimeout(timer); search(); });
}
