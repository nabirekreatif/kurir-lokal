/* Kurir Lokal — halaman publik + portal penjual · © Nabire Kreatif */
(function () {
  'use strict';
  const K = window.K, $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  const e = K.esc, I = K.ikon;
  let P = null, ST = { buka: true }, rute = '', arg = '';
  const app = $('#app');
  const F = function (k) { return !P || (P.settings || {})[k] !== 'TIDAK'; };     // fitur aktif?
  const LP = { id: 'PRODUK', nama: 'Pesan Produk & Antar', ikon: 'shopping_bag', butuh_a: false, butuh_b: true, label_b: 'Antar ke', tarif_mode: 'jarak', form_daftar: false };

  /* ======================= BOOT ======================= */
  function mulai() {
    const c = K.cachePublik();
    if (c && Date.now() - c.t < 6 * 3600e3) { pasang(c.d); tutupSplash(); }
    K.publik().then(function (d) { pasang(d); tutupSplash(); }).catch(function (er) {
      if (!P) { tutupSplash(); app.innerHTML = '<div class="wrap"><div class="empty">' + I('cloud_off') + '<p><b>Data belum bisa dimuat.</b></p><p class="small">' + e(er.message) + '</p><p style="margin-top:14px"><button class="btn pri" onclick="location.reload()">Coba lagi</button></p></div></div>'; }
    });
    setInterval(function () { if (P) { const s = K.status(P); if (s.buka !== ST.buka) { ST = s; render(); } } }, 60000);
    setInterval(function () { if (!document.hidden) K.publik(true).then(function (d) { if (!P || d.ver !== P.ver) pasang(d); }).catch(function () { }); }, 180000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden && P) K.publik(true).then(function (d) { if (d.ver !== P.ver) pasang(d); }).catch(function () { }); });
    window.addEventListener('hashchange', render);
    window.addEventListener('scroll', function () { const t = $('.top'); if (t) t.classList.toggle('scrolled', scrollY > 4); }, { passive: true });
  }
  function tutupSplash() { const s = $('#splash'); if (s) { s.classList.add('out'); setTimeout(function () { s.remove(); }, 450); } }
  function pasang(d) {
    P = d; ST = K.status(P); K.terapkanTema(P.settings);
    document.title = P.settings.nama_usaha + ' — Kurir Lokal';
    shell(); render();
  }

  /* ======================= SHELL (header + nav) ======================= */
  const T = function (k) { return K.T(P.settings, k); };
  function menuBolehBuka(m) { return !/^(#\/pesan|layanan:)/.test(String(m.link || '')) || ST.buka; }
  function shell() {
    const s = P.settings, hdr = K.headerItems(s).filter(function (x) { return x.tampil; });
    $('#top').innerHTML = '<div class="wrap top-in"><a class="brand" href="#/"><img src="' + e(K.img(s.logo_url)) + '" alt="" width="40" height="40" onerror="this.style.visibility=\'hidden\'"><b>' + e(s.nama_usaha) + '</b></a>' +
      '<nav class="desk-nav" aria-label="Navigasi">' + K.navItems(s).filter(function (n) { return n.tampil && n.id !== 'menu'; }).map(function (n) { const L = K.menuLink(n.link); return '<a href="' + e(L.href) + '"' + L.attr + ' data-r="' + e(n.link) + '">' + e(n.label) + '</a>'; }).join('') + '<a href="#" data-act="menu">Menu</a></nav>' +
      '<span class="status-pill" id="pill"></span>' +
      (F('fitur_keranjang') && F('fitur_produk') ? '<a class="ibtn" href="#/keranjang" aria-label="Keranjang" style="position:relative">' + I('shopping_cart') + '<span class="cnt-top hide" id="cartN"></span></a>' : '') +
      hdr.filter(function (x) { return x.id !== 'keranjang'; }).map(function (x) { const L = K.menuLink(x.link); return '<a class="ibtn hdr-' + e(x.id) + '" href="' + e(L.href) + '"' + L.attr + ' aria-label="' + e(x.label) + '" title="' + e(x.label) + '">' + I(x.id === 'tema' ? (document.documentElement.getAttribute('data-theme') === 'dark' ? 'light_mode' : 'dark_mode') : x.icon) + '</a>'; }).join('') + '</div>';
    $('#bnav').innerHTML = '<div class="bnav-in">' + K.navItems(s).filter(function (n) { return n.tampil; }).map(function (n) {
      const L = K.menuLink(n.link), cta = n.id === 'pesan' || /^#\/pesan$/.test(n.link);
      return '<a href="' + e(L.href) + '"' + L.attr + ' data-r="' + e(n.link) + '" class="' + (cta ? 'cta' : '') + '">' + I(n.icon || 'apps') + '<span>' + e(n.label) + '</span>' + (n.id === 'favorit' ? '<span class="cnt hide" data-favn></span>' : n.id === 'keranjang' ? '<span class="cnt hide" data-cartn></span>' : '') + '</a>';
    }).join('') + '</div>';
    $('#demo').innerHTML = P.demo ? '<div class="demo-ribbon">' + (K.DEMO ? 'Mode demo — data contoh tersimpan di perangkat ini saja.' : 'Masih memakai data contoh. Ganti dengan data asli dari dasbor sebelum dipromosikan.') + '</div>' : '';
  }
  function perbaruiShell() {
    const pill = $('#pill'); if (pill) { pill.className = 'status-pill ' + (ST.buka ? 'buka' : 'tutup'); pill.innerHTML = '<i class="dot ' + (ST.buka ? 'pulse' : '') + '"></i>' + (ST.buka ? 'Buka' : 'Tutup'); }
    const kini = '#/' + rute + (arg && /^(galeri)$/.test(rute) ? '/' + arg.split('/')[0] : '');
    $$('[data-r]').forEach(function (a) { const r = a.getAttribute('href'); a.classList.toggle('on', r === kini || (r === '#/' && rute === '') || (r !== '#/' && r !== '#' && kini.indexOf(r) === 0 && r.length > 2)); });
    $$('.bnav a.cta').forEach(function (a) { a.classList.toggle('off', !ST.buka); });
    const n = keranjang().reduce(function (t, x) { return t + x.qty; }, 0);
    $$('#cartN,[data-cartn]').forEach(function (c) { c.textContent = n; c.classList.toggle('hide', !n); });
    const f = K.Fav.all().length; $$('[data-favn]').forEach(function (c) { c.textContent = f; c.classList.toggle('hide', !f); });
  }
  /* aksi tombol menu/header: menu, cs, share, install, tema */
  document.addEventListener('click', function (ev) {
    const a = ev.target.closest('[data-act]'); if (!a || !P) return;
    ev.preventDefault();
    const act = a.dataset.act;
    if (act === 'menu') bukaMenu();
    else if (act === 'cs') window.open(K.waLink(P.settings.wa_admin, 'Halo admin ' + P.settings.nama_usaha + ', saya ingin bertanya.'), '_blank');
    else if (act === 'share') K.bagikan(K.urlSitus(), P.settings.nama_usaha + ' — pesan kurir lewat WhatsApp', { logo: P.settings.logo_url });
    else if (act === 'install') K.install();
    else if (act === 'tema') { K.gantiTema(P.settings); shell(); perbaruiShell(); }
  });
  document.addEventListener('click', function (ev) {
    const b = ev.target.closest('[data-fav]'); if (!b) return;
    ev.preventDefault(); ev.stopPropagation();
    const x = b.dataset.fav.split(':'), on = K.Fav.toggle(x[0], x.slice(1).join(':'));
    $$('[data-fav="' + b.dataset.fav + '"]').forEach(function (y) { y.classList.toggle('on', on); y.innerHTML = I('favorite', on ? 'fill' : ''); y.setAttribute('aria-pressed', on); });
    K.toast(on ? 'Disimpan ke Favorit.' : 'Dihapus dari Favorit.', on ? 'ok' : ''); perbaruiShell();
  });
  function favBtn(t, id) { if (!F('fitur_favorit')) return ''; const on = K.Fav.has(t, id); return '<button type="button" class="fav-b' + (on ? ' on' : '') + '" data-fav="' + t + ':' + e(id) + '" aria-pressed="' + on + '" aria-label="Simpan ke favorit">' + I('favorite', on ? 'fill' : '') + '</button>'; }
  function bukaMenu() {
    const s = P.settings, isi = K.menus(s).filter(function (m) { return m.tampil !== false && K.menuOk(m, s); });
    const tile = function (m) { const L = K.menuLink(m.link), off = !menuBolehBuka(m); return '<a class="mtile' + (off ? ' off' : '') + '" href="' + e(L.href) + '"' + L.attr + '>' + I(m.icon || 'apps') + '<span>' + e(m.label) + '</span></a>'; };
    const soc = K.json(s.sosmed_json, []).filter(function (x) { return x.tampil !== false && x.url; });
    const sh = K.sheet({ title: 'Menu', html: '<div class="menu-tiles">' + tile({ label: 'Beranda', icon: 'home', link: '#/' }) + isi.map(tile).join('') +
      '<button class="mtile" data-act="cs">' + I('chat') + '<span>Chat Admin</span></button>' +
      (F('fitur_bagikan') ? '<button class="mtile" data-act="share">' + I('share') + '<span>Bagikan</span></button>' + (K.bisaInstall() ? '<button class="mtile acc" data-act="install">' + I('install_mobile') + '<span>Install Aplikasi</span></button>' : '') : '') +
      '<button class="mtile" data-act="tema">' + I(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light_mode' : 'dark_mode') + '<span>' + (document.documentElement.getAttribute('data-theme') === 'dark' ? 'Mode terang' : 'Mode gelap') + '</span></button></div>' +
      (soc.length ? '<p class="small muted" style="margin:18px 0 10px;font-weight:600">Sosial media</p>' + sosmedHtml(soc) : '') });
    sh.el.addEventListener('click', function (ev) { if (ev.target.closest('a,[data-act]')) setTimeout(sh.close, 0); });
  }
  const SOC_IKON = { whatsapp: 'chat', instagram: 'photo_camera', facebook: 'public', tiktok: 'music_note', youtube: 'smart_display', telegram: 'send', website: 'language' };
  function sosmedHtml(soc) { return '<div class="soc-row">' + soc.map(function (x) { const k = String(x.platform || '').toLowerCase(); return '<a href="' + e(K.menuLink(x.url).href) + '" target="_blank" rel="noopener" class="soc">' + I(SOC_IKON[k] || 'link') + '<span>' + e(x.platform) + '</span></a>'; }).join('') + '</div>'; }

  /* ======================= ROUTER ======================= */
  function render() {
    if (!P) return;
    const h = location.hash.replace(/^#\/?/, '').split('/'); rute = h[0] || ''; arg = decodeURIComponent(h.slice(1).join('/'));
    ST = K.status(P); modeTarif = null; if (O && O.lay && O.lay.id === 'TARIF') O = null;
    clearInterval(heroT); clearInterval(lacakT);
    const v = { '': beranda, pesan: pesan, layanan: halLayanan, tarif: halTarif, produk: halProduk, toko: halToko, galeri: halGaleri, kurir: halKurir, jualan: halJualan, keranjang: halKeranjang, lacak: halLacak, favorit: halFavorit }[rute] || beranda;
    app.innerHTML = ''; v(); perbaruiShell();
    if (!/pesan|jualan/.test(rute)) scrollTo(0, 0);
    app.focus({ preventScroll: true });
  }
  function judul(t, s) { return '<div class="page-h"><h1>' + e(t) + '</h1>' + (s ? '<p>' + e(s) + '</p>' : '') + '</div>'; }
  function tutupBar() {
    if (ST.buka) return '';
    return '<div class="closed-bar">' + I('do_not_disturb_on', 'fill') + '<div><b>Kurir sedang tutup.</b> ' + e(ST.ket) + '<br><span class="small">' + e(P.settings.pesan_tutup) + '</span></div></div>';
  }

  /* ======================= BERANDA (bagian bisa diurutkan & dimatikan dari dasbor) ======================= */
  let heroT = null, lacakT = null;
  const SEKSI = {
    hero: function () {
      const b = F('fitur_banner') ? P.banner : [];
      if (!b.length) return '';
      return '<section class="sec sec-hero"><div class="wrap"><div class="hero-sl" data-hero><div class="hero-track">' + b.map(function (x, i) {
        const L = K.menuLink(x.tujuan || '#/pesan');
        return '<a class="bnr" href="' + e(L.href) + '"' + L.attr + '><img src="' + e(K.img(x.gambar_url)) + '" alt="' + e(x.judul || 'Promo') + '"' + (i ? ' loading="lazy"' : ' fetchpriority="high"') + '><div class="cap">' + (x.judul ? '<b>' + e(x.judul) + '</b>' : '') + (x.sub ? '<span>' + e(x.sub) + '</span>' : '') + '</div></a>';
      }).join('') + '</div>' + (b.length > 1 ? '<div class="dots">' + b.map(function (x, i) { return '<button aria-label="Slide ' + (i + 1) + '" data-i="' + i + '"' + (i ? '' : ' class="on"') + '></button>'; }).join('') + '</div>' : '') + '</div></div></section>';
    },
    status: function () {
      const s = P.settings;
      return '<section class="sec"><div class="wrap"><div class="hero"><span class="eyebrow" style="color:rgba(255,255,255,.7)">' + I('location_on') + ' ' + e(s.area_layanan) + '</span>' +
        '<h1 style="margin-top:8px">' + e(s.nama_usaha).replace(/(\S+)$/, '<em>$1</em>') + '</h1><p>' + e(s.tagline) + '</p>' +
        '<div class="row wrapx"><a class="btn pri lg ' + (ST.buka ? '' : 'off') + '" href="#/pesan">' + I('two_wheeler') + 'Pesan Kurir Sekarang</a>' +
        (F('fitur_cek_tarif') ? '<a class="btn line lg" href="#/tarif">' + I('calculate') + 'Cek Ongkir</a>' : '') + '</div>' +
        '<div class="hero-meta"><span>' + I('schedule') + 'Hari ini ' + e(ST.jamHariIni) + '</span><span>' + I('sports_motorsports') + ST.kurirOnline + ' kurir online</span><span>' + I('lock_open') + 'Tanpa daftar & tanpa OTP</span></div></div>' + tutupBar() + '</div></section>';
    },
    kategori: function () {
      if (!F('fitur_menu_kategori')) return '';
      const s = P.settings, list = K.kgItems(s).filter(function (m) { return m.tampil !== false && K.menuOk(m, s); }).map(function (m) {
        const L = K.menuLink(m.link), off = !menuBolehBuka(m);
        return '<a class="kg-it' + (off ? ' off' : '') + '" href="' + e(L.href) + '"' + L.attr + '><span class="kg-ic">' + (m.img ? '<img src="' + e(K.img(m.img)) + '" alt="" loading="lazy" width="56" height="56">' : I(m.icon || 'apps', 'fill')) + '</span><span class="kg-l">' + e(m.label) + '</span></a>';
      });
      if (!list.length) return '';
      const pages = []; for (let i = 0; i < list.length; i += 8) pages.push(list.slice(i, i + 8));
      return '<section class="sec kg kg-' + e(T('kg_gaya')) + '"><div class="wrap">' + (s.kg_judul ? '<div class="sec-h"><h2>' + e(s.kg_judul) + '</h2></div>' : '') +
        '<div class="kg-pages" data-kg>' + pages.map(function (p) { return '<div class="kg-page">' + p.join('') + '</div>'; }).join('') + '</div>' +
        (pages.length > 1 ? '<div class="kg-dots">' + pages.map(function (p, i) { return '<i' + (i ? '' : ' class="on"') + '></i>'; }).join('') + '</div>' : '') +
        '<div class="kg-all">' + list.join('') + '</div></div></section>';
    },
    menu: function () {
      const s = P.settings, isi = K.menus(s).filter(function (m) { return m.tampil !== false && K.menuOk(m, s); });
      if (!isi.length) return '';
      return '<section class="sec"><div class="wrap"><div class="menu-list">' + isi.map(function (m) {
        const L = K.menuLink(m.link), off = !menuBolehBuka(m);
        return '<a class="menu-btn' + (off ? ' off' : '') + '" href="' + e(L.href) + '"' + L.attr + '><span class="ic">' + I(m.icon || 'apps') + '</span><span class="grow"><b>' + e(m.label) + '</b>' + (m.sub ? '<small>' + e(off ? 'Kurir sedang tutup' : m.sub) + '</small>' : '') + '</span>' + I('chevron_right') + '</a>';
      }).join('') + '</div></div></section>';
    },
    layanan: function () { return '<section class="sec"><div class="wrap"><div class="sec-h"><h2>Layanan Kurir</h2><a href="#/layanan">Lihat detail</a></div>' + gridLayanan() + '</div></section>'; },
    lacak: function () {
      if (!F('fitur_lacak') || !F('fitur_catat_pesanan')) return '';
      const sy = pesananSaya().slice(0, 2);
      return '<section class="sec"><div class="wrap"><div class="card row lacak-card" style="gap:14px"><span class="ic-lg">' + I('location_searching') + '</span><div class="grow"><b>Lacak pesanan Anda</b><p class="small muted">' + (sy.length ? 'Pesanan terakhir: ' + sy.map(function (x) { return e(x.kode); }).join(', ') : 'Lihat status & posisi kurir secara langsung.') + '</p></div><a class="btn dark sm" href="' + (sy.length ? '#/lacak/' + e(sy[0].id) : '#/lacak') + '">Lacak</a></div></div></section>';
    },
    produk: function () {
      if (!F('fitur_produk')) return '';
      const ung = P.produk.filter(function (p) { return p.unggulan; }).concat(P.produk.filter(function (p) { return !p.unggulan; })).slice(0, 8);
      return ung.length ? '<section class="sec"><div class="wrap"><div class="sec-h"><h2>Jajanan & Produk Pilihan</h2><a href="#/produk">Lihat semua</a></div><div class="hscroll">' + ung.map(kartuProduk).join('') + '</div></div></section>' : '';
    },
    jualan: function () { return F('fitur_penjual') ? '<section class="sec"><div class="wrap"><div class="cta-sell"><div><span class="eyebrow">Untuk UMKM & pelaku usaha</span><h3 style="margin-top:6px">Mau jualan di sini?</h3><p class="muted" style="margin-top:6px">' + e(P.settings.teks_jualan) + '</p></div><a class="btn dark lg" href="#/jualan">' + I('add_business') + 'Pasang Jualan</a></div></div></section>' : ''; },
    galeri: function () { return F('fitur_galeri') ? galeriBeranda() : ''; },
    kurir: function () { return F('fitur_profil_kurir') && P.kurir.length ? '<section class="sec"><div class="wrap"><div class="sec-h"><h2>Kenalan dengan Kurir Kami</h2><a href="#/kurir">Profil lengkap</a></div><div class="grid2">' + P.kurir.map(kartuKurir).join('') + '</div></div></section>' : ''; },
    bayar: function () { return F('fitur_info_bayar') && P.settings.info_bayar ? '<section class="sec"><div class="wrap"><div class="card row" style="align-items:flex-start">' + I('payments') + '<div><b>Pembayaran</b><p class="muted small" style="margin-top:4px">' + e(P.settings.info_bayar) + '</p></div></div></div></section>' : ''; },
    faq: function () { const faq = K.json(P.settings.faq_json, []); return F('fitur_faq') && faq.length ? '<section class="sec"><div class="wrap"><div class="sec-h"><h2>Tanya Jawab</h2></div>' + faq.map(function (f) { return '<details class="faq"><summary>' + e(f.q) + '</summary><p>' + e(f.a) + '</p></details>'; }).join('') + '</div></section>' : ''; },
    sosmed: function () { const soc = K.json(P.settings.sosmed_json, []).filter(function (x) { return x.tampil !== false && x.url; }); return soc.length ? '<section class="sec"><div class="wrap"><div class="sec-h"><h2>Ikuti Kami</h2></div>' + sosmedHtml(soc) + '</div></section>' : ''; }
  };
  function beranda() {
    app.innerHTML = K.bagian(P.settings).filter(function (b) { return b.tampil !== false && SEKSI[b.id]; }).map(function (b) { return SEKSI[b.id](); }).join('') + footer();
    ikatGaleri(app); ikatProduk(); jalankanHero(); ikatKg();
  }
  function jalankanHero() {
    const h = $('[data-hero]'); if (!h) return;
    const tr = $('.hero-track', h), n = tr.children.length, dots = $$('.dots button', h);
    const idx = function () { return Math.round(tr.scrollLeft / Math.max(1, tr.clientWidth)); };
    tr.addEventListener('scroll', K.debounce(function () { const i = idx(); dots.forEach(function (d, k) { d.classList.toggle('on', k === i); }); }, 60), { passive: true });
    dots.forEach(function (d) { d.onclick = function () { tr.scrollTo({ left: +d.dataset.i * tr.clientWidth, behavior: 'smooth' }); }; });
    let jeda = false; ['pointerdown', 'mouseenter', 'focusin'].forEach(function (ev) { h.addEventListener(ev, function () { jeda = true; }); });
    ['mouseleave', 'focusout'].forEach(function (ev) { h.addEventListener(ev, function () { jeda = false; }); });
    h.addEventListener('touchend', function () { setTimeout(function () { jeda = false; }, 4000); }, { passive: true });
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (n > 1 && T('hero_otomatis') !== 'TIDAK' && !reduce) heroT = setInterval(function () { if (jeda || document.hidden || rute !== '') return; tr.scrollTo({ left: ((idx() + 1) % n) * tr.clientWidth, behavior: 'smooth' }); }, Math.max(2, +T('hero_detik') || 4) * 1000);
  }
  function ikatKg() { const k = $('[data-kg]'); if (!k) return; k.addEventListener('scroll', K.debounce(function () { const i = Math.round(k.scrollLeft / k.clientWidth); $$('.kg-dots i').forEach(function (d, x) { d.classList.toggle('on', x === i); }); }, 60), { passive: true }); }
  function footer() {
    const s = P.settings;
    return '<footer class="foot wrap"><p><b>' + e(s.nama_usaha) + '</b> · ' + e(s.area_layanan) + '</p><p style="margin-top:6px"><a href="' + K.waLink(s.wa_admin, 'Halo admin ' + s.nama_usaha) + '" target="_blank" rel="noopener">WA ' + e(K.hp08(s.wa_admin)) + '</a></p>' +
      '<p class="nk-copy tiny" style="margin-top:10px" data-nk-copy>© ' + new Date().getFullYear() + ' ' + e(s.nama_usaha) + '. by <a href="https://www.nabirekreatif.com" target="_blank" rel="noopener">Nabirekreatif.com</a></p></footer>';
  }
  function gridLayanan() {
    return '<div class="svc-grid">' + P.layanan.map(function (l) {
      return '<a class="svc ' + (ST.buka ? '' : 'off') + '" href="#/pesan/' + e(l.id) + '" aria-disabled="' + !ST.buka + '"><span class="ic">' + I(l.ikon || 'local_shipping') + '</span><b>' + e(l.nama) + '</b><small>' + e(l.deskripsi) + '</small></a>';
    }).join('') + '</div>';
  }

  /* ======================= LAYANAN ======================= */
  function halLayanan() {
    app.innerHTML = '<div class="wrap">' + judul('Layanan Kurir', 'Pilih layanan, isi lokasi, lalu pesanan langsung terkirim ke WhatsApp admin.') + tutupBar() +
      '<div class="list" style="margin-top:14px">' + P.layanan.map(function (l) {
        const t = l.tarif_mode === 'flat' ? 'Tarif tetap ' + K.rp(l.tarif_flat) : l.tarif_mode === 'nego' ? 'Tarif dikonfirmasi admin' : 'Sesuai jarak, mulai ' + K.rp(P.settings.tarif_minimal) + (Number(l.biaya_tambah) ? ' + ' + K.rp(l.biaya_tambah) : '');
        const titik = [l.butuh_a ? l.label_a : '', l.butuh_b ? l.label_b : ''].filter(String).join(' → ');
        return '<div class="card row" style="align-items:flex-start;gap:14px"><span class="th" style="width:52px;height:52px;border-radius:14px;display:grid;place-items:center;background:var(--primary-soft);color:var(--accent-text)">' + I(l.ikon || 'local_shipping') + '</span>' +
          '<div class="grow"><h3 style="font-size:18px">' + e(l.nama) + '</h3><p class="muted small" style="margin-top:4px">' + e(l.deskripsi) + '</p><p class="tiny" style="margin-top:8px">' + I('route') + ' ' + e(titik) + ' · <b class="price" style="font-size:14px">' + e(t) + '</b></p>' +
          '<a class="btn pri sm ' + (ST.buka ? '' : 'off') + '" style="margin-top:12px" href="#/pesan/' + e(l.id) + '">Pesan layanan ini</a></div></div>';
      }).join('') + '</div></div>' + footer();
  }

  /* ======================= PESAN (inti) ======================= */
  let O = null;                  // isian pesanan aktif
  function pesan() {
    const saya = K.get('saya', {});
    const dariKeranjang = arg === 'keranjang';
    const lay = dariKeranjang ? LP : (P.layanan.filter(function (l) { return l.id === arg; })[0] || (O && O.lay && O.lay.id !== 'PRODUK' ? O.lay : P.layanan[0]));
    if (!lay) { app.innerHTML = '<div class="wrap"><div class="empty">' + I('info') + 'Belum ada layanan aktif.</div></div>'; return; }
    if (!O || O.lay.id !== lay.id) O = { lay: lay, a: {}, b: Object.assign({}, saya.b || {}), nama: saya.nama || '', hp: saya.hp || '', catatan: '', daftar: '', km: null, cara: '' };
    if (dariKeranjang) siapkanAsalProduk();
    const s = P.settings;
    let h = '<div class="wrap">' + judul('Pesan Kurir', 'Tanpa login, tanpa OTP — pesanan langsung masuk ke WhatsApp admin.') + tutupBar() +
      '<div class="order-layout" style="margin-top:14px"><div class="stack-lg">';
    if (!dariKeranjang) h += '<div class="step"><span class="no">1</span><div class="grow"><b>Pilih layanan</b><div class="chips" style="margin-top:10px">' +
      P.layanan.map(function (l) { return '<button class="chip ' + (l.id === lay.id ? 'on' : '') + '" data-lay="' + e(l.id) + '">' + I(l.ikon || 'local_shipping') + e(l.nama) + '</button>'; }).join('') + '</div>' +
      '<p class="small muted" style="margin-top:6px">' + e(lay.deskripsi || '') + '</p></div></div>';
    else h += '<div class="step"><span class="no">1</span><div class="grow"><b>Produk yang dipesan</b><div class="card flat" style="margin-top:10px">' + ringkasKeranjang() + '<a class="btn line sm" style="margin-top:10px" href="#/keranjang">Ubah keranjang</a></div></div></div>';
    let no = 2;
    if (lay.butuh_a) h += '<div class="step"><span class="no">' + (no++) + '</span><div class="grow">' + titikHtml('a', lay.label_a || 'Titik jemput') + '</div></div>';
    else if (dariKeranjang) h += '<div class="step"><span class="no">' + (no++) + '</span><div class="grow"><b>Diambil dari</b><div class="pt" style="margin-top:8px"><p>' + e(O.a.teks) + '</p>' + (O.a.link ? '<div class="ok">' + I('check_circle', 'fill') + 'Lokasi toko tersedia · <a href="' + e(O.a.link) + '" target="_blank" rel="noopener">Lihat peta</a></div>' : '') + '</div></div></div>';
    if (lay.butuh_b) h += '<div class="step"><span class="no">' + (no++) + '</span><div class="grow">' + titikHtml('b', lay.label_b || 'Tujuan') + '</div></div>';
    if (lay.form_daftar) h += '<div class="step"><span class="no">' + (no++) + '</span><div class="grow"><label class="field"><span>' + e(lay.label_daftar || 'Daftar pesanan') + '</span><textarea class="input" id="daftar" placeholder="Satu per baris, contoh:\n2 bungkus nasi ayam\n1 es teh">' + e(O.daftar) + '</textarea></label></div></div>';
    h += '<div class="step"><span class="no">' + (no++) + '</span><div class="grow stack"><b>Data pemesan</b><div class="grid2"><label class="field"><span>Nama *</span><input class="input" id="nama" autocomplete="name" value="' + e(O.nama) + '" placeholder="Nama Anda"></label>' +
      '<label class="field"><span>No. HP (opsional)</span><input class="input" id="hp" inputmode="tel" autocomplete="tel" value="' + e(O.hp) + '" placeholder="08…"></label></div>' +
      '<label class="field"><span>Catatan untuk kurir</span><textarea class="input" id="catatan" placeholder="' + e(lay.catatan_ph || 'Patokan rumah, warna pagar, dll.') + '">' + e(O.catatan) + '</textarea></label></div></div>';
    h += '</div><aside class="sum" id="sum"></aside></div>' +
      (F('fitur_info_bayar') && s.info_bayar ? '<p class="small muted" style="margin:16px 0 8px">' + I('payments') + ' ' + e(s.info_bayar) + '</p>' : '') + '</div>';
    app.innerHTML = h;
    $$('[data-lay]').forEach(function (b) { b.onclick = function () { simpanIsian(); location.hash = '#/pesan/' + b.dataset.lay; }; });
    ['nama', 'hp', 'catatan', 'daftar'].forEach(function (k) { const el = $('#' + k); if (el) el.addEventListener('input', function () { O[k] = el.value; }); });
    ikatTitik('a'); ikatTitik('b'); hitung();
  }
  function simpanIsian() { ['nama', 'hp', 'catatan', 'daftar'].forEach(function (k) { const el = $('#' + k); if (el) O[k] = el.value; }); }
  function titikHtml(k, label) {
    const t = O[k] || {};
    return '<b>' + e(label) + ' *</b><div class="pt" style="margin-top:8px" data-pt="' + k + '"><input class="input" data-teks placeholder="Alamat / patokan (mis. depan Masjid Raya)" value="' + e(t.teks || '') + '">' +
      '<div class="tools">' + (F('fitur_gps') ? '<button class="btn sm line" data-gps>' + I('my_location') + 'Lokasi saya</button>' : '') + (F('fitur_peta') ? '<button class="btn sm line" data-peta>' + I('map') + 'Pilih di peta</button>' : '') +
      '<button class="btn sm ghost" data-tempel>' + I('link') + 'Tempel link Maps</button></div>' +
      '<input class="input hide" data-link style="margin-top:8px" placeholder="Tempel link Google Maps / share lokasi" value="' + e(t.linkAsli || '') + '"><div data-info>' + infoTitik(t) + '</div></div>';
  }
  function infoTitik(t) {
    if (t.lat != null && t.lat !== '') return '<div class="ok">' + I('check_circle', 'fill') + 'Titik peta terkunci · <a href="' + e(K.mapsLink(t)) + '" target="_blank" rel="noopener">Cek di Maps</a></div>';
    if (t.linkAsli) return '<div class="ok" style="color:var(--warn)">' + I('info') + 'Link disimpan, tapi koordinat tidak terbaca — ongkir dikonfirmasi admin.</div>';
    return '';
  }
  function ikatTitik(k) {
    const box = $('[data-pt="' + k + '"]'); if (!box) return;
    const t = O[k] = O[k] || {}, info = $('[data-info]', box), link = $('[data-link]', box);
    const set = function (p) { Object.assign(t, p); info.innerHTML = infoTitik(t); hitung(); };
    $('[data-teks]', box).addEventListener('input', function (ev) { t.teks = ev.target.value; hitung(true); });
    const g = $('[data-gps]', box); if (g) g.onclick = function () { K.busy(g, true, 'Mencari…'); K.gps().then(function (p) { set({ lat: p.lat, lng: p.lng, linkAsli: '' }); if (!t.teks) { t.teks = 'Lokasi GPS saya'; $('[data-teks]', box).value = t.teks; } K.toast('Lokasi didapat (akurasi ±' + Math.round(p.akurasi) + ' m).', 'ok'); }).catch(function (er) { K.toast(er.message, 'bad'); }).then(function () { K.busy(g, false); }); };
    const m = $('[data-peta]', box); if (m) m.onclick = function () {
      const awal = t.lat != null && t.lat !== '' ? t : { lat: +P.settings.pangkalan_lat || -3.36, lng: +P.settings.pangkalan_lng || 135.5 };
      K.pilihPeta(awal, 'Pilih ' + (k === 'a' ? (O.lay.label_a || 'titik jemput') : (O.lay.label_b || 'tujuan')).toLowerCase()).then(function (p) { if (p) set({ lat: p.lat, lng: p.lng, linkAsli: '' }); });
    };
    $('[data-tempel]', box).onclick = function () { link.classList.remove('hide'); link.focus(); };
    if (t.linkAsli) link.classList.remove('hide');
    link.addEventListener('input', K.debounce(function () { const v = link.value.trim(), c = K.parseLatLng(v); t.linkAsli = v; if (c) set({ lat: c.lat, lng: c.lng }); else { t.lat = null; t.lng = null; info.innerHTML = infoTitik(t); hitung(); } }, 400));
  }
  function asalTitik() {
    const L = O.lay;
    if (L.butuh_a) return O.a && O.a.lat != null && O.a.lat !== '' ? O.a : null;
    if (O.a && O.a.lat != null && O.a.lat !== '') return O.a;                      // toko penjual (pesan produk)
    const s = P.settings; return s.pangkalan_lat ? { lat: +s.pangkalan_lat, lng: +s.pangkalan_lng } : null;
  }
  let hitungKe = 0, modeTarif = null;
  function hitung(ringan) {
    if (modeTarif) return modeTarif();
    const L = O.lay, a = asalTitik(), b = L.butuh_b ? (O.b && O.b.lat != null && O.b.lat !== '' ? O.b : null) : null;
    const id = ++hitungKe;
    const lanjut = function (km, cara) { if (id !== hitungKe) return; O.km = km; O.cara = cara; ringkas(); };
    if (ringan) return ringkas();
    if (L.tarif_mode !== 'jarak') return lanjut(null, '');
    if (a && b) { O.km = undefined; ringkas(); K.jarak(a, b, P.settings).then(function (r) { lanjut(r.km, r.cara); }); }
    else if (a && !L.butuh_b) lanjut(0, '');
    else lanjut(null, '');
  }
  function ringkas() {
    const el = $('#sum'); if (!el) return;
    const L = O.lay, o = K.ongkir(O.km, L, P), sub = O.lay.id === 'PRODUK' ? totalKeranjang() : 0;
    const jarakTxt = O.km === undefined ? 'menghitung…' : O.km == null ? '–' : '±' + O.km.toFixed(1).replace('.', ',') + ' km' + (O.cara === 'perkiraan' ? ' (perkiraan)' : '');
    el.innerHTML = '<div class="row" style="justify-content:space-between"><span class="small" style="opacity:.75">' + I(L.ikon || 'two_wheeler') + ' ' + e(L.nama) + '</span><span class="small" style="opacity:.75">' + jarakTxt + '</span></div>' +
      '<div class="row" style="justify-content:space-between;margin-top:6px;align-items:flex-end"><div><span class="small" style="opacity:.75">Perkiraan ongkir</span><div class="big num">' + (o.nego || o.belum ? '<span style="font-size:16px">' + e(o.ket) + '</span>' : K.rp(o.ongkir)) + '</div>' +
      (o.ket && !o.nego && !o.belum ? '<span class="tiny" style="opacity:.7">' + e(o.ket) + '</span>' : '') + (sub ? '<div class="tiny" style="opacity:.8">+ belanja ' + K.rp(sub) + '</div>' : '') + '</div></div>' +
      '<button class="btn wa block lg" id="kirim" style="margin-top:12px" ' + (ST.buka ? '' : 'disabled') + '>' + I('send') + (ST.buka ? 'Kirim ke WhatsApp Admin' : 'Kurir sedang tutup') + '</button>' +
      '<p class="tiny" style="opacity:.65;margin-top:8px;text-align:center">Ongkir final dikonfirmasi admin lewat WhatsApp.</p>';
    $('#kirim').onclick = kirim;
  }
  function kirim() {
    simpanIsian();
    const L = O.lay, s = P.settings;
    if (!ST.buka) return K.toast('Kurir sedang tutup.', 'bad');
    if (!String(O.nama).trim()) { K.toast('Isi nama Anda dulu.', 'bad'); return $('#nama').focus(); }
    if (O.hp && !K.hpValid(O.hp)) return K.toast('Nomor HP tidak valid. Kosongkan bila tidak perlu.', 'bad');
    const kosong = function (t) { return !t || (!String(t.teks || '').trim() && (t.lat == null || t.lat === '') && !t.linkAsli); };
    if (L.butuh_a && kosong(O.a)) return K.toast('Isi ' + (L.label_a || 'titik jemput').toLowerCase() + '.', 'bad');
    if (L.butuh_b && kosong(O.b)) return K.toast('Isi ' + (L.label_b || 'tujuan').toLowerCase() + '.', 'bad');
    if (L.form_daftar && !String(O.daftar).trim()) return K.toast('Isi ' + (L.label_daftar || 'daftar pesanan').toLowerCase() + '.', 'bad');
    const o = K.ongkir(O.km, L, P), kode = K.kode(), lacakOn = F('fitur_lacak') && F('fitur_catat_pesanan'), lid = lacakOn ? K.acakId(12) : '';
    const urlLacak = lid ? K.urlSitus() + '#/lacak/' + lid : '';
    const linkT = function (t) { return t ? (t.lat != null && t.lat !== '' ? K.mapsLink(t) : t.linkAsli || '') : ''; };
    const baris = function (ikon, label, t) { const l = linkT(t); return ikon + ' *' + label + ':* ' + (t.teks || '-') + (l ? '\n🗺️ ' + l : '') + '\n'; };
    let titik = '';
    if (L.butuh_a || L.id === 'PRODUK') titik += baris('📍', L.label_a || 'Ambil di', O.a || {});
    if (L.butuh_b) titik += baris('🏁', L.label_b || 'Antar ke', O.b || {});
    let item = '';
    if (L.id === 'PRODUK') item = '🧾 *Pesanan:*\n' + teksKeranjang() + '\n\n';
    else if (L.form_daftar) item = '🧾 *' + (L.label_daftar || 'Daftar') + ':*\n' + O.daftar.trim() + '\n\n';
    const v = { kode: kode, layanan: L.nama, nama: O.nama.trim(), hp: O.hp ? K.hp08(O.hp) : '-', titik: titik, item: item, catatan: O.catatan.trim() || '-',
      lacak: urlLacak ? '📍 ' + T('lacak_teks') + '\n' + urlLacak + '\n\n' : '',
      jarak: O.km == null || O.km === undefined ? '-' : '±' + O.km.toFixed(1).replace('.', ',') + ' km', ongkir: o.nego || o.belum ? o.ket : '±' + K.rp(o.ongkir) + ' (perkiraan)', toko: s.nama_usaha };
    let tpl = String(s.tpl_pesan || ''); if (urlLacak && tpl.indexOf('{lacak}') < 0) tpl += '\n\n{lacak}';
    const teks = tpl.replace(/\{(\w+)\}/g, function (m, k) { return v[k] == null ? '' : v[k]; }).replace(/\n{3,}/g, '\n\n');
    K.set('saya', { nama: v.nama, hp: O.hp, b: O.b && O.b.teks ? { teks: O.b.teks, lat: O.b.lat, lng: O.b.lng, linkAsli: O.b.linkAsli } : undefined });
    const tujuan = O.kurirWa || s.wa_admin, url = K.waLink(tujuan, teks);
    if (F('fitur_catat_pesanan')) K.api('order.catat', { kode: kode, layanan: L.nama, nama: v.nama, hp: O.hp, titik_a: (O.a || {}).teks, link_a: linkT(O.a), titik_b: (O.b || {}).teks, link_b: linkT(O.b),
      jarak_km: O.km || 0, ongkir: o.ongkir || 0, item: (item || '').replace(/\*/g, ''), catatan: O.catatan, kurir_id: O.kurirId || '', lacak_id: lid,
      lat_a: L.butuh_a || L.id === 'PRODUK' ? (asalTitik() || {}).lat : '', lng_a: L.butuh_a || L.id === 'PRODUK' ? (asalTitik() || {}).lng : '', lat_b: (O.b || {}).lat, lng_b: (O.b || {}).lng });
    if (lid) K.set('pesananku', [{ id: lid, kode: kode, layanan: L.nama, t: Date.now() }].concat(pesananSaya()).slice(0, 10));
    if (L.id === 'PRODUK') { K.set('cart', []); perbaruiShell(); }
    const w = window.open(url, '_blank'); if (!w) location.href = url;
    K.sheet({ title: 'Pesanan dikirim', html: '<div class="empty" style="padding:10px 0">' + I('task_alt', 'fill') + '<p><b>Kode pesanan ' + e(kode) + '</b></p><p class="small" style="margin-top:6px">WhatsApp terbuka dengan pesan siap kirim. Tekan <b>kirim</b> di WhatsApp agar admin menerimanya.</p>' + (lid ? '<a class="btn dark" style="margin-top:14px" href="#/lacak/' + lid + '">' + I('location_searching') + 'Lacak pesanan ini</a>' : '') + '</div>',
      foot: '<a class="btn wa" href="' + e(url) + '" target="_blank" rel="noopener">' + I('chat') + 'Buka WhatsApp lagi</a><button class="btn line" data-x>Selesai</button>' });
  }

  function pesananSaya() { const a = K.get('pesananku', []); return Array.isArray(a) ? a.filter(function (x) { return Date.now() - x.t < 14 * 864e5; }) : []; }

  /* ======================= CEK TARIF ======================= */
  function halTarif() {
    const s = P.settings;
    const T = { lay: { id: 'TARIF', nama: 'Cek tarif', tarif_mode: 'jarak', butuh_a: true, butuh_b: true, label_a: 'Dari', label_b: 'Ke' }, a: {}, b: {}, km: null };
    O = T;                                                      // pakai ulang komponen titik
    let tbl = '';
    if (s.tarif_mode === 'tabel' && P.tarif.length) tbl = '<table class="tbl num"><thead><tr><th>Jarak</th><th>Tarif</th></tr></thead><tbody>' + P.tarif.map(function (t) { return '<tr><td>' + t.km_dari + '–' + t.km_sampai + ' km</td><td><b>' + K.rp(t.harga) + '</b></td></tr>'; }).join('') + '</tbody></table><p class="tiny muted" style="margin-top:8px">Lebih dari ' + P.tarif[P.tarif.length - 1].km_sampai + ' km: + ' + K.rp(s.tarif_per_km) + '/km</p>';
    else tbl = '<table class="tbl num"><tbody><tr><td>Tarif dasar (s.d. ' + e(s.km_dasar) + ' km)</td><td><b>' + K.rp(s.tarif_dasar) + '</b></td></tr><tr><td>Per km berikutnya</td><td><b>' + K.rp(s.tarif_per_km) + '</b></td></tr><tr><td>Tarif minimal</td><td><b>' + K.rp(s.tarif_minimal) + '</b></td></tr></tbody></table>';
    if (s.fitur_tarif_malam === 'YA') tbl += '<p class="small" style="margin-top:10px">' + I('dark_mode') + ' Pukul ' + e(s.malam_mulai) + '–' + e(s.malam_selesai) + ' + ' + K.rp(s.malam_biaya) + '</p>';
    app.innerHTML = '<div class="wrap">' + judul('Cek Tarif Ongkir', 'Hitung perkiraan ongkir dari jarak dua titik.') +
      '<div class="order-layout"><div class="stack-lg">' +
      '<div class="step"><span class="no">1</span><div class="grow">' + titikHtml.call(null, 'a', 'Dari') + '</div></div>' +
      '<div class="step"><span class="no">2</span><div class="grow">' + titikHtml.call(null, 'b', 'Ke') + '</div></div>' +
      '<div class="card"><h3 style="font-size:17px;margin-bottom:8px">Daftar tarif</h3>' + tbl + '<p class="tiny muted" style="margin-top:8px">Layanan tertentu bisa punya biaya tambahan (lihat menu Layanan).</p></div></div>' +
      '<aside class="sum" id="sumT"></aside></div></div>' + footer();
    ikatTitik('a'); ikatTitik('b');
    const r = function () {
      const el = $('#sumT'); if (!el) return;
      const o = K.ongkir(T.km, T.lay, P);
      el.innerHTML = '<span class="small" style="opacity:.75">Jarak ' + (T.km == null ? '–' : T.km === undefined ? 'menghitung…' : '±' + T.km.toFixed(1).replace('.', ',') + ' km') + '</span><div class="big num" style="margin-top:4px">' + (o.belum || o.nego ? '<span style="font-size:16px">' + e(o.ket) + '</span>' : K.rp(o.ongkir)) + '</div>' +
        '<a class="btn pri block" style="margin-top:12px" href="#/pesan">' + I('two_wheeler') + 'Pesan kurir</a>';
    };
    modeTarif = function () { const a = T.a.lat != null && T.a.lat !== '' ? T.a : null, b = T.b.lat != null && T.b.lat !== '' ? T.b : null; if (a && b) { T.km = undefined; r(); K.jarak(a, b, s).then(function (x) { T.km = x.km; r(); }); } else { T.km = null; r(); } };
    r();
  }

  /* ======================= PRODUK ======================= */
  function namaPenjual(p) { if (p.pemilik !== 'penjual') return P.settings.nama_usaha; const s = P.penjual[p.penjual_id]; return s ? s.nama_usaha : ''; }
  function kartuProduk(p) {
    const f = (p.foto || [])[0];
    return '<div class="prod ' + (p.stok === 'habis' ? 'habis' : '') + '" role="button" tabindex="0" data-prod="' + e(p.id) + '"><div class="ph">' + (f ? '<img src="' + e(K.img(f)) + '" alt="' + e(p.nama) + '" loading="lazy" onerror="this.remove()">' : '') +
      (p.stok === 'habis' ? '<span class="badge bad">Habis</span>' : p.harga_coret ? '<span class="badge pri">Promo</span>' : p.pemilik === 'penjual' ? '<span class="badge">Mitra</span>' : '') + favBtn('p', p.id) + '</div>' +
      '<div class="bd"><span class="nm">' + e(p.nama) + '</span><span class="by">' + I('storefront') + ' ' + e(namaPenjual(p)) + '</span><span class="price num">' + K.rp(p.harga) + (p.harga_coret ? '<s>' + K.rp(p.harga_coret) + '</s>' : '') + '</span></div></div>';
  }
  function ikatProduk() { $$('[data-prod]').forEach(function (b) { b.onclick = function (ev) { if (!ev.target.closest('[data-fav]')) detailProduk(b.dataset.prod); }; b.onkeydown = function (ev) { if (ev.key === 'Enter' && ev.target === b) detailProduk(b.dataset.prod); }; }); }
  function halProduk() {
    if (!F('fitur_produk')) { location.hash = '#/'; return; }
    const kats = ['Semua'].concat(String(P.settings.kategori_produk || '').split(',').map(function (x) { return x.trim(); }).filter(String));
    const st = { kat: /^k:/.test(arg) ? arg.slice(2) : 'Semua', q: /^q:/.test(arg) ? arg.slice(2) : '' };
    if (st.kat !== 'Semua' && kats.indexOf(st.kat) < 0) kats.push(st.kat);
    app.innerHTML = '<div class="wrap">' + judul('Produk & Jualan', 'Jajanan, makanan, dan kebutuhan dari kurir & mitra penjual. Pesan, kurir yang antar.') +
      '<input class="input" id="cari" type="search" placeholder="Cari produk atau toko…" style="margin:10px 0" value="' + e(st.q) + '">' +
      '<div class="chips" id="kat">' + kats.map(function (k) { return '<button class="chip ' + (k === st.kat ? 'on' : '') + '" data-k="' + e(k) + '">' + e(k) + '</button>'; }).join('') + '</div>' +
      '<div class="prod-grid" id="pg" style="margin-top:10px"></div>' +
      (F('fitur_penjual') ? '<div class="cta-sell" style="margin-top:26px"><div><h3>Punya jualan juga?</h3><p class="muted small" style="margin-top:4px">Pasang gratis, pelanggan pesan, kurir kami antar.</p></div><a class="btn dark" href="#/jualan">' + I('add_business') + 'Mau jualan di sini?</a></div>' : '') + '</div>' + footer();
    const tampil = function () {
      const q = st.q.toLowerCase(), list = P.produk.filter(function (p) { return (st.kat === 'Semua' || p.kategori === st.kat) && (!q || (p.nama + ' ' + namaPenjual(p) + ' ' + p.kategori).toLowerCase().indexOf(q) > -1); });
      $('#pg').innerHTML = list.length ? list.map(kartuProduk).join('') : '<div class="empty" style="grid-column:1/-1">' + I('search_off') + 'Belum ada produk yang cocok.</div>';
      ikatProduk();
    };
    $$('#kat .chip').forEach(function (c) { c.onclick = function () { $$('#kat .chip').forEach(function (x) { x.classList.remove('on'); }); c.classList.add('on'); st.kat = c.dataset.k; tampil(); }; });
    $('#cari').addEventListener('input', K.debounce(function (ev) { st.q = ev.target.value; tampil(); }, 200));
    tampil();
  }
  function detailProduk(id) {
    const p = P.produk.filter(function (x) { return x.id === id; })[0]; if (!p) return;
    const pj = p.pemilik === 'penjual' ? P.penjual[p.penjual_id] : null, habis = p.stok === 'habis';
    const urlP = K.urlSitus() + '#/produk/' + encodeURIComponent('q:' + p.nama);
    const sh = K.sheet({ title: p.nama, cls: 'wide', html: '<div class="row" style="justify-content:flex-end;margin:-6px 0 8px">' + favBtn('p', p.id).replace('fav-b', 'fav-b static') + (F('fitur_bagikan') ? '<button class="ibtn" data-sh aria-label="Bagikan">' + I('share') + '</button>' : '') + '</div>' +
      '<div class="grid2" style="gap:18px"><div><div class="carousel">' + (p.foto || []).map(function (f) { return '<img src="' + e(K.img(f)) + '" alt="' + e(p.nama) + '" loading="lazy">'; }).join('') + '</div>' + ((p.foto || []).length > 1 ? '<p class="tiny muted" style="text-align:center;margin-top:6px">Geser untuk foto lain</p>' : '') + '</div>' +
      '<div class="stack"><span class="badge">' + e(p.kategori) + '</span><div class="price num" style="font-size:24px">' + K.rp(p.harga) + (p.satuan ? '<span class="small muted" style="font-weight:400"> / ' + e(p.satuan) + '</span>' : '') + (p.harga_coret ? '<s>' + K.rp(p.harga_coret) + '</s>' : '') + '</div>' +
      (habis ? '<span class="badge bad">Stok habis</span>' : '') + '<p style="white-space:pre-line">' + e(p.deskripsi) + '</p>' +
      '<a class="item" href="' + (pj ? '#/toko/' + e(pj.id) : '#/kurir') + '" style="text-decoration:none"><img class="th" src="' + e(K.img(pj ? pj.foto_url : P.settings.logo_url)) + '" alt="" onerror="this.style.visibility=\'hidden\'"><div class="grow"><div class="tt">' + e(namaPenjual(p)) + '</div><div class="ss">' + e(pj ? pj.alamat : 'Dijual langsung oleh kurir') + '</div></div>' + I('chevron_right') + '</a>' +
      (!ST.buka ? '<p class="small" style="color:var(--bad)">' + I('do_not_disturb_on') + ' Kurir sedang tutup — pesan antar belum bisa.</p>' : '') + '</div></div>',
      foot: (F('fitur_wa_penjual') && pj ? '<a class="btn line" target="_blank" rel="noopener" href="' + e(K.waLink(pj.hp, 'Halo ' + pj.nama_usaha + ', saya lihat *' + p.nama + '* (' + K.rp(p.harga) + ') di aplikasi ' + P.settings.nama_usaha + '. Masih ada?')) + '">' + I('chat') + 'Chat penjual</a>' : '') +
        (F('fitur_keranjang') ? '<button class="btn line" data-add ' + (habis || !ST.buka ? 'disabled' : '') + '>' + I('add_shopping_cart') + 'Keranjang</button>' : '') +
        '<button class="btn pri" data-pesan ' + (habis || !ST.buka ? 'disabled' : '') + '>' + I('two_wheeler') + 'Pesan & Antar</button>' });
    const shb = sh.el.querySelector('[data-sh]'); if (shb) shb.onclick = function () { K.bagikan(urlP, p.nama + ' — ' + K.rp(p.harga), { foto: (p.foto || [])[0], teks: p.nama + ' ' + K.rp(p.harga) + ' di ' + P.settings.nama_usaha, tanpaInstall: true }); };
    const add = sh.el.querySelector('[data-add]'); if (add) add.onclick = function () { tambahKeranjang(p.id); K.toast('Masuk keranjang.', 'ok'); sh.close(); };
    sh.el.querySelector('[data-pesan]').onclick = function () { if (!F('fitur_keranjang')) K.set('cart', []); tambahKeranjang(p.id, true); sh.close(); O = null; location.hash = '#/pesan/keranjang'; };
  }

  /* ======================= KERANJANG ======================= */
  function keranjang() { const c = K.get('cart', []); return P ? c.filter(function (x) { return P.produk.some(function (p) { return p.id === x.id && p.stok !== 'habis'; }); }) : c; }
  function tambahKeranjang(id, satu) { const c = keranjang(), x = c.filter(function (i) { return i.id === id; })[0]; if (x) { if (!satu) x.qty++; } else c.push({ id: id, qty: 1 }); K.set('cart', c); perbaruiShell(); }
  function prodById(id) { return P.produk.filter(function (p) { return p.id === id; })[0]; }
  function totalKeranjang() { return keranjang().reduce(function (t, x) { const p = prodById(x.id); return t + (p ? p.harga * x.qty : 0); }, 0); }
  function teksKeranjang() {
    const per = {};
    keranjang().forEach(function (x) { const p = prodById(x.id); if (!p) return; const n = namaPenjual(p); (per[n] = per[n] || []).push(x.qty + '× ' + p.nama + ' — ' + K.rp(p.harga * x.qty)); });
    return Object.keys(per).map(function (n) { return '_' + n + '_\n' + per[n].join('\n'); }).join('\n') + '\n*Subtotal belanja: ' + K.rp(totalKeranjang()) + '*';
  }
  function ringkasKeranjang() { return keranjang().map(function (x) { const p = prodById(x.id); return p ? '<div class="row small" style="justify-content:space-between"><span>' + x.qty + '× ' + e(p.nama) + '</span><b class="num">' + K.rp(p.harga * x.qty) + '</b></div>' : ''; }).join('') + '<div class="row" style="justify-content:space-between;margin-top:8px;border-top:1px solid var(--line);padding-top:8px"><b>Subtotal</b><b class="num">' + K.rp(totalKeranjang()) + '</b></div>'; }
  function siapkanAsalProduk() {
    const toko = [], c = keranjang(); let titik = null;
    c.forEach(function (x) { const p = prodById(x.id); if (!p) return; const pj = p.pemilik === 'penjual' ? P.penjual[p.penjual_id] : null; const n = pj ? pj.nama_usaha + (pj.alamat ? ' (' + pj.alamat + ')' : '') : P.settings.pangkalan_nama || P.settings.nama_usaha; if (toko.indexOf(n) < 0) toko.push(n);
      if (!titik && pj) { const k = pj.lat ? { lat: +pj.lat, lng: +pj.lng } : K.parseLatLng(pj.link_maps); if (k) titik = k; } });
    if (!titik && P.settings.pangkalan_lat) titik = { lat: +P.settings.pangkalan_lat, lng: +P.settings.pangkalan_lng };
    O.a = Object.assign({ teks: toko.join(' + ') + (toko.length > 1 ? ' — beberapa toko, ongkir dikonfirmasi admin' : '') }, titik || {}, { linkAsli: '' });
    O.lay = Object.assign({}, LP, { label_a: 'Ambil di' });
  }
  function halKeranjang() {
    const c = keranjang();
    let h = '<div class="wrap">' + judul('Keranjang', 'Pesan beberapa produk sekaligus, kurir yang mengambil & mengantar.') + tutupBar();
    if (!c.length) h += '<div class="empty">' + I('shopping_cart') + '<p>Keranjang masih kosong.</p><a class="btn pri" style="margin-top:12px" href="#/produk">Lihat produk</a></div>';
    else h += '<div class="card" style="margin-top:12px">' + c.map(function (x) { const p = prodById(x.id); return '<div class="cart-line"><img src="' + e(K.img((p.foto || [])[0])) + '" alt=""><div><div style="font-weight:600">' + e(p.nama) + '</div><div class="small muted">' + e(namaPenjual(p)) + ' · ' + K.rp(p.harga) + '</div></div><div class="qty"><button data-q="' + e(p.id) + '" data-d="-1" aria-label="Kurangi">−</button><b class="num">' + x.qty + '</b><button data-q="' + e(p.id) + '" data-d="1" aria-label="Tambah">+</button></div></div>'; }).join('') +
      '<div class="row" style="justify-content:space-between;margin-top:14px"><b>Subtotal</b><b class="price num">' + K.rp(totalKeranjang()) + '</b></div><p class="tiny muted">Belum termasuk ongkir.</p>' +
      '<a class="btn pri block lg ' + (ST.buka ? '' : 'off') + '" style="margin-top:14px" href="#/pesan/keranjang">' + I('two_wheeler') + 'Lanjut pesan antar</a></div>';
    app.innerHTML = h + '</div>';
    $$('[data-q]').forEach(function (b) { b.onclick = function () { const cc = keranjang(), x = cc.filter(function (i) { return i.id === b.dataset.q; })[0]; x.qty += +b.dataset.d; K.set('cart', cc.filter(function (i) { return i.qty > 0; })); halKeranjang(); perbaruiShell(); }; });
  }

  /* ======================= TOKO PENJUAL ======================= */
  function halToko() {
    const pj = P.penjual[arg]; if (!pj) { app.innerHTML = '<div class="wrap"><div class="empty">' + I('storefront') + 'Toko tidak ditemukan.</div></div>'; return; }
    const pr = P.produk.filter(function (p) { return p.penjual_id === pj.id; }), ll = pj.lat ? K.mapsLink(pj) : pj.link_maps;
    app.innerHTML = '<div class="wrap"><div class="card pad-lg" style="margin-top:14px"><div class="kurir-card"><img class="av" src="' + e(K.img(pj.foto_url || P.settings.logo_url)) + '" alt=""><div><span class="badge ok">' + I('verified', 'fill') + 'Mitra terverifikasi</span><h1 style="font-size:24px;margin-top:6px">' + e(pj.nama_usaha) + '</h1><p class="muted small">' + e(pj.kategori) + ' · ' + e(pj.alamat) + '</p></div></div>' +
      (pj.deskripsi ? '<p style="margin-top:12px">' + e(pj.deskripsi) + '</p>' : '') + '<div class="row wrapx" style="margin-top:14px">' + (F('fitur_wa_penjual') ? '<a class="btn line sm" target="_blank" rel="noopener" href="' + e(K.waLink(pj.hp, 'Halo ' + pj.nama_usaha + ', saya lihat toko Anda di ' + P.settings.nama_usaha + '.')) + '">' + I('chat') + 'Chat penjual</a>' : '') + (ll ? '<a class="btn line sm" target="_blank" rel="noopener" href="' + e(ll) + '">' + I('map') + 'Lokasi</a>' : '') + '</div></div>' +
      '<div class="sec-h" style="margin-top:22px"><h2>Produk (' + pr.length + ')</h2></div><div class="prod-grid">' + (pr.map(kartuProduk).join('') || '<div class="empty">Belum ada produk.</div>') + '</div></div>' + footer();
    ikatProduk();
  }

  /* ======================= GALERI ======================= */
  /* ======================= GALERI USAHA PELANGGAN (alur sama dengan tema emas) ======================= */
  const GS = { j: '', kat: '', q: '', lay: K.get('gal_lay', 'grid') };
  const gDaftar = function () { return K.galeriDaftar(P.settings); };
  const gInfo = function (id) { return K.galeriDaftar(P.settings, true).filter(function (g) { return g.id === id; })[0] || { id: id, nama: id, judul: 'Galeri ' + id, icon: 'photo_library' }; };
  const gItems = function (j) { return P.galeri.filter(function (g) { return (!j || g.tipe === j) && gDaftar().some(function (d) { return d.id === g.tipe; }); }); };
  function galeriBeranda() {
    const all = gItems(); if (!all.length) return '';
    const acak = all.slice().sort(function () { return Math.random() - .5; }), tile = function (g) { return '<a href="#/galeri/' + e(g.tipe) + '/' + encodeURIComponent(g.id) + '" class="gb-it"><img src="' + e(K.img(g.foto_url)) + '" alt="' + e(g.judul || g.kategori) + '" decoding="async">' + favBtn('g', g.id) + '</a>'; };
    let body;
    if (T('galeri_bio_efek') === 'jalan' && acak.length >= 4) {
      const pick = acak.length < 10 ? acak.concat(acak).slice(0, 10) : acak.slice(0, 16), h = Math.ceil(pick.length / 2);
      const row = function (r, rev) { return '<div class="gb-row' + (rev ? ' rev' : '') + '" style="--dur:' + Math.max(18, r.length * 4.5) + 's"><div class="gb-track">' + r.map(tile).join('') + r.map(tile).join('').replace(/<a /g, '<a tabindex="-1" aria-hidden="true" ') + '</div></div>'; };
      body = '<div class="gb-marquee">' + row(pick.slice(0, h)) + row(pick.slice(h), 1) + '</div>';
    } else body = '<div class="gal">' + acak.slice(0, 8).map(tile).join('') + '</div>';
    return '<section class="sec"><div class="wrap"><div class="sec-h"><h2>' + e(T('galeri_bio_judul')) + '</h2><a href="#/galeri">Lihat semua</a></div></div>' + body +
      '<div class="wrap chips" style="margin-top:12px">' + gDaftar().filter(function (g) { return gItems(g.id).length; }).map(function (g) { return '<a class="chip" href="#/galeri/' + e(g.id) + '">' + I(g.icon || 'photo_library') + e(g.nama) + ' <small class="muted">' + gItems(g.id).length + '</small></a>'; }).join('') + '</div></section>';
  }
  function ikatGaleri() { }
  function halGaleri() {
    if (!F('fitur_galeri')) { location.hash = '#/'; return; }
    const parts = arg.split('/'), daftar = gDaftar().filter(function (g) { return gItems(g.id).length || g.id === parts[0]; });
    const j = parts[0] && daftar.some(function (g) { return g.id === parts[0]; }) ? parts[0] : ((daftar[0] || gDaftar()[0] || {}).id || '');
    if (j !== GS.j) { GS.kat = ''; GS.q = ''; } GS.j = j;
    const J = gInfo(j), all = gItems(j), cats = {};
    all.forEach(function (g) { const k = g.kategori || 'Lainnya'; cats[k] = (cats[k] || 0) + 1; });
    app.innerHTML = '<div class="wrap"><div class="gal-sw chips" style="margin-top:14px">' + daftar.map(function (g) { return '<a class="chip ' + (g.id === j ? 'on' : '') + '" href="#/galeri/' + e(g.id) + '">' + I(g.icon || 'photo_library') + e(g.nama) + ' <small>' + gItems(g.id).length + '</small></a>'; }).join('') + '</div>' +
      judul(J.judul, J.sub) + '<div class="row" style="margin:10px 0"><input class="input grow" type="search" id="gq" placeholder="Cari foto, kategori, nama usaha…" value="' + e(GS.q) + '">' +
      '<div class="seg light" style="margin:0;grid-template-columns:repeat(3,44px);padding:3px" role="group" aria-label="Tampilan">' + [['grid', 'grid_view'], ['masonry', 'view_quilt'], ['besar', 'view_day']].map(function (x) { return '<button data-lay="' + x[0] + '" class="' + (GS.lay === x[0] ? 'on' : '') + '" aria-label="Tampilan ' + x[0] + '" style="min-height:38px">' + I(x[1]) + '</button>'; }).join('') + '</div></div>' +
      '<div class="chips" id="gk"><button class="chip ' + (GS.kat ? '' : 'on') + '" data-k="">Semua <small>' + all.length + '</small></button>' + Object.keys(cats).map(function (c) { return '<button class="chip ' + (c === GS.kat ? 'on' : '') + '" data-k="' + e(c) + '">' + e(c) + ' <small>' + cats[c] + '</small></button>'; }).join('') + '</div>' +
      '<div id="gg" style="margin-top:12px"></div><p class="small muted" style="margin:16px 0">' + I('info') + ' Ketuk foto untuk melihat besar & menanyakannya ke admin lewat WhatsApp.</p></div>' + footer();
    const daftarTampil = function () { const q = GS.q.toLowerCase().trim(); return all.filter(function (g) { return (!GS.kat || (g.kategori || 'Lainnya') === GS.kat) && (!q || [g.judul, g.kategori, g.tag, g.usaha].join(' ').toLowerCase().indexOf(q) > -1); }); };
    const gambar = function () {
      const l = daftarTampil();
      $('#gg').className = 'galx galx-' + GS.lay;
      $('#gg').innerHTML = l.length ? l.map(function (g, i) { return '<div class="gi" role="button" tabindex="0" data-gi="' + i + '"><img src="' + e(K.img(g.foto_url)) + '" alt="' + e(g.judul || g.kategori) + '" loading="' + (i < 6 ? 'eager' : 'lazy') + '"><span class="gl">' + e(g.usaha || g.kategori || '') + '</span>' + favBtn('g', g.id) + '</div>'; }).join('') : '<div class="empty">' + I('search_off') + 'Tidak ada foto yang cocok.</div>';
      $$('[data-gi]').forEach(function (b) { const buka = function () { lightboxGaleri(l, +b.dataset.gi); }; b.onclick = function (ev) { if (!ev.target.closest('[data-fav]')) buka(); }; b.onkeydown = function (ev) { if (ev.key === 'Enter') buka(); }; });
    };
    $('#gq').addEventListener('input', K.debounce(function (ev) { GS.q = ev.target.value; gambar(); }, 220));
    $$('#gk .chip').forEach(function (c) { c.onclick = function () { $$('#gk .chip').forEach(function (x) { x.classList.toggle('on', x === c); }); GS.kat = c.dataset.k; gambar(); }; });
    $$('[data-lay]').forEach(function (b) { b.onclick = function () { GS.lay = b.dataset.lay; K.set('gal_lay', GS.lay); $$('[data-lay]').forEach(function (x) { x.classList.toggle('on', x === b); }); gambar(); }; });
    gambar();
    if (parts[1]) { const k = all.map(function (g) { return g.id; }).indexOf(parts[1]); if (k > -1) lightboxGaleri(all, k); }
  }
  function linkFoto(g) { return K.urlSitus() + '#/galeri/' + g.tipe + '/' + encodeURIComponent(g.id); }
  function lightboxGaleri(list, i) {
    if (!list.length) return;
    const o = document.createElement('div'); o.className = 'glb'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true');
    o.innerHTML = '<div class="glb-top"><span class="row" style="gap:6px">' + (F('fitur_bagikan') ? '<button class="glb-b" data-sh aria-label="Bagikan">' + I('share') + '</button>' : '') + '<span data-fv></span></span><span class="glb-n" data-n></span><button class="glb-b" data-x aria-label="Tutup">' + I('close') + '</button></div>' +
      '<div class="glb-st" data-st><img alt="" data-im></div><button class="glb-nav prev" data-pv aria-label="Sebelumnya">' + I('chevron_left') + '</button><button class="glb-nav next" data-nx aria-label="Berikutnya">' + I('chevron_right') + '</button>' +
      '<div class="glb-bot"><div class="glb-meta" data-m></div><button class="btn wa lg glb-wa" data-wa>' + I('chat', 'fill') + 'Tanyakan ke admin</button></div>';
    document.body.appendChild(o); document.body.style.overflow = 'hidden';
    const im = $('[data-im]', o);
    const show = function () {
      const g = list[i]; im.src = K.img(g.foto_url); im.alt = g.judul || g.kategori || '';
      $('[data-n]', o).textContent = (i + 1) + ' / ' + list.length;
      $('[data-fv]', o).innerHTML = favBtn('g', g.id).replace('fav-b', 'fav-b static');
      $('[data-m]', o).innerHTML = '<span class="chip">' + I(gInfo(g.tipe).icon || 'photo_library') + e(gInfo(g.tipe).nama) + '</span>' + (g.kategori ? '<span class="chip">' + e(g.kategori) + '</span>' : '') + (g.usaha ? '<span class="chip">' + I('storefront') + e(g.usaha) + '</span>' : '') + (g.judul ? '<p>' + e(g.judul) + '</p>' : '');
      $('[data-pv]', o).hidden = i <= 0; $('[data-nx]', o).hidden = i >= list.length - 1;
      $('[data-wa]', o).disabled = false;
      try { history.replaceState(null, '', '#/galeri/' + g.tipe + '/' + encodeURIComponent(g.id)); } catch (er) { }
    };
    const tutup = function () { o.remove(); document.body.style.overflow = ''; document.removeEventListener('keydown', key); try { if (rute === 'galeri') history.replaceState(null, '', '#/galeri/' + GS.j); } catch (er) { } };
    const go = function (d) { const n = i + d; if (n < 0 || n >= list.length) return; i = n; show(); };
    const key = function (ev) { if (ev.key === 'Escape') tutup(); if (ev.key === 'ArrowRight') go(1); if (ev.key === 'ArrowLeft') go(-1); };
    document.addEventListener('keydown', key);
    $('[data-x]', o).onclick = tutup; $('[data-pv]', o).onclick = function () { go(-1); }; $('[data-nx]', o).onclick = function () { go(1); };
    $('[data-st]', o).onclick = function (ev) { if (ev.target === ev.currentTarget) tutup(); };
    let x0 = null; const st = $('[data-st]', o);
    st.addEventListener('touchstart', function (ev) { x0 = ev.touches[0].clientX; }, { passive: true });
    st.addEventListener('touchend', function (ev) { if (x0 == null) return; const dx = ev.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); x0 = null; });
    $('[data-wa]', o).onclick = function () {
      const g = list[i], v = { toko: P.settings.nama_usaha, galeri: gInfo(g.tipe).nama, kategori: g.kategori || g.judul || '-', usaha: g.usaha ? ' dari *' + g.usaha + '*' : '', judul: g.judul || '', foto: K.abs(g.foto_url), link: linkFoto(g) };
      const msg = T('teks_pesan_galeri').replace(/\{(\w+)\}/g, function (m, k) { return v[k] == null ? '' : v[k]; });
      const w = window.open(K.waLink(P.settings.wa_admin, msg), '_blank'); if (!w) location.href = K.waLink(P.settings.wa_admin, msg);
    };
    const sh = $('[data-sh]', o); if (sh) sh.onclick = function (ev) { const g = list[i]; K.kirimFoto(g.foto_url, (g.judul || g.kategori || 'Foto') + (g.usaha ? ' — ' + g.usaha : '') + ' di ' + P.settings.nama_usaha, linkFoto(g), ev.currentTarget); };
    show();
  }

  /* ======================= LACAK PESANAN (#/lacak/<id>) ======================= */
  const LST = [['baru', 'Pesanan masuk', 'inbox'], ['diterima', 'Dikonfirmasi admin', 'task_alt'], ['dijemput', 'Kurir menjemput / membeli', 'storefront'], ['diantar', 'Sedang diantar', 'two_wheeler'], ['selesai', 'Pesanan selesai', 'verified']];
  let peta = null;
  function halLacak() {
    if (!F('fitur_lacak')) { location.hash = '#/'; return; }
    const id = arg.split('/')[0];
    if (!id) {
      const sy = pesananSaya();
      app.innerHTML = '<div class="wrap">' + judul('Lacak Pesanan', 'Pantau status pesanan & posisi kurir secara langsung.') +
        '<div class="card stack"><label class="field"><span>Kode lacak</span><input class="input" id="lk" placeholder="Tempel link atau kode lacak dari pesan WhatsApp"></label><button class="btn pri" id="lgo">' + I('location_searching') + 'Lacak</button></div>' +
        (sy.length ? '<div class="sec-h" style="margin-top:22px"><h2>Pesanan saya di HP ini</h2></div><div class="list">' + sy.map(function (x) { return '<a class="item" href="#/lacak/' + e(x.id) + '" style="text-decoration:none"><span class="th">' + I('receipt_long') + '</span><div class="grow"><div class="tt">' + e(x.kode) + '</div><div class="ss">' + e(x.layanan) + ' · ' + e(K.waktu(new Date(x.t).toISOString())) + '</div></div>' + I('chevron_right') + '</a>'; }).join('') + '</div>' : '') + '</div>' + footer();
      $('#lgo').onclick = function () { const v = $('#lk').value.trim(), m = v.match(/lacak\/([A-Za-z0-9]+)/); const k = m ? m[1] : v.replace(/[^A-Za-z0-9]/g, ''); if (k) location.hash = '#/lacak/' + k; else K.toast('Isi kode lacak.', 'bad'); };
      return;
    }
    app.innerHTML = '<div class="wrap"><div class="skel" style="height:120px;margin-top:20px"></div><div class="skel" style="height:300px;margin-top:12px"></div></div>';
    const muat = function (awal) {
      K.lacak(id).then(function (r) {
        if (rute !== 'lacak') return;
        if (!r.success) { app.innerHTML = '<div class="wrap"><div class="empty">' + I('search_off') + '<p><b>' + e(r.message) + '</b></p><a class="btn line" style="margin-top:12px" href="#/lacak">Coba kode lain</a></div></div>'; clearInterval(lacakT); return; }
        gambarLacak(r.data, awal);
      });
    };
    muat(true);
    lacakT = setInterval(function () { if (!document.hidden) muat(false); }, 20000);
  }
  function gambarLacak(d, awal) {
    const idx = LST.map(function (x) { return x[0]; }).indexOf(d.status), batal = d.status === 'batal', selesai = d.status === 'selesai';
    const waktuS = {}; (d.riwayat || []).forEach(function (r) { waktuS[r.s] = r.t; });
    const k = d.kurir, pos = d.pos, tujuan = d.status === 'dijemput' ? d.a : d.b;
    let eta = '';
    if (pos && tujuan && !selesai) { const km = K.haversine(pos, tujuan) * 1.3, mnt = Math.max(2, Math.round(km / 25 * 60)); eta = '±' + km.toFixed(1).replace('.', ',') + ' km · perkiraan ' + mnt + ' menit ' + (d.status === 'dijemput' ? 'ke titik jemput' : 'sampai tujuan'); }
    const umur = pos ? Math.round((Date.now() - new Date(pos.t).getTime()) / 60000) : 0;
    const html = '<div class="wrap">' + judul('Pesanan ' + d.kode, d.layanan + (d.nama ? ' · ' + d.nama : '')) +
      '<div class="order-layout"><div class="stack-lg">' +
      '<div class="card lacak-head ' + (batal ? 'bad' : selesai ? 'ok' : '') + '"><span class="ic-lg">' + I(batal ? 'cancel' : (LST[Math.max(0, idx)] || [])[2] || 'inbox', 'fill') + '</span><div class="grow"><span class="small muted">Status sekarang</span><h2>' + e(batal ? 'Pesanan dibatalkan' : (LST[Math.max(0, idx)] || [])[1]) + '</h2>' + (eta ? '<p class="small" style="margin-top:4px">' + I('schedule') + ' ' + e(eta) + '</p>' : '') + '</div></div>' +
      ((d.a || d.b || pos) && !batal ? '<div class="card flat" style="padding:0;overflow:hidden"><div id="lpeta" style="height:320px;background:var(--surface-2)"></div><div class="row small" style="padding:10px 14px;justify-content:space-between"><span>' + (pos ? I('two_wheeler') + ' Posisi kurir ' + (umur < 1 ? 'baru saja' : umur + ' menit lalu') : I('info') + ' Posisi kurir tampil saat pesanan sedang diproses') + '</span><span class="muted">Diperbarui otomatis</span></div></div>' : '') +
      '<div class="card"><ol class="steps">' + LST.map(function (x, n) { const st = batal ? (waktuS[x[0]] ? 'done' : '') : n < idx ? 'done' : n === idx ? 'now' : ''; return '<li class="' + st + '"><span class="dt">' + I(x[2]) + '</span><div><b>' + x[1] + '</b>' + (waktuS[x[0]] ? '<small>' + e(K.waktu(waktuS[x[0]])) + '</small>' : '') + '</div></li>'; }).join('') + (batal ? '<li class="bad now"><span class="dt">' + I('cancel') + '</span><div><b>Dibatalkan</b><small>' + e(K.waktu(waktuS.batal || '')) + '</small></div></li>' : '') + '</ol></div></div>' +
      '<aside class="stack">' + (k ? '<div class="card stack"><div class="kurir-card"><img class="av" src="' + e(K.img(k.foto_url)) + '" alt="Foto kurir"><div><span class="small muted">Kurir Anda</span><b style="display:block;font-family:var(--f-head);font-size:18px">' + e(k.nama) + '</b><span class="small">' + e(k.motor_nama) + ' · <b>' + e(k.plat) + '</b></span></div></div>' +
        (k.wa && !selesai && !batal ? '<div class="grid2"><a class="btn wa" target="_blank" rel="noopener" href="' + e(K.waLink(k.wa, 'Halo ' + (k.panggilan || k.nama) + ', saya pemesan ' + d.kode + '.')) + '">' + I('chat') + 'Chat kurir</a><a class="btn line" href="tel:' + e(k.wa) + '">' + I('call') + 'Telepon</a></div>' : '') + '</div>' : '<div class="card small muted">' + I('hourglass_top') + ' Kurir akan ditentukan setelah pesanan dikonfirmasi admin.</div>') +
      '<div class="card small stack">' + (d.titik_a ? '<div>' + I('trip_origin') + ' <b>Dari:</b> ' + e(d.titik_a) + '</div>' : '') + (d.titik_b ? '<div>' + I('flag') + ' <b>Ke:</b> ' + e(d.titik_b) + '</div>' : '') + (d.item ? '<div style="white-space:pre-line">' + e(d.item) + '</div>' : '') +
        '<div class="num">' + (d.jarak_km ? '±' + Number(d.jarak_km).toFixed(1) + ' km · ' : '') + '<b>' + (d.ongkir ? K.rp(d.ongkir) : 'Ongkir dikonfirmasi admin') + '</b></div></div>' +
      '<a class="btn line block" target="_blank" rel="noopener" href="' + e(K.waLink(d.wa_admin, 'Halo admin ' + d.toko + ', saya ingin menanyakan pesanan ' + d.kode + '.')) + '">' + I('support_agent') + 'Hubungi admin</a>' +
      (F('fitur_bagikan') ? '<button class="btn ghost block" id="bgL">' + I('share') + 'Bagikan link lacak</button>' : '') + '</aside></div></div>';
    const yScroll = scrollY; app.innerHTML = html; if (!awal) scrollTo(0, yScroll);
    const b = $('#bgL'); if (b) b.onclick = function () { K.bagikan(location.href, 'Lacak pesanan ' + d.kode, { tanpaInstall: true }); };
    if ((selesai || batal) && lacakT) clearInterval(lacakT);
    const el = $('#lpeta'); if (!el) return;
    K.muatLeaflet().then(function (L) {
      if (!document.body.contains(el)) return;
      const m = L.map(el, { zoomControl: true, attributionControl: true }); peta = m;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(m);
      const ik = function (warna, ikon) { return L.divIcon({ className: '', html: '<span class="mk" style="--c:' + warna + '">' + I(ikon, 'fill') + '</span>', iconSize: [38, 38], iconAnchor: [19, 36] }); };
      const titik = [];
      if (d.a) { L.marker([d.a.lat, d.a.lng], { icon: ik('#1D4ED8', 'storefront') }).addTo(m).bindPopup('Titik jemput'); titik.push([d.a.lat, d.a.lng]); }
      if (d.b) { L.marker([d.b.lat, d.b.lng], { icon: ik('#15803D', 'flag') }).addTo(m).bindPopup('Tujuan'); titik.push([d.b.lat, d.b.lng]); }
      if (pos) { L.marker([pos.lat, pos.lng], { icon: ik('#D9480F', 'two_wheeler'), zIndexOffset: 1000 }).addTo(m).bindPopup('Kurir'); titik.push([pos.lat, pos.lng]); }
      if (titik.length > 1) m.fitBounds(titik, { padding: [40, 40], maxZoom: 16 }); else if (titik.length) m.setView(titik[0], 15);
    }).catch(function () { el.innerHTML = '<div class="empty">' + I('map') + 'Peta gagal dimuat.</div>'; });
  }

  /* ======================= FAVORIT ======================= */
  function halFavorit() {
    const fav = K.Fav.all();
    const prd = fav.filter(function (x) { return x.t === 'p'; }).map(function (x) { return prodById(x.id); }).filter(Boolean);
    const gal = fav.filter(function (x) { return x.t === 'g'; }).map(function (x) { return P.galeri.filter(function (g) { return g.id === x.id; })[0]; }).filter(Boolean);
    app.innerHTML = '<div class="wrap">' + judul('Favorit Saya', 'Produk & foto yang Anda simpan di HP ini.') +
      (!prd.length && !gal.length ? '<div class="empty">' + I('favorite') + '<p>Belum ada favorit. Tekan ❤ di produk atau foto galeri.</p></div>' : '') +
      (prd.length ? '<div class="sec-h" style="margin-top:12px"><h2>Produk</h2></div><div class="prod-grid">' + prd.map(kartuProduk).join('') + '</div>' : '') +
      (gal.length ? '<div class="sec-h" style="margin-top:22px"><h2>Foto galeri</h2></div><div class="galx galx-grid">' + gal.map(function (g, i) { return '<div class="gi" role="button" tabindex="0" data-fg="' + i + '"><img src="' + e(K.img(g.foto_url)) + '" alt="" loading="lazy"><span class="gl">' + e(g.usaha || g.kategori || '') + '</span>' + favBtn('g', g.id) + '</div>'; }).join('') + '</div>' : '') +
      (prd.length + gal.length ? '<button class="btn wa block lg" style="margin:22px 0" id="tanyaSemua">' + I('chat') + 'Tanyakan semua ke admin (' + (prd.length + gal.length) + ')</button>' : '') + '</div>' + footer();
    ikatProduk();
    $$('[data-fg]').forEach(function (b) { b.onclick = function (ev) { if (!ev.target.closest('[data-fav]')) lightboxGaleri(gal, +b.dataset.fg); }; });
    const t = $('#tanyaSemua'); if (t) t.onclick = function () {
      const baris = prd.map(function (p) { return '• ' + p.nama + ' — ' + K.rp(p.harga) + ' (' + namaPenjual(p) + ')'; }).concat(gal.map(function (g) { return '• Foto ' + (g.judul || g.kategori || '') + (g.usaha ? ' — ' + g.usaha : '') + ': ' + linkFoto(g); }));
      window.open(K.waLink(P.settings.wa_admin, 'Halo admin ' + P.settings.nama_usaha + ', saya tertarik dengan pilihan favorit saya:\n' + baris.join('\n') + '\nMohon info harga, ketersediaan & ongkir antarnya. Terima kasih.'), '_blank');
    };
  }

  /* ======================= KURIR ======================= */
  const ST_LABEL = { online: 'Online', sibuk: 'Sedang antar', offline: 'Offline' };
  function kartuKurir(k) {
    return '<a class="card kurir-card" href="#/kurir" style="text-decoration:none"><img class="av" src="' + e(K.img(k.foto_url)) + '" alt="Foto ' + e(k.nama) + '" loading="lazy"><div><b style="font-family:var(--f-head);font-size:17px">' + e(k.nama) + '</b>' +
      '<div class="small st-' + e(k.status) + '" style="margin-top:2px"><i class="dot ' + (k.status === 'online' ? 'pulse' : '') + '"></i> ' + (ST_LABEL[k.status] || k.status) + '</div><div class="tiny muted" style="margin-top:4px">' + I('two_wheeler') + ' ' + e(k.motor_nama) + ' · ' + e(k.plat) + '</div></div></a>';
  }
  function halKurir() {
    app.innerHTML = '<div class="wrap">' + judul('Profil Kurir', 'Kurir lokal yang siap mengantar Anda — wajah dan kendaraan jelas, lebih tenang.') + '<div class="grid2" style="margin-top:12px">' +
      P.kurir.map(function (k) {
        return '<article class="card pad-lg kurir-full stack"><div class="kurir-card"><img class="av" src="' + e(K.img(k.foto_url)) + '" alt="Foto ' + e(k.nama) + '"><div><h2 style="font-size:21px">' + e(k.nama) + '</h2><p class="muted small">' + e(k.panggilan ? 'Panggil: ' + k.panggilan : '') + (k.sejak ? ' · kurir sejak ' + e(k.sejak) : '') + '</p>' +
          '<div class="small st-' + e(k.status) + '" style="margin-top:4px;font-weight:600"><i class="dot ' + (k.status === 'online' ? 'pulse' : '') + '"></i> ' + (ST_LABEL[k.status] || k.status) + '</div></div></div>' +
          '<div class="media"><img src="' + e(K.img(k.foto_url)) + '" alt="Foto kurir" loading="lazy" data-g="' + e(K.img(k.foto_url)) + '" data-c="' + e(k.nama) + '"><img src="' + e(K.img(k.motor_url)) + '" alt="Motor ' + e(k.motor_nama) + '" loading="lazy" data-g="' + e(K.img(k.motor_url)) + '" data-c="' + e(k.motor_nama + ' · ' + k.plat) + '"></div>' +
          '<table class="tbl"><tbody><tr><td class="muted">Kendaraan</td><td><b>' + e(k.motor_nama) + '</b></td></tr><tr><td class="muted">Plat nomor</td><td><b>' + e(k.plat) + '</b></td></tr><tr><td class="muted">Area</td><td>' + e(k.area) + '</td></tr></tbody></table>' +
          (k.bio ? '<p>' + e(k.bio) + '</p>' : '') +
          '<button class="btn pri block" data-pk="' + e(k.id) + '" ' + (ST.buka && k.status === 'online' ? '' : 'disabled') + '>' + I('two_wheeler') + (k.status === 'online' && ST.buka ? 'Pesan lewat ' + e(k.panggilan || k.nama.split(' ')[0]) : 'Belum bisa dipesan') + '</button></article>';
      }).join('') + '</div></div>' + footer();
    $$('.media img').forEach(function (i) { i.style.cursor = 'zoom-in'; i.onclick = function () { K.lightbox(i.dataset.g, i.dataset.c); }; });
    $$('[data-pk]').forEach(function (b) { b.onclick = function () { const k = P.kurir.filter(function (x) { return x.id === b.dataset.pk; })[0]; O = null; location.hash = '#/pesan'; setTimeout(function () { if (O) { O.kurirWa = k.wa; O.kurirId = k.id; K.toast('Pesanan akan dikirim ke WA ' + (k.panggilan || k.nama) + '.'); } }, 50); }; });
  }

  /* ======================= PORTAL PENJUAL (HP + PIN) ======================= */
  let PJ = null;   // { token, data }
  function halJualan() {
    if (!F('fitur_penjual')) { app.innerHTML = '<div class="wrap"><div class="empty">' + I('block') + 'Pendaftaran penjual sedang ditutup.</div></div>'; return; }
    const tok = K.get('ptoken', '');
    if (tok) { if (PJ && PJ.token === tok) return dasborPenjual(); app.innerHTML = '<div class="wrap"><div class="skel" style="height:160px;margin-top:20px"></div></div>'; return muatPenjual(tok); }
    const s = P.settings, syarat = String(s.syarat_jualan || '').split('\n').filter(String);
    app.innerHTML = '<div class="wrap">' + judul('Mau Jualan di Sini?', s.teks_jualan) +
      '<div class="order-layout"><div class="card pad-lg"><div class="seg light" style="grid-template-columns:1fr 1fr;margin:0 0 18px" role="tablist"><button class="on" data-tab="daftar">Daftar baru</button><button data-tab="masuk">Sudah punya akun</button></div><div id="pjForm"></div></div>' +
      '<aside class="card"><h3 style="font-size:17px">Syarat penjual</h3><ul style="padding-left:20px;margin:10px 0 0">' + syarat.map(function (x) { return '<li style="margin:6px 0">' + e(x) + '</li>'; }).join('') + '</ul>' +
      '<p class="small muted" style="margin-top:12px">' + I('verified_user') + ' Setelah mendaftar, admin akan memeriksa data Anda. Produk baru bisa diposting setelah akun disetujui.</p></aside></div></div>' + footer();
    const tab = function (t) {
      $$('[data-tab]').forEach(function (b) { b.classList.toggle('on', b.dataset.tab === t); });
      const kat = String(P.settings.kategori_produk || '').split(',').map(function (x) { return x.trim(); });
      $('#pjForm').innerHTML = t === 'daftar' ?
        '<div class="stack"><div class="grid2"><label class="field"><span>Nama Anda *</span><input class="input" name="nama" autocomplete="name"></label><label class="field"><span>Nama usaha / jualan *</span><input class="input" name="nama_usaha"></label></div>' +
        '<div class="grid2"><label class="field"><span>Nomor HP (WhatsApp) *</span><input class="input" name="hp" inputmode="tel" autocomplete="tel" placeholder="08…"></label><label class="field"><span>Kategori</span><select class="input" name="kategori">' + kat.map(function (k) { return '<option>' + e(k) + '</option>'; }).join('') + '</select></label></div>' +
        '<label class="field"><span>Alamat usaha</span><input class="input" name="alamat" placeholder="Jalan, patokan"></label><div class="row"><button class="btn sm line" type="button" data-loc>' + I('my_location') + 'Simpan titik lokasi usaha</button><span class="tiny muted" data-locinfo></span></div>' +
        '<div class="grid2"><label class="field"><span>Buat PIN (6 angka) *</span><input class="input pin" name="pin" inputmode="numeric" maxlength="6" type="password" autocomplete="new-password"></label><label class="field"><span>Ulangi PIN *</span><input class="input pin" name="pin2" inputmode="numeric" maxlength="6" type="password" autocomplete="new-password"></label></div>' +
        '<button class="btn pri block lg" data-go>' + I('how_to_reg') + 'Daftar sebagai penjual</button></div>' :
        '<div class="stack"><label class="field"><span>Nomor HP</span><input class="input" name="hp" inputmode="tel" autocomplete="tel" placeholder="08…"></label><label class="field"><span>PIN 6 angka</span><input class="input pin" name="pin" inputmode="numeric" maxlength="6" type="password" autocomplete="current-password"></label>' +
        '<button class="btn pri block lg" data-go>' + I('login') + 'Masuk</button><p class="small muted">Lupa PIN? <a href="' + e(K.waLink(P.settings.wa_admin, 'Halo admin, saya penjual dan lupa PIN. Nomor HP saya: ')) + '" target="_blank" rel="noopener">Minta reset ke admin</a>.</p></div>';
      let lok = null;
      const lb = $('[data-loc]'); if (lb) lb.onclick = function () { K.busy(lb, true, 'Mencari…'); K.gps().then(function (p) { lok = p; $('[data-locinfo]').textContent = '✓ Titik tersimpan'; }).catch(function (er) { K.toast(er.message, 'bad'); }).then(function () { K.busy(lb, false); }); };
      $('[data-go]').onclick = function () {
        const v = {}; $$('#pjForm [name]').forEach(function (i) { v[i.name] = i.value.trim(); });
        if (t === 'daftar' && v.pin !== v.pin2) return K.toast('Kedua PIN tidak sama.', 'bad');
        if (lok) { v.lat = lok.lat; v.lng = lok.lng; v.link_maps = K.mapsLink(lok); }
        const b = $('[data-go]'); K.busy(b, true);
        K.api(t === 'daftar' ? 'p.daftar' : 'p.masuk', v).then(function (r) {
          K.busy(b, false); if (!r.success) return K.toast(r.message, 'bad');
          K.set('ptoken', r.data.token); K.toast(r.message || 'Berhasil masuk.', 'ok'); PJ = null; halJualan();
        });
      };
    };
    $$('[data-tab]').forEach(function (b) { b.onclick = function () { tab(b.dataset.tab); }; }); tab('daftar');
  }
  function muatPenjual(tok) {
    K.api('p.saya', {}, tok).then(function (r) {
      if (!r.success) { if (r.data && r.data.code === 'AUTH' || /tidak aktif|Sesi/.test(r.message)) { K.del('ptoken'); K.toast(r.message, 'bad'); } else K.toast(r.message, 'bad'); PJ = null; return halJualan(); }
      PJ = { token: tok, data: r.data }; if (rute === 'jualan') dasborPenjual();
    });
  }
  function dasborPenjual() {
    const d = PJ.data, p = d.penjual, s = P.settings;
    const stat = { menunggu: ['warn', 'hourglass_top', 'Menunggu persetujuan admin', 'Data Anda sedang diperiksa. Biasanya kurang dari 1×24 jam.'], disetujui: ['ok', 'verified', 'Akun disetujui', 'Anda bisa memposting produk.'], ditolak: ['bad', 'cancel', 'Pendaftaran ditolak', p.catatan || 'Hubungi admin untuk informasi lebih lanjut.'], diblokir: ['bad', 'block', 'Akun diblokir', 'Hubungi admin.'] }[p.status] || ['', 'info', p.status, ''];
    const LT = { tayang: ['ok', 'Tayang'], menunggu: ['warn', 'Menunggu admin'], ditolak: ['bad', 'Ditolak'] };
    app.innerHTML = '<div class="wrap">' + judul('Halo, ' + p.nama.split(' ')[0] + ' 👋', p.nama_usaha) +
      (p.wajib_ganti ? '<div class="closed-bar" style="background:var(--warn-soft)">' + I('key') + '<div><b style="color:var(--warn)">PIN Anda baru direset admin.</b> Ganti PIN sekarang demi keamanan. <button class="btn sm pri" style="margin-top:8px" data-gpin>Ganti PIN</button></div></div>' : '') +
      '<div class="card row" style="margin-top:12px;align-items:flex-start;background:var(--' + stat[0] + '-soft)">' + I(stat[1], 'fill') + '<div class="grow"><b>' + e(stat[2]) + '</b><p class="small" style="margin-top:2px">' + e(stat[3]) + '</p>' +
      (p.status === 'menunggu' ? '<a class="btn sm wa" style="margin-top:10px" target="_blank" rel="noopener" href="' + e(K.waLink(s.wa_admin, 'Halo admin ' + s.nama_usaha + ', saya baru mendaftar sebagai penjual: *' + p.nama_usaha + '* (' + p.hp + '). Mohon diperiksa 🙏')) + '">' + I('chat') + 'Kabari admin</a>' : '') + '</div></div>' +
      '<div class="sec-h" style="margin-top:22px"><h2>Produk saya (' + d.produk.length + ')</h2>' + (p.status === 'disetujui' ? '<button class="btn pri sm" data-baru>' + I('add') + 'Tambah</button>' : '') + '</div>' +
      (d.moderasi && p.status === 'disetujui' ? '<p class="small muted" style="margin:-6px 0 12px">' + I('info') + ' Produk baru/yang diubah tayang setelah diperiksa admin.</p>' : '') +
      '<div class="list">' + (d.produk.map(function (x) {
        const l = LT[x.status_tayang] || ['', x.status_tayang];
        return '<div class="item"><img class="th" src="' + e(K.img(x.foto[0])) + '" alt=""><div class="grow"><div class="tt">' + e(x.nama) + '</div><div class="ss num">' + K.rp(x.harga) + ' · <span class="badge ' + l[0] + '">' + l[1] + '</span>' + (x.stok === 'habis' ? ' <span class="badge bad">Habis</span>' : '') + '</div>' + (x.catatan_admin ? '<div class="tiny" style="color:var(--bad)">Admin: ' + e(x.catatan_admin) + '</div>' : '') + '</div>' +
          '<div class="act"><button class="ibtn" data-stok="' + e(x.id) + '" aria-label="Ubah stok">' + I(x.stok === 'habis' ? 'inventory' : 'remove_shopping_cart') + '</button><button class="ibtn" data-ubah="' + e(x.id) + '" aria-label="Ubah">' + I('edit') + '</button><button class="ibtn" data-hapus="' + e(x.id) + '" aria-label="Hapus">' + I('delete') + '</button></div></div>';
      }).join('') || '<div class="empty">' + I('inventory_2') + (p.status === 'disetujui' ? 'Belum ada produk. Tekan Tambah.' : 'Produk bisa ditambahkan setelah akun disetujui.') + '</div>') + '</div>' +
      '<div class="row wrapx" style="margin:22px 0"><button class="btn line" data-profil>' + I('storefront') + 'Profil usaha</button><button class="btn line" data-gpin>' + I('key') + 'Ganti PIN</button><button class="btn ghost" data-keluar>' + I('logout') + 'Keluar</button></div></div>';
    const b = $('[data-baru]'); if (b) b.onclick = function () { formProdukPenjual(null); };
    $$('[data-ubah]').forEach(function (x) { x.onclick = function () { formProdukPenjual(d.produk.filter(function (q) { return q.id === x.dataset.ubah; })[0]); }; });
    $$('[data-stok]').forEach(function (x) { x.onclick = function () { const q = d.produk.filter(function (y) { return y.id === x.dataset.stok; })[0]; aksiPenjual('p.produkSave', Object.assign({}, q, { foto_urls: q.foto, stok: q.stok === 'habis' ? 'tersedia' : 'habis', ubahIsi: false })); }; });
    $$('[data-hapus]').forEach(function (x) { x.onclick = function () { K.konfirmasi('Hapus produk?', 'Produk dan fotonya akan dihapus permanen.', 'Hapus', true).then(function (y) { if (y) aksiPenjual('p.produkHapus', { id: x.dataset.hapus }); }); }; });
    $$('[data-gpin]').forEach(function (x) { x.onclick = gantiPin; });
    $('[data-profil]').onclick = profilPenjual;
    $('[data-keluar]').onclick = function () { K.del('ptoken'); PJ = null; halJualan(); };
  }
  function aksiPenjual(aksi, data, sh, btn) {
    K.busy(btn, true);
    return K.api(aksi, data, PJ.token).then(function (r) { K.busy(btn, false); if (!r.success) { K.toast(r.message, 'bad'); return false; } PJ.data = r.data; K.toast(r.message || 'Tersimpan.', 'ok'); if (sh) sh.close(); dasborPenjual(); return true; });
  }
  function fotoPicker(wadah, list, folder, token, aksi, maks) {
    const gambar = function () {
      wadah.innerHTML = list.map(function (u, i) { return '<div class="im"><img src="' + e(K.img(u)) + '" alt=""><button type="button" data-rm="' + i + '" aria-label="Hapus foto">' + I('close') + '</button></div>'; }).join('') +
        (list.length < (maks || 5) ? '<label class="add">' + I('add_a_photo') + '<input type="file" accept="image/*" multiple class="sr"></label>' : '');
      $$('[data-rm]', wadah).forEach(function (b) { b.onclick = function () { list.splice(+b.dataset.rm, 1); gambar(); }; });
      const inp = $('input[type=file]', wadah); if (inp) inp.onchange = function () {
        const fs = [].slice.call(inp.files).slice(0, (maks || 5) - list.length); if (!fs.length) return;
        wadah.querySelector('.add').innerHTML = I('progress_activity');
        fs.reduce(function (pr, f) { return pr.then(function () { return K.unggah(f, folder, token, aksi).then(function (u) { list.push(u); }); }); }, Promise.resolve())
          .catch(function (er) { K.toast(er.message, 'bad'); }).then(gambar);
      };
    };
    gambar(); return list;
  }
  function formProdukPenjual(x) {
    x = x || {}; const kat = String(PJ.data.kategori || '').split(',').map(function (k) { return k.trim(); });
    const sh = K.sheet({ title: x.id ? 'Ubah produk' : 'Produk baru', html: '<div class="stack"><div><span class="lbl">Foto produk (maks. 5) *</span><div class="imgs" id="fp"></div><p class="hint">Foto otomatis dikecilkan sebelum diunggah.</p></div>' +
      '<label class="field"><span>Nama produk *</span><input class="input" name="nama" value="' + e(x.nama || '') + '"></label>' +
      '<div class="grid2"><label class="field"><span>Harga *</span><input class="input" name="harga" inputmode="numeric" value="' + e(x.harga || '') + '"></label><label class="field"><span>Harga coret (opsional)</span><input class="input" name="harga_coret" inputmode="numeric" value="' + e(x.harga_coret || '') + '"></label></div>' +
      '<div class="grid2"><label class="field"><span>Kategori</span><select class="input" name="kategori">' + kat.map(function (k) { return '<option ' + (k === x.kategori ? 'selected' : '') + '>' + e(k) + '</option>'; }).join('') + '</select></label><label class="field"><span>Satuan</span><input class="input" name="satuan" placeholder="porsi / pak / kg" value="' + e(x.satuan || '') + '"></label></div>' +
      '<label class="field"><span>Deskripsi</span><textarea class="input" name="deskripsi">' + e(x.deskripsi || '') + '</textarea></label></div>',
      foot: '<button class="btn line" data-x>Batal</button><button class="btn pri" data-simpan>' + I('save') + 'Simpan</button>' });
    const foto = fotoPicker($('#fp', sh.el), (x.foto || []).slice(), 'Produk_Penjual', PJ.token, 'p.upload', 5);
    sh.el.querySelector('[data-simpan]').onclick = function (ev) {
      const v = { id: x.id, foto_urls: foto, stok: x.stok || 'tersedia', ubahIsi: true }; $$('[name]', sh.el).forEach(function (i) { v[i.name] = i.value.trim(); });
      aksiPenjual('p.produkSave', v, sh, ev.currentTarget);
    };
  }
  function profilPenjual() {
    const p = PJ.data.penjual; let foto = p.foto_url ? [p.foto_url] : [], lok = p.lat ? { lat: p.lat, lng: p.lng } : null;
    const sh = K.sheet({ title: 'Profil usaha', html: '<div class="stack"><div><span class="lbl">Foto / logo usaha</span><div class="imgs" id="fpp"></div></div>' +
      ['nama|Nama Anda', 'nama_usaha|Nama usaha', 'alamat|Alamat'].map(function (f) { f = f.split('|'); return '<label class="field"><span>' + f[1] + '</span><input class="input" name="' + f[0] + '" value="' + e(p[f[0]] || '') + '"></label>'; }).join('') +
      '<div class="row"><button class="btn sm line" type="button" data-loc>' + I('my_location') + 'Perbarui titik lokasi</button><span class="tiny muted" data-li>' + (lok ? '✓ Titik tersimpan' : 'Belum ada titik') + '</span></div>' +
      '<label class="field"><span>Deskripsi usaha</span><textarea class="input" name="deskripsi">' + e(p.deskripsi || '') + '</textarea></label><p class="hint">Nomor HP: ' + e(p.hp) + ' (hubungi admin untuk mengganti).</p></div>',
      foot: '<button class="btn line" data-x>Batal</button><button class="btn pri" data-simpan>' + I('save') + 'Simpan</button>' });
    fotoPicker($('#fpp', sh.el), foto, 'Produk_Penjual', PJ.token, 'p.upload', 1);
    sh.el.querySelector('[data-loc]').onclick = function (ev) { const b = ev.currentTarget; K.busy(b, true, 'Mencari…'); K.gps().then(function (g) { lok = g; sh.el.querySelector('[data-li]').textContent = '✓ Titik diperbarui'; }).catch(function (er) { K.toast(er.message, 'bad'); }).then(function () { K.busy(b, false); }); };
    sh.el.querySelector('[data-simpan]').onclick = function (ev) { const v = { foto_url: foto[0] || '' }; $$('[name]', sh.el).forEach(function (i) { v[i.name] = i.value.trim(); }); if (lok) { v.lat = lok.lat; v.lng = lok.lng; v.link_maps = K.mapsLink(lok); } aksiPenjual('p.profil', v, sh, ev.currentTarget); };
  }
  function gantiPin() {
    const sh = K.sheet({ title: 'Ganti PIN', html: '<div class="stack"><label class="field"><span>PIN lama</span><input class="input pin" name="lama" inputmode="numeric" maxlength="6" type="password"></label><label class="field"><span>PIN baru (6 angka)</span><input class="input pin" name="baru" inputmode="numeric" maxlength="6" type="password"></label></div>',
      foot: '<button class="btn line" data-x>Batal</button><button class="btn pri" data-simpan>Simpan PIN</button>' });
    sh.el.querySelector('[data-simpan]').onclick = function (ev) {
      const b = ev.currentTarget; K.busy(b, true);
      K.api('p.pin', { lama: $('[name=lama]', sh.el).value, baru: $('[name=baru]', sh.el).value }, PJ.token).then(function (r) { K.busy(b, false); if (!r.success) return K.toast(r.message, 'bad'); K.set('ptoken', r.data.token); PJ = null; sh.close(); K.toast('PIN diganti.', 'ok'); halJualan(); });
    };
  }

  mulai();
})();
