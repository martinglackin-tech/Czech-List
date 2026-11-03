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

    // ---------- Pieces ----------
    const icon = (d) => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
    const ICON = {
        say: icon('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12"/>'),
        show: icon('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
        check: icon('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
        cross: icon('<path d="M6 6l12 12M18 6L6 18"/>')
    };
    // Pub-tab tally marks: four strokes and a diagonal make five. `total` fixes the width.
    function tally(n, total = n, label = '') {
        const groups = Math.max(1, Math.ceil(total / 5)), W = 52, H = 44;
        let g = '';
        for (let k = 0; k < groups; k++) {
            const left = Math.max(0, Math.min(5, n - k * 5)), x0 = k * W + 8;
            for (let i = 0; i < Math.min(left, 4); i++) g += `<path d="M${x0 + i * 10} 4v36"/>`;
            if (left === 5) g += `<path d="M${x0 - 6} 32L${x0 + 38} 12"/>`;
        }
        return `<svg width="${groups * W}" height="${H}" viewBox="0 0 ${groups * W} ${H}" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" role="img" aria-label="${esc(label || n + ' tally marks')}">${g}</svg>`;
    }
    const viewHead = (title, sub) => `<header class="viewhead"><h1>${esc(title)}</h1><p class="small">${esc(sub)}</p></header>`;

    // ---------- Phrases ----------
    function phraseRow(p, i) {
        return `<li class="row" style="--i:${i}">
            <div class="txt"><div class="cz" lang="cs">${esc(p.czech)}</div><div class="snd">${esc(p.sound)}</div><div class="en">${esc(p.english)}</div></div>
            <button class="ib say" type="button" data-say="${p.id}" aria-label="Say: ${esc(p.english)}">${ICON.say}</button>
            <button class="ib" type="button" data-show="${p.id}" aria-label="Show full screen: ${esc(p.english)}">${ICON.show}</button>
        </li>`;
    }
    function renderPhrases() {
        let n = 0;
        main.innerHTML = `<section class="slip hero">
                <h1>Czech for Martin &amp; Alex</h1>
                <p class="lead">Fifteen phrases for Prague. Tap to hear one, hold the screen up to show it.</p>
                <div class="tally">${tally(phrases.length, phrases.length, phrases.length + ' phrases')}<span class="small">${phrases.length} phrases</span></div>
            </section>` + categoryOrder.map(key => {
            const c = categories[key];
            const items = phrases.filter(p => p.category === key);
            return `<section class="slip"><h2>${c.name}</h2><ul class="rows">${items.map(p => phraseRow(p, n++)).join('')}</ul></section>`;
        }).join('') + `<section class="field"><p><span class="first">Czech stress is always on the first syllable.</span> Say the capitals loudest and you will be understood.</p></section>`;
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
        main.innerHTML = viewHead('Flashcards', `Card ${cardIdx + 1} of ${phrases.length}. Tap the card to turn it over.`) + `
        <button class="card" type="button" data-act="flip" aria-live="polite" aria-label="${flipped ? 'Czech' : 'English'} side. Tap to turn over.">
            ${flipped
                ? `<div class="big" lang="cs">${esc(p.czech)}</div><div class="snd">${esc(p.sound)}</div>`
                : `<div class="big">${esc(p.english)}</div><div class="small hint">How do you say it in Czech?</div>`}
        </button>
        <div class="btns">
            <button class="btn" type="button" data-act="prev">Back</button>
            <button class="btn primary" type="button" data-act="say">${ICON.say}Say it</button>
            <button class="btn" type="button" data-act="next">Next</button>
        </div>
        <div class="btns"><button class="btn" type="button" data-act="shuffle">Shuffle the deck</button></div>`;
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
            main.innerHTML = `<section class="slip result"><h1 style="font-size:var(--step-head)">${s} out of ${n}</h1>
                <p class="lead">${s === n ? 'Perfektní! Every mark counted.' : s >= n * 0.7 ? 'Skvělé! Very good.' : 'Keep practising, you\'ll get there.'}</p>
                <div class="tally">${tally(s, n, s + ' correct')}</div></section>
                <div class="btns"><button class="btn primary" type="button" data-act="again">Play again</button></div>`;
        } else {
            const q = quiz.qs[quiz.i];
            main.innerHTML = `<p class="progress small">Question ${quiz.i + 1} of ${quiz.qs.length}. ${quiz.score} right so far.</p>
                <h1 class="q">${esc(q.p.english)}</h1>
                ${q.options.map((o, k) => `<button class="opt" type="button" data-k="${k}" lang="cs"><span>${esc(o.czech)}</span></button>`).join('')}
                <div class="btns" id="after" hidden><button class="btn" type="button" data-act="say">${ICON.say}Hear it</button><button class="btn primary" type="button" data-act="next">Next</button></div>`;
        }
        main.onclick = (e) => {
            const b = e.target.closest('button'); if (!b) return;
            const q = quiz.qs[quiz.i];
            if (b.dataset.act === 'again') { startQuiz(); return renderQuiz(); }
            if (b.dataset.act === 'say') return speak(sayOf(q.p));
            if (b.dataset.act === 'next') { quiz.i++; quiz.answered = false; return renderQuiz(); }
            if (b.dataset.k !== undefined && !quiz.answered) {
                quiz.answered = true;
                const right = q.options[b.dataset.k] === q.p;
                if (right) quiz.score++;
                main.querySelectorAll('.opt').forEach((el, k) => {
                    if (q.options[k] === q.p) { el.classList.add('right'); el.insertAdjacentHTML('beforeend', ICON.check); }
                    else if (el === b) { el.classList.add('wrong'); el.insertAdjacentHTML('beforeend', ICON.cross); }
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
