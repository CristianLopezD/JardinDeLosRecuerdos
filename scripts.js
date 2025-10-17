document.addEventListener('DOMContentLoaded', () => {

    /* ---------- CONFIG & DATA ---------- */
    const SLIDE_INTERVAL = 6000;
    const SLIDE_BLUR_MS = 450;
    const PETAL_COUNT = 36;
    const STORAGE_KEY = 'jardin_unlocked_v3';
    const MEMORIES_KEY = 'jardin_memories_v3';
    const FLOWER_DATA = [
  {
    id: "rose",
    code: "PETALO",
    label: "Rosa",
    type: "pink",
    message: "Como una rosa, tu abrazo florece incluso en los días más fríos.",
    gif: "https://i.pinimg.com/originals/23/30/12/233012cc4c5a106de39346da792a0963.gif",
    hint: "Suave y delicado... forma parte de cada flor 🌹"
  },
  {
    id: "amaryllis",
    code: "JARDIN",
    label: "Amaryllis",
    type: "yellow",
    message: "Como el sol en la mañana, tu compañía me llena de energía.",
    gif: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiBLUQx7iFo0NekxTwbYztuSZ7peM3mphV22cZczNd7isLToWpldVrFDXLowfTkAftaIc3QYvmXT3N6IVUmskUW7XaSK8l6ZL3_CiBJyiLm8KQBAy7WUCBqMdRv_zeUu7EeSCmQ1CUeWNTb/s1600/YutakaKitamura04.gif",
    hint: "Donde todo florece, donde nace la calma 🌿"
  },
  {
    id: "lily",
    code: "AROMA",
    label: "Lirio",
    type: "pink",
    message: "Tu sonrisa ilumina el jardín más que cualquier amanecer.",
    gif: "https://i.pinimg.com/originals/74/c3/d5/74c3d5d7eb88471971de78c69b61f1e4.gif",
    hint: "Lo invisible que perfuma cada recuerdo ✨"
  },
  {
    id: "gentiana",
    code: "BROTE",
    label: "Gentiana",
    type: "soft",
    message: "Cada paso contigo es una flor nueva en mi memoria.",
    gif: "https://i.pinimg.com/originals/c9/1d/1a/c91d1aa83c9785af78a2d945675c8f35.gif",
    hint: "Antes de ser flor, toda semilla pasa por esto 🌱"
  },
  {
    id: "pinkrose",
    code: "NECTAR",
    label: "Pink Rose",
    type: "violet",
    message: "A veces no hacen falta palabras; el silencio contigo también florece.",
    gif: "https://i.pinimg.com/originals/77/b2/5d/77b25d2fb159134445914ad5d75bc8cd.gif",
    hint: "Lo dulce que las flores guardan para quien las cuida 🐝"
  },
  {
    id: "freesia",
    code: "LUNA",
    label: "Freesia",
    type: "soft",
    message: "Entre tantas semillas del mundo, el viento nos trajo al mismo jardín.",
    gif: "https://i.pinimg.com/originals/ad/a7/55/ada7559288f112d7ff599d0623eb972b.gif",
    hint: "No es una flor, pero también brilla en la noche 🌙"
  }
];



    /* ---------- HELPERS ---------- */
    const $ = s => document.querySelector(s);
    const $$ = s => Array.from(document.querySelectorAll(s));
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    function rand(min, max) { return min + Math.random() * (max - min); }

    /* ---------- STORAGE ---------- */
    let unlocked = [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        unlocked = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(unlocked)) unlocked = [];
    } catch (e) {
        unlocked = [];
    }

    let memories = [];
    try {
        const rawM = localStorage.getItem(MEMORIES_KEY);
        memories = rawM ? JSON.parse(rawM) : [];
    } catch (e) { memories = []; }

    function saveUnlocked() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked)); } catch (e) { } }
    function saveMemories() { try { localStorage.setItem(MEMORIES_KEY, JSON.stringify(memories)); } catch (e) { } }

    /* ---------- SLIDER ---------- */
    const slides = $$('.slide');
    let slideIndex = 0;
    let slideTimer = null;
    function setActiveSlide(i) {
        slides.forEach((s, idx) => {
            s.classList.toggle('active', idx === i);
            s.classList.toggle('blur', idx !== i);
            s.style.transform = '';
        });
    }
    function nextSlide() {
        const prev = slideIndex;
        slideIndex = (slideIndex + 1) % slides.length;
        slides[prev].classList.add('blur');
        setTimeout(() => setActiveSlide(slideIndex), SLIDE_BLUR_MS);
    }
    function startSlides() { if (!slideTimer) slideTimer = setInterval(nextSlide, SLIDE_INTERVAL); }
    function stopSlides() { if (slideTimer) { clearInterval(slideTimer); slideTimer = null; } }
    startSlides(); // run in background

    /* ---------- PETAL CANVAS ---------- */
    const canvas = $('#petalCanvas');
    const ctx = canvas.getContext && canvas.getContext('2d');
    let w = window.innerWidth, h = window.innerHeight;
    if (ctx) {
        canvas.width = w; canvas.height = h;
        window.addEventListener('resize', () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; });
    } else {
        canvas.style.display = 'none';
    }

    class Petal {
        constructor(init = false) {
            this.reset(init);
        }
        reset(init = false) {
            this.x = rand(-100, w + 100);
            this.y = init ? rand(0, h) : rand(-h * 0.5, -20);
            this.vx = rand(-0.25, 0.8);
            this.vy = rand(0.3, 1.2);
            this.size = rand(6, 20);
            this.rot = rand(0, Math.PI * 2);
            this.omega = rand(-0.02, 0.02);
            this.color = ['#ffd6d9', '#ffb3c7', '#ffd98f', '#b7ffd7'][Math.floor(Math.random() * 4)];
            this.alpha = rand(0.6, 0.95);
            this.phase = Math.random() * Math.PI * 2;
        }
        update(dt) {
            this.phase += dt * 0.001;
            this.x += this.vx + Math.sin(this.phase) * 0.4;
            this.y += this.vy;
            this.rot += this.omega;
            if (this.y > h + 40 || this.x < -140 || this.x > w + 140) this.reset();
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rot);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size * 0.6, this.size, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    const petals = [];
    if (ctx) {
        for (let i = 0; i < PETAL_COUNT; i++) petals.push(new Petal(true));
        let last = performance.now();
        function loop(now) {
            const dt = now - last; last = now;
            ctx.clearRect(0, 0, w, h);
            for (const p of petals) { p.update(dt); p.draw(); }
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    }

    /* ---------- PARALLAX & HERO ---------- */
    const hero = $('#hero');
    hero.addEventListener('mousemove', e => {
        const rx = (e.clientX / window.innerWidth - 0.5) * 2;
        const ry = (e.clientY / window.innerHeight - 0.5) * 2;
        slides.forEach((s, idx) => {
            const depth = (idx - slideIndex) * 4;
            const tx = rx * depth * 6;
            const ty = ry * depth * 4;
            s.style.transform = `translate(${tx}px, ${ty}px) scale(${1 + Math.abs(depth) * 0.002})`;
        });
    });

    /* ---------- TYPING POETIC LINES ---------- */
    const typingPhrases = [
        "Los recuerdos florecen cuando los regamos con cariño.",
        "Cada palabra puede ser una semilla.",
        "Cuida el jardín, y el tiempo te devolverá flores."
    ];
    const typingEl = $('#typingArea');
    (async function typeLoop() {
        let i = 0;
        while (true) {
            const txt = typingPhrases[i++ % typingPhrases.length];
            typingEl.textContent = '';
            for (let k = 0; k <= txt.length; k++) { typingEl.textContent = txt.slice(0, k); await sleep(36); }
            await sleep(1100);
            for (let k = txt.length; k >= 0; k--) { typingEl.textContent = txt.slice(0, k); await sleep(12); }
            await sleep(300);
        }
    })();

    /* ---------- SVG FLOWER BUILDER ---------- */
    function createFlowerSVG(type = 'pink') {
        const ns = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', '0 0 120 120');
        svg.classList.add('flower-svg');
        const g = document.createElementNS(ns, 'g'); g.setAttribute('transform', 'translate(60,70)');
        const stem = document.createElementNS(ns, 'rect'); stem.setAttribute('x', '-3'); stem.setAttribute('y', '8'); stem.setAttribute('width', '6'); stem.setAttribute('height', '48'); stem.setAttribute('rx', '3'); stem.setAttribute('fill', '#2b6b3a'); g.appendChild(stem);
        const petalsG = document.createElementNS(ns, 'g'); petalsG.setAttribute('class', 'petalsGroup');
        const fill = type === 'yellow' ? '#ffd54a' : (type === 'violet' ? '#b794ff' : (type === 'soft' ? '#ffdfe7' : '#ff7aa3'));
        for (let p = 0; p < 6; p++) {
            const el = document.createElementNS(ns, 'ellipse');
            el.setAttribute('cx', '0'); el.setAttribute('cy', '-18'); el.setAttribute('rx', '18'); el.setAttribute('ry', '26');
            el.setAttribute('transform', `rotate(${p * 60})`);
            el.setAttribute('fill', fill);
            el.setAttribute('class', 'petal');
            petalsG.appendChild(el);
        }
        g.appendChild(petalsG);
        const center = document.createElementNS(ns, 'circle'); center.setAttribute('cx', '0'); center.setAttribute('cy', '-4'); center.setAttribute('r', '10'); center.setAttribute('fill', '#fff8d8'); center.setAttribute('stroke', '#e2c36b'); center.setAttribute('stroke-width', '2'); g.appendChild(center);
        svg.appendChild(g);
        return svg;
    }

    /* ---------- RENDER GARDEN, BOOK, PROGRESS ---------- */
    const gardenArea = $('#gardenArea');
    const bookPages = $('#bookPages');
    const progressRing = $('#progressRing');
    const progressText = $('#progressText');
    const finalBox = $('#finalBox');
    const messageBar = $('#messageBar');

    function flashMessage(txt, ms = 3200) {
        messageBar.textContent = txt; messageBar.style.opacity = '1';
        clearTimeout(messageBar._t);
        messageBar._t = setTimeout(() => messageBar.style.opacity = '0', ms);
    }

    function animateOpen(svgEl) {
        if (!svgEl) return;
        const petals = svgEl.querySelectorAll('.petal');
        petals.forEach((p, idx) => {
            p.animate([{ transform: `rotate(${idx * 60}deg) translateY(0)`, opacity: 1 }, { transform: `rotate(${idx * 60}deg) translateY(-8px)`, opacity: 1 }], { duration: 520 + idx * 40, easing: 'cubic-bezier(.2,.8,.25,1)', fill: 'forwards' });
        });
        svgEl.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }], { duration: 420, fill: 'forwards' });
    }

    function renderGarden() {
        gardenArea.innerHTML = '';
        FLOWER_DATA.forEach(f => {
            const card = document.createElement('div');
            card.className = 'flower-card';

            if (unlocked.includes(f.code)) {
                card.classList.add('unlocked');
            } else {
                card.classList.add('locked');
            }

            const svgWrap = document.createElement('div');

            // 🌸 Mostrar GIF si está desbloqueada, SVG si aún no
            let visualEl;
            if (unlocked.includes(f.code)) {
                visualEl = document.createElement('img');
                visualEl.src = f.gif || "https://i.pinimg.com/originals/23/30/12/233012cc4c5a106de39346da792a0963.gif";
                visualEl.alt = f.label;
                visualEl.style.width = "120px";
                visualEl.style.height = "120px";
                visualEl.style.borderRadius = "50%";
                visualEl.style.objectFit = "cover";
                visualEl.style.boxShadow = "0 0 10px rgba(255,255,255,0.5)";
            } else {
                visualEl = createFlowerSVG(f.type);
            }

            svgWrap.appendChild(visualEl);

            const label = document.createElement('div');
            label.className = 'flower-label';
            label.textContent = unlocked.includes(f.code) ? f.label : "Por florecer...";

            const reveal = document.createElement('div');
            reveal.className = 'reveal-msg';
            reveal.textContent = unlocked.includes(f.code)
                ? f.message
                : 'Introduce su código para verla florecer 🌱';

            card.appendChild(svgWrap);
            card.appendChild(label);
            card.appendChild(reveal);

            // 🌺 Click en flor
            card.addEventListener('click', () => {
                if (unlocked.includes(f.code)) {
                    card.classList.toggle('open');
                    openModal(`<h2>${f.label}</h2><p>${f.message}</p>`);
                } else {
                    flashMessage('Introduce el código correcto para desbloquear esta flor 🌱');
                }
            });

            gardenArea.appendChild(card);
        });
    }


    function renderBook() {
        bookPages.innerHTML = '';

        const hasUnlocked = unlocked.length > 0;
        const hasMemories = memories.length > 0;

        if (!hasUnlocked && !hasMemories) {
            const p = document.createElement('div');
            p.className = 'page';
            p.innerHTML = `
      <div class="mini">…</div>
      <div>Aún no hay recuerdos ni flores florecidas. Siembra uno para comenzar 🌱</div>`;
            bookPages.appendChild(p);
            return;
        }

        // 🌸 1. Mostrar flores desbloqueadas
        unlocked.forEach(code => {
            const f = FLOWER_DATA.find(x => x.code === code);
            const mem = memories.find(m => m.code === code);
            const page = document.createElement('div');
            page.className = 'page';
            page.innerHTML = `
      <div class="mini">${f.label[0]}</div>
      <div>
        <strong>${f.label}</strong>
        <div style="font-size:13px;color:var(--muted)">
          ${(mem && mem.text) ? mem.text.slice(0, 64) + '…' : f.message.slice(0, 64) + '…'}
        </div>
      </div>`;
            page.addEventListener('click', () =>
                openModal(`<h2>${f.label}</h2><p>${(mem && mem.text) ? mem.text : f.message}</p>`));
            bookPages.appendChild(page);
        });

        // 🌹 2. Mostrar recuerdos personales (sin flor)
        const personals = memories.filter(m => !FLOWER_DATA.some(f => f.code === m.code));
        if (personals.length) {
            const sep = document.createElement('div');
            sep.className = 'page-separator';
            sep.innerHTML = '<h4 style="margin-top:1em;">🌹 Recuerdos Persalizados </h4>';
            bookPages.appendChild(sep);

            personals.forEach(m => {
                const page = document.createElement('div');
                page.className = 'page';
                page.innerHTML = `
        <div class="mini">💌</div>
        <div>
          <strong>${m.name}</strong>
          <div style="font-size:13px;color:var(--muted)">
            ${m.text.slice(0, 80)}…
          </div>
          <small style="color:var(--muted)">
            ${new Date(m.date).toLocaleDateString()}
          </small>
        </div>`;
                page.addEventListener('click', () =>
                    openModal(`<h2>${m.name}</h2><p>${m.text}</p><small style="color:var(--muted)">${new Date(m.date).toLocaleString()}</small>`));
                bookPages.appendChild(page);
            });
        }
    }


    function updateProgress() {
        const total = FLOWER_DATA.length; const count = unlocked.length;
        const circumference = 2 * Math.PI * 50;
        const offset = circumference - (count / total) * circumference;
        progressRing.style.strokeDasharray = String(circumference); progressRing.style.strokeDashoffset = String(offset);
        progressText.textContent = `${count}/${total}`;
        if (count === total) showFinal();
    }

    function showFinal() {
        finalBox.classList.remove('hidden'); finalBox.classList.add('visible');
        flashMessage('✨ Jardín completo — Gracias por cuidar este jardín conmigo ✨', 6000);
        for (let i = 0; i < 60; i++) { if (ctx) petals.push(new Petal()); }
    }

    /* ---------- MODAL ---------- */
    const modal = $('#modal'); const modalContent = $('#modalContent'); const modalClose = $('#modalClose');
    function openModal(html) {
        modalContent.innerHTML = html; modal.classList.remove('hidden'); modal.setAttribute('aria-hidden', 'false');
    }
    function closeModal() { modal.classList.add('hidden'); modal.setAttribute('aria-hidden', 'true'); }
    modalClose.addEventListener('click', closeModal); modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    /* ---------- INTERACTIONS (codes/hints/reset/enter) ---------- */
    const codeInput = $('#codeInput'); const checkBtn = $('#checkBtn'); const hintBtn = $('#hintBtn'); const resetBtn = $('#resetBtn'); const enterBtn = $('#enterBtn');

    async function handleCode() {
        const v = (codeInput.value || '').trim().toUpperCase();
        if (!v) return;

        const found = FLOWER_DATA.find(f => f.code === v);
        if (!found) {
            flashMessage('Ese recuerdo no pertenece al jardín 🌼');
            codeInput.value = '';
            return;
        }

        if (unlocked.includes(found.code)) {
            flashMessage('Esa flor ya floreció 🌷');
            codeInput.value = '';
            return;
        }

        unlocked.push(found.code);
        saveUnlocked();
        flashMessage(`🌸 ${found.label} ha florecido`);

        renderGarden();
        renderBook();
        updateProgress();

        // 🌷 Mostrar GIF específico de la flor recién florecida (y mantenerlo)
        const targetCard = Array.from(document.querySelectorAll('.flower-card')).find(card =>
            card.querySelector('.flower-label')?.textContent === found.label
        );

        if (targetCard) {
            const svgWrap = targetCard.querySelector('div'); // contenedor del SVG
            if (svgWrap) {
                // Obtener el GIF correspondiente de FLOWER_DATA
                const gifURL = found.gif || "https://i.pinimg.com/originals/23/30/12/233012cc4c5a106de39346da792a0963.gif";

                // Reemplazar el SVG con el GIF (y mantenerlo)
                svgWrap.innerHTML = `
                <img src="${gifURL}" 
                     alt="${found.label}" 
                     style="width:120px;height:120px;border-radius:50%;object-fit:cover;">
            `;
            }
        }

        codeInput.value = '';
        for (let i = 0; i < 18; i++) {
            if (ctx) petals.push(new Petal());
        }
    }


    checkBtn.addEventListener('click', handleCode);
    codeInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleCode(); });

 hintBtn.addEventListener('click', () => {
  const remaining = FLOWER_DATA.filter(f => !unlocked.includes(f.code));
  if (!remaining.length) {
    flashMessage('🌸 Todas las flores ya florecieron, tu jardín está completo.');
    return;
  }

  const pick = remaining[Math.floor(Math.random() * remaining.length)];

  flashMessage(
    `💡 Pista para "${pick.label}": ${pick.hint} 
     (${pick.code.length} letras)`
  );
});



    // --- BOTÓN REINICIAR (versión funcional y robusta) ---
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {

            // 1. Limpiar memoria y almacenamiento
            unlocked = [];
            memories = [];
            try {
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem(MEMORIES_KEY);
                localStorage.removeItem('jardin_unlocked_v2');
                localStorage.removeItem('jardin_unlocked');
            } catch (e) {
                console.warn("Error limpiando almacenamiento:", e);
            }

            // 2. Guardar estado vacío para consistencia
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
                localStorage.setItem(MEMORIES_KEY, JSON.stringify(memories));
            } catch (e) { }

            // 3. Reiniciar animaciones visuales
            try {
                if (ctx && Array.isArray(petals)) {
                    petals.length = 0;
                    for (let i = 0; i < PETAL_COUNT; i++) petals.push(new Petal(true));
                }
            } catch (e) { }

            // 4. Cerrar modal y ocultar pantalla final
            try { closeModal(); } catch (e) { }
            if (finalBox) {
                finalBox.classList.add('hidden');
                finalBox.classList.remove('visible');
            }

            // 5. Re-renderizar todo
            try {
                renderGarden();
                renderBook();
                updateProgress();
            } catch (e) {
                console.error("Error re-renderizando jardín:", e);
            }

            // 6. Mostrar mensaje visual
            flashMessage("🌱 Jardín reiniciado con éxito 🌸");

            // 7. Espera breve y recarga completa (garantiza reinicio real)
            setTimeout(() => {
                location.reload();
            }, 1200);
        });
    } else {
        console.warn("⚠️ No se encontró el botón #resetBtn en el DOM.");
    }


    enterBtn.addEventListener('click', async () => {
        const veil = document.createElement('div'); veil.style.cssText = 'position:fixed;inset:0;background:radial-gradient(circle at 50% 35%, rgba(255,240,230,0.8), rgba(255,240,250,0.08));z-index:120;';
        document.body.appendChild(veil); await sleep(600); $('#hero').style.display = 'none'; $('#main').classList.remove('hidden'); try { document.body.removeChild(veil); } catch (e) { }
        startSlides(); // ensure slider runs
    });

    /* ---------- GALLERY interaction: open modal ---------- */
    $$('#gallery .gallery-grid figure').forEach(fig => {
        fig.addEventListener('click', () => {
            const img = fig.querySelector('img'); const caption = fig.querySelector('figcaption')?.textContent || '';
            openModal(`<img src="${img.src}" style="width:100%;border-radius:8px;margin-bottom:12px"><p style="color:var(--muted)">${caption}</p>`);
        });
    });

    /* ---------- CONTACT: solo guardar recuerdo simple ---------- */
    const memForm = document.getElementById('memoryForm');
    const memText = document.getElementById('memText');
    const clearMem = document.getElementById('clearMem');

    if (memForm) {
        memForm.addEventListener('submit', e => {
            e.preventDefault();

            const text = (memText.value || '').trim();
            if (!text) {
                flashMessage('🌸 Escribe un recuerdo antes de enviarlo.');
                return;
            }

            const name = "Mi Secretito";
            const code = "REC-" + Math.floor(1000 + Math.random() * 9000);
            const mem = {
                id: 'recuerdo_' + Date.now(),
                name,
                code,
                text,
                date: new Date().toISOString()
            };

            memories.push(mem);
            saveMemories();
            flashMessage('💌 Tu recuerdo ha sido sembrado en el jardín.');
            memForm.reset();

            if (typeof renderBook === 'function') renderBook();
        });

        clearMem.addEventListener('click', () => memForm.reset());
    }

    clearMem.addEventListener('click', () => memForm.reset());

    /* ---------- THEME toggle & topbar scroll ---------- */
    const topbar = $('#topbar'); const themeToggle = $('#themeToggle');
    window.addEventListener('scroll', () => topbar.classList.toggle('scrolled', window.scrollY > 40));
    themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('warm');
        themeToggle.textContent = document.documentElement.classList.contains('warm') ? '☾' : '☼';
    });

    /* ---------- INIT ---------- */
    function init() {
        renderGarden(); renderBook(); updateProgress();
        // set progress ring full dash array
        progressRing.style.strokeDasharray = String(2 * Math.PI * 50);
        progressRing.style.strokeDashoffset = String(2 * Math.PI * 50);
        // smooth scroll for nav
        $$('.nav a').forEach(a => {
            a.addEventListener('click', e => {
                e.preventDefault();
                const href = a.getAttribute('href'); const el = document.querySelector(href);
                if (!el) return;
                const top = el.getBoundingClientRect().top + window.scrollY - 70;
                window.scrollTo({ top, behavior: 'smooth' });
            });
        });
    }
    init();

    /* expose for debug */
    window._jardin = { unlocked, memories, FLOWER_DATA };

});
/* ---------- EASTER EGG AL PRESIONAR F12 🌸 ---------- */
(function () {
    document.addEventListener('keydown', e => {
        if (
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) ||
            (e.metaKey && e.altKey && e.key === 'I')
        ) {
            e.preventDefault();

            alert(
                "🌷 Hola, Alma Curiosa 🌷\n\n" +
                "Si llegaste hasta aquí es porque tu curiosidad floreció, y eso es algo hermoso.\n" +
                "Pero este jardín guarda sus secretos en forma de emociones, no en líneas de código. 💫\n\n" +
                "Gracias por mirar tan de cerca… eso también es una manera de cuidar 🌸"
            );
        }
    });
})();
