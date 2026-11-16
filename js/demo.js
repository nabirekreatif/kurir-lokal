/* Kurir Lokal — MODE DEMO (aktif bila GAS_URL kosong). Meniru backend di browser, data tersimpan di HP ini saja.
   Login demo dasbor: superadmin / demo1234 · kurir_demo / demo1234 · Penjual contoh: 081300003333 / PIN 246810 */
(function () {
  'use strict';
  const KEY = 'kurir:v2:demodb', now = new Date().toISOString(), img = function (n) { return 'assets/contoh/' + n + '.svg'; };
  function seed() {
    const jadwal = [0, 1, 2, 3, 4, 5, 6].map(function (h) { return { h: h, buka: '07:00', tutup: h === 0 ? '18:00' : '21:00', libur: false }; });
    const S = {
      nama_usaha: 'Kurir Kilat Nabire', tagline: 'Antar barang, makanan & titip belanja — cepat, aman, ramah.', logo_url: 'assets/logo.png', wa_admin: '081200001111',
      area_layanan: 'Nabire Kota & sekitarnya', app_url: '', warna_utama: '#D9480F', tema_bawaan: 'terang', status_mode: 'buka', tutup_sampai: '',
      pesan_tutup: 'Kurir sedang istirahat. Silakan pesan lagi saat kami buka, atau tinggalkan pesan di WhatsApp.', jadwal: JSON.stringify(jadwal), wajib_kurir_online: 'YA',
      pangkalan_nama: 'Pangkalan Kurir — Pasar Karang', pangkalan_lat: '-3.3683', pangkalan_lng: '135.4960', tarif_mode: 'perkm', tarif_dasar: '8000', km_dasar: '3',
      tarif_per_km: '2500', tarif_minimal: '8000', tarif_maks_km: '25', faktor_jalan: '1.3', pembulatan: '1000', malam_mulai: '21:00', malam_selesai: '05:00', malam_biaya: '3000',
      tpl_pesan: '*PESANAN KURIR {kode}*\n🛵 Layanan: {layanan}\n👤 Nama: {nama}\n📱 HP: {hp}\n\n{titik}\n{item}📏 Jarak: {jarak}\n💰 Ongkir: {ongkir}\n📝 Catatan: {catatan}\n\nMohon dikonfirmasi ya, terima kasih 🙏',
      info_bayar: 'Bayar tunai ke kurir saat barang diterima, atau transfer/QRIS setelah dikonfirmasi admin.',
      teks_jualan: 'Punya usaha makanan, kue, sayur, atau barang lain? Pasang jualan Anda di sini GRATIS. Pesanan pelanggan diantar kurir kami.',
      syarat_jualan: 'Produk halal & layak jual\nFoto asli, bukan ambil dari internet\nHarga jujur dan selalu diperbarui\nSiap dihubungi lewat WhatsApp',
      faq_json: JSON.stringify([
        { q: 'Bagaimana cara memesan kurir?', a: 'Pilih layanan, isi titik jemput & tujuan (bisa pakai GPS atau pilih di peta), lalu tekan Kirim ke WhatsApp. Admin akan segera mengonfirmasi.' },
        { q: 'Berapa ongkirnya?', a: 'Ongkir dihitung otomatis sesuai jarak. Coba menu Cek Tarif. Angka di aplikasi adalah perkiraan; admin akan mengonfirmasi ongkir final.' },
        { q: 'Apakah perlu daftar akun?', a: 'Tidak. Pesan kurir cukup lewat WhatsApp tanpa login dan tanpa kode OTP.' },
        { q: 'Saya mau jualan di aplikasi ini, caranya?', a: 'Tekan tombol "Mau Jualan di Sini?", daftar dengan nomor HP & PIN, lalu tunggu persetujuan admin.' }]),
      kategori_produk: 'Makanan, Minuman, Kue & Camilan, Sayur & Bahan Dapur, Lainnya', bc_grup: '[]', bc_otomatis: 'TIDAK', bc_jam: '08:00', bc_template: '', bc_hanya_buka: 'YA'
    };
    ['fitur_produk', 'fitur_penjual', 'fitur_moderasi', 'fitur_keranjang', 'fitur_wa_penjual', 'fitur_galeri', 'fitur_banner', 'fitur_cek_tarif', 'fitur_peta', 'fitur_gps',
      'fitur_jarak_jalan', 'fitur_profil_kurir', 'fitur_catat_pesanan', 'fitur_broadcast', 'fitur_faq', 'fitur_info_bayar', 'fitur_jadwal'].forEach(function (k) { S[k] = 'YA'; });
    S.fitur_tarif_malam = 'TIDAK'; S.fitur_notif_wa = 'TIDAK';
    ['fitur_lacak', 'fitur_favorit', 'fitur_menu_kategori', 'fitur_bagikan'].forEach(function (k) { S[k] = 'YA'; });
    Object.assign(S, { menu_items: '', nav_items: '', header_items: '', kg_items: '', kg_judul: '', kg_gaya: 'kartu', bagian_urutan: '', hero_otomatis: 'YA', hero_detik: '4', galeri_daftar: '',
      galeri_bio_judul: 'Galeri Usaha Pelanggan', galeri_bio_efek: 'jalan', teks_pesan_galeri: '', lacak_teks: 'Pantau status pesanan & posisi kurir Anda di sini:',
      sosmed_json: JSON.stringify([{ platform: 'Instagram', url: 'https://instagram.com/' }, { platform: 'TikTok', url: 'https://tiktok.com/' }, { platform: 'Facebook', url: 'https://facebook.com/' }]) });
    S.tpl_pesan = S.tpl_pesan.replace('\n\nMohon dikonfirmasi', '\n\n{lacak}Mohon dikonfirmasi');
    const L = function (id, nama, ikon, des, a, la, b, lb, daftar, ld, mode, flat, tambah, ph, u) { return { id: id, nama: nama, ikon: ikon, deskripsi: des, butuh_a: a, label_a: la, butuh_b: b, label_b: lb, form_daftar: daftar, label_daftar: ld, tarif_mode: mode, tarif_flat: flat, biaya_tambah: tambah, catatan_ph: ph, urutan: u, aktif: true, is_demo: true }; };
    const P = function (id, nama, kat, harga, coret, sat, des, foto, pem, pjl, st, ung, u) { return { id: id, nama: nama, kategori: kat, harga: harga, harga_coret: coret, satuan: sat, deskripsi: des, foto_urls: JSON.stringify(foto.map(img)), pemilik: pem, penjual_id: pjl, status_tayang: st, stok: 'tersedia', unggulan: ung, catatan_admin: '', urutan: u, aktif: true, dibuat: now, diubah: now, is_demo: true }; };
    return {
      Pengaturan: S,
      Layanan: [
        L('LYN-ANTAR', 'Antar Barang / Paket', 'package_2', 'Kirim paket, dokumen, atau barang ke mana saja dalam kota.', true, 'Ambil barang di', true, 'Antar ke', false, '', 'jarak', 0, 0, 'Contoh: paket 2 kg, mudah pecah', 1),
        L('LYN-MAKAN', 'Antar Makanan', 'lunch_dining', 'Kami belikan & antar makanan dari warung/resto mana pun.', true, 'Beli di (warung/resto)', true, 'Antar ke', true, 'Daftar pesanan makanan', 'jarak', 0, 0, 'Contoh: pedas sedang, tanpa es', 2),
        L('LYN-BELANJA', 'Titip Belanja', 'shopping_basket', 'Belanja pasar, toko, atau apotek — uang ditalangi dulu.', true, 'Belanja di (pasar/toko)', true, 'Antar ke', true, 'Daftar belanjaan', 'jarak', 0, 3000, 'Contoh: maks. talangan Rp200.000', 3),
        L('LYN-OJEK', 'Ojek / Antar Orang', 'two_wheeler', 'Antar-jemput penumpang dengan helm & jas hujan.', true, 'Jemput di', true, 'Tujuan', false, '', 'jarak', 0, 0, 'Contoh: 1 orang, bawa tas kecil', 4),
        L('LYN-DOK', 'Ambil Dokumen / Bayar Tagihan', 'description', 'Ambil berkas, bayar listrik/air, setor ke kantor.', false, '', true, 'Lokasi Anda', true, 'Keperluan', 'flat', 15000, 0, 'Contoh: bayar PDAM a.n. Budi', 5)],
      Tarif: [[0, 3, 8000], [3, 5, 12000], [5, 8, 17000], [8, 12, 25000], [12, 20, 35000]].map(function (t, i) { return { id: 'TRF-' + (i + 1), km_dari: t[0], km_sampai: t[1], harga: t[2], urutan: i + 1, is_demo: true }; }),
      Kurir: [
        { id: 'KRR-1', nama: 'Yohanes Waromi', panggilan: 'Kak Yo', wa: '081200001111', foto_url: img('kurir-1'), motor_url: img('motor-1'), motor_nama: 'Honda Beat 2021', plat: 'PA 1234 NB', area: 'Nabire Kota, Karang, Oyehe', bio: 'Kurir sejak 2019. Hafal jalan tikus Nabire, siap antar pagi sampai malam.', sejak: '2019', status: 'online', urutan: 1, aktif: true, is_demo: true, lat: -3.3695, lng: 135.5032, lokasi_at: now },
        { id: 'KRR-2', nama: 'Siti Rahma', panggilan: 'Mbak Siti', wa: '081200002222', foto_url: img('kurir-2'), motor_url: img('motor-2'), motor_nama: 'Yamaha NMAX 2022', plat: 'PA 5678 NB', area: 'Kalibobo, Siriwini, Bumi Wonorejo', bio: 'Spesialis titip belanja pasar & antar kue. Teliti dan ramah.', sejak: '2021', status: 'offline', urutan: 2, aktif: true, is_demo: true }],
      Penjual: [
        { id: 'PJL-DEMO1', nama: 'Mama Ina', hp: '081300003333', nama_usaha: 'Dapur Mama Ina', kategori: 'Makanan', alamat: 'Jl. Merdeka, Nabire', link_maps: '', lat: -3.366, lng: 135.499, foto_url: img('toko-1'), deskripsi: 'Masakan rumahan khas Papua & Jawa.', pin: '246810', status: 'disetujui', catatan: '', wajib_ganti: false, dibuat: now, is_demo: true },
        { id: 'PJL-DEMO2', nama: 'Andi', hp: '081300004444', nama_usaha: 'Kue Andi Bakery', kategori: 'Kue & Camilan', alamat: 'Jl. Pepera, Nabire', link_maps: '', lat: -3.371, lng: 135.503, foto_url: img('toko-2'), deskripsi: 'Kue basah & roti, pesan H-1 untuk acara.', pin: '246810', status: 'disetujui', catatan: '', wajib_ganti: false, dibuat: now, is_demo: true },
        { id: 'PJL-DEMO3', nama: 'Pak Rudi', hp: '081300005555', nama_usaha: 'Sayur Segar Rudi', kategori: 'Sayur & Bahan Dapur', alamat: 'Pasar Karang', link_maps: '', lat: '', lng: '', foto_url: '', deskripsi: 'Contoh pendaftar yang menunggu persetujuan.', pin: '246810', status: 'menunggu', catatan: '', wajib_ganti: false, dibuat: now, is_demo: true }],
      Produk: [
        P('PRD-D1', 'Nasi Kuning Komplit', 'Makanan', 25000, 30000, 'porsi', 'Nasi kuning, ayam suwir, telur, sambal roa.', ['nasi-kuning'], 'penjual', 'PJL-DEMO1', 'tayang', true, 1),
        P('PRD-D2', 'Ikan Kuah Kuning', 'Makanan', 35000, '', 'porsi', 'Ikan tongkol segar kuah kuning + nasi.', ['ikan-kuah'], 'penjual', 'PJL-DEMO1', 'tayang', false, 2),
        P('PRD-D3', 'Kue Lapis Legit', 'Kue & Camilan', 85000, '', 'loyang', 'Lapis legit premium 20×20 cm.', ['lapis'], 'penjual', 'PJL-DEMO2', 'tayang', true, 3),
        P('PRD-D4', 'Roti Sobek Cokelat', 'Kue & Camilan', 20000, '', 'pak', 'Lembut, isi cokelat lumer.', ['roti'], 'penjual', 'PJL-DEMO2', 'menunggu', false, 4),
        P('PRD-D5', 'Es Kopi Susu Gula Aren', 'Minuman', 18000, '', 'cup', 'Racikan kurir sendiri, dingin sampai tujuan.', ['kopi'], 'kurir', '', 'tayang', true, 5),
        P('PRD-D6', 'Air Galon Isi Ulang', 'Lainnya', 8000, '', 'galon', 'Antar galon isi ulang (tukar galon kosong).', ['galon'], 'kurir', '', 'tayang', false, 6)],
      Galeri: [['galeri-1', 'Nasi campur harian', 'kuliner', 'Makanan', 'Dapur Mama Ina'], ['nasi-kuning', 'Nasi kuning komplit', 'kuliner', 'Makanan', 'Dapur Mama Ina'],
        ['galeri-2', 'Kue untuk acara', 'kuliner', 'Kue', 'Kue Andi Bakery'], ['kopi', 'Es kopi susu', 'kuliner', 'Minuman', ''],
        ['hp-1', 'HP second mulus', 'elektronik', 'HP', 'Cell Mandiri (contoh)'], ['hp-2', 'Aksesoris & charger', 'elektronik', 'Aksesoris', 'Cell Mandiri (contoh)'],
        ['galeri-4', 'Sayur segar pasar', 'jualan', 'Sayur', 'Sayur Segar Rudi'], ['galeri-3', 'Antar paket pagi', 'dokumentasi', 'Paket', '']]
        .map(function (g, i) { return { id: 'GLR-D' + (i + 1), foto_url: img(g[0]), judul: g[1], tipe: g[2], kategori: g[3], usaha: g[4], tag: '', urutan: i + 1, aktif: true, dibuat: now, is_demo: true }; }),
      Banner: [
        { id: 'BNR-D1', gambar_url: img('banner-1'), judul: 'Antar Cepat se-Kota', sub: 'Mulai Rp8.000 — pesan cukup lewat WhatsApp', tujuan: '#/pesan', urutan: 1, aktif: true, is_demo: true },
        { id: 'BNR-D2', gambar_url: img('banner-2'), judul: 'Punya Usaha Kuliner?', sub: 'Pasang jualan Anda di sini, gratis!', tujuan: '#/jualan', urutan: 2, aktif: true, is_demo: true }],
      Broadcast: [
        { id: 'BCS-D1', judul: 'Promo harian', pesan: '🛵 *{nama}* — {status}\n⏰ Jam hari ini: {jam}\n📍 Area: {area}\n\nLayanan kami:\n{layanan}\n\n💰 Ongkir mulai {tarif}\n\n🍱 Jajanan pilihan hari ini:\n{produk}\n\n📲 Pesan cepat tanpa daftar: {link}\nWA: {wa}', gambar_url: '', urutan: 1, aktif: true, is_demo: true },
        { id: 'BCS-D2', judul: 'Pengingat singkat', pesan: 'Butuh antar barang, makanan, atau titip belanja? 🛵\n{nama} siap antar hari ini ({jam}).\nPesan: {link}', gambar_url: '', urutan: 2, aktif: true, is_demo: true }],
      Pesanan: [{ id: 'PSN-D1', kode: 'KR-DEMO1', waktu: now, layanan: 'Antar Makanan', nama: 'Bu Maria', hp: '081299990000', titik_a: 'Dapur Mama Ina', link_a: 'https://maps.google.com/?q=-3.366,135.499', titik_b: 'Jl. Sisingamangaraja', link_b: 'https://maps.google.com/?q=-3.372,135.51', jarak_km: 2.1, ongkir: 8000, item: '2× Nasi Kuning Komplit', catatan: 'Contoh pesanan', status: 'baru', kurir_id: '', is_demo: true, lacak_id: '', riwayat: JSON.stringify([{ s: 'baru', t: now }]) },
        { id: 'PSN-D2', kode: 'KR-DEMO2', waktu: now, layanan: 'Antar Barang / Paket', nama: 'Pak Yoel', hp: '081299991111', titik_a: 'Toko Sinar Jaya', link_a: 'https://maps.google.com/?q=-3.3660,135.4990', titik_b: 'Kantor Distrik Nabire', link_b: 'https://maps.google.com/?q=-3.3750,135.5120',
          jarak_km: 2.4, ongkir: 8000, item: '', catatan: 'Contoh pesanan yang sedang diantar', status: 'diantar', kurir_id: 'KRR-1', is_demo: true, lacak_id: 'DEMOLACAK01',
          riwayat: JSON.stringify([{ s: 'baru', t: now }, { s: 'diterima', t: now }, { s: 'dijemput', t: now }, { s: 'diantar', t: now }]), lat_a: -3.366, lng_a: 135.499, lat_b: -3.375, lng_b: 135.512 }],
      Pengguna: [
        { id: 'USR-SA', username: 'superadmin', nama: 'Pemilik Usaha (demo)', peran: 'superadmin', kurir_id: '', pw: 'demo1234', aktif: true, wajib_ganti: false, login_terakhir: '' },
        { id: 'USR-K1', username: 'kurir_demo', nama: 'Kak Yo (demo)', peran: 'kurir', kurir_id: 'KRR-1', pw: 'demo1234', aktif: true, wajib_ganti: false, login_terakhir: '' }],
      Log: []
    };
  }
  let DB; try { DB = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { }
  if (!DB || !DB.Pengaturan) DB = seed();
  const save = function () { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) { } };
  const ok = function (d, m) { return { success: true, data: d === undefined ? null : d, message: m || '' }; };
  const fail = function (m, d) { return { success: false, data: d || null, message: m }; };
  const id = function (p) { return p + '-' + Math.random().toString(36).slice(2, 10).toUpperCase(); };
  const tok = function (u, peran) { return 'demo.' + btoa(JSON.stringify({ id: u.id, peran: peran || u.peran, kurirId: u.kurir_id || '', username: u.username || u.hp, nama: u.nama })); };
  const who = function (t) { try { return JSON.parse(atob(String(t).split('.')[1])); } catch (e) { return null; } };
  const LEVEL = { kurir: 1, admin: 2, superadmin: 3 };
  const by = function (t, i) { return DB[t].filter(function (r) { return r.id === i; })[0]; };
  const strip = function (p) { const o = Object.assign({}, p); delete o.pin; delete o.pw; return o; };
  const urut = function (a, b) { return (a.urutan || 0) - (b.urutan || 0); };
  const S = function () { return DB.Pengaturan; };
  const foto = function (p) { return window.K.list(p.foto_urls); };

  function publik() {
    const s = S(), pj = {};
    DB.Penjual.filter(function (p) { return p.status === 'disetujui'; }).forEach(function (p) { pj[p.id] = strip(p); });
    return {
      ver: 'demo', tz: 'Asia/Jayapura', settings: Object.assign({}, s), demo: true,
      layanan: DB.Layanan.filter(function (l) { return l.aktif; }).sort(urut),
      tarif: DB.Tarif.slice().sort(function (a, b) { return a.km_dari - b.km_dari; }),
      kurir: DB.Kurir.filter(function (k) { return k.aktif; }).sort(urut),
      produk: DB.Produk.filter(function (p) { return p.aktif && p.status_tayang === 'tayang' && (p.pemilik !== 'penjual' || pj[p.penjual_id]); }).sort(urut)
        .map(function (p) { return Object.assign({}, p, { foto: foto(p) }); }),
      penjual: pj,
      galeri: s.fitur_galeri === 'TIDAK' ? [] : DB.Galeri.filter(function (g) { return g.aktif; }).sort(urut),
      banner: s.fitur_banner === 'TIDAK' ? [] : DB.Banner.filter(function (g) { return g.aktif; }).sort(urut)
    };
  }
  function statusSrv() { return window.K.status({ settings: S(), kurir: DB.Kurir.filter(function (k) { return k.aktif; }), tz: 'Asia/Jayapura' }); }
  function saya(u) {
    const p = by('Penjual', u.id);
    return { penjual: strip(p), produk: DB.Produk.filter(function (x) { return x.penjual_id === p.id; }).map(function (x) { return Object.assign({}, x, { foto: foto(x) }); }), moderasi: S().fitur_moderasi !== 'TIDAK', kategori: S().kategori_produk };
  }
  const TBL = { Layanan: 'LYN', Tarif: 'TRF', Kurir: 'KRR', Produk: 'PRD', Penjual: 'PJL', Galeri: 'GLR', Banner: 'BNR', Broadcast: 'BCS', Pesanan: 'PSN' };
  const MIN = { Broadcast: 'kurir', Pesanan: 'kurir' };

  const H = {
    public: function () { return ok(publik()); },
    'order.catat': function (d) { DB.Pesanan.push(Object.assign({ id: id('PSN'), waktu: new Date().toISOString(), status: 'baru', is_demo: false, riwayat: JSON.stringify([{ s: 'baru', t: new Date().toISOString() }]) }, d)); save(); return ok({ dicatat: true }); },
    lacak: function (d) {
      const o = DB.Pesanan.filter(function (p) { return p.lacak_id && p.lacak_id === d.id; })[0]; if (!o) return fail('Pesanan tidak ditemukan. Periksa kembali link lacak Anda.');
      const k = o.kurir_id ? by('Kurir', o.kurir_id) : null, aktif = /diterima|dijemput|diantar/.test(o.status);
      let pos = k && aktif && k.lat ? { lat: k.lat, lng: k.lng, t: k.lokasi_at || new Date().toISOString() } : null;
      if (pos && o.lacak_id === 'DEMOLACAK01') { const f = (Date.now() / 1000 % 300) / 300; pos = { lat: -3.366 + (o.lat_b - -3.366) * f, lng: 135.499 + (o.lng_b - 135.499) * f, t: new Date().toISOString() }; }   // simulasi kurir bergerak
      return ok({ kode: o.kode, layanan: o.layanan, status: o.status, waktu: o.waktu, riwayat: window.K.json(o.riwayat, []), nama: String(o.nama || '').split(' ')[0], titik_a: o.titik_a, titik_b: o.titik_b,
        a: o.lat_a ? { lat: +o.lat_a, lng: +o.lng_a } : null, b: o.lat_b ? { lat: +o.lat_b, lng: +o.lng_b } : null, jarak_km: o.jarak_km, ongkir: o.ongkir, item: o.item,
        kurir: k ? { nama: k.nama, panggilan: k.panggilan, foto_url: k.foto_url, motor_nama: k.motor_nama, plat: k.plat, wa: k.wa, status: k.status } : null, pos: pos, wa_admin: S().wa_admin, toko: S().nama_usaha, tz: 'Asia/Jayapura' });
    },
    login: function (d) {
      const u = DB.Pengguna.filter(function (x) { return x.username === String(d.username || '').toLowerCase(); })[0];
      if (!u || u.pw !== d.password || !u.aktif) return fail('Username atau sandi salah. (Demo: superadmin / demo1234)');
      return ok({ token: tok(u), user: strip(u), mustChange: !!u.wajib_ganti });
    },
    'p.daftar': function (d) {
      if (!window.K.hpValid(d.hp)) return fail('Nomor HP tidak valid (contoh 0812xxxxxxxx).');
      if (!/^\d{6}$/.test(d.pin)) return fail('PIN harus 6 angka.');
      if (!d.nama || !d.nama_usaha) return fail('Isi nama Anda dan nama usaha/jualan.');
      const hp = window.K.hp08(d.hp); if (DB.Penjual.some(function (p) { return p.hp === hp; })) return fail('Nomor ini sudah terdaftar. Silakan masuk dengan PIN.');
      const p = { id: id('PJL'), nama: d.nama, hp: hp, nama_usaha: d.nama_usaha, kategori: d.kategori || '', alamat: d.alamat || '', link_maps: d.link_maps || '', lat: d.lat || '', lng: d.lng || '', foto_url: '', deskripsi: d.deskripsi || '', pin: d.pin, status: 'menunggu', catatan: '', wajib_ganti: false, dibuat: new Date().toISOString(), is_demo: false };
      DB.Penjual.push(p); save(); return ok({ token: tok(p, 'penjual'), penjual: strip(p) }, 'Pendaftaran terkirim. Tunggu persetujuan admin.');
    },
    'p.masuk': function (d) {
      const p = DB.Penjual.filter(function (x) { return x.hp === window.K.hp08(d.hp); })[0];
      if (!p || p.pin !== String(d.pin)) return fail('Nomor HP atau PIN salah. (Demo: 081300003333 / 246810)');
      if (p.status === 'diblokir') return fail('Akun penjual ini diblokir. Hubungi admin.');
      return ok({ token: tok(p, 'penjual'), penjual: strip(p), mustChange: !!p.wajib_ganti });
    }
  };
  const AUTH = {
    'p.saya': function (u) { return ok(saya(u)); },
    'p.profil': function (u, d) { Object.assign(by('Penjual', u.id), d); save(); return ok(saya(u)); },
    'p.pin': function (u, d) { const p = by('Penjual', u.id); if (p.pin !== d.lama) return fail('PIN lama salah.'); if (!/^\d{6}$/.test(d.baru)) return fail('PIN baru harus 6 angka.'); p.pin = d.baru; p.wajib_ganti = false; save(); return ok({ token: tok(p, 'penjual') }, 'PIN diganti.'); },
    'p.produkSave': function (u, d) {
      const p = by('Penjual', u.id); if (p.status !== 'disetujui') return fail('Akun Anda belum disetujui admin. Produk bisa diposting setelah disetujui.');
      if (!d.nama) return fail('Nama produk wajib diisi.'); const f = window.K.list(d.foto_urls); if (!f.length) return fail('Tambahkan minimal 1 foto produk.');
      const mod = S().fitur_moderasi !== 'TIDAK', lama = d.id ? by('Produk', d.id) : null;
      const o = { nama: d.nama, kategori: d.kategori, harga: Number(String(d.harga).replace(/\D/g, '')) || 0, harga_coret: Number(String(d.harga_coret || '').replace(/\D/g, '')) || '', satuan: d.satuan || '', deskripsi: d.deskripsi || '', foto_urls: JSON.stringify(f), stok: d.stok === 'habis' ? 'habis' : 'tersedia', diubah: new Date().toISOString() };
      o.status_tayang = lama && lama.status_tayang === 'tayang' && !d.ubahIsi ? 'tayang' : (mod ? 'menunggu' : 'tayang');
      if (lama) Object.assign(lama, o); else DB.Produk.push(Object.assign({ id: id('PRD'), pemilik: 'penjual', penjual_id: p.id, unggulan: false, catatan_admin: '', urutan: DB.Produk.length + 1, aktif: true, dibuat: o.diubah, is_demo: false }, o));
      save(); return ok(saya(u), o.status_tayang === 'menunggu' ? 'Produk dikirim dan menunggu persetujuan admin.' : 'Produk tayang.');
    },
    'p.produkHapus': function (u, d) { DB.Produk = DB.Produk.filter(function (x) { return !(x.id === d.id && x.penjual_id === u.id); }); save(); return ok(saya(u), 'Produk dihapus.'); },
    'p.upload': function (u, d) { return ok({ url: d.base64 }, 'Foto disimpan (demo: tersimpan di HP ini).'); },
    upload: function (u, d) { return ok({ url: d.base64 }, 'Foto disimpan (demo).'); },
    boot: function (u) {
      const o = { user: u, settings: S(), status: statusSrv(), tz: 'Asia/Jayapura', kurir: DB.Kurir, layanan: DB.Layanan, tarif: DB.Tarif, pesanan: DB.Pesanan.slice().reverse(), broadcast: DB.Broadcast, fonnte: false };
      if (LEVEL[u.peran] >= 2) Object.assign(o, { produk: DB.Produk, penjual: DB.Penjual.map(strip), galeri: DB.Galeri, banner: DB.Banner });
      if (u.peran === 'superadmin') o.users = DB.Pengguna.map(strip);
      return ok(o);
    },
    password: function (u, d) { const x = by('Pengguna', u.id); if (x.pw !== d.lama) return fail('Sandi lama tidak cocok.'); if (String(d.baru).length < 8) return fail('Sandi minimal 8 karakter.'); x.pw = d.baru; x.wajib_ganti = false; save(); return ok({ token: tok(x), user: strip(x) }, 'Sandi berhasil diganti.'); },
    'crud.save': function (u, d) {
      const t = d.tabel, r = Object.assign({}, d.row || {}); if (!TBL[t]) return fail('Tabel tidak dikenal.');
      const boleh = LEVEL[u.peran] >= LEVEL[MIN[t] || 'admin'] || (t === 'Kurir' && r.id === u.kurirId); if (!boleh) return fail('Tidak punya akses ke data ini.');
      if (r.foto_urls !== undefined) r.foto_urls = JSON.stringify(window.K.list(r.foto_urls));
      let x = r.id ? by(t, r.id) : null;
      if (x && t === 'Pesanan' && r.status && r.status !== x.status) { const rw = window.K.json(x.riwayat, []); rw.push({ s: r.status, t: new Date().toISOString(), o: u.nama }); r.riwayat = JSON.stringify(rw); if (u.peran === 'kurir' && !x.kurir_id) r.kurir_id = u.kurirId; }
      if (x) Object.assign(x, r); else { x = Object.assign({ id: id(TBL[t]), urutan: DB[t].length + 1, aktif: true, dibuat: new Date().toISOString(), is_demo: false }, t === 'Produk' ? { pemilik: 'kurir', status_tayang: 'tayang', stok: 'tersedia' } : {}, t === 'Kurir' ? { status: 'offline' } : {}, r); DB[t].push(x); }
      save(); return ok(x, 'Tersimpan.');
    },
    'crud.delete': function (u, d) { if (LEVEL[u.peran] < 2) return fail('Tidak punya akses.'); DB[d.tabel] = DB[d.tabel].filter(function (r) { return r.id !== d.id; }); if (d.tabel === 'Penjual') DB.Produk = DB.Produk.filter(function (p) { return p.penjual_id !== d.id; }); save(); return ok({ id: d.id }, 'Dihapus.'); },
    'crud.urut': function (u, d) { (d.ids || []).forEach(function (i, n) { const x = by(d.tabel, i); if (x) x.urutan = n + 1; }); save(); return ok(null, 'Urutan disimpan.'); },
    'settings.save': function (u, d) { Object.assign(DB.Pengaturan, d.settings || {}); save(); return ok({ settings: S(), status: statusSrv() }, 'Pengaturan disimpan.'); },
    'status.set': function (u, d) { const s = S(); if (d.mode) { s.status_mode = d.mode; s.tutup_sampai = ''; } if (d.istirahat !== undefined) s.tutup_sampai = Number(d.istirahat) > 0 ? new Date(Date.now() + d.istirahat * 60e3).toISOString() : ''; save(); return ok({ settings: s, status: statusSrv() }, 'Status diperbarui.'); },
    'kurir.status': function (u, d) { const k = by('Kurir', u.peran === 'kurir' ? u.kurirId : d.id); if (!k) return fail('Profil kurir tidak ditemukan.'); k.status = d.status; save(); return ok({ kurir: DB.Kurir, status: statusSrv() }, k.nama + ' sekarang ' + d.status + '.'); },
    'kurir.lokasi': function (u, d) { const k = by('Kurir', u.peran === 'kurir' ? u.kurirId : d.id); if (!k) return fail('Akun belum terhubung ke profil kurir.'); if (d.mati) { k.lokasi_at = ''; save(); return ok(null, 'Berbagi lokasi dimatikan.'); } k.lat = d.lat; k.lng = d.lng; k.lokasi_at = new Date().toISOString(); save(); return ok({ t: k.lokasi_at }); },
    'pesanan.cek': function () { return ok({ baru: DB.Pesanan.filter(function (p) { return p.status === 'baru'; }).length, total: DB.Pesanan.length, akhir: (DB.Pesanan[DB.Pesanan.length - 1] || {}).id || '' }); },
    'penjual.aksi': function (u, d) { const p = by('Penjual', d.id); let extra = null; if (d.aksi === 'resetPin') { p.pin = String(100000 + Math.floor(Math.random() * 900000)); p.wajib_ganti = true; extra = { pin: p.pin }; } else p.status = d.aksi; save(); return ok({ penjual: DB.Penjual.map(strip), extra: extra }, d.aksi === 'resetPin' ? 'PIN sementara dibuat.' : p.nama_usaha + ': ' + d.aksi + '.'); },
    'produk.moderasi': function (u, d) { [].concat(d.ids || d.id).forEach(function (i) { const p = by('Produk', i); if (p) { p.status_tayang = d.status; if (d.catatan !== undefined) p.catatan_admin = d.catatan; } }); save(); return ok({ produk: DB.Produk }, 'Status produk diperbarui.'); },
    'bc.kirim': function () { return fail('Mode demo: pengiriman otomatis lewat Fonnte hanya aktif setelah backend terpasang.'); },
    'bc.grup': function () { return fail('Mode demo: hubungkan Fonnte setelah backend terpasang.'); },
    'fonnte.save': function () { return fail('Mode demo: token disimpan di server setelah backend terpasang.'); },
    'users.save': function (u, d) { let x = d.id ? by('Pengguna', d.id) : null; const pw = 'Demo' + Math.floor(1000 + Math.random() * 9000); if (x) Object.assign(x, d); else { x = Object.assign({ id: id('USR'), pw: pw, wajib_ganti: true, aktif: true }, d); DB.Pengguna.push(x); } save(); return ok({ users: DB.Pengguna.map(strip), sandi: d.id ? '' : pw }, 'Akun disimpan.'); },
    'users.reset': function (u, d) { const x = by('Pengguna', d.id); x.pw = 'Demo' + Math.floor(1000 + Math.random() * 9000); save(); return ok({ sandi: x.pw }, 'Sandi sementara dibuat.'); },
    logs: function () { return ok(DB.Log); }
  };
  const PERAN_RUTE = { 'p.saya': 'penjual', 'p.profil': 'penjual', 'p.pin': 'penjual', 'p.produkSave': 'penjual', 'p.produkHapus': 'penjual', 'p.upload': 'penjual', 'settings.save': 'admin', 'penjual.aksi': 'admin', 'produk.moderasi': 'admin', 'crud.urut': 'admin', 'users.save': 'superadmin', 'users.reset': 'superadmin', logs: 'superadmin', 'fonnte.save': 'superadmin', 'bc.grup': 'admin' };

  window.KDemo = {
    handle: function (action, data, token) {
      if (H[action]) return H[action](data || {});
      if (!AUTH[action]) return fail('Aksi tidak dikenal: ' + action);
      const u = who(token); if (!u) return fail('Sesi berakhir. Silakan masuk lagi.', { code: 'AUTH' });
      const butuh = PERAN_RUTE[action] || 'kurir';
      if ((butuh === 'penjual') !== (u.peran === 'penjual')) return fail('Sesi tidak berlaku untuk menu ini.', { code: 'AUTH' });
      if (butuh !== 'penjual' && (LEVEL[u.peran] || 0) < LEVEL[butuh]) return fail('Menu ini khusus ' + butuh + '.');
      if (u.peran === 'penjual' && !by('Penjual', u.id)) return fail('Akun tidak ditemukan.', { code: 'AUTH' });
      return AUTH[action](u, data || {});
    },
    reset: function () { DB = seed(); save(); }
  };
})();
