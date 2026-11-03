(function () {
    const { categories, categoryOrder, phrases } = PHRASEBOOK;
    const $ = (sel, root = document) => root.querySelector(sel);
    const main = $('#main');
    const esc = (s) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

    // ---------- Voice (the phone's built-in Czech voice; works offline) ----------
    let voices = [];
    function loadVoices() { voices = window.speechSynthesis ? speechSynthesis.getVoices() : []; }
    if (window.speechSynthesis) { loadVoices(); speechSynthesis.addEventListener?.('voiceschanged', loadVoices); }

    let toastTimer;
    function toast(msg) {
        const t = $('#toast'); t.textContent = msg; t.classList.add('on');
        clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('on'), 3500);
    }

    function speak(text) {
        if (!window.speechSynthesis) return toast('Speech is not supported on this device.');
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'cs-CZ'; u.rate = 0.85;
        const v = voices.find(v => /^cs([-_]|$)/i.test(v.lang));
        if (v) u.voice = v;
        else if (voices.length) toast('No Czech voice installed. Add one in your phone\'s speech settings.');
        speechSynthesis.speak(u);
    }
    const sayOf = (p) => p.say || p.czech;

    // ---------- Overlays ----------
    function openOverlay(el) { el.classList.add('on'); $('[data-body]', el).classList.remove('flip'); }
    document.querySelectorAll('.overlay').forEach(el => {
        $('[data-close]', el).onclick = () => el.classList.remove('on');
        $('[data-flip]', el).onclick = () => $('[data-body]', el).classList.toggle('flip');
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('.overlay.on').forEach(o => o.classList.remove('on')); });

    function showPhrase(p) {
        $('#ov-cz').textContent = p.czech;
        $('#ov-sound').textContent = p.sound;
        $('#ov-en').textContent = p.english;
        $('#ov-say').onclick = () => speak(sayOf(p));
        openOverlay($('#ov-phrase'));
    }

    // ---------- Phrases ----------
    function phraseRow(p) {
        return `<li class="row" style="list-style:none">
            <div class="txt"><div class="cz" lang="cs">${esc(p.czech)}</div><div class="snd">${esc(p.sound)}</div><div class="en">${esc(p.english)}</div></div>
            <button class="ib" type="button" data-say="${p.id}" aria-label="Say: ${esc(p.english)}">🔊</button>
            <button class="ib" type="button" data-show="${p.id}" aria-label="Show full screen: ${esc(p.english)}">⛶</button>
        </li>`;
    }
    function renderPhrases() {
        main.innerHTML = `<p class="eyebrow">15 phrases</p>` + categoryOrder.map(key => {
            const c = categories[key];
            const items = phrases.filter(p => p.category === key);
            return `<h2>${c.icon} ${c.name}</h2><ul class="panel" style="margin:0;padding:0">${items.map(phraseRow).join('')}</ul>`;
        }).join('') + `<p class="en" style="margin-top:20px">Tip: tap ⛶ to show a phrase full screen to a waiter. Czech stress is always on the <b>first</b> syllable.</p>`;
        main.onclick = (e) => {
            const b = e.target.closest('button'); if (!b) return;
            if (b.dataset.say) speak(sayOf(phrases.find(p => p.id == b.dataset.say)));
            if (b.dataset.show) showPhrase(phrases.find(p => p.id == b.dataset.show));
        };
    }

    // ---------- Flashcards ----------
    let cardIdx = 0, flipped = false;
    function renderCards() {
        const p = phrases[cardIdx];
        main.innerHTML = `
        <p class="progress">Card ${cardIdx + 1} of ${phrases.length} · tap the card to flip</p>
        <button class="flash" type="button" data-act="flip" aria-live="polite">
            ${flipped
                ? `<div class="cz" lang="cs">${esc(p.czech)}</div><div class="snd">${esc(p.sound)}</div>`
                : `<div class="en" style="font-size:22px;color:var(--ink)">${esc(p.english)}</div><div class="en">How do you say it in Czech?</div>`}
        </button>
        <div class="btns">
            <button class="btn" type="button" data-act="prev">← Prev</button>
            <button class="btn primary" type="button" data-act="say">🔊 Say it</button>
            <button class="btn" type="button" data-act="next">Next →</button>
        </div>
        <div class="btns"><button class="btn" type="button" data-act="shuffle">🔀 Shuffle deck</button></div>`;
        main.onclick = (e) => {
            const b = e.target.closest('button'); if (!b) return;
            const a = b.dataset.act;
            if (a === 'flip') { flipped = !flipped; if (flipped) speak(sayOf(p)); }
            else if (a === 'say') return speak(sayOf(p));
            else if (a === 'next') { cardIdx = (cardIdx + 1) % phrases.length; flipped = false; }
            else if (a === 'prev') { cardIdx = (cardIdx - 1 + phrases.length) % phrases.length; flipped = false; }
            else if (a === 'shuffle') { shuffle(phrases); cardIdx = 0; flipped = false; toast('Deck shuffled'); }
            renderCards();
        };
    }
    function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

    // ---------- Quiz ----------
    let quiz = null;
    function startQuiz() {
        const qs = shuffle([...phrases]).slice(0, 10).map(p => ({
            p, options: shuffle([p, ...shuffle(phrases.filter(x => x !== p)).slice(0, 3)])
        }));
        quiz = { qs, i: 0, score: 0, answered: false };
    }
    function renderQuiz() {
        if (!quiz) startQuiz();
        if (quiz.i >= quiz.qs.length) {
            const n = quiz.qs.length, s = quiz.score;
            main.innerHTML = `<div class="center"><h2>${s} / ${n}</h2><p>${s === n ? 'Perfektní! 🎉' : s >= n * 0.7 ? 'Skvělé! Very good.' : 'Keep practising, you\'ll get there.'}</p>
                <button class="btn blue" type="button" data-act="again">Play again</button></div>`;
        } else {
            const q = quiz.qs[quiz.i];
            main.innerHTML = `<p class="progress">Question ${quiz.i + 1} of ${quiz.qs.length} · score ${quiz.score}</p>
                <h2 style="margin-top:0">${esc(q.p.english)}</h2>
                ${q.options.map((o, k) => `<button class="btn opt" type="button" data-k="${k}" lang="cs">${esc(o.czech)}</button>`).join('')}
                <div class="btns" id="after" hidden><button class="btn primary" type="button" data-act="say">🔊 Hear it</button><button class="btn blue" type="button" data-act="next">Next →</button></div>`;
        }
        main.onclick = (e) => {
            const b = e.target.closest('button'); if (!b) return;
            const q = quiz.qs[quiz.i];
            if (b.dataset.act === 'again') { startQuiz(); return renderQuiz(); }
            if (b.dataset.act === 'say') return speak(sayOf(q.p));
            if (b.dataset.act === 'next') { quiz.i++; quiz.answered = false; return renderQuiz(); }
            if (b.dataset.k !== undefined && !quiz.answered) {
                quiz.answered = true;
                const picked = q.options[b.dataset.k];
                const right = picked === q.p;
                if (right) quiz.score++;
                main.querySelectorAll('.opt').forEach((el, k) => {
                    if (q.options[k] === q.p) el.classList.add('right');
                    else if (el === b) el.classList.add('wrong');
                    el.disabled = true;
                });
                $('#after').hidden = false;
                speak(sayOf(q.p));
            }
        };
    }

    // ---------- Tabs ----------
    const views = { phrases: renderPhrases, cards: renderCards, quiz: renderQuiz };
    function go(tab) {
        document.querySelectorAll('nav.tabs button').forEach(b => b.setAttribute('aria-current', String(b.dataset.tab === tab)));
        views[tab](); window.scrollTo(0, 0);
        try { localStorage.setItem('tab', tab); } catch (e) {}
    }
    document.querySelectorAll('nav.tabs button').forEach(b => b.onclick = () => go(b.dataset.tab));
    let start = 'phrases';
    try { const t = localStorage.getItem('tab'); if (views[t]) start = t; } catch (e) {}
    go(start);

    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }
})();
