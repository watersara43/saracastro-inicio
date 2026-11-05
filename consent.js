/* Aviso de cookies + etiqueta de Google Ads + píxel de Meta.
   Nada de seguimiento se carga hasta que la persona pulsa "Aceptar".
   La elección se guarda en el navegador y se puede cambiar desde /cookies.
   Este archivo NO toca el formulario ni /api/lead: solo escucha el envío para medirlo. */
(function () {
  var GOOGLE_ADS_ID = 'AW-18558359110';
  var GOOGLE_ADS_LEAD = 'AW-18558359110/nMFiCN6w5rIdEMasqJFF'; // Conversión "Lead formulario web"
  var META_PIXEL_ID = '2172475516685413'; // Píxel de Meta (conjunto de datos "Suricato")
  var KEY = 'sc_cookies'; // 'si' | 'no'

  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  var loaded = false;
  function loadTracking() {
    if (loaded) return; loaded = true;

    // Google (Ads)
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('consent', 'default', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' });
    gtag('js', new Date());
    gtag('config', GOOGLE_ADS_ID);
    var g = document.createElement('script');
    g.async = true; g.src = 'https://www.googletagmanager.com/gtag/js?id=' + GOOGLE_ADS_ID;
    document.head.appendChild(g);

    // Meta (Instagram / Facebook)
    if (META_PIXEL_ID) {
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', META_PIXEL_ID);
      fbq('track', 'PageView');
    }
  }

  // Mide cuando alguien deja su email en el formulario (sin modificarlo).
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f || f.id !== 'lead-form' || get() !== 'si') return;
    // Solo cuenta si el formulario está bien rellenado (nombre, email válido y casilla de privacidad).
    var n = f.querySelector('#lead-name'), m = f.querySelector('#lead-email'), ok = f.querySelector('#lead-ok');
    if (!n || !n.value.trim() || !m || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.value.trim()) || !ok || !ok.checked) return;
    try { if (window.gtag) gtag('event', 'conversion', { send_to: GOOGLE_ADS_LEAD }); } catch (err) {}
    try { if (window.fbq) fbq('track', 'Lead'); } catch (err) {}
  }, true);

  var css =
    '.ck-bar{position:fixed;left:16px;right:16px;bottom:16px;z-index:9998;max-width:560px;margin-inline:auto;background:var(--panel-2,#261e20);color:var(--text,#f2e8e1);border:1px solid var(--line,#3a2e30);border-radius:var(--radius,14px);padding:18px 18px 16px;box-shadow:0 12px 40px rgba(0,0,0,.45);font-family:var(--body,sans-serif);font-size:.95rem;line-height:1.5}' +
    '.ck-bar p{margin:0 0 14px;color:var(--muted,#b5a59e)}.ck-bar a{color:var(--copper-soft,#e0bdf8)}' +
    '.ck-row{display:flex;gap:10px;flex-wrap:wrap}.ck-row .btn{flex:1 1 140px;padding:11px 18px;font-size:.95rem;cursor:pointer}' +
    '.ck-no{background:transparent;color:var(--text,#f2e8e1);border-color:var(--line,#3a2e30)}.ck-no:hover{border-color:var(--muted,#b5a59e)}';

  function showBar() {
    if (document.querySelector('.ck-bar')) return;
    if (!document.getElementById('ck-css')) {
      var s = document.createElement('style'); s.id = 'ck-css'; s.textContent = css; document.head.appendChild(s);
    }
    var bar = document.createElement('div');
    bar.className = 'ck-bar'; bar.setAttribute('role', 'dialog'); bar.setAttribute('aria-label', 'Aviso de cookies');
    bar.innerHTML =
      '<p>Uso cookies de Google y Meta para medir la web y mostrar anuncios a quien ya me conoce. Solo se activan si aceptas. <a href="/cookies">Más información</a>.</p>' +
      '<div class="ck-row"><button type="button" class="btn ck-no">Rechazar</button><button type="button" class="btn btn-primary ck-yes">Aceptar</button></div>';
    document.body.appendChild(bar);
    bar.querySelector('.ck-yes').onclick = function () { set('si'); bar.remove(); loadTracking(); };
    bar.querySelector('.ck-no').onclick = function () {
      var had = loaded; set('no'); bar.remove();
      if (had) location.reload(); // si antes había aceptado, recarga para dejar de medir
    };
  }

  // Para el enlace "Configurar cookies" de /cookies
  window.scCookies = showBar;

  function init() { var c = get(); if (c === 'si') loadTracking(); else if (c !== 'no') showBar(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
