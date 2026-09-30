/* Ventana de captura: pide nombre y email antes de abrir WhatsApp, la comunidad o el calendario. */
(function () {
  var COPY = {
    comunidad: { t: 'Entra en la comunidad gratuita', p: 'Déjame tu nombre y tu email y te llevo al grupo de WhatsApp.', b: 'Entrar en la comunidad' },
    llamada:   { t: 'Agenda tu llamada conmigo', p: 'Déjame tu nombre y tu email y te llevo a mi calendario para que elijas día y hora.', b: 'Ir al calendario' },
    whatsapp:  { t: 'Escríbeme por WhatsApp', p: 'Déjame tu nombre y tu email y se abre el chat conmigo.', b: 'Abrir WhatsApp' },
    sesion:    { t: 'Sesión única A Fondo', p: 'Déjame tu nombre y tu email y se abre el chat conmigo para reservarla.', b: 'Abrir WhatsApp' },
    intensivo: { t: 'Intensivo A Fondo', p: 'Déjame tu nombre y tu email y se abre el chat conmigo para empezar.', b: 'Abrir WhatsApp' }
  };
  var KEY = 'sc_lead';
  function saved() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
  function send(d) {
    try {
      fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d), keepalive: true });
    } catch (e) {}
  }
  function go(href) {
    var w = window.open(href, '_blank', 'noopener');
    if (!w) window.location.href = href;
  }

  var wrap = document.createElement('div');
  wrap.className = 'lead-modal';
  wrap.hidden = true;
  wrap.innerHTML =
    '<div class="lead-backdrop" data-close></div>' +
    '<div class="lead-box" role="dialog" aria-modal="true" aria-labelledby="lead-title">' +
      '<button class="lead-x" type="button" aria-label="Cerrar" data-close>×</button>' +
      '<p class="eyebrow">Sara Castro</p>' +
      '<h2 id="lead-title"></h2>' +
      '<p class="lead-text"></p>' +
      '<form id="lead-form" novalidate>' +
        '<label for="lead-name">Nombre</label>' +
        '<input id="lead-name" name="name" type="text" autocomplete="given-name" required>' +
        '<label for="lead-email">Email</label>' +
        '<input id="lead-email" name="email" type="email" autocomplete="email" required>' +
        '<input class="lead-hp" name="website" type="text" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<label class="lead-check"><input id="lead-ok" type="checkbox" required> <span>He leído y acepto la <a href="/privacidad" target="_blank" rel="noopener">política de privacidad</a>.</span></label>' +
        '<p class="lead-err" hidden></p>' +
        '<button class="btn btn-primary" type="submit"></button>' +
      '</form>' +
    '</div>';
  document.body.appendChild(wrap);

  var form = wrap.querySelector('form'), err = wrap.querySelector('.lead-err');
  var current = null;

  function open(a) {
    var src = a.getAttribute('data-lead');
    var c = COPY[src] || COPY.whatsapp;
    current = { href: a.href, source: src };
    wrap.querySelector('h2').textContent = c.t;
    wrap.querySelector('.lead-text').textContent = c.p;
    wrap.querySelector('button[type=submit]').textContent = c.b;
    err.hidden = true;
    wrap.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    setTimeout(function () { document.getElementById('lead-name').focus(); }, 30);
  }
  function close() { wrap.hidden = true; document.documentElement.style.overflow = ''; }

  wrap.addEventListener('click', function (e) { if (e.target.hasAttribute('data-close')) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !wrap.hidden) close(); });

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-lead]');
    if (!a) return;
    var s = saved();
    if (s && s.email) {
      // Ya nos dejó sus datos antes: solo añadimos la etiqueta nueva y dejamos pasar.
      send({ name: s.name, email: s.email, source: a.getAttribute('data-lead') });
      return;
    }
    e.preventDefault();
    open(a);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('lead-name').value.trim(), email = document.getElementById('lead-email').value.trim();
    var msg = '';
    if (!name) msg = 'Escribe tu nombre.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) msg = 'Revisa tu email, parece que falta algo.';
    else if (!document.getElementById('lead-ok').checked) msg = 'Marca la casilla de la política de privacidad para continuar.';
    if (msg) { err.textContent = msg; err.hidden = false; return; }
    var d = { name: name, email: email, source: current.source, website: form.querySelector('.lead-hp').value };
    send(d);
    save({ name: name, email: email });
    close();
    go(current.href);
  });
})();
