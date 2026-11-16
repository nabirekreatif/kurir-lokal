/* Kurir Lokal — inti bersama (publik + dasbor) · © Nabire Kreatif */
(function () {
  'use strict';
  const CFG = window.KURIR_CONFIG || {};
  const GAS = String(CFG.GAS_URL || '').trim();
  const LS = 'kurir:v1:';
  const K = window.K = { CFG: CFG, DEMO: !GAS, BASE: window.K_BASE || '' };

  /* ---------- penyimpanan lokal (aman bila diblokir browser) ---------- */
  K.get = function (k, d) { try { const v = localStorage.getItem(LS + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  K.set = function (k, v) { try { localStorage.setItem(LS + k, JSON.stringify(v)); } catch (e) { } };
  K.del = function (k) { try { localStorage.removeItem(LS + k); } catch (e) { } };

  /* ---------- API ---------- */
  K.api = function (action, data, token) {
    if (K.DEMO) return Promise.resolve().then(function () { return window.KDemo.handle(action, data || {}, token); });
    const body = JSON.stringify({ action: action, data: data || {}, token: token || '', reqId: Date.now().toString(36) + Math.random().toString(36).slice(2, 8) });
    return fetch(GAS, { method: 'POST', body: body, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, redirect: 'follow' })
      .then(function (r) { return r.json(); })
      .catch(function () { return { success: false, message: 'Koneksi gagal. Periksa internet Anda lalu coba lagi.' }; });
  };
  K.publik = function (paksa) {
    if (K.DEMO) return Promise.resolve(window.KDemo.handle('public').data);
    const ambil = (window.__kPub && !paksa ? window.__kPub : fetch(GAS + (GAS.indexOf('?') > -1 ? '&' : '?') + 'action=public', { cache: 'no-store', redirect: 'follow' }).then(function (r) { return r.json(); }))
      .then(function (j) { window.__kPub = null; if (!j || !j.success) throw new Error((j && j.message) || 'Gagal memuat'); K.set('pub', { t: Date.now(), d: j.data }); return j.data; });
    return ambil;
  };
  K.cachePublik = function () { const c = K.get('pub', null); return c && c.d ? c : null; };

  /* ---------- utilitas ---------- */
  K.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  K.rp = function (n) { return 'Rp' + String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };
  K.hp08 = function (v) { let s = String(v || '').replace(/[^0-9+]/g, '').replace(/^\+/, ''); if (!s) return ''; if (s.indexOf('62') === 0) s = '0' + s.slice(2); else if (s[0] === '8') s = '0' + s; return s; };
  K.hp62 = function (v) { const s = K.hp08(v); return s ? '62' + s.slice(1) : ''; };
  K.hpValid = function (v) { return /^08\d{8,12}$/.test(K.hp08(v)); };
  K.waLink = function (hp, teks) { return 'https://wa.me/' + (hp ? K.hp62(hp) : '') + '?text=' + encodeURIComponent(teks || ''); };
  K.img = function (u) { u = String(u || ''); if (!u) return ''; return /^(https?:|data:|blob:)/.test(u) ? u : K.BASE + u; };
  K.ya = function (v) { return v === true || v === 'YA' || v === 'TRUE' || v === 'true'; };
  K.list = function (v) { if (Array.isArray(v)) return v; const s = String(v || '').trim(); if (!s) return []; if (s[0] === '[') { try { return JSON.parse(s); } catch (e) { } } return s.split(/[\n,]+/).map(function (x) { return x.trim(); }).filter(String); };
  K.json = function (v, d) { try { return typeof v === 'string' ? JSON.parse(v) : (v || d); } catch (e) { return d; } };
  K.waktu = function (iso) { try { const d = new Date(iso); return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch (e) { return iso; } };
  K.ikon = function (n, cls) { return '<span class="mi' + (cls ? ' ' + cls : '') + '" aria-hidden="true">' + K.esc(n) + '</span>'; };
  K.debounce = function (fn, ms) { let t; return function () { const a = arguments, s = this; clearTimeout(t); t = setTimeout(function () { fn.apply(s, a); }, ms); }; };
  K.kode = function () { const d = new Date(), p = function (n) { return String(n).padStart(2, '0'); }; return 'KR' + p(d.getDate()) + p(d.getMonth() + 1) + '-' + p(d.getHours()) + p(d.getMinutes()) + Math.floor(Math.random() * 90 + 10); };

  /* ---------- tema & warna ---------- */
  K.terapkanTema = function (s) {
    const d = document.documentElement;
    let t = K.get('tema', '');
    if (!t) t = s && s.tema_bawaan === 'gelap' ? 'dark' : s && s.tema_bawaan === 'sistem' && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    d.setAttribute('data-theme', t);
    const w = s && /^#[0-9a-f]{6}$/i.test(s.warna_utama || '') ? s.warna_utama : '';
    if (w) {
      const l = K.luminan(w), on = l > 0.4 ? '#1C1A1F' : '#FFFFFF';
      d.style.setProperty('--primary', w); d.style.setProperty('--on-primary', on);
      d.style.setProperty('--primary-deep', K.gelapkan(w, .18));
      d.style.setProperty('--accent-text', t === 'dark' ? K.terangkan(w, .35) : (l > 0.25 ? K.gelapkan(w, .45) : w));
      d.style.setProperty('--primary-soft', t === 'dark' ? K.campur(w, '#1C1A1F', .78) : K.campur(w, '#FFFFFF', .9));
    }
    const m = document.querySelector('meta[name=theme-color]'); if (m) m.setAttribute('content', t === 'dark' ? '#121114' : '#F7F5F2');
  };
  K.gantiTema = function (s) { const now = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; K.set('tema', now); K.terapkanTema(s); };
  function rgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function hex(a) { return '#' + a.map(function (x) { return ('0' + Math.round(Math.max(0, Math.min(255, x))).toString(16)).slice(-2); }).join(''); }
  K.luminan = function (h) { const c = rgb(h).map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
  K.gelapkan = function (h, f) { return hex(rgb(h).map(function (v) { return v * (1 - f); })); };
  K.terangkan = function (h, f) { return hex(rgb(h).map(function (v) { return v + (255 - v) * f; })); };
  K.campur = function (a, b, f) { const x = rgb(a), y = rgb(b); return hex(x.map(function (v, i) { return v * (1 - f) + y[i] * f; })); };

  /* ---------- status buka/tutup (dihitung di HP pengunjung, zona waktu usaha) ---------- */
  K.jamDi = function (tz) {
    try {
      const f = new Intl.DateTimeFormat('en-GB', { timeZone: tz || 'Asia/Jayapura', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
      const g = function (t) { return (f.filter(function (x) { return x.type === t; })[0] || {}).value; };
      return { h: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(g('weekday')), hm: (g('hour') === '24' ? '00' : g('hour')) + ':' + g('minute') };
    } catch (e) { const d = new Date(); return { h: d.getDay(), hm: String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') }; }
  };
  K.status = function (P) {
    const s = P.settings || {}, now = K.jamDi(P.tz), jad = K.json(s.jadwal, []), hari = jad.filter(function (x) { return x.h === now.h; })[0];
    const on = (P.kurir || []).filter(function (k) { return k.status === 'online'; }).length;
    let buka, alasan = '';
    if (s.tutup_sampai && new Date(s.tutup_sampai) > new Date()) { buka = false; alasan = 'istirahat'; }
    else if (s.status_mode === 'buka') buka = true;
    else if (s.status_mode === 'tutup') { buka = false; alasan = 'manual'; }
    else if (s.fitur_jadwal === 'TIDAK') buka = true;
    else { buka = !!(hari && !hari.libur && now.hm >= hari.buka && now.hm < hari.tutup); if (!buka) alasan = 'jadwal'; }
    if (buka && s.wajib_kurir_online !== 'TIDAK' && !on) { buka = false; alasan = 'kurir_off'; }
    let ket = '';
    if (alasan === 'istirahat') ket = 'Istirahat sebentar, buka lagi ±' + new Date(s.tutup_sampai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    else if (alasan === 'kurir_off') ket = 'Semua kurir sedang tidak aktif';
    else if (alasan === 'jadwal') { const bsk = K.bukaBerikut(jad, now); ket = bsk ? 'Buka lagi ' + bsk : 'Di luar jam operasional'; }
    else if (alasan === 'manual') ket = 'Ditutup sementara oleh admin';
    return { buka: buka, alasan: alasan, ket: ket, kurirOnline: on, jamHariIni: hari && !hari.libur ? hari.buka + '–' + hari.tutup : 'Libur' };
  };
  K.HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  K.bukaBerikut = function (jad, now) {
    for (let i = 0; i < 7; i++) {
      const h = (now.h + i) % 7, j = jad.filter(function (x) { return x.h === h; })[0];
      if (!j || j.libur) continue;
      if (i === 0 && now.hm < j.buka) return 'hari ini pukul ' + j.buka;
      if (i === 1) return 'besok pukul ' + j.buka;
      if (i > 1) return K.HARI[h] + ' pukul ' + j.buka;
    }
    return '';
  };

  /* ---------- lokasi & jarak ---------- */
  K.parseLatLng = function (s) {
    s = decodeURIComponent(String(s || ''));
    const m = s.match(/@(-?\d{1,2}\.\d{3,}),\s*(-?\d{1,3}\.\d{3,})/) || s.match(/[?&](?:q|query|ll|destination)=(-?\d{1,2}\.\d{3,}),\s*(-?\d{1,3}\.\d{3,})/) ||
      s.match(/!3d(-?\d{1,2}\.\d{3,})!4d(-?\d{1,3}\.\d{3,})/) || s.match(/^\s*(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)\s*$/);
    return m ? { lat: +m[1], lng: +m[2] } : null;
  };
  K.mapsLink = function (p) { return p && p.lat != null && p.lat !== '' ? 'https://maps.google.com/?q=' + (+p.lat).toFixed(6) + ',' + (+p.lng).toFixed(6) : ''; };
  K.haversine = function (a, b) {
    const R = 6371, r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
  };
  /** Jarak lewat jalan (OSRM publik, maks 5 dtk) → cadangan garis lurus × faktor jalan. */
  K.jarak = function (a, b, s) {
    const lurus = K.haversine(a, b) * (Number(s.faktor_jalan) || 1.3);
    if (s.fitur_jarak_jalan === 'TIDAK' || !window.fetch) return Promise.resolve({ km: lurus, cara: 'perkiraan' });
    const ctl = window.AbortController ? new AbortController() : null, t = setTimeout(function () { ctl && ctl.abort(); }, 5000);
    return fetch('https://router.project-osrm.org/route/v1/driving/' + a.lng + ',' + a.lat + ';' + b.lng + ',' + b.lat + '?overview=false', ctl ? { signal: ctl.signal } : {})
      .then(function (r) { return r.json(); })
      .then(function (j) { clearTimeout(t); const m = j && j.routes && j.routes[0] && j.routes[0].distance; return m ? { km: m / 1000, cara: 'jalan' } : { km: lurus, cara: 'perkiraan' }; })
      .catch(function () { clearTimeout(t); return { km: lurus, cara: 'perkiraan' }; });
  };
  K.gps = function () {
    return new Promise(function (ok, no) {
      if (!navigator.geolocation) return no(new Error('Perangkat tidak mendukung GPS.'));
      navigator.geolocation.getCurrentPosition(function (p) { ok({ lat: p.coords.latitude, lng: p.coords.longitude, akurasi: p.coords.accuracy }); },
        function (e) { no(new Error(e.code === 1 ? 'Izin lokasi ditolak. Aktifkan izin lokasi di browser, atau pilih di peta.' : 'Lokasi belum didapat. Coba di luar ruangan atau pilih di peta.')); },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 });
    });
  };

  /* ---------- tarif ---------- */
  K.ongkir = function (km, layanan, P) {
    const s = P.settings || {}, L = layanan || {};
    if (L.tarif_mode === 'flat') return { ongkir: Number(L.tarif_flat) || 0, ket: 'Tarif tetap' };
    if (L.tarif_mode === 'nego') return { ongkir: 0, ket: 'Tarif dikonfirmasi admin', nego: true };
    if (km == null || isNaN(km)) return { ongkir: 0, ket: 'Tentukan titik untuk menghitung', belum: true };
    if (km > (Number(s.tarif_maks_km) || 999)) return { ongkir: 0, ket: 'Jarak di atas ' + s.tarif_maks_km + ' km — ongkir dikonfirmasi admin', nego: true };
    let o = 0;
    if (s.tarif_mode === 'tabel' && (P.tarif || []).length) {
      const t = P.tarif.filter(function (r) { return km >= r.km_dari && km < r.km_sampai; })[0];
      if (t) o = Number(t.harga);
      else { const last = P.tarif[P.tarif.length - 1]; o = Number(last.harga) + Math.ceil(km - last.km_sampai) * (Number(s.tarif_per_km) || 0); }
    } else {
      o = (Number(s.tarif_dasar) || 0) + Math.max(0, Math.ceil(km - (Number(s.km_dasar) || 0))) * (Number(s.tarif_per_km) || 0);
    }
    o = Math.max(o, Number(s.tarif_minimal) || 0);
    let ket = '';
    if (s.fitur_tarif_malam === 'YA') {
      const hm = K.jamDi(P.tz).hm, a = s.malam_mulai || '21:00', b = s.malam_selesai || '05:00';
      if (a > b ? (hm >= a || hm < b) : (hm >= a && hm < b)) { o += Number(s.malam_biaya) || 0; ket = 'termasuk biaya malam ' + K.rp(s.malam_biaya); }
    }
    o += Number(L.biaya_tambah) || 0;
    const bul = Number(s.pembulatan) || 0; if (bul) o = Math.ceil(o / bul) * bul;
    return { ongkir: o, ket: ket };
  };

  /* ---------- broadcast (sama dengan susunBroadcast_ di backend) ---------- */
  K.susunBroadcast = function (tpl, P, st) {
    const s = P.settings || {};
    const prd = (P.produk || []).filter(function (p) { return p.stok !== 'habis' && (p.status_tayang ? p.status_tayang === 'tayang' && p.aktif !== false : true); })
      .sort(function (a, b) { return (b.unggulan ? 1 : 0) - (a.unggulan ? 1 : 0); }).slice(0, 5);
    const v = { nama: s.nama_usaha, tagline: s.tagline, area: s.area_layanan, wa: K.hp08(s.wa_admin), link: s.app_url || location.origin + location.pathname.replace(/admin\/?(index\.html)?$/, ''),
      status: st.buka ? '🟢 BUKA sekarang' : '🔴 Sedang tutup', jam: st.jamHariIni,
      layanan: (P.layanan || []).filter(function (l) { return l.aktif !== false; }).map(function (l) { return '✅ ' + l.nama; }).join('\n'),
      tarif: K.rp(Number(s.tarif_minimal || s.tarif_dasar || 0)), produk: prd.map(function (p) { return '• ' + p.nama + ' — ' + K.rp(p.harga); }).join('\n'),
      tanggal: new Date().toLocaleDateString('id-ID') };
    return String(tpl || '').replace(/\{(\w+)\}/g, function (m, k) { return v[k] == null ? m : String(v[k]); });
  };

  /* ---------- UI: toast, sheet, konfirmasi, lightbox ---------- */
  K.toast = function (msg, tipe) {
    let box = document.getElementById('toasts');
    if (!box) { box = document.createElement('div'); box.id = 'toasts'; box.className = 'toasts'; box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    const t = document.createElement('div'); t.className = 'toast ' + (tipe || '');
    t.innerHTML = K.ikon(tipe === 'bad' ? 'error' : tipe === 'ok' ? 'check_circle' : 'info', 'fill') + '<span>' + K.esc(msg) + '</span>';
    box.appendChild(t); setTimeout(function () { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(function () { t.remove(); }, 320); }, tipe === 'bad' ? 4200 : 2800);
  };
  let sheetStack = [];
  /** Lembar (bottom-sheet di HP, dialog di desktop). Tertutup hanya lewat X / Batal (isian tidak hilang tak sengaja). */
  K.sheet = function (o) {
    const ov = document.createElement('div'); ov.className = 'ov';
    ov.innerHTML = '<div class="sheet ' + (o.cls || '') + '" role="dialog" aria-modal="true" aria-label="' + K.esc(o.title || '') + '">' +
      '<div class="sheet-h"><h3>' + K.esc(o.title || '') + '</h3><button class="ibtn" data-x aria-label="Tutup">' + K.ikon('close') + '</button></div>' +
      '<div class="sheet-b">' + (o.html || '') + '</div>' + (o.foot ? '<div class="sheet-f">' + o.foot + '</div>' : '') + '</div>';
    document.body.appendChild(ov); document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { ov.classList.add('show'); });
    const api = { el: ov, body: ov.querySelector('.sheet-b'), close: function () { ov.classList.remove('show'); sheetStack = sheetStack.filter(function (x) { return x !== api; }); setTimeout(function () { ov.remove(); if (!sheetStack.length) document.body.style.overflow = ''; }, 260); if (o.onClose) o.onClose(); } };
    ov.querySelectorAll('[data-x]').forEach(function (b) { b.addEventListener('click', api.close); });
    sheetStack.push(api);
    const f = ov.querySelector('input,textarea,select'); if (f && matchMedia('(min-width:768px)').matches) setTimeout(function () { f.focus(); }, 300);
    return api;
  };
  window.addEventListener('hashchange', function () { sheetStack.slice().forEach(function (x) { x.close(); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && sheetStack.length) sheetStack[sheetStack.length - 1].close(); });
  K.konfirmasi = function (judul, teks, tombol, bahaya) {
    return new Promise(function (ok) {
      const s = K.sheet({ title: judul, html: '<p>' + K.esc(teks) + '</p>', foot: '<button class="btn line" data-x>Batal</button><button class="btn ' + (bahaya ? 'danger' : 'pri') + '" data-y>' + K.esc(tombol || 'Lanjutkan') + '</button>', onClose: function () { ok(false); } });
      s.el.querySelector('[data-y]').addEventListener('click', function () { ok(true); ok = function () { }; s.close(); });
    });
  };
  K.lightbox = function (src, cap) {
    const d = document.createElement('div'); d.className = 'lightbox'; d.setAttribute('role', 'dialog');
    d.innerHTML = '<button class="ibtn" aria-label="Tutup">' + K.ikon('close') + '</button><div><img src="' + K.esc(src) + '" alt="' + K.esc(cap || '') + '">' + (cap ? '<p>' + K.esc(cap) + '</p>' : '') + '</div>';
    d.querySelector('button').onclick = function () { d.remove(); }; d.addEventListener('click', function (e) { if (e.target === d) d.remove(); });
    document.body.appendChild(d);
  };
  K.busy = function (btn, on, teks) {
    if (!btn) return; if (on) { btn.dataset.t = btn.innerHTML; btn.disabled = true; btn.innerHTML = K.ikon('progress_activity') + (teks || 'Memproses…'); }
    else { btn.disabled = false; if (btn.dataset.t) btn.innerHTML = btn.dataset.t; }
  };
  K.salin = function (t) {
    return (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { K.toast('Teks disalin.', 'ok'); })
      .catch(function () { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); K.toast('Teks disalin.', 'ok'); } catch (e) { } a.remove(); });
  };

  /* ---------- foto: kompres di browser sebelum diunggah ---------- */
  K.kompres = function (file, max, mutu) {
    max = max || 1280; mutu = mutu || .8;
    return new Promise(function (ok, no) {
      if (!/^image\//.test(file.type)) return no(new Error('Berkas harus gambar.'));
      const url = URL.createObjectURL(file), im = new Image();
      im.onload = function () {
        const r = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas');
        c.width = Math.round(im.width * r); c.height = Math.round(im.height * r);
        const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url); ok({ base64: c.toDataURL('image/jpeg', mutu), mime: 'image/jpeg' });
      };
      im.onerror = function () { no(new Error('Gambar tidak bisa dibaca.')); }; im.src = url;
    });
  };
  K.unggah = function (file, folder, token, aksi) {
    return K.kompres(file).then(function (b) { return K.api(aksi || 'upload', { base64: b.base64, mime: b.mime, folder: folder, nama: file.name }, token); })
      .then(function (r) { if (!r.success) throw new Error(r.message); return r.data.url; });
  };


  /* =====================================================================
   *  MENU, NAVIGASI, MENU KATEGORI, GALERI, BAGIAN BERANDA (meniru tema emas)
   *  Semua bisa diubah dari dasbor → Tampilan. Kosong = pakai bawaan di bawah.
   * ===================================================================== */
  const DEF = K.DEF = {
    menu: [
      { id: 'pesan', label: 'Pesan Kurir', sub: 'Antar barang, makanan & titip belanja', icon: 'two_wheeler', link: '#/pesan', tampil: true },
      { id: 'tarif', label: 'Cek Ongkir', sub: 'Hitung perkiraan ongkir dari jarak', icon: 'calculate', link: '#/tarif', tampil: true },
      { id: 'lacak', label: 'Lacak Pesanan', sub: 'Lihat status & posisi kurir', icon: 'location_searching', link: '#/lacak', tampil: true },
      { id: 'produk', label: 'Produk & Jualan', sub: 'Jajanan & kebutuhan dari mitra', icon: 'storefront', link: '#/produk', tampil: true },
      { id: 'galeri', label: 'Galeri Usaha Pelanggan', sub: 'Foto menu & jualan pelanggan kami', icon: 'photo_library', link: '#/galeri', tampil: true },
      { id: 'layanan', label: 'Daftar Layanan', sub: 'Semua layanan & tarifnya', icon: 'list_alt', link: '#/layanan', tampil: false },
      { id: 'kurir', label: 'Profil Kurir', sub: 'Kenalan dengan kurir kami', icon: 'badge', link: '#/kurir', tampil: true },
      { id: 'jualan', label: 'Mau Jualan di Sini?', sub: 'Pasang jualan Anda gratis', icon: 'add_business', link: '#/jualan', tampil: true },
      { id: 'favorit', label: 'Favorit Saya', sub: 'Produk & foto yang Anda simpan', icon: 'favorite', link: '#/favorit', tampil: false }
    ],
    sys: [
      { id: 'bio', label: 'Beranda', icon: 'home', link: '#/', sys: 1 }, { id: 'menu', label: 'Menu', icon: 'menu', link: 'aksi:menu', sys: 1 },
      { id: 'cs', label: 'Chat Admin', icon: 'chat', link: 'aksi:cs', sys: 1 }, { id: 'share', label: 'Bagikan', icon: 'share', link: 'aksi:share', sys: 1 },
      { id: 'install', label: 'Install', icon: 'install_mobile', link: 'aksi:install', sys: 1 }, { id: 'tema', label: 'Mode gelap', icon: 'dark_mode', link: 'aksi:tema', sys: 1 },
      { id: 'keranjang', label: 'Keranjang', icon: 'shopping_cart', link: '#/keranjang', sys: 1 }
    ],
    nav: [{ id: 'bio', label: 'Beranda', icon: 'home', tampil: true }, { id: 'pesan', label: 'Pesan', icon: 'two_wheeler', tampil: true },
      { id: 'produk', label: 'Produk', icon: 'storefront', tampil: true }, { id: 'lacak', label: 'Lacak', icon: 'location_searching', tampil: true },
      { id: 'menu', label: 'Menu', icon: 'menu', tampil: true }],
    header: [{ id: 'cs', tampil: true }, { id: 'tema', tampil: true }],
    kg: [['Antar Barang', 'package_2', 'layanan:LYN-ANTAR'], ['Antar Makanan', 'lunch_dining', 'layanan:LYN-MAKAN'], ['Titip Belanja', 'shopping_basket', 'layanan:LYN-BELANJA'],
      ['Ojek', 'two_wheeler', 'layanan:LYN-OJEK'], ['Bayar Tagihan', 'receipt_long', 'layanan:LYN-DOK'], ['Makanan', 'restaurant', 'kat:Makanan'], ['Kue', 'bakery_dining', 'kat:Kue & Camilan'],
      ['Cek Ongkir', 'calculate', '#/tarif'], ['Lacak', 'location_searching', '#/lacak'], ['Galeri', 'photo_library', '#/galeri'], ['Jualan', 'add_business', '#/jualan'], ['Kurir', 'badge', '#/kurir']]
      .map(function (x, i) { return { id: 'k' + (i + 1), label: x[0], icon: x[1], img: '', link: x[2], tampil: true }; }),
    galeri: [{ id: 'kuliner', nama: 'Kuliner', judul: 'Galeri Kuliner & Menu', sub: 'Menu makanan & minuman dari usaha pelanggan kami — tanyakan, kami belikan & antar.', icon: 'restaurant', tampil: true },
      { id: 'elektronik', nama: 'HP & Elektronik', judul: 'Galeri HP & Elektronik', sub: 'HP, aksesoris & elektronik dari toko pelanggan kami.', icon: 'smartphone', tampil: true },
      { id: 'jualan', nama: 'Jualan Pelanggan', judul: 'Galeri Jualan Pelanggan', sub: 'Aneka jualan UMKM pelanggan kurir kami.', icon: 'storefront', tampil: true },
      { id: 'dokumentasi', nama: 'Dokumentasi', judul: 'Dokumentasi Pengantaran', sub: 'Bukti pengantaran & kegiatan kurir.', icon: 'local_shipping', tampil: true }],
    bagian: [['hero', 'Slide sampul (otomatis)'], ['status', 'Kartu status & tombol pesan'], ['kategori', 'Menu kategori (4×2, geser)'], ['menu', 'Tombol menu link bio'],
      ['layanan', 'Kartu layanan kurir'], ['lacak', 'Kartu lacak pesanan'], ['produk', 'Produk pilihan'], ['jualan', 'Ajakan pasang jualan'], ['galeri', 'Galeri usaha pelanggan'],
      ['kurir', 'Profil kurir'], ['bayar', 'Info pembayaran'], ['faq', 'Tanya jawab'], ['sosmed', 'Sosial media']]
      .map(function (x) { return { id: x[0], label: x[1], tampil: x[0] !== 'layanan' }; })
  };
  K.TXT = { hero_otomatis: 'YA', hero_detik: '4', kg_gaya: 'kartu', galeri_bio_judul: 'Galeri Usaha Pelanggan', galeri_bio_efek: 'jalan',
    teks_pesan_galeri: 'Halo admin {toko}, saya tertarik dengan foto ini di galeri *{galeri}*{usaha} ({kategori}). Boleh info selengkapnya (harga, ketersediaan & ongkir antar)?\nFoto: {foto}\nLihat: {link}',
    lacak_teks: 'Pantau status pesanan & posisi kurir Anda di sini:' };
  K.T = function (s, k) { const v = (s || {})[k]; return v === undefined || v === null || String(v).trim() === '' ? (K.TXT[k] || '') : String(v); };
  K.arr = function (s, k, def) { let a = null; try { a = JSON.parse((s || {})[k] || 'null'); } catch (e) { } return Array.isArray(a) && a.length ? a : JSON.parse(JSON.stringify(def)); };
  const SYARAT = { '#/produk': ['fitur_produk'], '#/galeri': ['fitur_galeri'], '#/tarif': ['fitur_cek_tarif'], '#/jualan': ['fitur_penjual'], '#/kurir': ['fitur_profil_kurir'],
    '#/lacak': ['fitur_lacak', 'fitur_catat_pesanan'], '#/favorit': ['fitur_favorit'], '#/keranjang': ['fitur_keranjang', 'fitur_produk'], 'aksi:share': ['fitur_bagikan'], 'aksi:install': ['fitur_bagikan'] };
  K.menuOk = function (m, s) { const l = String(m.link || ''), base = l.replace(/^(#\/[a-z]+).*/, '$1'), req = SYARAT[l] || SYARAT[base] || (/^kat:|^cari:/.test(l) ? ['fitur_produk'] : /^galeri:/.test(l) ? ['fitur_galeri'] : []); return req.every(function (k) { return (s || {})[k] !== 'TIDAK'; }); };
  K.menus = function (s) {        // menu isi (bisa ditambah sendiri)
    const a = K.arr(s, 'menu_items', DEF.menu), ids = a.map(function (x) { return x.id; });
    DEF.menu.forEach(function (d) { if (ids.indexOf(d.id) < 0) a.push(Object.assign({}, d, { tampil: false })); });
    return a;
  };
  K.allMenus = function (s) { const a = K.menus(s), ids = a.map(function (x) { return x.id; }); return a.concat(DEF.sys.filter(function (x) { return ids.indexOf(x.id) < 0; })); };
  K.navItems = function (s) {
    const all = K.allMenus(s), a = K.arr(s, 'nav_items', DEF.nav).filter(function (x) { return all.some(function (m) { return m.id === x.id; }); }), ids = a.map(function (x) { return x.id; });
    all.forEach(function (m) { if (ids.indexOf(m.id) < 0) a.push({ id: m.id, label: m.label, icon: m.icon, tampil: false }); });
    let on = 0; return a.map(function (x) { const m = all.filter(function (y) { return y.id === x.id; })[0], r = Object.assign({}, x, { link: m.link }); if (r.tampil && (!K.menuOk(m, s) || ++on > 5)) r.tampil = false; return r; });
  };
  K.headerItems = function (s) {
    const all = K.allMenus(s), a = K.arr(s, 'header_items', DEF.header).filter(function (x) { return all.some(function (m) { return m.id === x.id; }); }), ids = a.map(function (x) { return x.id; });
    all.forEach(function (m) { if (ids.indexOf(m.id) < 0) a.push({ id: m.id, tampil: false }); });
    let on = 0; return a.map(function (x) { const m = all.filter(function (y) { return y.id === x.id; })[0], r = Object.assign({ label: m.label, icon: m.icon }, x, { link: m.link }); if (r.tampil && (!K.menuOk(m, s) || ++on > 2)) r.tampil = false; return r; });
  };
  K.kgItems = function (s) { return K.arr(s, 'kg_items', DEF.kg); };
  K.galeriDaftar = function (s, semua) { const a = K.arr(s, 'galeri_daftar', DEF.galeri); return semua ? a : a.filter(function (g) { return g.tampil !== false; }); };
  K.bagian = function (s) {
    const a = K.arr(s, 'bagian_urutan', DEF.bagian), ids = a.map(function (x) { return x.id; });
    DEF.bagian.forEach(function (d) { if (ids.indexOf(d.id) < 0) a.push(Object.assign({}, d, { tampil: false })); });
    return a.filter(function (x) { return DEF.bagian.some(function (d) { return d.id === x.id; }); }).map(function (x) { return Object.assign({}, DEF.bagian.filter(function (d) { return d.id === x.id; })[0], x); });
  };
  /** Tautan menu → { href, attr }. Format: #/halaman · layanan:ID · kat:Kategori · cari:kata · galeri:ID · aksi:menu|cs|share|install|tema · https://… · domain.com */
  K.menuLink = function (l) {
    l = String(l || '').trim();
    if (/^aksi:/.test(l)) return { href: '#', attr: ' data-act="' + K.esc(l.slice(5)) + '"' };
    if (/^layanan:/.test(l)) return { href: '#/pesan/' + encodeURIComponent(l.slice(8)), attr: '' };
    if (/^kat:/.test(l)) return { href: '#/produk/' + encodeURIComponent('k:' + l.slice(4)), attr: '' };
    if (/^cari:/.test(l)) return { href: '#/produk/' + encodeURIComponent('q:' + l.slice(5)), attr: '' };
    if (/^galeri:/.test(l)) return { href: '#/galeri/' + encodeURIComponent(l.slice(7)), attr: '' };
    if (/^#\//.test(l)) return { href: l, attr: '' };
    if (/^#./.test(l)) return { href: '#/produk/' + encodeURIComponent('q:' + l.slice(1)), attr: '' };
    if (/^(https?:|mailto:|tel:)/i.test(l)) return { href: l, attr: ' target="_blank" rel="noopener"' };
    if (/^[\w-]+(\.[\w-]+)+/.test(l)) return { href: 'https://' + l, attr: ' target="_blank" rel="noopener"' };
    return { href: '#/', attr: '' };
  };
  K.ICONS = ['two_wheeler', 'local_shipping', 'package_2', 'lunch_dining', 'restaurant', 'local_cafe', 'bakery_dining', 'shopping_basket', 'shopping_cart', 'storefront', 'add_business',
    'receipt_long', 'description', 'calculate', 'location_searching', 'location_on', 'map', 'route', 'photo_library', 'badge', 'sports_motorsports', 'favorite', 'star', 'local_offer',
    'campaign', 'chat', 'call', 'smartphone', 'checkroom', 'local_pharmacy', 'local_laundry_service', 'water_drop', 'eco', 'pets', 'school', 'home', 'apps', 'info', 'help', 'payments', 'qr_code_2', 'share', 'menu'];

  /* ---------- favorit (di perangkat pelanggan) ---------- */
  K.Fav = {
    all: function () { const a = K.get('fav', []); return Array.isArray(a) ? a : []; },
    has: function (t, id) { return this.all().some(function (x) { return x.t === t && x.id === id; }); },
    toggle: function (t, id) { let a = this.all(); const on = !this.has(t, id); a = on ? [{ t: t, id: id }].concat(a) : a.filter(function (x) { return !(x.t === t && x.id === id); }); K.set('fav', a.slice(0, 200)); return on; }
  };

  /* ---------- PWA: tombol Install ---------- */
  let bip = window.__bip || null;
  addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); bip = e; document.documentElement.classList.add('can-install'); });
  if (bip) document.documentElement.classList.add('can-install');
  K.standalone = function () { return (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true; };
  K.bisaInstall = function () { return !K.standalone() && (!!bip || /iphone|ipad|ipod/i.test(navigator.userAgent)); };
  K.install = function () {
    if (bip) { const d = bip; bip = null; d.prompt(); d.userChoice.then(function (r) { if (r.outcome !== 'accepted') bip = d; else document.documentElement.classList.remove('can-install'); }); return; }
    K.sheet({ title: 'Pasang aplikasi', html: /iphone|ipad|ipod/i.test(navigator.userAgent) ? '<p>Di Safari: ketuk <b>Bagikan</b> ' + K.ikon('ios_share') + ' lalu pilih <b>Tambah ke Layar Utama</b>.</p>' : '<p>Buka menu browser (⋮) lalu pilih <b>Instal aplikasi</b> / <b>Tambahkan ke layar utama</b>. Gunakan Chrome, bukan browser bawaan WhatsApp/Instagram.</p>', foot: '<button class="btn pri" data-x>Mengerti</button>' });
  };

  /* ---------- bunyi notifikasi (WebAudio, tanpa berkas) ---------- */
  let actx = null;
  K.bunyi = function (n) {
    try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const t0 = actx.currentTime;
      [880, 1175, 1568].slice(0, n || 3).forEach(function (f, i) { const o = actx.createOscillator(), g = actx.createGain(); o.frequency.value = f; o.type = 'sine'; g.gain.setValueAtTime(0.0001, t0 + i * .16); g.gain.exponentialRampToValueAtTime(.25, t0 + i * .16 + .02); g.gain.exponentialRampToValueAtTime(.0001, t0 + i * .16 + .15); o.connect(g).connect(actx.destination); o.start(t0 + i * .16); o.stop(t0 + i * .16 + .16); });
      if (navigator.vibrate) navigator.vibrate([120, 60, 120]);
    } catch (e) { }
  };

  /* ---------- BAGIKAN: link + QR Code + kirim foto ---------- */
  K.urlSitus = function () { return location.href.split('#')[0].replace(/admin\/(index\.html)?$/, ''); };
  K.abs = function (u) { try { return new URL(K.img(u), location.href).href; } catch (e) { return u; } };
  K.kirimFoto = function (foto, teks, url, btn) {
    const cadangan = function () { window.open('https://wa.me/?text=' + encodeURIComponent(teks + (url ? '\n' + url : '')), '_blank'); };
    if (!foto || !navigator.canShare) return cadangan();
    K.busy(btn, true, 'Menyiapkan foto…');
    fetch(K.img(foto)).then(function (r) { return r.blob(); }).then(function (b) {
      const f = new File([b], 'foto.' + (/png/.test(b.type) ? 'png' : /svg/.test(b.type) ? 'svg' : 'jpg'), { type: b.type || 'image/jpeg' });
      if (navigator.canShare({ files: [f] })) return navigator.share({ files: [f], text: teks + (url ? '\n' + url : '') }); cadangan();
    }).catch(function (e) { if (!e || e.name !== 'AbortError') cadangan(); }).then(function () { K.busy(btn, false); });
  };
  K.bagikan = function (url, judul, opt) {
    opt = opt || {}; url = url || K.urlSitus(); judul = judul || document.title;
    const enc = encodeURIComponent, txt = judul + '\n' + url;
    let qr = ''; try { qr = window.QR ? QR.svg(url, { ecl: 'Q' }) : ''; } catch (e) { }
    const tj = [['WhatsApp', 'chat', 'https://wa.me/?text=' + enc(txt)], ['Facebook', 'public', 'https://www.facebook.com/sharer/sharer.php?u=' + enc(url)], ['Telegram', 'send', 'https://t.me/share/url?url=' + enc(url) + '&text=' + enc(judul)], ['X', 'alternate_email', 'https://twitter.com/intent/tweet?url=' + enc(url) + '&text=' + enc(judul)]];
    const sh = K.sheet({ title: 'Bagikan', html: (opt.foto ? '<button class="item" style="width:100%;text-align:left;cursor:pointer" data-foto><img class="th" src="' + K.esc(K.img(opt.foto)) + '" alt=""><span class="grow"><b>Kirim foto + link</b><br><span class="small muted">Foto ikut terkirim ke WhatsApp, IG, dll.</span></span>' + K.ikon('send') + '</button>' : '') +
      '<div class="qr-card">' + (qr ? '<div class="qr">' + qr + '</div>' : '') + '<b>' + K.esc(judul) + '</b><span class="small muted">Pindai dengan kamera HP untuk membuka</span></div>' +
      '<div class="row" style="margin-top:12px"><input class="input grow" readonly value="' + K.esc(url) + '" data-u><button class="btn pri sm" data-c>' + K.ikon('content_copy') + 'Salin</button></div>' +
      '<div class="share-grid">' + tj.map(function (t) { return '<a href="' + K.esc(t[2]) + '" target="_blank" rel="noopener">' + K.ikon(t[1]) + '<span>' + t[0] + '</span></a>'; }).join('') + '</div>' +
      '<div class="row wrapx" style="margin-top:12px">' + (qr ? '<button class="btn line grow" data-dl>' + K.ikon('qr_code_2') + 'Unduh QR</button>' : '') + (navigator.share ? '<button class="btn line grow" data-n>' + K.ikon('ios_share') + 'Lainnya</button>' : '') + '</div>' +
      (K.bisaInstall() && !opt.tanpaInstall ? '<button class="btn dark block" style="margin-top:10px" data-ins>' + K.ikon('install_mobile') + 'Pasang aplikasi di HP</button>' : '') });
    const q = function (s) { return sh.el.querySelector(s); };
    q('[data-c]').onclick = function () { K.salin(url); }; q('[data-u]').onclick = function (e) { e.target.select(); };
    if (q('[data-foto]')) q('[data-foto]').onclick = function (e) { K.kirimFoto(opt.foto, opt.teks || judul, url, e.currentTarget); };
    if (q('[data-n]')) q('[data-n]').onclick = function () { navigator.share({ title: judul, text: judul, url: url }).catch(function () { }); };
    if (q('[data-ins]')) q('[data-ins]').onclick = function () { sh.close(); K.install(); };
    if (q('[data-dl]')) q('[data-dl]').onclick = function () { QR.canvas(url, { size: 900, logo: K.abs(opt.logo || 'assets/logo.png') }).then(function (c) { const a = document.createElement('a'); a.download = 'qr-' + (judul.replace(/[^\w]+/g, '-').slice(0, 30) || 'link') + '.png'; a.href = c.toDataURL('image/png'); a.click(); }); };
  };
  K.acakId = function (n) { const a = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'; let s = ''; const r = (window.crypto && crypto.getRandomValues) ? crypto.getRandomValues(new Uint8Array(n)) : null; for (let i = 0; i < n; i++) s += a[(r ? r[i] : Math.floor(Math.random() * 256)) % a.length]; return s; };
  K.lacak = function (id) {
    if (K.DEMO) return Promise.resolve(window.KDemo.handle('lacak', { id: id }));
    return fetch(String(CFG.GAS_URL).trim() + (CFG.GAS_URL.indexOf('?') > -1 ? '&' : '?') + 'action=lacak&id=' + encodeURIComponent(id), { cache: 'no-store', redirect: 'follow' }).then(function (r) { return r.json(); })
      .catch(function () { return { success: false, message: 'Koneksi gagal. Coba lagi.' }; });
  };

  /* ---------- peta (Leaflet dimuat saat dibutuhkan) ---------- */
  let leaf = null;
  K.muatLeaflet = function () {
    if (window.L) return Promise.resolve(window.L);
    if (leaf) return leaf;
    leaf = new Promise(function (ok, no) {
      const c = document.createElement('link'); c.rel = 'stylesheet'; c.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(c);
      const s = document.createElement('script'); s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; s.onload = function () { ok(window.L); }; s.onerror = function () { leaf = null; no(new Error('Peta gagal dimuat.')); };
      document.head.appendChild(s);
    });
    return leaf;
  };
  /** Pilih titik di peta: geser peta, pin tetap di tengah. Hasil {lat,lng}. */
  K.pilihPeta = function (awal, judul) {
    return new Promise(function (ok) {
      const s = K.sheet({ title: judul || 'Pilih titik di peta', cls: 'wide', html: '<p class="small muted" style="margin-bottom:10px">Geser peta sampai pin tepat di lokasi.</p><div class="map-pin"><div id="peta"></div></div>',
        foot: '<button class="btn line" data-gps>' + K.ikon('my_location') + 'Lokasi saya</button><button class="btn pri" data-ok>' + K.ikon('check') + 'Pakai titik ini</button>', onClose: function () { ok(null); } });
      K.muatLeaflet().then(function (L) {
        const m = L.map(s.el.querySelector('#peta'), { zoomControl: true }).setView([awal.lat, awal.lng], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(m);
        setTimeout(function () { m.invalidateSize(); }, 300);
        s.el.querySelector('[data-gps]').onclick = function (e) { const b = e.currentTarget; K.busy(b, true, 'Mencari…'); K.gps().then(function (p) { m.setView([p.lat, p.lng], 17); }).catch(function (er) { K.toast(er.message, 'bad'); }).then(function () { K.busy(b, false); }); };
        s.el.querySelector('[data-ok]').onclick = function () { const c = m.getCenter(); ok({ lat: c.lat, lng: c.lng }); ok = function () { }; s.close(); };
      }).catch(function (e) { s.body.innerHTML = '<div class="empty">' + K.ikon('map') + K.esc(e.message) + ' Tempel link Google Maps sebagai gantinya.</div>'; });
    });
  };
})();
