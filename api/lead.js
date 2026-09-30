// Recibe nombre + email desde la web y los guarda en Systeme.io con la etiqueta del botón.
// Necesita la variable de entorno SYSTEME_API_KEY en Vercel.
// Una sola etiqueta para todos los leads de la web (plan gratuito de Systeme: 1 etiqueta).
// Si no existe en tu Systeme, se crea sola la primera vez.
const TAG_NAME = 'web-lead';
const BASE = 'https://api.systeme.io/api';

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ ok: false }); return; }
  let body = req.body || {};
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }

  if (body.website) { res.status(200).json({ ok: true }); return; } // anti-spam
  const email = String(body.email || '').trim().toLowerCase();
  const name = String(body.name || '').trim().slice(0, 80);
  const source = String(body.source || '');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { res.status(400).json({ ok: false, error: 'email' }); return; }

  const key = process.env.SYSTEME_API_KEY;
  if (!key) { res.status(500).json({ ok: false, error: 'missing SYSTEME_API_KEY' }); return; }
  const H = { 'X-API-Key': key, 'Content-Type': 'application/json', 'Accept': 'application/json' };

  try {
    let id = null;
    const created = await fetch(BASE + '/contacts', {
      method: 'POST', headers: H,
      body: JSON.stringify({ email, locale: 'es', fields: name ? [{ slug: 'first_name', value: name }] : [] })
    });
    if (created.ok) {
      id = (await created.json()).id;
    } else {
      // Ya existe: lo buscamos por email
      const found = await fetch(BASE + '/contacts?limit=10&email=' + encodeURIComponent(email), { headers: H });
      if (found.ok) { const j = await found.json(); id = j.items && j.items[0] && j.items[0].id; }
    }
    if (!id) { res.status(502).json({ ok: false, error: 'systeme' }); return; }

    const tagName = TAG_NAME;
    if (tagName) {
      const tagId = await getTagId(tagName, H);
      if (tagId) {
        await fetch(BASE + '/contacts/' + id + '/tags', { method: 'POST', headers: H, body: JSON.stringify({ tagId }) });
      }
    }
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'server' });
  }
};

async function getTagId(name, H) {
  const r = await fetch(BASE + '/tags?limit=100&query=' + encodeURIComponent(name), { headers: H });
  if (r.ok) {
    const j = await r.json();
    const t = (j.items || []).find(function (x) { return x.name.toLowerCase() === name.toLowerCase(); });
    if (t) return t.id;
  }
  const c = await fetch(BASE + '/tags', { method: 'POST', headers: H, body: JSON.stringify({ name }) });
  if (c.ok) return (await c.json()).id;
  return null;
}
