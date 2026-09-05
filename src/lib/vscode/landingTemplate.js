const CONSOLE_HOOK = `<script>(function(){var send=function(type,args){try{parent.postMessage({__kobaConsole:true,type:type,args:args.map(function(a){try{return typeof a==="object"?JSON.stringify(a):String(a)}catch(e){return String(a)}})},"*")}catch(e){}};["log","info","warn","error"].forEach(function(m){var orig=console[m];console[m]=function(){send(m,Array.prototype.slice.call(arguments));if(orig)orig.apply(console,arguments)}});window.addEventListener("error",function(e){send("error",[e.message])});})();</script>`;

export function buildPreviewDoc({ html, css, js }) {
    const safeJs = (js || "").replace(/<\/script>/gi, "<\\/script>");
    return `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n<style>${css || ""}</style>\n</head>\n<body>\n${html || ""}\n${CONSOLE_HOOK}\n<script>${safeJs}</script>\n</body>\n</html>`;
}

export const STARTER_HTML = `<header class="nav">
  <div class="wrap nav-inner">
    <a class="brand" href="#"><span class="brand-mark">&#10047;</span> blush</a>
    <button class="menu-btn" id="menuBtn" aria-label="Menu">&#9776;</button>
    <nav class="links" id="navLinks">
      <a href="#collection">Collection</a>
      <a href="#collection">About</a>
      <a href="#hello" class="btn btn-sm">Say hello</a>
    </nav>
  </div>
</header>

<main>
  <section class="wrap hero">
    <p class="pill">new &middot; spring edit</p>
    <h1>Soft things,<br /><em>made beautifully.</em></h1>
    <p class="sub">A calm little corner of the internet. Pastels, whitespace, and room to breathe.</p>
    <div class="actions">
      <a href="#collection" class="btn">Explore</a>
      <button class="btn btn-ghost" id="loveBtn">Send love</button>
    </div>
    <p class="hint" id="loveHint"></p>
    <div class="hero-card">
      <div class="hero-blob"></div>
      <p class="hero-quote">&ldquo;Simplicity is the prettiest thing you can wear.&rdquo;</p>
    </div>
  </section>

  <section class="wrap collection" id="collection">
    <p class="eyebrow">the collection</p>
    <h2>Three little favourites</h2>
    <p class="section-sub">Everything you need to start. Nothing you don&rsquo;t.</p>
    <div class="grid">
      <article class="card">
        <div class="thumb t1"></div>
        <h3>Petal</h3>
        <p>Blush tones and rounded edges for gentle interfaces.</p>
      </article>
      <article class="card">
        <div class="thumb t2"></div>
        <h3>Milk</h3>
        <p>Creamy surfaces with lots of airy spacing.</p>
      </article>
      <article class="card">
        <div class="thumb t3"></div>
        <h3>Honey</h3>
        <p>Warm accents that feel like golden hour.</p>
      </article>
    </div>
  </section>

  <section class="wrap hello" id="hello">
    <div class="hello-box">
      <h2>Come say hi &#9825;</h2>
      <p>Made with HTML, CSS &amp; a little JavaScript.</p>
    </div>
  </section>
</main>

<footer class="footer">
  <div class="wrap footer-inner">
    <span>&#10047; blush &middot; <span id="year">2026</span></span>
  </div>
</footer>`;

export const STARTER_CSS = `* { box-sizing: border-box; }
:root {
  --bg: #fff9fb;
  --surface: #ffffff;
  --ink: #4a3a42;
  --muted: #a78e99;
  --rose: #f472b6;
  --rose-deep: #db2777;
  --rose-soft: #fce7f3;
  --peach: #fde8d8;
  --line: #f5dce8;
  --radius: 24px;
}
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: ui-rounded, "Hiragino Maru Gothic ProN", "Segoe UI", system-ui, sans-serif;
  background: var(--bg);
  color: var(--ink);
  line-height: 1.7;
}
a { color: inherit; text-decoration: none; }
.wrap { max-width: 640px; margin: 0 auto; padding: 0 24px; }

/* nav */
.nav {
  position: sticky; top: 0; z-index: 10;
  background: rgba(255, 249, 251, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--line);
}
.nav-inner { display: flex; align-items: center; height: 64px; }
.brand { font-weight: 800; font-size: 20px; letter-spacing: -0.01em; }
.brand-mark { color: var(--rose-deep); }
.menu-btn {
  display: none; margin-left: auto;
  background: var(--surface); border: 1px solid var(--line);
  border-radius: 12px; padding: 6px 12px; font-size: 18px; color: var(--ink);
}
.links { display: flex; align-items: center; gap: 26px; margin-left: auto; font-size: 15px; color: var(--muted); }
.links a:hover { color: var(--ink); }

/* buttons */
.btn {
  display: inline-block; border: none; cursor: pointer;
  background: var(--ink); color: #fff;
  font-weight: 700; font-size: 16px;
  padding: 15px 34px; border-radius: 999px;
}
.btn:hover { background: var(--rose-deep); }
.btn-sm { padding: 10px 22px; font-size: 14px; }
.btn-ghost { background: var(--surface); color: var(--ink); border: 1px solid var(--line); }

/* hero */
.hero { text-align: center; padding: 72px 24px 24px; }
.pill {
  display: inline-block; margin: 0 0 28px;
  font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--rose-deep); background: var(--rose-soft);
  padding: 8px 20px; border-radius: 999px;
}
.hero h1 {
  font-family: Georgia, "Times New Roman", serif;
  font-weight: 400; font-size: clamp(2.6rem, 9vw, 4rem);
  line-height: 1.12; letter-spacing: -0.02em; margin: 0 0 24px;
}
.hero h1 em { font-style: italic; color: var(--rose-deep); }
.sub { color: var(--muted); font-size: 17px; max-width: 420px; margin: 0 auto 36px; }
.actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 16px; }
.hint { min-height: 24px; font-size: 14px; color: var(--rose-deep); margin: 0 0 8px; }
.hero-card {
  margin: 40px 0 0; background: var(--surface);
  border: 1px solid var(--line); border-radius: 32px;
  padding: 56px 32px;
}
.hero-blob {
  width: 88px; height: 88px; margin: 0 auto 24px;
  background: linear-gradient(135deg, var(--rose-soft), var(--peach));
  border-radius: 46% 54% 55% 45% / 48% 44% 56% 52%;
}
.hero-quote {
  font-family: Georgia, serif; font-style: italic;
  font-size: 20px; color: var(--ink); margin: 0;
}

/* collection */
.collection { padding: 88px 24px 8px; text-align: center; }
.eyebrow {
  font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--rose-deep); margin: 0 0 16px;
}
.collection h2, .hello-box h2 {
  font-family: Georgia, serif; font-weight: 400;
  font-size: clamp(1.8rem, 6vw, 2.4rem); margin: 0 0 12px;
}
.section-sub { color: var(--muted); margin: 0 0 48px; }
.grid { display: grid; gap: 24px; text-align: left; }
.card {
  background: var(--surface); border: 1px solid var(--line);
  border-radius: var(--radius); padding: 20px 20px 28px;
}
.thumb { height: 150px; border-radius: 16px; margin-bottom: 20px; }
.t1 { background: linear-gradient(135deg, #fce7f3, #fbcfe8); }
.t2 { background: linear-gradient(135deg, #fef3e8, #fde8d8); }
.t3 { background: linear-gradient(135deg, #fdf2f8, #e9d5ff); }
.card h3 { font-family: Georgia, serif; font-size: 20px; margin: 0 0 6px; }
.card p { margin: 0; color: var(--muted); font-size: 15px; }

/* hello + footer */
.hello { padding: 88px 24px 96px; text-align: center; }
.hello-box {
  background: var(--ink); color: #fff;
  border-radius: 32px; padding: 64px 32px;
}
.hello-box p { margin: 0; opacity: 0.7; }
.footer { border-top: 1px solid var(--line); padding: 28px 0 36px; }
.footer-inner { text-align: center; color: var(--muted); font-size: 14px; }

.reveal { opacity: 0; transform: translateY(16px); transition: opacity 0.6s ease, transform 0.6s ease; }
.reveal.visible { opacity: 1; transform: none; }

@media (max-width: 560px) {
  .menu-btn { display: block; }
  .nav { position: sticky; }
  .nav-inner { flex-wrap: wrap; }
  .links {
    display: none; flex-basis: 100%; flex-direction: column;
    align-items: stretch; gap: 0; margin: 0;
    padding: 8px 0 16px;
  }
  .links.open { display: flex; }
  .links a { padding: 12px 4px; border-top: 1px solid var(--line); }
  .hero { padding-top: 56px; }
  .actions .btn { width: 100%; }
  .hero-card { padding: 44px 24px; border-radius: 26px; }
}`;

export const STARTER_JS = `document.getElementById('year').textContent = new Date().getFullYear();

var menuBtn = document.getElementById('menuBtn');
var navLinks = document.getElementById('navLinks');
menuBtn.addEventListener('click', function () {
  navLinks.classList.toggle('open');
});
navLinks.addEventListener('click', function (e) {
  if (e.target.tagName === 'A') navLinks.classList.remove('open');
});

var notes = ['you are loved', 'stay soft', 'you look lovely today', 'keep blooming'];
var i = 0;
var hint = document.getElementById('loveHint');
document.getElementById('loveBtn').addEventListener('click', function () {
  var msg = notes[i % notes.length] + '  \\u2665';
  i++;
  hint.textContent = msg;
  console.log(msg);
});

var els = document.querySelectorAll('.card, .hero-card, .hello-box');
els.forEach(function (el) { el.classList.add('reveal'); });
var io = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1 });
els.forEach(function (el) { io.observe(el); });`;

export const VSCODE_STARTER = {
    html: STARTER_HTML,
    css: STARTER_CSS,
    js: STARTER_JS,
};
