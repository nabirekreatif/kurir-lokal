/* Kurir Lokal — dasbor admin & kurir · © Nabire Kreatif */
(function () {
  'use strict';
  const K = window.K, $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  const e = K.esc, I = K.ikon, root = $('#root');
  const A = { token: K.get('atoken', ''), user: null, D: null };
  const LV = { kurir: 1, admin: 2, superadmin: 3 };
  const boleh = function (p) { return A.user && LV[A.user.peran] >= LV[p]; };
  const S = function () { return A.D.settings; };

  const FITUR = [
    ['fitur_produk', 'Etalase produk & menu jualan', 'storefront'], ['fitur_penjual', 'Pendaftaran penjual (pasang jualan)', 'add_business'],
    ['fitur_moderasi', 'Produk penjual wajib disetujui admin', 'fact_check'], ['fitur_keranjang', 'Keranjang (pesan beberapa produk)', 'shopping_cart'],
    ['fitur_wa_penjual', 'Tombol chat langsung ke WA penjual', 'chat'], ['fitur_galeri', 'Galeri foto menu/jualan', 'photo_library'],
    ['fitur_banner', 'Slide promo di beranda', 'view_carousel'], ['fitur_cek_tarif', 'Halaman cek tarif ongkir', 'calculate'],
    ['fitur_peta', 'Pilih titik di peta', 'map'], ['fitur_gps', 'Tombol "Lokasi saya" (GPS)', 'my_location'],
    ['fitur_jarak_jalan', 'Jarak lewat jalan raya (lebih akurat)', 'route'], ['fitur_tarif_malam', 'Biaya tambahan malam hari', 'dark_mode'],
    ['fitur_profil_kurir', 'Halaman profil kurir', 'badge'], ['fitur_catat_pesanan', 'Catat pesanan ke dasbor', 'receipt_long'],
    ['fitur_broadcast', 'Broadcast promosi ke grup WA', 'campaign'], ['fitur_faq', 'Tanya jawab di beranda', 'quiz'],
    ['fitur_info_bayar', 'Info pembayaran', 'payments'], ['fitur_jadwal', 'Buka/tutup otomatis sesuai jam', 'schedule'],
    ['fitur_notif_wa', 'Kabari admin via Fonnte (penjual/produk baru)', 'notifications_active'],
    ['fitur_lacak', 'Lacak pesanan & posisi kurir (link tracking)', 'location_searching'], ['fitur_favorit', 'Favorit pelanggan (produk & foto)', 'favorite'],
    ['fitur_menu_kategori', 'Menu kategori ala aplikasi (4×2)', 'apps'], ['fitur_bagikan', 'Bagikan + QR Code & tombol Install', 'qr_code_2']
  ];
  const MENU = [
    ['beranda', 'space_dashboard', 'Beranda', 'kurir', 'Utama'], ['pesanan', 'receipt_long', 'Pesanan', 'kurir'], ['profil', 'badge', 'Profil Saya', 'kurir', '', 'kurirSaja'],
    ['produk', 'storefront', 'Produk', 'admin'], ['penjual', 'groups', 'Penjual', 'admin'], ['broadcast', 'campaign', 'Broadcast', 'kurir'],
    ['layanan', 'two_wheeler', 'Layanan', 'admin', 'Atur'], ['tarif', 'calculate', 'Tarif Jarak', 'admin'], ['kurir', 'sports_motorsports', 'Kurir', 'admin'],
    ['jam', 'schedule', 'Jam & Status', 'admin'], ['tampilan', 'palette', 'Tampilan & Menu', 'admin'], ['galeri', 'photo_library', 'Galeri', 'admin'], ['banner', 'view_carousel', 'Slide Sampul', 'admin'],
    ['fitur', 'toggle_on', 'Fitur On/Off', 'admin'], ['pengaturan', 'tune', 'Pengaturan', 'admin'],
    ['akun', 'manage_accounts', 'Akun & Keamanan', 'kurir', 'Sistem']
  ];

  /* ======================= LOGIN ======================= */
  function login(pesan) {
    document.body.className = 'adm';
    root.innerHTML = '<div class="login-wrap"><div class="card stack-lg"><div class="row"><img src="' + e(K.img('assets/logo.png')) + '" width="48" height="48" style="border-radius:14px" alt=""><div><h1 style="font-size:22px">Dasbor Kurir</h1><p class="small muted">Masuk untuk mengelola pesanan & toko</p></div></div>' +
      (pesan ? '<div class="closed-bar" style="margin:0">' + I('info') + '<span>' + e(pesan) + '</span></div>' : '') +
      '<label class="field"><span>Username</span><input class="input" id="un" autocomplete="username" autocapitalize="none"></label><label class="field"><span>Sandi</span><input class="input" id="pw" type="password" autocomplete="current-password"></label>' +
      '<button class="btn pri block lg" id="masuk">' + I('login') + 'Masuk</button>' + (K.DEMO ? '<p class="small muted">Mode demo: <b>superadmin</b> / <b>demo1234</b> atau <b>kurir_demo</b> / <b>demo1234</b></p>' : '<p class="small muted">Lupa sandi superadmin? Jalankan <code>resetPasswordSuperadmin</code> di editor Apps Script.</p>') +
      '<a class="small" href="../">← Kembali ke halaman utama</a></div></div>';
    const go = function () {
      const b = $('#masuk'); K.busy(b, true);
      K.api('login', { username: $('#un').value, password: $('#pw').value }).then(function (r) {
        K.busy(b, false); if (!r.success) return K.toast(r.message, 'bad');
        A.token = r.data.token; K.set('atoken', A.token);
        if (r.data.mustChange) return wajibGanti(); boot();
      });
    };
    $('#masuk').onclick = go; $('#pw').addEventListener('keydown', function (ev) { if (ev.key === 'Enter') go(); });
  }
  function wajibGanti() {
    document.body.className = 'adm';
    root.innerHTML = '<div class="login-wrap"><div class="card stack-lg"><h1 style="font-size:22px">Ganti sandi dulu</h1><p class="small muted">Demi keamanan, sandi sementara wajib diganti. Minimal 8 karakter, berisi huruf dan angka.</p>' +
      '<label class="field"><span>Sandi sementara</span><input class="input" id="l" type="password"></label><label class="field"><span>Sandi baru</span><input class="input" id="b" type="password" autocomplete="new-password"></label>' +
      '<button class="btn pri block lg" id="ok">Simpan & lanjut</button></div></div>';
    $('#ok').onclick = function () { const b = $('#ok'); K.busy(b, true); K.api('password', { lama: $('#l').value, baru: $('#b').value }, A.token).then(function (r) { K.busy(b, false); if (!r.success) return K.toast(r.message, 'bad'); A.token = r.data.token; K.set('atoken', A.token); K.toast('Sandi diganti.', 'ok'); boot(); }); };
  }
  function keluar() { clearInterval(cekT); if (lok.on) lokasiStop(true); K.del('atoken'); A.token = ''; A.user = null; A.D = null; login(); }

  /* ======================= BOOT ======================= */
  function boot() {
    if (!A.token) { tutupSplash(); return login(); }
    K.api('boot', {}, A.token).then(function (r) {
      tutupSplash();
      if (!r.success) { if (r.data && (r.data.code === 'AUTH')) { K.del('atoken'); return login(r.message); } if (r.data && r.data.code === 'MUST_CHANGE') return wajibGanti(); return login(r.message); }
      A.D = r.data; A.user = r.data.user; K.terapkanTema(S()); shell(); window.onhashchange = halaman; halaman(); mulaiPantau();
    });
  }
  function tutupSplash() { const s = $('#splash'); if (s) { s.classList.add('out'); setTimeout(function () { s.remove(); }, 450); } }
  function muatUlang() { return K.api('boot', {}, A.token).then(function (r) { if (r.success) { A.D = r.data; halaman(); } }); }
  /** Panggil API dasbor; tampilkan pesan; kembalikan data bila sukses. */
  function api(aksi, data, btn) {
    K.busy(btn, true);
    return K.api(aksi, data, A.token).then(function (r) {
      K.busy(btn, false);
      if (!r.success) { if (r.data && r.data.code === 'AUTH') { keluar(); } K.toast(r.message, 'bad'); throw new Error(r.message); }
      if (r.message) K.toast(r.message, 'ok'); return r.data;
    });
  }

  /* ======================= SHELL ======================= */
  function menuSaya() { return MENU.filter(function (m) { return boleh(m[3]) && (m[5] !== 'kurirSaja' || A.user.peran === 'kurir'); }); }
  function hitungan() {
    const D = A.D;
    return { pesanan: (D.pesanan || []).filter(function (p) { return p.status === 'baru'; }).length, penjual: (D.penjual || []).filter(function (p) { return p.status === 'menunggu'; }).length,
      produk: (D.produk || []).filter(function (p) { return p.status_tayang === 'menunggu'; }).length };
  }
  function shell() {
    document.body.className = 'adm';
    let grp = '';
    const side = menuSaya().map(function (m) { const g = m[4] && m[4] !== grp ? '<div class="grp">' + e(m[4]) + '</div>' : ''; if (m[4]) grp = m[4]; return g + '<a href="#/' + m[0] + '" data-m="' + m[0] + '">' + I(m[1]) + '<span class="grow">' + e(m[2]) + '</span><span class="badge bad hide" data-c="' + m[0] + '"></span></a>'; }).join('');
    const bn = [['beranda', 'space_dashboard', 'Beranda'], ['pesanan', 'receipt_long', 'Pesanan'], boleh('admin') ? ['produk', 'storefront', 'Produk'] : ['broadcast', 'campaign', 'Promosi'], boleh('admin') ? ['penjual', 'groups', 'Penjual'] : ['profil', 'badge', 'Profil'], ['menu', 'apps', 'Menu']];
    root.innerHTML = '<div class="adm-shell"><aside class="side"><a class="brand" href="#/beranda"><img src="' + e(K.img(S().logo_url)) + '" alt="" width="40" height="40"><b>' + e(S().nama_usaha) + '</b></a>' + side +
      '<div style="margin-top:auto;padding-top:16px"><a href="../" target="_blank" rel="noopener">' + I('open_in_new') + 'Lihat situs</a><a href="#" data-out>' + I('logout') + 'Keluar</a></div></aside>' +
      '<div class="adm-main"><header class="adm-top"><div class="in"><button class="ibtn hide" id="back" aria-label="Kembali">' + I('arrow_back') + '</button><h1 id="ttl">Beranda</h1>' +
      '<span class="status-pill" id="pill"></span><button class="ibtn" id="tm" aria-label="Mode gelap">' + I('dark_mode') + '</button><a class="ibtn" href="../" target="_blank" rel="noopener" aria-label="Lihat situs">' + I('open_in_new') + '</a></div></header>' +
      (K.DEMO ? '<div class="demo-ribbon">Mode demo — perubahan hanya tersimpan di browser ini.</div>' : '') +
      '<div class="adm-body" id="pg"></div><nav class="bnav"><div class="bnav-in">' + bn.map(function (n) { return '<a href="#/' + n[0] + '" data-b="' + n[0] + '">' + I(n[1]) + '<span>' + n[2] + '</span><span class="cnt hide" data-cb="' + n[0] + '"></span></a>'; }).join('') + '</div></nav></div></div>';
    $('[data-out]').onclick = function (ev) { ev.preventDefault(); keluar(); };
    $('#tm').onclick = function () { K.gantiTema(S()); };
    $('#back').onclick = function () { location.hash = '#/menu'; };
  }
  function perbaruiShell(id, judul) {
    const st = statusKini(), pill = $('#pill');
    pill.className = 'status-pill ' + (st.buka ? 'buka' : 'tutup'); pill.innerHTML = '<i class="dot"></i>' + (st.buka ? 'Buka' : 'Tutup');
    $('#ttl').textContent = judul; document.title = judul + ' · Dasbor ' + S().nama_usaha;
    $$('[data-m]').forEach(function (a) { a.classList.toggle('on', a.dataset.m === id); });
    const utama = ['beranda', 'pesanan', 'produk', 'penjual', 'menu', 'broadcast', 'profil'];
    $$('[data-b]').forEach(function (a) { a.classList.toggle('on', a.dataset.b === id || (a.dataset.b === 'menu' && utama.indexOf(id) < 0)); });
    $('#back').classList.toggle('hide', utama.indexOf(id) > -1);
    const c = hitungan();
    ['pesanan', 'penjual', 'produk'].forEach(function (k) {
      $$('[data-c="' + k + '"],[data-cb="' + k + '"]').forEach(function (b) { b.textContent = c[k]; b.classList.toggle('hide', !c[k]); });
    });
  }
  function statusKini() { return K.status({ settings: S(), kurir: (A.D.kurir || []).filter(function (k) { return k.aktif; }), tz: A.D.tz }); }

  /* ======================= ROUTER ======================= */
  function halaman() {
    const id = location.hash.replace(/^#\/?/, '').split('/')[0] || 'beranda';
    const m = MENU.filter(function (x) { return x[0] === id; })[0];
    if (m && !boleh(m[3])) { location.hash = '#/beranda'; return; }
    const pg = $('#pg'); pg.innerHTML = '';
    const fn = { beranda: hBeranda, pesanan: hPesanan, profil: hProfil, produk: hProduk, penjual: hPenjual, broadcast: hBroadcast, layanan: hLayanan, tarif: hTarif, kurir: hKurir,
      jam: hJam, tampilan: hTampilan, galeri: hGaleri, banner: hBanner, fitur: hFitur, pengaturan: hPengaturan, akun: hAkun, menu: hMenu }[id] || hBeranda;
    perbaruiShell(id, id === 'menu' ? 'Menu' : m ? m[2] : 'Beranda');
    fn(pg); scrollTo(0, 0);
  }

  /* ======================= FORM GENERIK ======================= */
  const kats = function () { return String(S().kategori_produk || '').split(',').map(function (x) { return x.trim(); }).filter(String); };
  const FORM = {
    Layanan: function () { return [['nama', 'Nama layanan *'], ['ikon', 'Ikon', 'icon'], ['deskripsi', 'Keterangan singkat', 'textarea'],
      ['butuh_a', 'Pakai titik pertama (jemput/ambil/beli di)', 'bool'], ['label_a', 'Label titik pertama', 'text', 'Contoh: Jemput di / Beli di / Ambil barang di'],
      ['butuh_b', 'Pakai titik kedua (antar/tujuan)', 'bool'], ['label_b', 'Label titik kedua', 'text', 'Contoh: Antar ke / Tujuan'],
      ['form_daftar', 'Pakai kolom daftar (pesanan/belanjaan)', 'bool'], ['label_daftar', 'Label kolom daftar'],
      ['tarif_mode', 'Cara hitung tarif', 'select', [['jarak', 'Sesuai jarak'], ['flat', 'Tarif tetap'], ['nego', 'Dikonfirmasi admin']]],
      ['tarif_flat', 'Tarif tetap (bila "Tarif tetap")', 'money'], ['biaya_tambah', 'Biaya tambahan layanan', 'money', 'Mis. biaya talangan belanja'],
      ['catatan_ph', 'Contoh isi catatan'], ['aktif', 'Tampilkan', 'bool']]; },
    Tarif: function () { return [['km_dari', 'Dari km', 'number'], ['km_sampai', 'Sampai km', 'number'], ['harga', 'Tarif', 'money']]; },
    Kurir: function () { return [['foto_url', 'Foto profil kurir', 'image', 'Kurir'], ['motor_url', 'Foto motor', 'image', 'Kurir'], ['nama', 'Nama lengkap *'], ['panggilan', 'Nama panggilan'], ['wa', 'Nomor WA kurir', 'hp'],
      ['motor_nama', 'Merek & tipe motor'], ['plat', 'Plat nomor'], ['area', 'Area layanan'], ['sejak', 'Kurir sejak (tahun)'], ['bio', 'Perkenalan singkat', 'textarea'],
      ['status', 'Status', 'select', [['online', 'Online'], ['sibuk', 'Sedang antar'], ['offline', 'Offline']]], ['aktif', 'Tampilkan di situs', 'bool']]; },
    Produk: function () { return [['foto_urls', 'Foto produk (maks. 5)', 'images', 'Produk'], ['nama', 'Nama produk *'], ['kategori', 'Kategori', 'select', kats().map(function (k) { return [k, k]; })],
      ['harga', 'Harga', 'money'], ['harga_coret', 'Harga coret (opsional)', 'money'], ['satuan', 'Satuan'], ['deskripsi', 'Deskripsi', 'textarea'],
      ['pemilik', 'Pemilik', 'select', [['kurir', 'Jualan kurir sendiri'], ['penjual', 'Milik penjual/mitra']]],
      ['penjual_id', 'Penjual (bila milik mitra)', 'select', [['', '—']].concat((A.D.penjual || []).map(function (p) { return [p.id, p.nama_usaha]; }))],
      ['status_tayang', 'Status tayang', 'select', [['tayang', 'Tayang'], ['menunggu', 'Menunggu'], ['ditolak', 'Ditolak']]], ['stok', 'Stok', 'select', [['tersedia', 'Tersedia'], ['habis', 'Habis']]],
      ['unggulan', 'Produk unggulan (tampil di beranda & broadcast)', 'bool'], ['catatan_admin', 'Catatan untuk penjual'], ['aktif', 'Aktif', 'bool']]; },
    Penjual: function () { return [['foto_url', 'Foto/logo usaha', 'image', 'Penjual'], ['nama', 'Nama pemilik'], ['nama_usaha', 'Nama usaha'], ['hp', 'Nomor HP (login)', 'hp'], ['kategori', 'Kategori'],
      ['alamat', 'Alamat'], ['link_maps', 'Link Google Maps'], ['deskripsi', 'Deskripsi', 'textarea'],
      ['status', 'Status', 'select', [['menunggu', 'Menunggu'], ['disetujui', 'Disetujui'], ['ditolak', 'Ditolak'], ['diblokir', 'Diblokir']]], ['catatan', 'Catatan admin']]; },
    Galeri: function () { return [['foto_url', 'Foto *', 'image', 'Galeri'], ['tipe', 'Galeri', 'select', K.galeriDaftar(S(), true).map(function (g) { return [g.id, g.nama]; })], ['kategori', 'Kategori (mis. HP, Makanan, Kue)', 'text', 'Ketik kategori baru atau yang sudah ada: ' + kategoriGaleri().join(', ')],
      ['usaha', 'Nama usaha pelanggan (opsional)', 'text', 'Tampil di foto & ikut dikirim di pesan WA'], ['judul', 'Keterangan foto'], ['tag', 'Kata kunci pencarian (opsional)'], ['aktif', 'Tampilkan', 'bool']]; },
    Banner: function () { return [['gambar_url', 'Gambar (rasio 2:1) *', 'image', 'Banner'], ['judul', 'Judul'], ['sub', 'Subjudul'], ['tujuan', 'Tujuan saat diklik', 'text', '#/pesan · #/produk · #/jualan · #/tarif · atau https://…'], ['aktif', 'Tampilkan', 'bool']]; },
    Broadcast: function () { return [['judul', 'Nama template'], ['pesan', 'Isi pesan *', 'textarea', 'Variabel: {nama} {status} {jam} {area} {layanan} {tarif} {produk} {link} {wa} {tanggal}'], ['gambar_url', 'Gambar (opsional)', 'image', 'Broadcast'], ['aktif', 'Aktif', 'bool']]; }
  };
  function kategoriGaleri() { return (A.D.galeri || []).map(function (g) { return g.kategori; }).filter(function (k, i, a) { return k && a.indexOf(k) === i; }); }
  function inputHtml(f, v) {
    const k = f[0], lab = f[1], t = f[2] || 'text', x = f[3];
    if (t === 'bool') return '<div class="set-row"><div class="grow">' + e(lab) + '</div><label class="switch"><input type="checkbox" name="' + k + '" ' + (K.ya(v) || (v === undefined && k === 'aktif') ? 'checked' : '') + '><i></i></label></div>';
    if (t === 'image' || t === 'images') return '<div class="field"><span class="lbl">' + e(lab) + '</span><div class="imgs" data-img="' + k + '" data-folder="' + e(x) + '" data-multi="' + (t === 'images') + '"></div></div>';
    if (t === 'select') return '<label class="field"><span>' + e(lab) + '</span><select class="input" name="' + k + '">' + x.map(function (o) { return '<option value="' + e(o[0]) + '" ' + (String(v) === String(o[0]) ? 'selected' : '') + '>' + e(o[1]) + '</option>'; }).join('') + '</select></label>';
    if (t === 'textarea') return '<label class="field"><span>' + e(lab) + '</span><textarea class="input" name="' + k + '" rows="' + (k === 'pesan' ? 9 : 4) + '">' + e(v) + '</textarea>' + (x ? '<p class="hint">' + e(x) + '</p>' : '') + '</label>';
    if (t === 'icon') return '<label class="field"><span>' + e(lab) + '</span><div class="row"><span class="th" style="width:48px;height:48px;border-radius:12px;display:grid;place-items:center;background:var(--primary-soft);color:var(--accent-text)">' + I(v || 'local_shipping') + '</span><input class="input grow" name="' + k + '" value="' + e(v) + '" placeholder="local_shipping"></div><p class="hint">Nama ikon dari <a href="https://fonts.google.com/icons" target="_blank" rel="noopener">Google Material Symbols</a>, mis. two_wheeler, lunch_dining, package_2.</p></label>';
    const mode = t === 'money' || t === 'number' ? ' inputmode="decimal"' : t === 'hp' ? ' inputmode="tel"' : '';
    return '<label class="field"><span>' + e(lab) + '</span><input class="input" name="' + k + '" value="' + e(v) + '"' + mode + '>' + (x ? '<p class="hint">' + e(x) + '</p>' : '') + '</label>';
  }
  function pasangGambar(wadah, nilai, multi, folder) {
    const list = multi ? K.list(nilai) : (nilai ? [nilai] : []), maks = multi ? 5 : 1;
    const g = function () {
      wadah.innerHTML = list.map(function (u, i) { return '<div class="im"><img src="' + e(K.img(u)) + '" alt=""><button type="button" data-rm="' + i + '" aria-label="Hapus">' + I('close') + '</button></div>'; }).join('') +
        (list.length < maks ? '<label class="add" title="Tambah foto">' + I('add_a_photo') + '<input type="file" accept="image/*" ' + (multi ? 'multiple' : '') + ' class="sr"></label>' : '') +
        (!multi ? '<input class="input" data-url placeholder="atau tempel URL gambar" value="" style="flex:1;min-width:180px;align-self:center">' : '');
      $$('[data-rm]', wadah).forEach(function (b) { b.onclick = function () { list.splice(+b.dataset.rm, 1); g(); }; });
      const u = $('[data-url]', wadah); if (u) u.onchange = function () { if (u.value.trim()) { list.splice(0, 1, u.value.trim()); g(); } };
      const inp = $('input[type=file]', wadah); if (inp) inp.onchange = function () {
        const fs = [].slice.call(inp.files).slice(0, maks - list.length); $('.add', wadah).innerHTML = I('progress_activity');
        fs.reduce(function (p, f) { return p.then(function () { return K.unggah(f, folder, A.token).then(function (url) { list.push(url); }); }); }, Promise.resolve()).catch(function (er) { K.toast(er.message, 'bad'); }).then(g);
      };
    };
    g(); return function () { return multi ? list : (list[0] || ''); };
  }
  /** Buka lembar edit untuk satu baris tabel. */
  function edit(tabel, row, judul, setelah) {
    row = row || {}; const fields = FORM[tabel]();
    const sh = K.sheet({ title: judul || (row.id ? 'Ubah' : 'Tambah') + ' ' + tabel.toLowerCase(), cls: 'wide', html: '<div class="stack">' + fields.map(function (f) { return inputHtml(f, row[f[0]] == null ? (f[2] === 'bool' && !row.id ? true : '') : row[f[0]]); }).join('') + '</div>',
      foot: '<button class="btn line" data-x>Batal</button><button class="btn pri" data-simpan>' + I('save') + 'Simpan</button>' });
    const ambilGbr = {};
    $$('[data-img]', sh.el).forEach(function (w) { ambilGbr[w.dataset.img] = pasangGambar(w, row[w.dataset.img], w.dataset.multi === 'true', w.dataset.folder); });
    const ik = $('[name=ikon]', sh.el); if (ik) ik.addEventListener('input', function () { ik.previousElementSibling.innerHTML = I(ik.value || 'local_shipping'); });
    sh.el.querySelector('[data-simpan]').onclick = function (ev) {
      const v = { id: row.id };
      fields.forEach(function (f) { const k = f[0]; if (ambilGbr[k]) v[k] = ambilGbr[k](); else { const el = $('[name="' + k + '"]', sh.el); if (el) v[k] = el.type === 'checkbox' ? el.checked : el.value.trim(); } });
      api('crud.save', { tabel: tabel, row: v }, ev.currentTarget).then(function (x) {
        const arr = A.D[tabel.toLowerCase()]; if (arr) { const i = arr.map(function (r) { return r.id; }).indexOf(x.id); if (i > -1) arr[i] = Object.assign(arr[i], x); else arr.push(x); }
        sh.close(); if (setelah) setelah(x); else halaman();
      }).catch(function () { });
    };
  }
  function hapus(tabel, row, nama) {
    K.konfirmasi('Hapus ' + (nama || 'data') + '?', tabel === 'Penjual' ? 'Penjual dan SEMUA produknya akan dihapus permanen. Tidak bisa dibatalkan.' : 'Data akan dihapus permanen dan tidak bisa dibatalkan.', 'Ya, hapus', true).then(function (y) {
      if (!y) return; api('crud.delete', { tabel: tabel, id: row.id }).then(function () { muatUlang(); }).catch(function () { });
    });
  }
  function daftarGenerik(pg, tabel, o) {
    const rows = (A.D[tabel.toLowerCase()] || []).slice().sort(function (a, b) { return (a.urutan || 0) - (b.urutan || 0); });
    pg.innerHTML = (o.intro ? '<p class="muted" style="margin-bottom:14px">' + o.intro + '</p>' : '') + '<div class="row" style="justify-content:space-between;margin-bottom:12px"><b>' + rows.length + ' item</b><button class="btn pri sm" data-tambah>' + I('add') + 'Tambah</button></div>' +
      '<div class="list">' + (rows.map(function (r, i) {
        return '<div class="item">' + (o.thumb ? (o.thumb(r) ? '<img class="th" src="' + e(K.img(o.thumb(r))) + '" alt="" loading="lazy">' : '<span class="th">' + I(o.ikon ? o.ikon(r) : 'image') + '</span>') : '') +
          '<div class="grow"><div class="tt">' + e(o.judul(r)) + (r.is_demo ? ' <span class="badge warn">contoh</span>' : '') + (r.aktif === false ? ' <span class="badge">disembunyikan</span>' : '') + '</div><div class="ss">' + (o.sub ? o.sub(r) : '') + '</div></div>' +
          '<div class="act">' + (i && 'urutan' in r ? '<button class="ibtn" data-up="' + i + '" aria-label="Naikkan">' + I('arrow_upward') + '</button>' : '') + '<button class="ibtn" data-ed="' + i + '" aria-label="Ubah">' + I('edit') + '</button><button class="ibtn" data-del="' + i + '" aria-label="Hapus">' + I('delete') + '</button></div></div>';
      }).join('') || '<div class="empty">' + I('inbox') + 'Belum ada data.</div>') + '</div>';
    $('[data-tambah]', pg).onclick = function () { edit(tabel, null); };
    $$('[data-ed]', pg).forEach(function (b) { b.onclick = function () { edit(tabel, rows[+b.dataset.ed]); }; });
    $$('[data-del]', pg).forEach(function (b) { b.onclick = function () { const r = rows[+b.dataset.del]; hapus(tabel, r, o.judul(r)); }; });
    $$('[data-up]', pg).forEach(function (b) { b.onclick = function () { const i = +b.dataset.up, ids = rows.map(function (r) { return r.id; }); ids.splice(i - 1, 0, ids.splice(i, 1)[0]); api('crud.urut', { tabel: tabel, ids: ids }).then(muatUlang).catch(function () { }); }; });
  }
  function simpanSetelan(map, btn) { return api('settings.save', { settings: map }, btn).then(function (d) { A.D.settings = d.settings; A.D.status = d.status; K.terapkanTema(S()); perbaruiShell(location.hash.replace(/^#\/?/, '') || 'beranda', $('#ttl').textContent); return d; }); }
  function bacaForm(box) { const v = {}; $$('[name]', box).forEach(function (el) { v[el.name] = el.type === 'checkbox' ? (el.checked ? 'YA' : 'TIDAK') : el.value.trim(); }); return v; }

  /* ======================= BERANDA ======================= */
  function hBeranda(pg) {
    const st = statusKini(), s = S(), D = A.D, c = hitungan();
    const hariIni = new Date().toDateString(), psnHari = (D.pesanan || []).filter(function (p) { return new Date(p.waktu).toDateString() === hariIni; });
    const kurirku = A.user.peran === 'kurir' ? (D.kurir || []).filter(function (k) { return k.id === A.user.kurirId; }) : (D.kurir || []).filter(function (k) { return k.aktif; });
    pg.innerHTML = '<div class="stack-lg">' +
      '<section class="status-hero ' + (st.buka ? 'buka' : 'tutup') + '"><div class="row" style="justify-content:space-between;align-items:flex-start"><div><span class="small" style="opacity:.8">Status layanan sekarang</span><h2>' + (st.buka ? '🟢 BUKA' : '🔴 TUTUP') + '</h2>' +
      '<p class="small" style="opacity:.85;margin-top:2px">' + e(st.buka ? 'Pelanggan bisa memesan. Jam hari ini ' + st.jamHariIni + '.' : st.ket) + '</p></div>' + I('two_wheeler') + '</div>' +
      '<div class="seg" role="group" aria-label="Mode buka/tutup">' + [['jadwal', 'Otomatis'], ['buka', 'Buka'], ['tutup', 'Tutup']].map(function (m) { return '<button data-mode="' + m[0] + '" class="' + (s.status_mode === m[0] ? 'on' : '') + '">' + m[1] + '</button>'; }).join('') + '</div>' +
      '<div class="row wrapx" style="margin-top:12px"><span class="small" style="opacity:.8">Istirahat sebentar:</span>' + [15, 30, 60].map(function (n) { return '<button class="btn sm line" style="color:#fff;border-color:rgba(255,255,255,.3)" data-ist="' + n + '">' + n + ' mnt</button>'; }).join('') +
      (s.tutup_sampai && new Date(s.tutup_sampai) > new Date() ? '<button class="btn sm" data-ist="0">Akhiri istirahat</button>' : '') + '</div>' +
      '<p class="tiny" style="opacity:.7;margin-top:10px">Otomatis = mengikuti Jam & Status. Saat tutup, tombol pesan & layanan di situs dinonaktifkan.</p></section>' +
      '<section class="card"><div class="row" style="justify-content:space-between;margin-bottom:6px"><h3 style="font-size:17px">' + (A.user.peran === 'kurir' ? 'Status saya' : 'Kurir hari ini') + '</h3><span class="small muted">' + st.kurirOnline + ' online</span></div>' +
      (kurirku.map(function (k) {
        return '<div class="set-row" style="flex-wrap:wrap"><img src="' + e(K.img(k.foto_url)) + '" alt="" style="width:44px;height:44px;border-radius:12px;object-fit:cover;background:var(--surface-2)"><div class="grow"><b>' + e(k.nama) + '</b><div class="tiny muted">' + e(k.motor_nama) + ' · ' + e(k.plat) + '</div></div>' +
          '<div class="seg light kseg" style="margin:0;grid-template-columns:repeat(3,1fr)">' + [['online', 'On'], ['sibuk', 'Antar'], ['offline', 'Off']].map(function (x) { return '<button data-ks="' + e(k.id) + '" data-v="' + x[0] + '" class="' + (k.status === x[0] ? 'on' : '') + '">' + x[1] + '</button>'; }).join('') + '</div></div>';
      }).join('') || '<p class="muted small">' + (A.user.peran === 'kurir' ? 'Akun Anda belum dihubungkan ke profil kurir. Minta superadmin menghubungkannya.' : 'Belum ada kurir. Tambah di menu Kurir.') + '</p>') +
      (s.wajib_kurir_online !== 'TIDAK' ? '<p class="tiny muted" style="margin-top:8px">' + I('info') + ' Bila semua kurir Off, layanan otomatis tutup.</p>' : '') + '</section>' +
      (A.user.kurirId && s.fitur_lacak !== 'TIDAK' ? '<section class="share-loc ' + (lok.on ? 'on' : '') + '"><div class="set-row" style="border:0;padding:0"><span class="ic-lg" style="background:var(--surface)">' + I('my_location') + '</span><div class="grow"><b>Bagikan lokasi saya</b><div class="small" id="lokInfo">' + e(lok.info || 'Pelanggan bisa melihat posisi Anda di link lacak saat pesanan dijemput/diantar.') + '</div></div><label class="switch"><input type="checkbox" id="lokSw" ' + (lok.on ? 'checked' : '') + ' aria-label="Bagikan lokasi"><i></i></label></div><p class="tiny" style="margin-top:8px;opacity:.75">Biarkan halaman dasbor ini terbuka (layar boleh redup) selama mengantar. Lokasi dikirim tiap ±30 detik.</p></section>' : '') +
      '<div class="kpis"><a class="kpi ' + (c.pesanan ? 'alert' : '') + '" href="#/pesanan"><b>' + c.pesanan + '</b><span>Pesanan baru</span></a><a class="kpi" href="#/pesanan"><b>' + psnHari.length + '</b><span>Pesanan hari ini</span></a>' +
      (boleh('admin') ? '<a class="kpi ' + (c.penjual ? 'alert' : '') + '" href="#/penjual"><b>' + c.penjual + '</b><span>Penjual menunggu</span></a><a class="kpi ' + (c.produk ? 'alert' : '') + '" href="#/produk"><b>' + c.produk + '</b><span>Produk menunggu</span></a>' :
        '<a class="kpi" href="#/pesanan"><b class="num">' + K.rp(psnHari.reduce(function (t, p) { return t + (Number(p.ongkir) || 0); }, 0)) + '</b><span>Perkiraan ongkir hari ini</span></a><a class="kpi" href="#/broadcast"><b>' + I('campaign') + '</b><span>Kirim promosi</span></a>') + '</div>' +
      '<section><div class="sec-h"><h2 style="font-size:19px">Pesanan terbaru</h2><a href="#/pesanan">Semua</a></div><div class="list">' + ((D.pesanan || []).slice(0, 5).map(kartuPesanan).join('') || '<div class="empty">' + I('receipt_long') + 'Belum ada pesanan tercatat.</div>') + '</div></section>' +
      (boleh('superadmin') && (D.produk || []).some(function (p) { return p.is_demo; }) ? '<div class="card row" style="background:var(--warn-soft);align-items:flex-start">' + I('science') + '<div class="small"><b>Masih ada data contoh.</b> Ganti dengan data asli, atau hapus semua data contoh dengan menjalankan <code>hapusDataContoh</code> di editor Apps Script.</div></div>' : '') + '</div>';
    $$('[data-mode]', pg).forEach(function (b) { b.onclick = function () { api('status.set', { mode: b.dataset.mode }).then(function (d) { A.D.settings = d.settings; halaman(); }).catch(function () { }); }; });
    $$('[data-ist]', pg).forEach(function (b) { b.onclick = function () { api('status.set', { istirahat: +b.dataset.ist }).then(function (d) { A.D.settings = d.settings; halaman(); }).catch(function () { }); }; });
    const sw = $('#lokSw', pg); if (sw) sw.onchange = function () { if (sw.checked) lokasiMulai(); else lokasiStop(); };
    $$('[data-ks]', pg).forEach(function (b) { b.onclick = function () { api('kurir.status', { id: b.dataset.ks, status: b.dataset.v }).then(function (d) { A.D.kurir = d.kurir; halaman(); }).catch(function () { }); }; });
    ikatPesanan(pg);
  }

  /* ======================= BAGIKAN LOKASI KURIR (untuk link lacak) ======================= */
  const lok = { on: false, watch: null, last: 0, info: '', wake: null };
  function lokasiMulai() {
    if (!navigator.geolocation) return K.toast('Perangkat tidak mendukung GPS.', 'bad');
    lok.on = true; lok.info = 'Mencari sinyal GPS…'; infoLok();
    try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(function (w) { lok.wake = w; }).catch(function () { }); } catch (er) { }
    lok.watch = navigator.geolocation.watchPosition(function (p) {
      if (Date.now() - lok.last < 30000) return; lok.last = Date.now();
      K.api('kurir.lokasi', { lat: p.coords.latitude, lng: p.coords.longitude, akurasi: p.coords.accuracy }, A.token).then(function (r) {
        lok.info = r.success ? 'Aktif · terkirim ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' (akurasi ±' + Math.round(p.coords.accuracy) + ' m)' : 'Gagal mengirim: ' + r.message; infoLok();
      });
    }, function (er) { lok.info = er.code === 1 ? 'Izin lokasi ditolak. Izinkan lokasi untuk situs ini di browser.' : 'Sinyal GPS belum didapat.'; infoLok(); if (er.code === 1) lokasiStop(true); }, { enableHighAccuracy: true, maximumAge: 15000, timeout: 30000 });
  }
  function lokasiStop(diam) {
    lok.on = false; if (lok.watch != null) navigator.geolocation.clearWatch(lok.watch); lok.watch = null; lok.last = 0;
    try { if (lok.wake) lok.wake.release(); } catch (er) { } lok.wake = null;
    if (!diam) { lok.info = 'Berbagi lokasi dimatikan.'; K.api('kurir.lokasi', { mati: true, lat: 0, lng: 0 }, A.token); }
    infoLok();
  }
  function infoLok() { const i = $('#lokInfo'); if (i) i.textContent = lok.info; const b = $('.share-loc'); if (b) b.classList.toggle('on', lok.on); const c = $('#lokSw'); if (c) c.checked = lok.on; }
  document.addEventListener('visibilitychange', function () { if (!document.hidden && lok.on && navigator.wakeLock && !lok.wake) navigator.wakeLock.request('screen').then(function (w) { lok.wake = w; }).catch(function () { }); });

  /* ======================= PANTAU PESANAN BARU (bunyi + getar) ======================= */
  let cekT = null, totalPesanan = -1;
  function mulaiPantau() {
    clearInterval(cekT); totalPesanan = (A.D.pesanan || []).length;
    cekT = setInterval(function () {
      if (!A.token || document.hidden) return;
      K.api('pesanan.cek', {}, A.token).then(function (r) {
        if (!r.success) return;
        if (totalPesanan >= 0 && r.data.total > totalPesanan) {
          if (K.get('bunyi', true)) K.bunyi(3);
          K.toast('🔔 Ada ' + (r.data.total - totalPesanan) + ' pesanan baru!', 'ok');
          K.api('boot', {}, A.token).then(function (b) { if (b.success) { A.D = b.data; if (!document.querySelector('.ov')) halaman(); else perbaruiShell(location.hash.replace(/^#\/?/, '').split('/')[0] || 'beranda', $('#ttl').textContent); } });
        }
        totalPesanan = r.data.total;
      });
    }, 45000);
  }

  /* ======================= PESANAN ======================= */
  const PS = { baru: ['warn', 'Baru'], diterima: ['info', 'Dikonfirmasi'], dijemput: ['info', 'Dijemput'], diantar: ['pri', 'Diantar'], diproses: ['info', 'Diproses'], selesai: ['ok', 'Selesai'], batal: ['bad', 'Batal'] };
  const LANJUT = { baru: ['diterima', 'Terima'], diterima: ['dijemput', 'Jemput'], diproses: ['dijemput', 'Jemput'], dijemput: ['diantar', 'Antar'], diantar: ['selesai', 'Selesai'] };
  const urlLacak = function (p) { return p.lacak_id ? K.urlSitus() + '#/lacak/' + p.lacak_id : ''; };
  function kartuPesanan(p) {
    const st = PS[p.status] || ['', p.status], kr = (A.D.kurir || []).filter(function (k) { return k.id === p.kurir_id; })[0];
    return '<div class="card flat stack" data-psn="' + e(p.id) + '"><div class="row" style="justify-content:space-between"><div><b>' + e(p.kode) + '</b> <span class="badge ' + st[0] + '">' + st[1] + '</span>' + (p.is_demo ? ' <span class="badge warn">contoh</span>' : '') + '</div><span class="tiny muted">' + e(K.waktu(p.waktu)) + '</span></div>' +
      '<div class="small"><b>' + e(p.layanan) + '</b> · ' + e(p.nama) + (p.hp ? ' · ' + e(p.hp) : '') + '</div>' +
      (p.titik_a || p.link_a ? '<div class="small">' + I('trip_origin') + ' ' + e(p.titik_a || '-') + (p.link_a ? ' · <a href="' + e(p.link_a) + '" target="_blank" rel="noopener">peta</a>' : '') + '</div>' : '') +
      (p.titik_b || p.link_b ? '<div class="small">' + I('flag') + ' ' + e(p.titik_b || '-') + (p.link_b ? ' · <a href="' + e(p.link_b) + '" target="_blank" rel="noopener">peta</a>' : '') + '</div>' : '') +
      (p.item ? '<details class="small"><summary>Rincian pesanan</summary><p style="white-space:pre-line;margin-top:6px">' + e(p.item) + '</p></details>' : '') +
      '<div class="row wrapx small"><span class="num">' + (p.jarak_km ? '±' + Number(p.jarak_km).toFixed(1) + ' km · ' : '') + '<b>' + (p.ongkir ? K.rp(p.ongkir) : 'ongkir dikonfirmasi') + '</b></span>' + (kr ? '<span class="badge">' + I('two_wheeler') + e(kr.panggilan || kr.nama) + '</span>' : '') + '</div>' +
      '<div class="row wrapx">' + (LANJUT[p.status] ? '<button class="btn sm pri" data-ps="' + LANJUT[p.status][0] + '">' + I('arrow_forward') + LANJUT[p.status][1] + '</button>' : '') + (p.status !== 'selesai' && p.status !== 'batal' ? '<button class="btn sm ghost" data-ps="batal">Batal</button>' : '') +
      (p.hp ? '<a class="btn sm wa" target="_blank" rel="noopener" href="' + e(K.waLink(p.hp, 'Halo ' + p.nama + ', pesanan ' + p.kode + ' (' + p.layanan + ') ' + ((PS[p.status] || [])[1] || p.status).toLowerCase() + '.' + (urlLacak(p) ? '\nLacak posisi kurir: ' + urlLacak(p) : ''))) + '">' + I('chat') + 'WA</a>' : '') +
      (urlLacak(p) ? '<button class="btn sm line" data-lk="' + e(urlLacak(p)) + '">' + I('location_searching') + 'Link lacak</button>' : '') +
      (boleh('admin') ? '<select class="input" data-kr style="width:auto;min-height:38px;padding:6px 10px;font-size:14px"><option value="">Pilih kurir…</option>' + (A.D.kurir || []).map(function (k) { return '<option value="' + e(k.id) + '" ' + (k.id === p.kurir_id ? 'selected' : '') + '>' + e(k.panggilan || k.nama) + '</option>'; }).join('') + '</select>' : '') + '</div></div>';
  }
  function ikatPesanan(pg) {
    $$('[data-psn]', pg).forEach(function (c) {
      const id = c.dataset.psn, simpan = function (row, btn) { row.id = id; return api('crud.save', { tabel: 'Pesanan', row: row }, btn).then(function (x) { const p = A.D.pesanan.filter(function (r) { return r.id === id; })[0]; Object.assign(p, x); halaman(); }).catch(function () { }); };
      $$('[data-ps]', c).forEach(function (b) { b.onclick = function () {
        const row = { status: b.dataset.ps }, p = A.D.pesanan.filter(function (r) { return r.id === id; })[0];
        if (b.dataset.ps === 'batal') return K.konfirmasi('Batalkan pesanan ' + p.kode + '?', 'Status di link lacak pelanggan berubah menjadi dibatalkan.', 'Batalkan', true).then(function (y) { if (y) simpan(row, b); });
        if (A.user.peran === 'kurir' && !p.kurir_id) row.kurir_id = A.user.kurirId;
        simpan(row, b).then(function () { if (/dijemput|diantar/.test(row.status) && A.user.peran === 'kurir' && !lok.on && p.lacak_id) K.toast('Nyalakan "Bagikan lokasi saya" di Beranda agar pelanggan melihat posisi Anda.'); });
      }; });
      const lk = $('[data-lk]', c); if (lk) lk.onclick = function () { K.salin(lk.dataset.lk); };
      const kr = $('[data-kr]', c); if (kr) kr.onchange = function () { simpan({ kurir_id: kr.value }); };
    });
  }
  function hPesanan(pg) {
    const st = { f: 'aktif', q: '' };
    pg.innerHTML = (A.D.settings.fitur_catat_pesanan === 'TIDAK' ? '<div class="card" style="background:var(--warn-soft);margin-bottom:12px">' + I('info') + ' Fitur "Catat pesanan" sedang mati — pesanan baru hanya masuk ke WhatsApp.</div>' : '') +
      '<input class="input" id="q" type="search" placeholder="Cari kode, nama, alamat…"><div class="tabs" style="margin-top:12px">' + [['aktif', 'Perlu diurus'], ['baru', 'Baru'], ['diantar', 'Diantar'], ['selesai', 'Selesai'], ['batal', 'Batal'], ['semua', 'Semua']].map(function (t, i) { return '<button class="chip ' + (i ? '' : 'on') + '" data-f="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div><div class="list" id="ls"></div>';
    const isi = function () {
      const q = st.q.toLowerCase(), l = (A.D.pesanan || []).filter(function (p) { return (st.f === 'semua' || (st.f === 'aktif' ? /baru|diterima|dijemput|diantar|diproses/.test(p.status) : p.status === st.f)) && (!q || [p.kode, p.nama, p.titik_a, p.titik_b, p.layanan, p.hp].join(' ').toLowerCase().indexOf(q) > -1); });
      $('#ls').innerHTML = l.slice(0, 150).map(kartuPesanan).join('') || '<div class="empty">' + I('inbox') + 'Tidak ada pesanan.</div>'; ikatPesanan(pg);
    };
    $$('[data-f]', pg).forEach(function (b) { b.onclick = function () { $$('[data-f]', pg).forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); st.f = b.dataset.f; isi(); }; });
    $('#q').addEventListener('input', K.debounce(function (ev) { st.q = ev.target.value; isi(); }, 200)); isi();
  }

  /* ======================= PRODUK & PENJUAL ======================= */
  function hProduk(pg) {
    const st = { f: hitungan().produk ? 'menunggu' : 'tayang', q: '' };
    const pj = {}; (A.D.penjual || []).forEach(function (p) { pj[p.id] = p; });
    pg.innerHTML = '<div class="row" style="margin-bottom:12px"><input class="input grow" id="q" type="search" placeholder="Cari produk / penjual…"><button class="btn pri" data-baru>' + I('add') + '<span>Tambah</span></button></div>' +
      '<div class="tabs">' + [['menunggu', 'Menunggu'], ['tayang', 'Tayang'], ['ditolak', 'Ditolak'], ['semua', 'Semua']].map(function (t) { const n = t[0] === 'semua' ? A.D.produk.length : A.D.produk.filter(function (p) { return p.status_tayang === t[0]; }).length; return '<button class="chip ' + (t[0] === st.f ? 'on' : '') + '" data-f="' + t[0] + '">' + t[1] + ' (' + n + ')</button>'; }).join('') + '</div><div class="list" id="ls"></div>';
    const isi = function () {
      const q = st.q.toLowerCase(), l = A.D.produk.filter(function (p) { return (st.f === 'semua' || p.status_tayang === st.f) && (!q || (p.nama + ' ' + (pj[p.penjual_id] || {}).nama_usaha).toLowerCase().indexOf(q) > -1); });
      $('#ls').innerHTML = l.map(function (p) {
        const f = K.list(p.foto_urls)[0], milik = p.pemilik === 'penjual' ? ((pj[p.penjual_id] || {}).nama_usaha || 'Penjual?') : 'Kurir';
        return '<div class="item" style="flex-wrap:wrap"><img class="th" src="' + e(K.img(f)) + '" alt="" loading="lazy"><div class="grow"><div class="tt">' + e(p.nama) + (p.unggulan ? ' ' + I('star', 'fill') : '') + (p.is_demo ? ' <span class="badge warn">contoh</span>' : '') + '</div><div class="ss num">' + K.rp(p.harga) + ' · ' + e(milik) + (p.stok === 'habis' ? ' · <span class="badge bad">Habis</span>' : '') + (p.aktif === false ? ' · <span class="badge">nonaktif</span>' : '') + '</div></div>' +
          '<div class="act">' + (p.status_tayang !== 'tayang' ? '<button class="btn sm pri" data-ok="' + e(p.id) + '">' + I('check') + 'Tayangkan</button>' : '') + (p.status_tayang === 'menunggu' ? '<button class="btn sm danger" data-no="' + e(p.id) + '">Tolak</button>' : '') +
          '<button class="ibtn" data-ed="' + e(p.id) + '" aria-label="Ubah">' + I('edit') + '</button><button class="ibtn" data-del="' + e(p.id) + '" aria-label="Hapus">' + I('delete') + '</button></div></div>';
      }).join('') || '<div class="empty">' + I('inventory_2') + 'Tidak ada produk di sini.</div>';
      const cari = function (id) { return A.D.produk.filter(function (p) { return p.id === id; })[0]; };
      $$('[data-ok]', pg).forEach(function (b) { b.onclick = function () { api('produk.moderasi', { ids: [b.dataset.ok], status: 'tayang', catatan: '' }, b).then(function (d) { A.D.produk = d.produk; halaman(); }).catch(function () { }); }; });
      $$('[data-no]', pg).forEach(function (b) { b.onclick = function () { alasan('Alasan penolakan (dibaca penjual)').then(function (c) { if (c === null) return; api('produk.moderasi', { ids: [b.dataset.no], status: 'ditolak', catatan: c }).then(function (d) { A.D.produk = d.produk; halaman(); }).catch(function () { }); }); }; });
      $$('[data-ed]', pg).forEach(function (b) { b.onclick = function () { edit('Produk', cari(b.dataset.ed)); }; });
      $$('[data-del]', pg).forEach(function (b) { b.onclick = function () { const p = cari(b.dataset.del); hapus('Produk', p, p.nama); }; });
    };
    $$('[data-f]', pg).forEach(function (b) { b.onclick = function () { $$('[data-f]', pg).forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); st.f = b.dataset.f; isi(); }; });
    $('#q').addEventListener('input', K.debounce(function (ev) { st.q = ev.target.value; isi(); }, 200));
    $('[data-baru]', pg).onclick = function () { edit('Produk', { pemilik: 'kurir', status_tayang: 'tayang', stok: 'tersedia', aktif: true }); };
    isi();
  }
  function alasan(judul) {
    return new Promise(function (ok) {
      const sh = K.sheet({ title: judul, html: '<textarea class="input" id="al" placeholder="Contoh: foto kurang jelas, mohon unggah ulang."></textarea>', foot: '<button class="btn line" data-x>Batal</button><button class="btn pri" data-y>Kirim</button>', onClose: function () { ok(null); } });
      sh.el.querySelector('[data-y]').onclick = function () { ok($('#al', sh.el).value.trim()); ok = function () { }; sh.close(); };
    });
  }
  function hPenjual(pg) {
    const st = { f: hitungan().penjual ? 'menunggu' : 'disetujui' };
    pg.innerHTML = '<p class="muted small" style="margin-bottom:12px">Penjual mendaftar sendiri dari tombol "Mau jualan di sini?" dengan nomor HP + PIN. Setujui agar mereka bisa memposting produk.</p>' +
      '<div class="tabs">' + [['menunggu', 'Menunggu'], ['disetujui', 'Disetujui'], ['ditolak', 'Ditolak'], ['diblokir', 'Diblokir']].map(function (t) { return '<button class="chip ' + (t[0] === st.f ? 'on' : '') + '" data-f="' + t[0] + '">' + t[1] + ' (' + A.D.penjual.filter(function (p) { return p.status === t[0]; }).length + ')</button>'; }).join('') + '</div><div class="list" id="ls"></div>';
    const isi = function () {
      $('#ls').innerHTML = A.D.penjual.filter(function (p) { return p.status === st.f; }).map(function (p) {
        const np = A.D.produk.filter(function (x) { return x.penjual_id === p.id; }).length;
        return '<div class="card flat stack"><div class="row"><img src="' + e(K.img(p.foto_url || S().logo_url)) + '" alt="" style="width:52px;height:52px;border-radius:14px;object-fit:cover;background:var(--surface-2)"><div class="grow"><b>' + e(p.nama_usaha) + '</b>' + (p.is_demo ? ' <span class="badge warn">contoh</span>' : '') + '<div class="small muted">' + e(p.nama) + ' · ' + e(p.hp) + ' · ' + e(p.kategori) + '</div><div class="tiny muted">' + e(p.alamat) + ' · ' + np + ' produk · daftar ' + e(K.waktu(p.dibuat)) + '</div></div></div>' +
          (p.deskripsi ? '<p class="small">' + e(p.deskripsi) + '</p>' : '') + (p.catatan ? '<p class="tiny" style="color:var(--bad)">Catatan: ' + e(p.catatan) + '</p>' : '') +
          '<div class="row wrapx">' + (p.status !== 'disetujui' ? '<button class="btn sm pri" data-a="disetujui" data-id="' + e(p.id) + '">' + I('check') + 'Setujui</button>' : '') +
          (p.status === 'menunggu' ? '<button class="btn sm danger" data-a="ditolak" data-id="' + e(p.id) + '">Tolak</button>' : '') + (p.status === 'disetujui' ? '<button class="btn sm ghost" data-a="diblokir" data-id="' + e(p.id) + '">' + I('block') + 'Blokir</button>' : '') +
          '<a class="btn sm wa" target="_blank" rel="noopener" href="' + e(K.waLink(p.hp, 'Halo ' + p.nama + ', ini admin ' + S().nama_usaha + '. ' + (p.status === 'menunggu' ? 'Pendaftaran penjual Anda sedang kami periksa.' : ''))) + '">' + I('chat') + 'WA</a>' +
          '<button class="btn sm line" data-a="resetPin" data-id="' + e(p.id) + '">' + I('key') + 'Reset PIN</button><button class="ibtn" data-ed="' + e(p.id) + '" aria-label="Ubah">' + I('edit') + '</button><button class="ibtn" data-del="' + e(p.id) + '" aria-label="Hapus">' + I('delete') + '</button></div></div>';
      }).join('') || '<div class="empty">' + I('groups') + 'Tidak ada penjual di sini.</div>';
      const cari = function (id) { return A.D.penjual.filter(function (p) { return p.id === id; })[0]; };
      $$('[data-a]', pg).forEach(function (b) {
        b.onclick = function () {
          const p = cari(b.dataset.id), a = b.dataset.a;
          const jalan = function (cat) {
            api('penjual.aksi', { id: p.id, aksi: a, catatan: cat || '' }, b).then(function (d) {
              A.D.penjual = d.penjual;
              if (d.extra && d.extra.pin) K.sheet({ title: 'PIN sementara', html: '<p>PIN sementara untuk <b>' + e(p.nama_usaha) + '</b>:</p><p class="pin" style="font-size:34px;margin:14px 0">' + e(d.extra.pin) + '</p><p class="small muted">Penjual wajib mengganti PIN setelah masuk.</p>',
                foot: '<a class="btn wa" target="_blank" rel="noopener" href="' + e(K.waLink(p.hp, 'Halo ' + p.nama + ', PIN sementara akun penjual ' + S().nama_usaha + ' Anda: ' + d.extra.pin + '\nMasuk dengan nomor ' + p.hp + ' lalu segera ganti PIN.')) + '">' + I('send') + 'Kirim via WA</a><button class="btn line" data-x>Tutup</button>' });
              else if (a === 'disetujui') K.sheet({ title: 'Penjual disetujui', html: '<p>Kabari <b>' + e(p.nama_usaha) + '</b> bahwa akunnya aktif?</p>', foot: '<a class="btn wa" target="_blank" rel="noopener" href="' + e(K.waLink(p.hp, 'Halo ' + p.nama + ', akun penjual *' + p.nama_usaha + '* di ' + S().nama_usaha + ' sudah DISETUJUI ✅\nSilakan masuk dengan nomor HP & PIN Anda lalu posting produk.')) + '">' + I('send') + 'Kabari via WA</a><button class="btn line" data-x>Nanti</button>' });
              halaman();
            }).catch(function () { });
          };
          if (a === 'ditolak' || a === 'diblokir') alasan(a === 'ditolak' ? 'Alasan penolakan' : 'Alasan pemblokiran').then(function (c) { if (c !== null) jalan(c); });
          else if (a === 'resetPin') K.konfirmasi('Reset PIN?', 'PIN lama ' + p.nama_usaha + ' tidak berlaku lagi dan sesi masuknya dicabut.', 'Reset PIN').then(function (y) { if (y) jalan(); });
          else jalan();
        };
      });
      $$('[data-ed]', pg).forEach(function (b) { b.onclick = function () { edit('Penjual', cari(b.dataset.ed)); }; });
      $$('[data-del]', pg).forEach(function (b) { b.onclick = function () { const p = cari(b.dataset.del); hapus('Penjual', p, p.nama_usaha); }; });
    };
    $$('[data-f]', pg).forEach(function (b) { b.onclick = function () { $$('[data-f]', pg).forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); st.f = b.dataset.f; isi(); }; });
    isi();
  }

  /* ======================= BROADCAST ======================= */
  function hBroadcast(pg) {
    if (S().fitur_broadcast === 'TIDAK') { pg.innerHTML = '<div class="empty">' + I('campaign') + 'Fitur broadcast dimatikan. Nyalakan di menu Fitur On/Off.</div>'; return; }
    const tpl = (A.D.broadcast || []).filter(function (b) { return b.aktif !== false; }).sort(function (a, b) { return a.urutan - b.urutan; });
    const P = { settings: S(), layanan: A.D.layanan, produk: A.D.produk || [] }, st = statusKini();
    let pilih = tpl[0] || { pesan: '' };
    const grup = K.json(S().bc_grup, []);
    pg.innerHTML = '<div class="order-layout"><div class="stack-lg"><section class="card stack"><h3 style="font-size:17px">1. Pilih template</h3><div class="chips">' + tpl.map(function (t, i) { return '<button class="chip ' + (i ? '' : 'on') + '" data-t="' + e(t.id) + '">' + e(t.judul || 'Template ' + (i + 1)) + '</button>'; }).join('') + '</div>' +
      '<label class="field"><span>2. Sesuaikan pesan (variabel terisi otomatis)</span><textarea class="input" id="bcTxt" rows="10">' + e(pilih.pesan) + '</textarea></label>' +
      '<p class="hint">{nama} {status} {jam} {area} {layanan} {tarif} {produk} {link} {wa} {tanggal}. Status, jam, layanan & produk unggulan diambil dari data saat ini.</p></section>' +
      '<section class="card stack"><h3 style="font-size:17px">3. Kirim ke grup WhatsApp</h3>' +
      '<button class="btn wa lg block" id="bcWa">' + I('groups') + 'Kirim ke Grup WA (pilih grup)</button>' +
      '<div class="grid2"><button class="btn line" id="bcShare">' + I('share') + 'Bagikan + gambar</button><button class="btn line" id="bcCopy">' + I('content_copy') + 'Salin teks</button></div>' +
      '<p class="small muted">Tombol hijau membuka WhatsApp dengan pesan siap kirim — pilih grup tujuan lalu kirim. Untuk kirim <b>otomatis tanpa membuka WA</b>, hubungkan Fonnte di bawah.</p>' +
      (A.D.fonnte ? '<div style="border-top:1px solid var(--line);padding-top:12px" class="stack"><b>Otomatis lewat Fonnte</b>' + (grup.length ? grup.map(function (g) { return '<label class="set-row"><input type="checkbox" checked data-g="' + e(g.id) + '"> <span class="grow">' + e(g.name) + '</span></label>'; }).join('') + '<button class="btn pri" id="bcFon">' + I('send') + 'Kirim otomatis ke ' + grup.length + ' grup</button>' : '<p class="small muted">Belum ada grup tujuan.</p>') + (boleh('admin') ? '<button class="btn line sm" id="bcGrup">' + I('sync') + 'Ambil daftar grup dari Fonnte</button>' : '') + '</div>' :
        '<p class="tiny muted">' + I('info') + ' Fonnte belum terhubung' + (boleh('superadmin') ? ' — isi token di Akun & Keamanan.' : '.') + '</p>') + '</section>' +
      (boleh('admin') ? '<section class="card stack"><h3 style="font-size:17px">Broadcast terjadwal (otomatis)</h3><div id="bcAuto"></div></section>' : '') +
      (boleh('admin') ? '<section><div class="sec-h"><h2 style="font-size:18px">Template broadcast</h2></div><div id="bcList"></div></section>' : '') + '</div>' +
      '<aside class="stack" style="position:sticky;top:76px"><b>Pratinjau</b><div class="preview-wa"><div class="bub" id="bcPrev"></div></div><p class="tiny muted">' + I('info') + ' Status sekarang: ' + (st.buka ? 'BUKA' : 'TUTUP') + '. Hindari mengirim tautan sama ke ratusan grup dalam waktu singkat agar nomor tidak diblokir.</p></aside></div>';
    const teks = function () { return K.susunBroadcast($('#bcTxt').value, P, st); };
    const prev = function () { $('#bcPrev').textContent = teks(); };
    $('#bcTxt').addEventListener('input', prev); prev();
    $$('[data-t]', pg).forEach(function (b) { b.onclick = function () { $$('[data-t]', pg).forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); pilih = tpl.filter(function (t) { return t.id === b.dataset.t; })[0]; $('#bcTxt').value = pilih.pesan; prev(); }; });
    $('#bcWa').onclick = function () { window.open(K.waLink('', teks()), '_blank'); };
    $('#bcCopy').onclick = function () { K.salin(teks()); };
    $('#bcShare').onclick = function () {
      const t = teks(), g = pilih.gambar_url;
      const tanpa = function () { if (navigator.share) navigator.share({ text: t }).catch(function () { }); else K.salin(t); };
      if (!g || !navigator.canShare) return tanpa();
      fetch(K.img(g)).then(function (r) { return r.blob(); }).then(function (bl) { const f = new File([bl], 'promo.jpg', { type: bl.type || 'image/jpeg' }); if (navigator.canShare({ files: [f] })) return navigator.share({ files: [f], text: t }); tanpa(); }).catch(tanpa);
    };
    const fon = $('#bcFon'); if (fon) fon.onclick = function () { const ids = $$('[data-g]', pg).filter(function (c) { return c.checked; }).map(function (c) { return c.dataset.g; }); if (!ids.length) return K.toast('Pilih minimal 1 grup.', 'bad'); K.konfirmasi('Kirim broadcast?', 'Pesan dikirim otomatis ke ' + ids.length + ' grup WhatsApp lewat Fonnte.', 'Kirim').then(function (y) { if (y) api('bc.kirim', { pesan: $('#bcTxt').value, grup: ids, gambar: /^https/.test(pilih.gambar_url || '') ? pilih.gambar_url : '' }, fon).catch(function () { }); }); };
    const gb = $('#bcGrup'); if (gb) gb.onclick = function () {
      api('bc.grup', {}, gb).then(function (list) {
        const sh = K.sheet({ title: 'Pilih grup tujuan', html: list.map(function (g) { return '<label class="set-row"><input type="checkbox" data-gg="' + e(g.id) + '" data-n="' + e(g.name) + '" ' + (grup.some(function (x) { return x.id === g.id; }) ? 'checked' : '') + '><span class="grow">' + e(g.name) + '</span></label>'; }).join('') || '<p class="muted">Tidak ada grup. Pastikan nomor Fonnte sudah bergabung di grup.</p>', foot: '<button class="btn line" data-x>Batal</button><button class="btn pri" data-y>Simpan</button>' });
        sh.el.querySelector('[data-y]').onclick = function (ev) { const pil = $$('[data-gg]', sh.el).filter(function (c) { return c.checked; }).map(function (c) { return { id: c.dataset.gg, name: c.dataset.n }; }); simpanSetelan({ bc_grup: JSON.stringify(pil) }, ev.currentTarget).then(function () { sh.close(); halaman(); }).catch(function () { }); };
      }).catch(function () { });
    };
    const au = $('#bcAuto'); if (au) {
      au.innerHTML = '<div class="set-row"><div class="grow">Kirim otomatis terjadwal<div class="tiny muted">Butuh Fonnte & grup tujuan. Pemicu backend mengecek tiap 5 menit.</div></div><label class="switch"><input type="checkbox" name="bc_otomatis" ' + (S().bc_otomatis === 'YA' ? 'checked' : '') + '><i></i></label></div>' +
        '<div class="grid2"><label class="field"><span>Jam kirim (pisahkan koma)</span><input class="input" name="bc_jam" value="' + e(S().bc_jam) + '" placeholder="08:00, 16:30"></label><label class="field"><span>Template</span><select class="input" name="bc_template">' + tpl.map(function (t) { return '<option value="' + e(t.id) + '" ' + (t.id === S().bc_template ? 'selected' : '') + '>' + e(t.judul) + '</option>'; }).join('') + '</select></label></div>' +
        '<div class="set-row"><div class="grow">Hanya kirim saat status BUKA</div><label class="switch"><input type="checkbox" name="bc_hanya_buka" ' + (S().bc_hanya_buka !== 'TIDAK' ? 'checked' : '') + '><i></i></label></div><button class="btn pri" id="auSave">' + I('save') + 'Simpan jadwal</button>';
      $('#auSave').onclick = function (ev) { simpanSetelan(bacaForm(au), ev.currentTarget).catch(function () { }); };
    }
    const bl = $('#bcList'); if (bl) daftarGenerik(bl, 'Broadcast', { judul: function (r) { return r.judul || '(tanpa nama)'; }, sub: function (r) { return e(String(r.pesan).slice(0, 80)) + '…'; }, thumb: function (r) { return r.gambar_url; }, ikon: function () { return 'campaign'; } });
  }

  /* ======================= LAYANAN / KURIR / GALERI / BANNER ======================= */
  function hLayanan(pg) {
    daftarGenerik(pg, 'Layanan', { intro: 'Atur layanan dan titik yang diminta di form pesan. Contoh: Antar Barang memakai titik "Ambil di" + "Antar ke"; Bayar Tagihan cukup "Lokasi Anda".',
      judul: function (r) { return r.nama; }, thumb: function () { return ''; }, ikon: function (r) { return r.ikon || 'local_shipping'; },
      sub: function (r) { return e([r.butuh_a ? r.label_a : '', r.butuh_b ? r.label_b : ''].filter(String).join(' → ')) + ' · ' + (r.tarif_mode === 'flat' ? 'tetap ' + K.rp(r.tarif_flat) : r.tarif_mode === 'nego' ? 'dikonfirmasi admin' : 'sesuai jarak') + (Number(r.biaya_tambah) ? ' + ' + K.rp(r.biaya_tambah) : ''); } });
  }
  function hKurir(pg) {
    daftarGenerik(pg, 'Kurir', { intro: 'Profil kurir tampil di halaman publik lengkap dengan foto diri & motor. Untuk memberi kurir akses dasbor sendiri (status on/off & pesanan), buat akun peran "kurir" di Akun & Keamanan.',
      judul: function (r) { return r.nama; }, thumb: function (r) { return r.foto_url; }, sub: function (r) { return '<span class="st-' + e(r.status) + '"><i class="dot"></i> ' + e(r.status) + '</span> · ' + e(r.motor_nama) + ' · ' + e(r.plat); } });
  }
  let galTab = '';
  function hGaleri(pg) {
    const daftar = K.galeriDaftar(S(), true);
    if (!galTab || (galTab !== '_kelola' && !daftar.some(function (g) { return g.id === galTab; }))) galTab = (daftar[0] || {}).id || '_kelola';
    pg.innerHTML = '<p class="muted" style="margin-bottom:12px">Foto usaha pelanggan per galeri (mis. Kuliner, HP & Elektronik). Saat pengunjung mengetuk foto, muncul tombol <b>Tanyakan ke admin</b> yang mengirim pesan WA berisi link foto & galeri.</p>' +
      '<div class="tabs">' + daftar.map(function (g) { return '<button class="chip ' + (g.id === galTab ? 'on' : '') + '" data-gt="' + e(g.id) + '">' + I(g.icon || 'photo_library') + e(g.nama) + ' (' + (A.D.galeri || []).filter(function (x) { return x.tipe === g.id; }).length + ')' + (g.tampil === false ? ' · disembunyikan' : '') + '</button>'; }).join('') + '<button class="chip ' + (galTab === '_kelola' ? 'on' : '') + '" data-gt="_kelola">' + I('settings') + 'Kelola galeri</button></div><div id="gbox"></div>';
    $$('[data-gt]', pg).forEach(function (b) { b.onclick = function () { galTab = b.dataset.gt; hGaleri(pg); }; });
    const box = $('#gbox', pg);
    if (galTab === '_kelola') {
      box.innerHTML = '<div class="card stack" id="gset">' + inputHtml(['galeri_bio_judul', 'Judul galeri di beranda'], K.T(S(), 'galeri_bio_judul')) +
        inputHtml(['galeri_bio_efek', 'Efek galeri di beranda', 'select', [['jalan', 'Berjalan (2 baris bergeser)'], ['diam', 'Diam (grid)']]], K.T(S(), 'galeri_bio_efek')) +
        inputHtml(['teks_pesan_galeri', 'Pesan WA "Tanyakan ke admin"', 'textarea', 'Variabel: {toko} {galeri} {kategori} {usaha} {judul} {foto} {link}'], K.T(S(), 'teks_pesan_galeri')) + '<button class="btn pri" id="gsS">' + I('save') + 'Simpan</button></div><div class="card" style="margin-top:14px" id="gd"></div>';
      $('#gsS').onclick = function (ev) { simpanSetelan(bacaForm($('#gset')), ev.currentTarget).catch(function () { }); };
      editorDaftar($('#gd'), { judul: 'Daftar galeri', kunci: 'galeri_daftar', data: daftar, tambah: true,
        teks: function (g) { return g.nama; }, sub: function (g) { return '#/galeri/' + g.id + ' · ' + (A.D.galeri || []).filter(function (x) { return x.tipe === g.id; }).length + ' foto'; }, ikon: function (g) { return g.icon; },
        bolehHapus: function (g) { return !(A.D.galeri || []).some(function (x) { return x.tipe === g.id; }); }, alasanHapus: 'Galeri yang masih berisi foto tidak bisa dihapus. Pindahkan/hapus fotonya dulu.',
        form: function (g) { return [['nama', 'Nama singkat (tab)'], ['judul', 'Judul halaman'], ['sub', 'Keterangan halaman', 'textarea'], ['icon', 'Ikon', 'icon']]; },
        baru: function (v) { return Object.assign({ id: (v.nama || 'galeri').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 20) || 'galeri', tampil: true, icon: 'photo_library' }, v); } });
      return;
    }
    const wrap = document.createElement('div'); box.appendChild(wrap);
    const asli = A.D.galeri; A.D.galeri = asli.filter(function (g) { return g.tipe === galTab; });
    daftarGenerik(wrap, 'Galeri', { judul: function (r) { return (r.usaha ? r.usaha + ' — ' : '') + (r.judul || r.kategori || '(tanpa keterangan)'); }, thumb: function (r) { return r.foto_url; }, sub: function (r) { return e(r.kategori || 'tanpa kategori') + (r.tag ? ' · ' + e(r.tag) : ''); } });
    A.D.galeri = asli;
    $('[data-tambah]', wrap).onclick = function () { edit('Galeri', { tipe: galTab, aktif: true }); };
  }
  function hBanner(pg) { daftarGenerik(pg, 'Banner', { intro: 'Slide promo di beranda. Ukuran ideal 1200×600 px.', judul: function (r) { return r.judul || '(tanpa judul)'; }, thumb: function (r) { return r.gambar_url; }, sub: function (r) { return e(r.sub) + ' → ' + e(r.tujuan); } }); }
  function hProfil(pg) {
    const k = (A.D.kurir || []).filter(function (x) { return x.id === A.user.kurirId; })[0];
    if (!k) { pg.innerHTML = '<div class="empty">' + I('badge') + 'Akun Anda belum dihubungkan ke profil kurir.</div>'; return; }
    pg.innerHTML = '<div class="card pad-lg kurir-full stack"><div class="kurir-card"><img class="av" src="' + e(K.img(k.foto_url)) + '" alt=""><div><h2 style="font-size:22px">' + e(k.nama) + '</h2><p class="muted">' + e(k.motor_nama) + ' · ' + e(k.plat) + '</p></div></div><div class="media"><img src="' + e(K.img(k.foto_url)) + '" alt=""><img src="' + e(K.img(k.motor_url)) + '" alt=""></div><p>' + e(k.bio) + '</p><button class="btn pri" id="ub">' + I('edit') + 'Ubah profil saya</button></div>';
    $('#ub').onclick = function () { edit('Kurir', k, 'Ubah profil saya', function () { muatUlang(); }); };
  }


  /* ======================= EDITOR DAFTAR JSON (menu, kategori, navigasi, bagian, galeri) ======================= */
  const HALAMAN = [['#/', 'Beranda'], ['#/pesan', 'Pesan Kurir'], ['#/layanan', 'Daftar Layanan'], ['#/tarif', 'Cek Ongkir'], ['#/lacak', 'Lacak Pesanan'], ['#/produk', 'Produk & Jualan'],
    ['#/galeri', 'Galeri'], ['#/kurir', 'Profil Kurir'], ['#/jualan', 'Mau Jualan (penjual)'], ['#/favorit', 'Favorit'], ['#/keranjang', 'Keranjang']];
  const AKSI = [['aksi:menu', 'Buka lembar Menu'], ['aksi:cs', 'Chat admin (WA)'], ['aksi:share', 'Bagikan + QR'], ['aksi:install', 'Install aplikasi'], ['aksi:tema', 'Mode gelap/terang']];
  /** Pemilih tujuan klik: halaman, layanan, kategori produk, galeri, pencarian, aksi, atau link luar. */
  function linkPicker() {
    return '<div class="field lp"><span class="lbl">Tujuan saat diklik</span><div class="grid2"><select class="input" data-lj>' + [['hal', 'Halaman di situs'], ['layanan', 'Langsung pesan layanan'], ['kat', 'Kategori produk'], ['galeri', 'Galeri foto'], ['cari', 'Cari kata di produk'], ['aksi', 'Aksi (menu, chat, bagikan…)'], ['luar', 'Link lain (URL)']]
      .map(function (o) { return '<option value="' + o[0] + '">' + o[1] + '</option>'; }).join('') + '</select><span data-lv></span></div><p class="hint" data-lh></p></div>';
  }
  function ikatLinkPicker(box, nilai) {
    nilai = String(nilai || '#/');
    const jenisAwal = /^layanan:/.test(nilai) ? 'layanan' : /^kat:/.test(nilai) ? 'kat' : /^galeri:/.test(nilai) ? 'galeri' : /^cari:/.test(nilai) ? 'cari' : /^aksi:/.test(nilai) ? 'aksi' : /^#\//.test(nilai) && (HALAMAN.some(function (h) { return h[0] === nilai; }) || /^#\/galeri\/[\w-]+$/.test(nilai)) ? 'hal' : 'luar';
    const pil = { hal: HALAMAN.concat(K.galeriDaftar(S()).map(function (g) { return ['#/galeri/' + g.id, 'Galeri ' + g.nama]; })), layanan: (A.D.layanan || []).map(function (l) { return [l.id, l.nama]; }),
      kat: kats().map(function (k) { return [k, k]; }), galeri: K.galeriDaftar(S(), true).map(function (g) { return [g.id, g.nama]; }), aksi: AKSI };
    const HINT = { hal: '', layanan: 'Membuka form pesan dengan layanan ini sudah terpilih.', kat: 'Membuka halaman produk tersaring kategori ini.', galeri: 'Membuka galeri ini.', cari: 'Contoh: nasi, kue, galon.', aksi: '', luar: 'Contoh: https://instagram.com/akun, wa.me/62812…, atau domain.com/halaman (terbuka di tab baru).' };
    const sel = $('[data-lj]', box), lv = $('[data-lv]', box), lh = $('[data-lh]', box);
    const gambar = function (j, v) {
      lh.textContent = HINT[j];
      lv.innerHTML = pil[j] ? '<select class="input" data-lval>' + pil[j].map(function (o) { return '<option value="' + e(o[0]) + '" ' + (o[0] === v ? 'selected' : '') + '>' + e(o[1]) + '</option>'; }).join('') + '</select>' : '<input class="input" data-lval value="' + e(v || '') + '" placeholder="' + (j === 'cari' ? 'kata pencarian' : 'https://…') + '">';
    };
    sel.value = jenisAwal;
    gambar(jenisAwal, jenisAwal === 'hal' || jenisAwal === 'aksi' || jenisAwal === 'luar' ? nilai : nilai.replace(/^\w+:/, ''));
    sel.onchange = function () { gambar(sel.value, ''); };
    return function () { const j = sel.value, v = ($('[data-lval]', box).value || '').trim(); return j === 'hal' || j === 'aksi' || j === 'luar' ? v : j + ':' + v; };
  }
  function iconPicker(box, awal) {
    let v = awal || 'apps';
    box.innerHTML = '<div class="row" style="margin-bottom:8px"><span class="th" style="width:44px;height:44px;border-radius:12px;display:grid;place-items:center;background:var(--primary-soft);color:var(--accent-text)" data-ip>' + I(v) + '</span><input class="input grow" data-iv value="' + e(v) + '" placeholder="nama ikon"></div><div class="ic-pick">' + K.ICONS.map(function (n) { return '<button type="button" data-ic="' + n + '" class="' + (n === v ? 'on' : '') + '" aria-label="' + n + '">' + I(n) + '</button>'; }).join('') + '</div><p class="hint">Atau ketik nama ikon lain dari Google Material Symbols.</p>';
    const set = function (n) { v = n; $('[data-ip]', box).innerHTML = I(n); $$('[data-ic]', box).forEach(function (b) { b.classList.toggle('on', b.dataset.ic === n); }); };
    $$('[data-ic]', box).forEach(function (b) { b.onclick = function () { $('[data-iv]', box).value = b.dataset.ic; set(b.dataset.ic); }; });
    $('[data-iv]', box).oninput = function (ev) { set(ev.target.value.trim() || 'apps'); };
    return function () { return v; };
  }
  /**
   * Editor daftar JSON di Pengaturan: urut (▲▼), saklar tampil, ubah, hapus, tambah. Disimpan ke kunci pengaturan opt.kunci.
   * opt: { judul, kunci, data, teks(x), sub(x), ikon(x), img(x), form(x) → field[], link(true = pakai pemilih tujuan), gambar(true = boleh gambar), tambah, maks, bolehHapus(x), baru(v) }
   */
  function editorDaftar(box, opt) {
    const data = opt.data.map(function (x) { return Object.assign({}, x); });
    const gambar = function () {
      const aktif = data.filter(function (x) { return x.tampil !== false; }).length;
      box.innerHTML = '<div class="row" style="justify-content:space-between;margin-bottom:6px"><h3 style="font-size:17px">' + e(opt.judul) + '</h3>' + (opt.tambah ? '<button class="btn sm line" data-add>' + I('add') + 'Tambah</button>' : '') + '</div>' +
        (opt.ket ? '<p class="small muted" style="margin-bottom:6px">' + opt.ket + (opt.maks ? ' Aktif: <b>' + aktif + '/' + opt.maks + '</b>.' : '') + '</p>' : '') +
        data.map(function (x, i) {
          const im = opt.img && opt.img(x);
          return '<div class="ed-row"><span class="th">' + (im ? '<img src="' + e(K.img(im)) + '" alt="">' : I((opt.ikon && opt.ikon(x)) || 'apps')) + '</span><div class="grow" style="min-width:0"><b>' + e(opt.teks(x)) + '</b><div class="tiny muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + e(opt.sub ? opt.sub(x) : '') + '</div></div>' +
            '<button class="ibtn" data-up="' + i + '" aria-label="Naikkan" ' + (i ? '' : 'disabled style="opacity:.3"') + '>' + I('arrow_upward') + '</button>' + (opt.form ? '<button class="ibtn" data-ed="' + i + '" aria-label="Ubah">' + I('edit') + '</button>' : '') +
            (opt.tambah ? '<button class="ibtn" data-del="' + i + '" aria-label="Hapus">' + I('delete') + '</button>' : '') +
            '<label class="switch"><input type="checkbox" data-sw="' + i + '" ' + (x.tampil !== false ? 'checked' : '') + ' aria-label="Tampilkan ' + e(opt.teks(x)) + '"><i></i></label></div>';
        }).join('') +
        '<div class="row wrapx" style="margin-top:12px"><button class="btn pri" data-save>' + I('save') + 'Simpan</button>' + (opt.reset !== false ? '<button class="btn ghost" data-reset>' + I('restart_alt') + 'Kembalikan bawaan</button>' : '') + '</div>';
      $$('[data-up]', box).forEach(function (b) { b.onclick = function () { const i = +b.dataset.up; data.splice(i - 1, 0, data.splice(i, 1)[0]); gambar(); }; });
      $$('[data-sw]', box).forEach(function (c) { c.onchange = function () { const i = +c.dataset.sw; if (c.checked && opt.maks && data.filter(function (x) { return x.tampil !== false; }).length >= opt.maks) { c.checked = false; return K.toast('Maksimal ' + opt.maks + ' yang aktif. Matikan yang lain dulu.', 'bad'); } data[i].tampil = c.checked; gambar(); }; });
      $$('[data-del]', box).forEach(function (b) { b.onclick = function () { const x = data[+b.dataset.del]; if (opt.bolehHapus && !opt.bolehHapus(x)) return K.toast(opt.alasanHapus || 'Item bawaan tidak bisa dihapus — matikan saja saklarnya.', 'bad'); K.konfirmasi('Hapus "' + opt.teks(x) + '"?', 'Item dihapus dari daftar setelah Anda menekan Simpan.', 'Hapus', true).then(function (y) { if (y) { data.splice(+b.dataset.del, 1); gambar(); } }); }; });
      $$('[data-ed]', box).forEach(function (b) { b.onclick = function () { ubah(+b.dataset.ed); }; });
      const ad = $('[data-add]', box); if (ad) ad.onclick = function () { ubah(-1); };
      $('[data-save]', box).onclick = function (ev) { const m = {}; m[opt.kunci] = JSON.stringify(data); simpanSetelan(m, ev.currentTarget).then(function () { if (opt.setelah) opt.setelah(); }).catch(function () { }); };
      const rs = $('[data-reset]', box); if (rs) rs.onclick = function () { K.konfirmasi('Kembalikan bawaan?', 'Daftar ini kembali ke susunan bawaan aplikasi.', 'Kembalikan').then(function (y) { if (!y) return; const m = {}; m[opt.kunci] = ''; simpanSetelan(m).then(function () { halaman(); }).catch(function () { }); }); };
    };
    const ubah = function (i) {
      const x = i > -1 ? data[i] : { tampil: true, icon: 'apps' }, fields = opt.form(x);
      const sh = K.sheet({ title: i > -1 ? 'Ubah' : 'Tambah', html: '<div class="stack">' + fields.map(function (f) { return f[2] === 'icon' ? '<div class="field"><span class="lbl">' + e(f[1]) + '</span><div data-icbox></div></div>' : inputHtml(f, x[f[0]] == null ? '' : x[f[0]]); }).join('') +
        (opt.gambar ? '<div class="field"><span class="lbl">Gambar ilustrasi (opsional, menggantikan ikon)</span><div class="imgs" data-gbr></div><p class="hint">PNG transparan ±160 px paling bagus.</p></div>' : '') +
        (opt.link && (!x.sys) ? linkPicker(x.link) : '') + '</div>', foot: '<button class="btn line" data-x>Batal</button><button class="btn pri" data-ok>Selesai</button>' });
      const icb = $('[data-icbox]', sh.el), ambilIk = icb ? iconPicker(icb, x.icon) : null;
      const ambilGb = opt.gambar ? pasangGambar($('[data-gbr]', sh.el), x.img, false, 'Logo') : null;
      const ambilLink = opt.link && !x.sys ? ikatLinkPicker($('.lp', sh.el), x.link) : null;
      sh.el.querySelector('[data-ok]').onclick = function () {
        const v = {}; fields.forEach(function (f) { if (f[2] === 'icon') v[f[0]] = ambilIk(); else { const el = $('[name="' + f[0] + '"]', sh.el); if (el) v[f[0]] = el.type === 'checkbox' ? el.checked : el.value.trim(); } });
        if (ambilGb) v.img = ambilGb(); if (ambilLink) v.link = ambilLink();
        const label = v.label !== undefined ? v.label : v.nama;
        if (label !== undefined && !String(label).trim()) return K.toast('Nama wajib diisi.', 'bad');
        if (i > -1) Object.assign(data[i], v); else { const n = opt.baru ? opt.baru(v) : Object.assign({ id: 'c' + Date.now().toString(36), custom: true, tampil: true }, v); if (data.some(function (d) { return d.id === n.id; })) n.id += '-' + Date.now().toString(36).slice(-3); data.push(n); }
        sh.close(); gambar(); K.toast('Tekan Simpan untuk menerapkan.');
      };
    };
    gambar();
  }

  /* ======================= TAMPILAN & MENU ======================= */
  let tpTab = 'bagian';
  function hTampilan(pg) {
    const s = S();
    pg.innerHTML = '<div class="tabs">' + [['bagian', 'view_agenda', 'Bagian Beranda'], ['menu', 'menu', 'Menu'], ['kategori', 'apps', 'Menu Kategori'], ['nav', 'bottom_navigation', 'Navigasi & Header'], ['slide', 'view_carousel', 'Slide Sampul'], ['sosmed', 'share', 'Sosial Media']]
      .map(function (t) { return '<button class="chip ' + (t[0] === tpTab ? 'on' : '') + '" data-tp="' + t[0] + '">' + I(t[1]) + t[2] + '</button>'; }).join('') + '</div><div class="card" id="tpb"></div><div id="tpx"></div>';
    $$('[data-tp]', pg).forEach(function (b) { b.onclick = function () { tpTab = b.dataset.tp; hTampilan(pg); }; });
    const box = $('#tpb', pg), x = $('#tpx', pg);
    const all = K.allMenus(s);
    if (tpTab === 'bagian') editorDaftar(box, { judul: 'Susunan beranda', kunci: 'bagian_urutan', data: K.bagian(s), ket: 'Geser naik (▲) untuk mengubah urutan, saklar untuk menampilkan/menyembunyikan bagian.', teks: function (b) { return b.label; }, sub: function (b) { return b.id; }, ikon: function () { return 'view_agenda'; } });
    if (tpTab === 'menu') editorDaftar(box, { judul: 'Menu link bio & lembar Menu', kunci: 'menu_items', data: K.menus(s), tambah: true, link: true,
      ket: 'Tampil sebagai tombol di beranda (bagian "Tombol menu") dan di lembar Menu. Tambah menu sendiri ke halaman, layanan, kategori, galeri, atau link lain.',
      teks: function (m) { return m.label; }, sub: function (m) { return (m.sub ? m.sub + ' · ' : '') + m.link; }, ikon: function (m) { return m.icon; },
      bolehHapus: function (m) { return !!m.custom; }, form: function () { return [['label', 'Nama menu *'], ['sub', 'Keterangan kecil'], ['icon', 'Ikon', 'icon']]; } });
    if (tpTab === 'kategori') {
      editorDaftar(box, { judul: 'Menu kategori ala aplikasi', kunci: 'kg_items', data: K.kgItems(s), tambah: true, link: true, gambar: true,
        ket: 'Tampil 4 kolom × 2 baris di HP; lebih dari 8 bisa digeser ke samping. Di desktop tampil satu baris penuh.',
        teks: function (m) { return m.label; }, sub: function (m) { return m.link; }, ikon: function (m) { return m.icon; }, img: function (m) { return m.img; },
        form: function () { return [['label', 'Nama (pendek) *'], ['icon', 'Ikon', 'icon']]; }, baru: function (v) { return Object.assign({ id: 'k' + Date.now().toString(36), tampil: true }, v); } });
      x.innerHTML = '<div class="card stack" style="margin-top:14px" id="kgs"><h3 style="font-size:17px">Gaya menu kategori</h3>' + inputHtml(['kg_judul', 'Judul di atas menu (kosongkan bila tidak perlu)'], s.kg_judul || '') +
        inputHtml(['kg_gaya', 'Bentuk ikon', 'select', [['kartu', 'Kotak membulat'], ['bulat', 'Lingkaran'], ['polos', 'Tanpa latar']]], K.T(s, 'kg_gaya')) + '<button class="btn pri" id="kgS">' + I('save') + 'Simpan gaya</button></div>';
      $('#kgS').onclick = function (ev) { simpanSetelan(bacaForm($('#kgs')), ev.currentTarget).catch(function () { }); };
    }
    if (tpTab === 'nav') {
      const navF = function (it) { return [['label', 'Nama tombol *'], ['icon', 'Ikon', 'icon']]; };
      editorDaftar(box, { judul: 'Navigasi bawah (HP)', kunci: 'nav_items', data: K.navItems(s).map(function (n) { return { id: n.id, label: n.label, icon: n.icon, tampil: n.tampil }; }), maks: 5,
        ket: 'Pilih maksimal 5 tombol dari semua menu (termasuk menu buatan sendiri). Tombol "Pesan" tampil menonjol.', teks: function (n) { return n.label; }, sub: function (n) { const m = all.filter(function (y) { return y.id === n.id; })[0]; return m ? m.link : ''; }, ikon: function (n) { return n.icon; }, form: navF });
      const hb = document.createElement('div'); hb.className = 'card'; hb.style.marginTop = '14px'; x.appendChild(hb);
      editorDaftar(hb, { judul: 'Tombol di header', kunci: 'header_items', data: K.headerItems(s).map(function (h) { return { id: h.id, label: h.label, icon: h.icon, tampil: h.tampil }; }), maks: 2,
        ket: 'Maksimal 2 tombol di kanan atas (mis. Chat admin, Mode gelap, Bagikan, Install).', teks: function (n) { return n.label; }, sub: function (n) { const m = all.filter(function (y) { return y.id === n.id; })[0]; return m ? m.link : ''; }, ikon: function (n) { return n.icon; }, form: navF });
    }
    if (tpTab === 'slide') {
      box.innerHTML = '<div class="stack" id="sls"><h3 style="font-size:17px">Slide sampul</h3><p class="small muted">Gambar slide diatur di menu <a href="#/banner">Slide Sampul</a> (' + (A.D.banner || []).length + ' slide). Ukuran ideal 1200×600 px.</p>' +
        '<div class="set-row"><div class="grow">Berganti otomatis<div class="tiny muted">Berhenti sejenak saat disentuh/diarahkan kursor.</div></div><label class="switch"><input type="checkbox" name="hero_otomatis" ' + (K.T(s, 'hero_otomatis') !== 'TIDAK' ? 'checked' : '') + '><i></i></label></div>' +
        inputHtml(['hero_detik', 'Jeda tiap slide (detik)', 'number'], K.T(s, 'hero_detik')) + '<button class="btn pri" id="slS" style="justify-self:start">' + I('save') + 'Simpan</button></div>';
      $('#slS').onclick = function (ev) { simpanSetelan(bacaForm($('#sls')), ev.currentTarget).catch(function () { }); };
    }
    if (tpTab === 'sosmed') {
      editorDaftar(box, { judul: 'Sosial media', kunci: 'sosmed_json', data: K.json(s.sosmed_json, []).map(function (x, i) { return Object.assign({ id: 's' + i, tampil: true }, x); }), tambah: true, reset: false,
        ket: 'Tampil di bagian "Sosial media" beranda & lembar Menu.', teks: function (x) { return x.platform; }, sub: function (x) { return x.url; }, ikon: function () { return 'share'; },
        form: function () { return [['platform', 'Platform', 'select', ['Instagram', 'TikTok', 'Facebook', 'YouTube', 'WhatsApp', 'Telegram', 'Website'].map(function (p) { return [p, p]; })], ['url', 'Link (https://…)']]; },
        baru: function (v) { return Object.assign({ id: 's' + Date.now(), tampil: true }, v); } });
    }
  }

  /* ======================= TARIF ======================= */
  function hTarif(pg) {
    const s = S();
    pg.innerHTML = '<div class="order-layout"><div class="stack-lg"><section class="card stack" id="tf"><h3 style="font-size:17px">Cara hitung ongkir</h3>' +
      '<div class="seg light" style="grid-template-columns:1fr 1fr;margin:0"><button data-tm="perkm" class="' + (s.tarif_mode !== 'tabel' ? 'on' : '') + '">Dasar + per km</button><button data-tm="tabel" class="' + (s.tarif_mode === 'tabel' ? 'on' : '') + '">Tabel jarak</button></div><input type="hidden" name="tarif_mode" value="' + e(s.tarif_mode) + '">' +
      '<div class="grid2">' + [['tarif_dasar', 'Tarif dasar'], ['km_dasar', 'Km termasuk tarif dasar'], ['tarif_per_km', 'Tarif per km berikutnya'], ['tarif_minimal', 'Tarif minimal'], ['tarif_maks_km', 'Jarak maks. otomatis (km)'], ['pembulatan', 'Bulatkan ke atas (Rp)'], ['faktor_jalan', 'Faktor jalan (bila jarak lurus)']].map(function (f) { return inputHtml([f[0], f[1], 'number'], s[f[0]]); }).join('') + '</div>' +
      '<p class="hint">Faktor jalan dipakai saat jarak jalan raya tidak bisa dihitung (jarak garis lurus × faktor, umumnya 1,2–1,4).</p>' +
      '<h3 style="font-size:16px;margin-top:8px">Tarif malam</h3><div class="grid2">' + inputHtml(['malam_mulai', 'Mulai (HH:MM)'], s.malam_mulai) + inputHtml(['malam_selesai', 'Selesai (HH:MM)'], s.malam_selesai) + inputHtml(['malam_biaya', 'Biaya tambahan', 'number'], s.malam_biaya) + '</div>' +
      '<p class="hint">Aktif bila fitur "Biaya tambahan malam hari" dinyalakan (' + (s.fitur_tarif_malam === 'YA' ? 'sedang AKTIF' : 'sedang mati') + ').</p><button class="btn pri" id="tfSave">' + I('save') + 'Simpan tarif</button></section>' +
      '<section id="tbl"></section></div><aside class="card stack" style="position:sticky;top:76px"><b>Simulasi ongkir</b><label class="field"><span>Jarak (km)</span><input class="input" id="sim" inputmode="decimal" value="4"></label><div class="price num" id="simO" style="font-size:26px"></div><p class="tiny muted" id="simK"></p></aside></div>';
    const sim = function () { const v = bacaForm($('#tf')), P = { settings: Object.assign({}, s, v), tarif: (A.D.tarif || []).slice().sort(function (a, b) { return a.km_dari - b.km_dari; }), tz: A.D.tz }; const o = K.ongkir(parseFloat(String($('#sim').value).replace(',', '.')), { tarif_mode: 'jarak' }, P); $('#simO').textContent = o.nego ? '—' : K.rp(o.ongkir); $('#simK').textContent = o.ket || ''; };
    $$('[data-tm]', pg).forEach(function (b) { b.onclick = function () { $$('[data-tm]', pg).forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); $('[name=tarif_mode]', pg).value = b.dataset.tm; sim(); tabel(); }; });
    $('#tf').addEventListener('input', sim); $('#sim').addEventListener('input', sim);
    $('#tfSave').onclick = function (ev) { simpanSetelan(bacaForm($('#tf')), ev.currentTarget).catch(function () { }); };
    const tabel = function () {
      const box = $('#tbl');
      if ($('[name=tarif_mode]', pg).value !== 'tabel') { box.innerHTML = ''; return; }
      const wrap = document.createElement('div'); box.innerHTML = '<h3 style="font-size:17px;margin-bottom:10px">Tabel jarak</h3>'; box.appendChild(wrap);
      daftarGenerik(wrap, 'Tarif', { judul: function (r) { return r.km_dari + '–' + r.km_sampai + ' km'; }, sub: function (r) { return '<b class="num">' + K.rp(r.harga) + '</b>'; } });
    };
    sim(); tabel();
  }

  /* ======================= JAM & STATUS ======================= */
  function hJam(pg) {
    const s = S(), jad = K.json(s.jadwal, []);
    pg.innerHTML = '<div class="stack-lg"><section class="card stack" id="jm"><h3 style="font-size:17px">Mode buka/tutup</h3><div class="seg light" style="margin:0">' + [['jadwal', 'Otomatis (jadwal)'], ['buka', 'Selalu buka'], ['tutup', 'Tutup manual']].map(function (m) { return '<button data-mode="' + m[0] + '" class="' + (s.status_mode === m[0] ? 'on' : '') + '">' + m[1] + '</button>'; }).join('') + '</div>' +
      '<div class="set-row"><div class="grow">Tutup otomatis bila tidak ada kurir online<div class="tiny muted">Saat semua kurir Off, tombol pesan & layanan nonaktif.</div></div><label class="switch"><input type="checkbox" name="wajib_kurir_online" ' + (s.wajib_kurir_online !== 'TIDAK' ? 'checked' : '') + '><i></i></label></div>' +
      inputHtml(['pesan_tutup', 'Pesan saat tutup', 'textarea'], s.pesan_tutup) + '</section>' +
      '<section class="card"><h3 style="font-size:17px;margin-bottom:6px">Jam operasional</h3><p class="small muted">Dipakai saat mode Otomatis' + (s.fitur_jadwal === 'TIDAK' ? ' (fitur jadwal sedang mati: dianggap selalu buka)' : '') + '.</p>' +
      [1, 2, 3, 4, 5, 6, 0].map(function (h) { const j = jad.filter(function (x) { return x.h === h; })[0] || { h: h, buka: '07:00', tutup: '21:00', libur: false }; return '<div class="set-row" style="flex-wrap:wrap;gap:8px" data-h="' + h + '"><b style="width:68px">' + K.HARI[h] + '</b><input class="input" type="time" data-b value="' + e(j.buka) + '" style="width:112px"><span>–</span><input class="input" type="time" data-t value="' + e(j.tutup) + '" style="width:112px"><label class="row small" style="margin-left:auto"><input type="checkbox" data-l ' + (j.libur ? 'checked' : '') + '> Libur</label></div>'; }).join('') + '</section>' +
      '<section class="card stack" id="pk"><h3 style="font-size:17px">Titik pangkalan</h3><p class="small muted">Titik awal hitung ongkir untuk layanan satu titik & produk kurir.</p>' + inputHtml(['pangkalan_nama', 'Nama pangkalan'], s.pangkalan_nama) + '<div class="grid2">' + inputHtml(['pangkalan_lat', 'Lintang (lat)'], s.pangkalan_lat) + inputHtml(['pangkalan_lng', 'Bujur (lng)'], s.pangkalan_lng) + '</div><div class="row wrapx"><button class="btn line sm" id="pkGps">' + I('my_location') + 'Pakai lokasi saya</button><button class="btn line sm" id="pkMap">' + I('map') + 'Pilih di peta</button></div></section>' +
      '<button class="btn pri lg" id="jmSave">' + I('save') + 'Simpan jam & status</button></div>';
    let mode = s.status_mode;
    $$('[data-mode]', pg).forEach(function (b) { b.onclick = function () { $$('[data-mode]', pg).forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); mode = b.dataset.mode; }; });
    const set = function (p) { $('[name=pangkalan_lat]', pg).value = p.lat.toFixed(6); $('[name=pangkalan_lng]', pg).value = p.lng.toFixed(6); };
    $('#pkGps').onclick = function (ev) { const b = ev.currentTarget; K.busy(b, true, 'Mencari…'); K.gps().then(set).catch(function (er) { K.toast(er.message, 'bad'); }).then(function () { K.busy(b, false); }); };
    $('#pkMap').onclick = function () { K.pilihPeta({ lat: +$('[name=pangkalan_lat]', pg).value || -3.36, lng: +$('[name=pangkalan_lng]', pg).value || 135.5 }, 'Titik pangkalan').then(function (p) { if (p) set(p); }); };
    $('#jmSave').onclick = function (ev) {
      const j = $$('[data-h]', pg).map(function (r) { return { h: +r.dataset.h, buka: $('[data-b]', r).value || '07:00', tutup: $('[data-t]', r).value || '21:00', libur: $('[data-l]', r).checked }; }).sort(function (a, b) { return a.h - b.h; });
      if (j.some(function (x) { return !x.libur && x.tutup <= x.buka; })) return K.toast('Jam tutup harus setelah jam buka (untuk buka lewat tengah malam, pakai mode Selalu buka).', 'bad');
      const v = Object.assign(bacaForm($('#jm')), bacaForm($('#pk')), { jadwal: JSON.stringify(j), status_mode: mode, tutup_sampai: '' });
      simpanSetelan(v, ev.currentTarget).catch(function () { });
    };
  }

  /* ======================= FITUR ON/OFF ======================= */
  function hFitur(pg) {
    pg.innerHTML = '<p class="muted" style="margin-bottom:14px">Nyalakan hanya fitur yang Anda butuhkan. Perubahan langsung tersimpan dan tampil di situs dalam ±1 menit.</p><div class="card">' +
      FITUR.map(function (f) { return '<div class="set-row">' + I(f[2]) + '<div class="grow">' + e(f[1]) + '</div><label class="switch"><input type="checkbox" data-f="' + f[0] + '" ' + (S()[f[0]] !== 'TIDAK' ? 'checked' : '') + ' aria-label="' + e(f[1]) + '"><i></i></label></div>'; }).join('') + '</div>';
    $$('[data-f]', pg).forEach(function (c) { c.onchange = function () { const m = {}; m[c.dataset.f] = c.checked ? 'YA' : 'TIDAK'; simpanSetelan(m).catch(function () { c.checked = !c.checked; }); }; });
  }

  /* ======================= PENGATURAN ======================= */
  function hPengaturan(pg) {
    const s = S(), faq = K.json(s.faq_json, []);
    pg.innerHTML = '<div class="stack-lg" id="st"><section class="card stack"><h3 style="font-size:17px">Profil usaha</h3><div class="field"><span class="lbl">Logo</span><div class="imgs" id="logo"></div></div>' +
      inputHtml(['nama_usaha', 'Nama usaha'], s.nama_usaha) + inputHtml(['tagline', 'Tagline'], s.tagline) + '<div class="grid2">' + inputHtml(['wa_admin', 'Nomor WA admin (penerima pesanan)', 'hp'], s.wa_admin) + inputHtml(['area_layanan', 'Area layanan'], s.area_layanan) + '</div>' +
      inputHtml(['app_url', 'Alamat website (untuk link broadcast)', 'text', 'Contoh: https://namaanda.github.io/kurir/'], s.app_url) + '</section>' +
      '<section class="card stack"><h3 style="font-size:17px">Tampilan</h3><div class="grid2"><label class="field"><span>Warna utama</span><input class="input" type="color" name="warna_utama" value="' + e(s.warna_utama || '#D9480F') + '" style="height:48px;padding:4px"></label>' +
      inputHtml(['tema_bawaan', 'Tema bawaan pengunjung', 'select', [['terang', 'Terang'], ['gelap', 'Gelap'], ['sistem', 'Ikuti HP']]], s.tema_bawaan) + '</div><div class="chips">' + ['#D9480F', '#C2185B', '#2563EB', '#0F766E', '#15803D', '#7C3AED', '#B45309', '#1C1A1F'].map(function (c) { return '<button class="chip" data-w="' + c + '"><i class="dot" style="color:' + c + ';width:16px;height:16px"></i>' + c + '</button>'; }).join('') + '</div></section>' +
      '<section class="card stack"><h3 style="font-size:17px">Teks & pesan</h3>' + inputHtml(['tpl_pesan', 'Template pesan WA pesanan', 'textarea', 'Variabel: {kode} {layanan} {nama} {hp} {titik} {item} {jarak} {ongkir} {catatan} {toko}'], s.tpl_pesan) +
      inputHtml(['info_bayar', 'Info pembayaran', 'textarea'], s.info_bayar) + inputHtml(['teks_jualan', 'Ajakan untuk penjual', 'textarea'], s.teks_jualan) + inputHtml(['syarat_jualan', 'Syarat penjual (satu per baris)', 'textarea'], s.syarat_jualan) +
      inputHtml(['kategori_produk', 'Kategori produk (pisahkan koma)'], s.kategori_produk) + '</section>' +
      '<section class="card stack"><div class="row" style="justify-content:space-between"><h3 style="font-size:17px">Tanya jawab (FAQ)</h3><button class="btn sm line" id="fqAdd">' + I('add') + 'Tambah</button></div><div id="fq" class="stack"></div></section>' +
      '<button class="btn pri lg" id="stSave">' + I('save') + 'Simpan pengaturan</button></div>';
    const logo = pasangGambar($('#logo'), s.logo_url, false, 'Logo');
    $$('[data-w]', pg).forEach(function (b) { b.onclick = function () { $('[name=warna_utama]', pg).value = b.dataset.w; }; });
    const fq = faq.slice();
    const gambarFaq = function () {
      $('#fq').innerHTML = fq.map(function (f, i) { return '<div class="card flat stack" data-i="' + i + '"><input class="input" data-q value="' + e(f.q) + '" placeholder="Pertanyaan"><textarea class="input" data-a rows="2" placeholder="Jawaban">' + e(f.a) + '</textarea><button class="btn sm ghost" data-rm style="justify-self:start">' + I('delete') + 'Hapus</button></div>'; }).join('') || '<p class="muted small">Belum ada.</p>';
      $$('[data-i]', pg).forEach(function (c) { const i = +c.dataset.i; $('[data-q]', c).oninput = function (ev) { fq[i].q = ev.target.value; }; $('[data-a]', c).oninput = function (ev) { fq[i].a = ev.target.value; }; $('[data-rm]', c).onclick = function () { fq.splice(i, 1); gambarFaq(); }; });
    };
    $('#fqAdd').onclick = function () { fq.push({ q: '', a: '' }); gambarFaq(); }; gambarFaq();
    $('#stSave').onclick = function (ev) {
      const v = bacaForm($('#st')); delete v.undefined;
      v.logo_url = logo(); v.faq_json = JSON.stringify(fq.filter(function (f) { return f.q.trim(); }));
      if (v.wa_admin && !K.hpValid(v.wa_admin)) return K.toast('Nomor WA admin tidak valid.', 'bad');
      simpanSetelan(v, ev.currentTarget).then(function () { shell(); halaman(); }).catch(function () { });
    };
  }

  /* ======================= AKUN & KEAMANAN ======================= */
  function hAkun(pg) {
    const D = A.D;
    let h = '<div class="stack-lg"><section class="card stack"><h3 style="font-size:17px">Akun saya</h3><p class="small">' + e(A.user.nama) + ' · <span class="badge">' + e(A.user.peran) + '</span></p>' +
      '<div class="grid2"><label class="field"><span>Sandi lama</span><input class="input" type="password" id="pl"></label><label class="field"><span>Sandi baru</span><input class="input" type="password" id="pb" autocomplete="new-password"></label></div><button class="btn pri" id="pgo" style="justify-self:start">Ganti sandi</button>' +
      '<div class="set-row"><div class="grow">Bunyi & getar saat ada pesanan baru<div class="tiny muted">Dasbor memeriksa pesanan baru tiap ±45 detik selama terbuka.</div></div><button class="btn sm line" id="tes">Tes bunyi</button><label class="switch"><input type="checkbox" id="bny" ' + (K.get('bunyi', true) ? 'checked' : '') + '><i></i></label></div></section>';
    if (boleh('superadmin')) {
      h += '<section class="card stack"><div class="row" style="justify-content:space-between"><h3 style="font-size:17px">Akun dasbor</h3><button class="btn sm pri" id="uAdd">' + I('person_add') + 'Tambah akun</button></div>' +
        '<p class="small muted">Superadmin: semua menu. Admin: semua kecuali akun & token. Kurir: status on/off diri sendiri, pesanan, broadcast, dan profil sendiri.</p><div class="list">' +
        (D.users || []).map(function (u) { return '<div class="item"><span class="th">' + I(u.peran === 'kurir' ? 'two_wheeler' : 'shield_person') + '</span><div class="grow"><div class="tt">' + e(u.nama) + ' <span class="badge">' + e(u.peran) + '</span>' + (u.aktif ? '' : ' <span class="badge bad">nonaktif</span>') + '</div><div class="ss">@' + e(u.username) + (u.login_terakhir ? ' · masuk ' + e(K.waktu(u.login_terakhir)) : '') + '</div></div><div class="act"><button class="ibtn" data-ue="' + e(u.id) + '" aria-label="Ubah">' + I('edit') + '</button><button class="ibtn" data-ur="' + e(u.id) + '" aria-label="Reset sandi">' + I('lock_reset') + '</button></div></div>'; }).join('') + '</div></section>' +
        '<section class="card stack"><h3 style="font-size:17px">WhatsApp otomatis (Fonnte)</h3><p class="small muted">Opsional. Dipakai untuk broadcast otomatis ke grup & kabar penjual baru. Daftar di fonnte.com → Device → scan QR → salin token. Token disimpan aman di server.</p>' +
        '<div class="row"><input class="input grow" id="fTok" type="password" placeholder="' + (D.fonnte ? 'Token tersimpan — isi untuk mengganti' : 'Tempel token Fonnte') + '"><button class="btn pri" id="fSave">Simpan</button>' + (D.fonnte ? '<button class="btn ghost" id="fDel">Hapus</button>' : '') + '</div></section>' +
        '<section class="card stack"><h3 style="font-size:17px">Reset lewat backend</h3><p class="small">Demi keamanan, tiga hal ini <b>hanya</b> bisa dijalankan dari editor Apps Script (pilih fungsi → ▶ Jalankan → lihat Log eksekusi):</p><ul class="small" style="margin:0;padding-left:20px"><li><code>jalankanResetDataContoh</code> — isi ulang data contoh</li><li><code>hapusDataContoh</code> — hapus semua data contoh, data asli aman</li><li><code>resetPasswordSuperadmin</code> — lupa sandi superadmin</li></ul></section>' +
        '<section class="card"><div class="row" style="justify-content:space-between"><h3 style="font-size:17px">Log aktivitas</h3><button class="btn sm line" id="lg">Tampilkan</button></div><div id="lgBox"></div></section>';
    }
    h += '<button class="btn line" id="out">' + I('logout') + 'Keluar</button></div>';
    pg.innerHTML = h;
    $('#pgo').onclick = function (ev) { api('password', { lama: $('#pl').value, baru: $('#pb').value }, ev.currentTarget).then(function (d) { A.token = d.token; K.set('atoken', A.token); $('#pl').value = $('#pb').value = ''; }).catch(function () { }); };
    $('#out').onclick = keluar;
    $('#bny').onchange = function (ev) { K.set('bunyi', ev.target.checked); }; $('#tes').onclick = function () { K.bunyi(3); };
    if (!boleh('superadmin')) return;
    const formAkun = function (u) {
      u = u || { peran: 'kurir', aktif: true };
      const sh = K.sheet({ title: u.id ? 'Ubah akun' : 'Akun baru', html: '<div class="stack">' + inputHtml(['username', 'Username (huruf kecil/angka)'], u.username) + inputHtml(['nama', 'Nama'], u.nama) +
        inputHtml(['peran', 'Peran', 'select', [['kurir', 'Kurir'], ['admin', 'Admin'], ['superadmin', 'Superadmin']]], u.peran) +
        inputHtml(['kurir_id', 'Hubungkan ke profil kurir (wajib untuk peran kurir)', 'select', [['', '—']].concat((D.kurir || []).map(function (k) { return [k.id, k.nama]; }))], u.kurir_id) + inputHtml(['aktif', 'Akun aktif', 'bool'], u.aktif) + '</div>',
        foot: '<button class="btn line" data-x>Batal</button><button class="btn pri" data-y>Simpan</button>' });
      sh.el.querySelector('[data-y]').onclick = function (ev) { const v = bacaForm(sh.el); v.aktif = v.aktif === 'YA'; v.id = u.id; api('users.save', v, ev.currentTarget).then(function (d) { D.users = d.users; sh.close(); if (d.sandi) tampilSandi(v.username, d.sandi); halaman(); }).catch(function () { }); };
    };
    const tampilSandi = function (un, s) { K.sheet({ title: 'Sandi sementara', html: '<p>Akun <b>@' + e(un) + '</b>. Sampaikan sandi ini langsung ke pemiliknya. Sandi wajib diganti saat login pertama.</p><p class="pin" style="font-size:26px;margin:14px 0;letter-spacing:.1em">' + e(s) + '</p>', foot: '<button class="btn line" data-c>' + I('content_copy') + 'Salin</button><button class="btn pri" data-x>Selesai</button>' }).el.querySelector('[data-c]').onclick = function () { K.salin(s); }; };
    $('#uAdd').onclick = function () { formAkun(); };
    $$('[data-ue]', pg).forEach(function (b) { b.onclick = function () { formAkun(D.users.filter(function (u) { return u.id === b.dataset.ue; })[0]); }; });
    $$('[data-ur]', pg).forEach(function (b) { b.onclick = function () { const u = D.users.filter(function (x) { return x.id === b.dataset.ur; })[0]; K.konfirmasi('Reset sandi @' + u.username + '?', 'Sandi lama tidak berlaku dan semua sesi masuknya dicabut.', 'Reset').then(function (y) { if (y) api('users.reset', { id: u.id }).then(function (d) { tampilSandi(u.username, d.sandi); }).catch(function () { }); }); }; });
    $('#fSave').onclick = function (ev) { const t = $('#fTok').value.trim(); if (!t) return K.toast('Tempel token dulu.', 'bad'); api('fonnte.save', { token: t }, ev.currentTarget).then(function (d) { D.fonnte = d.fonnte; halaman(); }).catch(function () { }); };
    const fd = $('#fDel'); if (fd) fd.onclick = function () { api('fonnte.save', { token: '__HAPUS__' }).then(function (d) { D.fonnte = d.fonnte; halaman(); }).catch(function () { }); };
    $('#lg').onclick = function (ev) { api('logs', {}, ev.currentTarget).then(function (l) { $('#lgBox').innerHTML = '<table class="tbl small" style="margin-top:10px"><tbody>' + (l.slice(0, 100).map(function (x) { return '<tr><td class="muted" style="white-space:nowrap">' + e(K.waktu(x.waktu)) + '</td><td>' + e(x.username) + '</td><td><b>' + e(x.aksi) + '</b> ' + e(x.target) + '</td></tr>'; }).join('') || '<tr><td>Belum ada log.</td></tr>') + '</tbody></table>'; }).catch(function () { }); };
  }

  /* ======================= MENU (HP) ======================= */
  function hMenu(pg) {
    const c = hitungan();
    pg.innerHTML = '<div class="menu-grid">' + menuSaya().map(function (m) { const n = c[m[0]]; return '<a href="#/' + m[0] + '">' + I(m[1]) + '<span>' + e(m[2]) + '</span>' + (n ? '<span class="cnt">' + n + '</span>' : '') + '</a>'; }).join('') +
      '<a href="../" target="_blank" rel="noopener">' + I('open_in_new') + '<span>Lihat situs</span></a></div>';
  }

  if (A.token) boot(); else { tutupSplash(); login(); }
})();
