/**
 * EKSPANSI KALENDER LENGKAP (ala timeanddate.com "Holidays and Observances")
 * --------------------------------------------------------------------------
 * - EXTRA_EVENTS  : hari libur & peringatan tambahan per negara, lengkap dengan tema Studio Master.
 * - LEGACY_RULES  : aturan tanggal otomatis untuk event kurasi inti (eventCalendar.ts).
 *
 * Setiap event punya `rule` → tanggal dihitung ulang otomatis tiap tahun oleh holidayEngine.ts
 * (Paskah, Ramadan, Idul Fitri, Imlek, Thanksgiving, Bank Holiday, dll. ikut bergeser sendiri).
 * Hari libur resmi lain yang belum ada di sini akan otomatis masuk lewat Live Sync (holidaySync.ts).
 */

import type { CalendarEventItem } from "./eventCalendar";
import type { DateRule } from "./holidayEngine";

// 0 = Minggu, 1 = Senin, 2 = Selasa, 3 = Rabu, 4 = Kamis, 5 = Jumat, 6 = Sabtu
const fixed = (month: number, day: number): DateRule => ({ type: "fixed", month, day });
const nth = (month: number, weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6, n: number, offsetDays = 0): DateRule => ({
  type: "nth",
  month,
  weekday,
  n,
  offsetDays,
});
const easter = (offsetDays: number): DateRule => ({ type: "easter", offsetDays });
const hijri = (month: number, day: number): DateRule => ({ type: "lunar", calendar: "islamic-umalqura", month: String(month), day });
const lunarCn = (month: number, day: number): DateRule => ({ type: "lunar", calendar: "chinese", month: String(month), day });

/** Aturan tanggal otomatis untuk event kurasi inti yang sudah ada */
export const LEGACY_RULES: Record<string, DateRule> = {
  "jan-global-newyear": fixed(1, 1),
  "jan-jp-seijin": nth(1, 1, 2),
  "jan-in-republic": fixed(1, 26),
  "feb-cn-lunar": lunarCn(1, 1),
  "feb-global-valentine": fixed(2, 14),
  "feb-us-superbowl": nth(2, 0, 2),
  "feb-me-founding": fixed(2, 22),
  "mar-global-iwd": fixed(3, 8),
  "mar-me-ramadan": hijri(9, 1),
  "mar-us-stpatrick": fixed(3, 17),
  "apr-id-lebaran": hijri(10, 1),
  "apr-global-earthday": fixed(4, 22),
  "apr-de-easter": easter(0),
  "apr-us-tax-finance": fixed(4, 15),
  "may-global-labour": fixed(5, 1),
  "may-jp-goldenweek": fixed(5, 3),
  "may-us-mothersday": nth(5, 0, 2),
  "may-us-memorial": nth(5, 1, -1),
  "jun-global-env": fixed(6, 5),
  "jun-cn-618-midyear": fixed(6, 18),
  "jun-me-hajj-adha": hijri(12, 10),
  "jun-uk-summer-solstice": fixed(6, 21),
  "jul-us-july4": fixed(7, 4),
  "jul-jp-tanabata": fixed(7, 7),
  "aug-id-merdeka": fixed(8, 17),
  "aug-in-independence": fixed(8, 15),
  "sep-cn-midautumn": lunarCn(8, 15),
  "sep-de-oktoberfest-autumn": { type: "onOrAfter", month: 9, day: 16, weekday: 6 },
  "sep-us-autumn-equinox": fixed(9, 22),
  "sep-me-saudinational": fixed(9, 23),
  "oct-us-halloween": fixed(10, 31),
  "oct-de-unity": fixed(10, 3),
  "nov-global-blackfriday": nth(11, 4, 4, 1),
  "nov-cn-singlesday": fixed(11, 11),
  "nov-us-thanksgiving": nth(11, 4, 4),
  "nov-uk-bonfire": fixed(11, 5),
  "dec-global-christmas": fixed(12, 25),
  "dec-de-winter-snowflake": fixed(12, 21),
  "dec-me-uaenational": fixed(12, 2),
  "jan-au-australiaday": fixed(1, 26),
  "feb-br-carnival": easter(-47),
  "feb-kr-seollal": lunarCn(1, 1),
  "apr-au-anzac": fixed(4, 25),
  "may-ca-victoriaday": { type: "onOrBefore", month: 5, day: 24, weekday: 1 },
  "jul-ca-canadaday": fixed(7, 1),
  "jul-fr-bastilleday": fixed(7, 14),
  "sep-kr-chuseok": lunarCn(8, 15),
  "sep-br-independencia": fixed(9, 7),
  "oct-ca-thanksgiving": nth(10, 1, 2),
};

export const EXTRA_EVENTS: CalendarEventItem[] = [
  // ======================================================================
  // 🇬🇧 INGGRIS (UK) — Lengkap sesuai daftar Holidays & Observances
  // ======================================================================
  {
    id: "uk-2jan-scotland", month: 1, dateLabel: "2 Januari", country: "uk", rule: fixed(1, 2),
    title: "2nd January Holiday (Scotland) & Hogmanay Afterglow", category: "National & Civic", demand: "Stabil",
    desc: "Libur tambahan tahun baru khas Skotlandia; lanjutan perayaan Hogmanay.",
    promptTheme: "Celtic Knot Light Lattice & Highland Ember Particles (Jalinan simpul Celtic geometris bercahaya emas dengan bara partikel lembut)",
    recommendedStyle: "swiss-kinetic", recommendedPalette: "obsidian-gold",
    keywords: ["scotland holiday", "hogmanay", "celtic knot", "new year scotland", "highland"],
  },
  {
    id: "uk-burns-night", month: 1, dateLabel: "25 Januari", country: "uk", rule: fixed(1, 25),
    title: "Burns Night (Scottish Poetry & Tartan Heritage)", category: "Cultural & Holiday", demand: "Stabil",
    desc: "Malam perayaan penyair Robert Burns; populer untuk restoran, whisky, dan event budaya Skotlandia.",
    promptTheme: "Kinetic Tartan Grid Weave & Amber Whisky Light Refraction (Anyaman grid tartan 3D yang bergeser ritmis dengan bias cahaya amber)",
    recommendedStyle: "swiss-kinetic", recommendedPalette: "crimson-imperial",
    keywords: ["burns night", "tartan pattern", "scottish heritage", "whisky amber", "scotland"],
  },
  {
    id: "uk-pancake-day", month: 2, dateLabel: "Shrove Tuesday (47 hari sebelum Paskah)", country: "uk", rule: easter(-47),
    title: "Carnival / Shrove Tuesday / Pancake Day", category: "Cultural & Holiday", demand: "Tinggi",
    desc: "Hari Pancake di UK & Mardi Gras di AS/Eropa; banyak dipakai brand F&B dan ritel.",
    promptTheme: "Stacked Golden Disc Tower & Maple Syrup Liquid Ribbons (Menara cakram emas bertumpuk isometrik dengan pita cair amber yang mengalir pelan)",
    recommendedStyle: "isometric-fintech", recommendedPalette: "obsidian-gold",
    keywords: ["pancake day", "shrove tuesday", "mardi gras", "carnival", "food celebration"],
  },
  {
    id: "uk-st-davids", month: 3, dateLabel: "1 Maret", country: "uk", rule: fixed(3, 1),
    title: "St. David's Day (Wales) & Daffodil Spring", category: "National & Civic", demand: "Stabil",
    desc: "Hari nasional Wales dengan simbol bunga daffodil kuning dan naga merah.",
    promptTheme: "Faceted Daffodil Crystal Bloom & Emerald Valley Light Waves (Bunga kristal kuning berfaset yang mekar di atas gelombang lembah zamrud)",
    recommendedStyle: "frosted-glass", recommendedPalette: "emerald-mint",
    keywords: ["st davids day", "wales", "daffodil", "spring bloom", "welsh heritage"],
  },
  {
    id: "uk-mothering-sunday", month: 3, dateLabel: "3 Minggu sebelum Paskah", country: "uk", rule: easter(-21),
    title: "Mother's Day UK (Mothering Sunday)", category: "Commercial & Retail", demand: "Sangat Tinggi",
    desc: "Hari Ibu versi Inggris & Irlandia (berbeda dari AS); puncak belanja bunga, kosmetik, dan hadiah.",
    promptTheme: "Pearl Glass Tulip Sculpture & Soft Blush Light Ribbons (Pahatan tulip kaca mutiara dengan pita cahaya merah muda lembut)",
    recommendedStyle: "frosted-glass", recommendedPalette: "sakura-aurora",
    keywords: ["mothering sunday", "mothers day uk", "floral gift", "tulip glass", "pastel luxury"],
  },
  {
    id: "global-good-friday", month: 4, dateLabel: "Jumat sebelum Paskah", country: "global", rule: easter(-2),
    title: "Good Friday & Holy Week Reflection", category: "Cultural & Holiday", demand: "Tinggi",
    desc: "Libur resmi di UK, Jerman, Australia, Kanada, Brasil, Indonesia (Wafat Isa Almasih), dan banyak negara lain.",
    promptTheme: "Serene Cathedral Light Shafts & Floating Stained-Glass Prisms (Sorot cahaya katedral menembus prisma kaca patri geometris yang melayang tenang)",
    recommendedStyle: "frosted-glass", recommendedPalette: "arctic-slate",
    keywords: ["good friday", "holy week", "stained glass", "light rays", "spiritual background"],
  },
  {
    id: "uk-easter-monday", month: 4, dateLabel: "Senin setelah Paskah", country: "uk", rule: easter(1),
    title: "Easter Monday (England, N. Ireland, Wales, Eropa)", category: "National & Civic", demand: "Stabil",
    desc: "Libur panjang Paskah di UK, Jerman, Prancis, Australia, dan Kanada; musim liburan keluarga.",
    promptTheme: "Pastel Geometric Egg Lattice & Spring Breeze Ribbons (Kisi telur geometris pastel berfaset dengan pita angin musim semi)",
    recommendedStyle: "swiss-kinetic", recommendedPalette: "sakura-aurora",
    keywords: ["easter monday", "spring holiday", "pastel eggs", "family holiday", "easter break"],
  },
  {
    id: "uk-st-georges", month: 4, dateLabel: "23 April", country: "uk", rule: fixed(4, 23),
    title: "St. George's Day (England) & Heraldic Shield", category: "National & Civic", demand: "Stabil",
    desc: "Hari nasional Inggris dengan simbol salib merah dan mawar Tudor.",
    promptTheme: "Heraldic Crimson Cross Shield & Tudor Rose Prism (Perisai heraldik 3D dengan salib merah dan prisma mawar Tudor berputar anggun)",
    recommendedStyle: "isometric-fintech", recommendedPalette: "crimson-imperial",
    keywords: ["st georges day", "england", "heraldic shield", "tudor rose", "english heritage"],
  },
  {
    id: "uk-early-may-bank", month: 5, dateLabel: "Senin pertama Mei", country: "uk", rule: nth(5, 1, 1),
    title: "Early May Bank Holiday & Maypole Spring", category: "National & Civic", demand: "Stabil",
    desc: "Libur nasional awal musim semi di UK; tradisi tiang Maypole dan festival desa.",
    promptTheme: "Spiraling Maypole Ribbon Helix & Spring Meadow Particles (Heliks pita warna-warni yang berputar mengelilingi tiang cahaya dengan partikel padang bunga)",
    recommendedStyle: "organic-ribbon", recommendedPalette: "emerald-mint",
    keywords: ["may bank holiday", "maypole", "spring festival", "uk holiday", "ribbon helix"],
  },
  {
    id: "uk-spring-bank", month: 5, dateLabel: "Senin terakhir Mei", country: "uk", rule: nth(5, 1, -1),
    title: "Spring Bank Holiday & Garden Season", category: "Seasonal & Nature", demand: "Stabil",
    desc: "Libur akhir musim semi di UK; puncak promosi taman, travel, dan outdoor.",
    promptTheme: "Isometric Botanical Garden Terraces & Glass Greenhouse Glow (Terasering taman isometrik dengan rumah kaca bercahaya lembut)",
    recommendedStyle: "isometric-fintech", recommendedPalette: "emerald-mint",
    keywords: ["spring bank holiday", "garden season", "greenhouse", "botanical", "uk spring"],
  },
  {
    id: "uk-kings-birthday", month: 6, dateLabel: "Sabtu ke-2 Juni (Trooping the Colour)", country: "uk", rule: nth(6, 6, 2),
    title: "King's Birthday & Trooping the Colour", category: "National & Civic", demand: "Tinggi",
    desc: "Perayaan ulang tahun resmi Raja Inggris dengan parade kerajaan di London.",
    promptTheme: "Royal Crown Crystal Monolith & Ceremonial Gold Banner Ribbons (Mahkota kristal berfaset di atas monolit dengan pita panji emas seremonial)",
    recommendedStyle: "frosted-glass", recommendedPalette: "obsidian-gold",
    keywords: ["kings birthday", "trooping the colour", "royal crown", "british monarchy", "ceremonial gold"],
  },
  {
    id: "global-fathers-day", month: 6, dateLabel: "Minggu ke-3 Juni", country: "global", rule: nth(6, 0, 3),
    title: "Father's Day (US, UK, Kanada, Jepang, India)", category: "Commercial & Retail", demand: "Sangat Tinggi",
    desc: "Puncak belanja hadiah pria: gadget, jam tangan, fashion, dan otomotif.",
    promptTheme: "Precision Watch Movement Gears & Brushed Titanium Plates (Mekanisme roda gigi jam presisi berlapis titanium dengan kilau sorot studio)",
    recommendedStyle: "swiss-kinetic", recommendedPalette: "arctic-slate",
    keywords: ["fathers day", "gift for dad", "watch gears", "titanium luxury", "mens gift"],
  },
  {
    id: "uk-boyne", month: 7, dateLabel: "12 Juli", country: "uk", rule: fixed(7, 12),
    title: "Battle of the Boyne / Orangemen's Day (Northern Ireland)", category: "National & Civic", demand: "Stabil",
    desc: "Libur resmi Irlandia Utara (diamati 13 Juli jika jatuh di akhir pekan). Gunakan visual netral bertema warisan sejarah.",
    promptTheme: "Historic River Valley Contour Map & Amber Heritage Light Lines (Peta kontur lembah sungai isometrik dengan garis cahaya warisan sejarah)",
    recommendedStyle: "isometric-fintech", recommendedPalette: "arctic-slate",
    keywords: ["northern ireland", "heritage", "historic map", "contour lines", "july holiday"],
  },
  {
    id: "uk-summer-bank", month: 8, dateLabel: "Senin terakhir Agustus (ENG, NIR, WAL)", country: "uk", rule: nth(8, 1, -1),
    title: "Summer Bank Holiday & Seaside Festival", category: "Seasonal & Nature", demand: "Tinggi",
    desc: "Libur akhir musim panas UK (Skotlandia: Senin pertama Agustus); puncak travel pantai & festival Notting Hill.",
    promptTheme: "Sunset Coastal Wave Ribbons & Carnival Light Confetti (Pita gelombang pantai senja dengan konfeti cahaya festival musim panas)",
    recommendedStyle: "organic-ribbon", recommendedPalette: "sakura-aurora",
    keywords: ["summer bank holiday", "seaside", "notting hill carnival", "summer festival", "uk summer"],
  },
  {
    id: "uk-remembrance", month: 11, dateLabel: "Minggu ke-2 November", country: "uk", rule: nth(11, 0, 2),
    title: "Remembrance Sunday & Poppy Commemoration", category: "National & Civic", demand: "Tinggi",
    desc: "Peringatan nasional UK, Kanada, Australia (Remembrance/Veterans Day 11 Nov). Visual khidmat bunga poppy.",
    promptTheme: "Faceted Crimson Poppy Crystal & Solemn Dawn Monolith (Bunga poppy kristal merah berfaset di depan monolit batu dengan cahaya fajar khidmat)",
    recommendedStyle: "frosted-glass", recommendedPalette: "crimson-imperial",
    keywords: ["remembrance sunday", "poppy", "lest we forget", "memorial", "veterans"],
  },
  {
    id: "uk-st-andrews", month: 11, dateLabel: "30 November", country: "uk", rule: fixed(11, 30),
    title: "St. Andrew's Day (Scotland) & Saltire Light", category: "National & Civic", demand: "Stabil",
    desc: "Hari nasional Skotlandia dengan simbol salib Saltire biru-putih.",
    promptTheme: "Diagonal Saltire Light Beams & Highland Glass Peaks (Sorot cahaya diagonal biru-putih menyilang di atas pegunungan kaca isometrik)",
    recommendedStyle: "cyber-precision", recommendedPalette: "void-sky",
    keywords: ["st andrews day", "scotland", "saltire", "highlands", "scottish flag"],
  },
  {
    id: "global-christmas-eve", month: 12, dateLabel: "24 Desember", country: "global", rule: fixed(12, 24),
    title: "Christmas Eve & Midnight Candle Glow", category: "Cultural & Holiday", demand: "Sangat Tinggi",
    desc: "Malam Natal — puncak konten ucapan, broadcast TV, dan iklan keluarga di seluruh dunia.",
    promptTheme: "Crystal Candle Lantern Array & Warm Midnight Snow Bokeh (Deretan lentera lilin kristal dengan bokeh salju hangat tengah malam)",
    recommendedStyle: "frosted-glass", recommendedPalette: "obsidian-gold",
    keywords: ["christmas eve", "candle glow", "holiday night", "warm bokeh", "festive greeting"],
  },
  {
    id: "uk-boxing-day", month: 12, dateLabel: "26 Desember", country: "uk", rule: fixed(12, 26),
    title: "Boxing Day Mega Sale (UK, Kanada, Australia)", category: "Commercial & Retail", demand: "Sangat Tinggi",
    desc: "Hari diskon terbesar pasca-Natal di negara Persemakmuran — setara Black Friday.",
    promptTheme: "Unboxing Isometric Gift Cube Cascade & Crimson-Gold Sale Ribbons (Kubus hadiah isometrik yang terbuka berurutan dengan pita promo merah-emas)",
    recommendedStyle: "isometric-fintech", recommendedPalette: "crimson-imperial",
    keywords: ["boxing day", "boxing day sale", "gift box 3d", "holiday sale", "retail promo"],
  },
  {
    id: "global-nye", month: 12, dateLabel: "31 Desember", country: "global", rule: fixed(12, 31),
    title: "New Year's Eve Countdown & Hogmanay", category: "Cultural & Holiday", demand: "Sangat Tinggi",
    desc: "Malam pergantian tahun — salah satu tema dengan pencarian video tertinggi sepanjang tahun.",
    promptTheme: "Kinetic Countdown Numeral Monoliths & Champagne Light Burst (Monolit angka hitung mundur 3D dengan ledakan cahaya sampanye emas)",
    recommendedStyle: "cyber-precision", recommendedPalette: "obsidian-gold",
    keywords: ["new years eve", "countdown", "champagne", "midnight celebration", "hogmanay"],
  },

  // ======================================================================
  // 🇺🇸 AMERIKA SERIKAT
  // ======================================================================
  {
    id: "us-mlk-day", month: 1, dateLabel: "Senin ke-3 Januari", country: "us", rule: nth(1, 1, 3),
    title: "Martin Luther King Jr. Day (Unity & Equality)", category: "National & Civic", demand: "Tinggi",
    desc: "Libur federal AS; dipakai sekolah, korporat, dan media untuk tema persatuan & keadilan.",
    promptTheme: "Converging Light Pathways & Harmonic Unity Rings of Glass (Jalur cahaya yang menyatu ke tengah membentuk susunan kaca harmonis)",
    recommendedStyle: "frosted-glass", recommendedPalette: "void-sky",
    keywords: ["mlk day", "unity", "equality", "civil rights", "dream"],
  },
  {
    id: "us-black-history", month: 2, dateLabel: "1 Februari (sebulan penuh)", country: "us", rule: fixed(2, 1),
    title: "Black History Month (US, Kanada, UK Oktober)", category: "Cultural & Holiday", demand: "Tinggi",
    desc: "Bulan peringatan sejarah dan budaya; banyak dibutuhkan untuk konten edukasi & korporat.",
    promptTheme: "Ascending Heritage Pillars & Golden Pan-African Ribbon Weave (Pilar warisan bertingkat dengan anyaman pita emas, hijau, dan merah)",
    recommendedStyle: "organic-ribbon", recommendedPalette: "obsidian-gold",
    keywords: ["black history month", "heritage", "culture", "celebration", "education"],
  },
  {
    id: "us-presidents-day", month: 2, dateLabel: "Senin ke-3 Februari", country: "us", rule: nth(2, 1, 3),
    title: "Presidents' Day & Winter Retail Sale", category: "National & Civic", demand: "Tinggi",
    desc: "Libur federal yang identik dengan diskon besar mobil, kasur, dan elektronik di AS.",
    promptTheme: "Neoclassical Column Monolith & Star-Spangled Light Grid (Kolom neoklasik isometrik dengan grid bintang bercahaya biru-merah)",
    recommendedStyle: "isometric-fintech", recommendedPalette: "void-sky",
    keywords: ["presidents day", "presidents day sale", "patriotic", "neoclassical", "american"],
  },
  {
    id: "us-pride-month", month: 6, dateLabel: "1 Juni (sebulan penuh)", country: "us", rule: fixed(6, 1),
    title: "Pride Month (Global Diversity & Inclusion)", category: "Cultural & Holiday", demand: "Sangat Tinggi",
    desc: "Bulan keberagaman yang dirayakan brand global di AS, Eropa, dan Australia.",
    promptTheme: "Prismatic Spectrum Ribbon Cascade & Inclusive Light Lattice (Air terjun pita spektrum pelangi 3D dengan kisi cahaya yang menyatu)",
    recommendedStyle: "organic-ribbon", recommendedPalette: "titanium-ultraviolet",
    keywords: ["pride month", "diversity", "inclusion", "rainbow spectrum", "equality"],
  },
  {
    id: "us-juneteenth", month: 6, dateLabel: "19 Juni", country: "us", rule: fixed(6, 19),
    title: "Juneteenth (Freedom Day)", category: "National & Civic", demand: "Tinggi",
    desc: "Libur federal AS memperingati kebebasan; kebutuhan visual korporat terus meningkat.",
    promptTheme: "Breaking Dawn Horizon & Ascending Freedom Light Ribbons (Cakrawala fajar dengan pita cahaya merah-emas-hijau yang naik bebas)",
    recommendedStyle: "organic-ribbon", recommendedPalette: "crimson-imperial",
    keywords: ["juneteenth", "freedom day", "celebration", "heritage", "dawn"],
  },
  {
    id: "us-labor-day", month: 9, dateLabel: "Senin pertama September", country: "us", rule: nth(9, 1, 1),
    title: "Labor Day (US & Kanada) & End-of-Summer Sale", category: "National & Civic", demand: "Sangat Tinggi",
    desc: "Penutup musim panas AS/Kanada dengan promo ritel besar-besaran.",
    promptTheme: "Isometric Industrial Skyline & Precision Gear Light Trails (Siluet industri isometrik dengan jejak cahaya roda gigi presisi)",
    recommendedStyle: "isometric-fintech", recommendedPalette: "arctic-slate",
    keywords: ["labor day", "labor day sale", "industry", "workers", "end of summer"],
  },
  {
    id: "us-columbus-indigenous", month: 10, dateLabel: "Senin ke-2 Oktober", country: "us", rule: nth(10, 1, 2),
    title: "Indigenous Peoples' Day / Columbus Day", category: "National & Civic", demand: "Stabil",
    desc: "Libur federal AS; tema warisan budaya asli dan eksplorasi.",
    promptTheme: "Woven Geometric Textile Matrix & Earth-Tone Light Patterns (Matriks tenun geometris dengan pola cahaya warna tanah)",
    recommendedStyle: "swiss-kinetic", recommendedPalette: "obsidian-gold",
    keywords: ["indigenous peoples day", "columbus day", "heritage pattern", "geometric textile", "culture"],
  },
  {
    id: "us-cinco-de-mayo", month: 5, dateLabel: "5 Mei", country: "us", countries: ["us", "br"], rule: fixed(5, 5),
    title: "Cinco de Mayo (Mexican Heritage & Fiesta Celebration)", category: "Cultural & Holiday", demand: "Tinggi",
    desc: "Perayaan budaya Meksiko yang sangat populer di Amerika Serikat (F&B, restoran, ritel, dan festival musim semi).",
    promptTheme: "Vibrant Papel Picado Geometric Lattice & Festive Marigold Light Waves (Kisi geometris papel picado berlapis dengan gelombang pita cahaya warna fiesta)",
    recommendedStyle: "swiss-kinetic", recommendedPalette: "crimson-imperial",
    keywords: ["cinco de mayo", "mexican fiesta", "papel picado", "celebration background", "may 5th"],
  },
  {
    id: "us-flag-day", month: 6, dateLabel: "14 Juni", country: "us", rule: fixed(6, 14),
    title: "Flag Day (US Stars & Stripes Civic Heritage)", category: "National & Civic", demand: "Stabil",
    desc: "Hari peringatan adopsi bendera Amerika Serikat (14 Juni); banyak dipakai instansi, berita, dan acara patriotik.",
    promptTheme: "Waving Isometric Star-Spangled Ribbon Matrix & Sapphire Light Pillars (Jalinan pita 3D merah-putih-biru mengalir anggun di antara pilar cahaya safir)",
    recommendedStyle: "organic-ribbon", recommendedPalette: "void-sky",
    keywords: ["flag day", "stars and stripes", "american flag", "patriotic background", "june 14"],
  },
  {
    id: "us-election-day", month: 11, dateLabel: "Selasa setelah Senin pertama November", country: "us", rule: nth(11, 1, 1, 1),
    title: "Election Day (US Civic Democracy & Broadcast Graphics)", category: "National & Civic", demand: "Sangat Tinggi",
    desc: "Hari Pemilihan Umum AS; kebutuhan sangat tinggi untuk grafis stasiun TV, berita, poling data, dan media sosial.",
    promptTheme: "Broadcast Democracy Podium & Crimson-Sapphire Data Bar Matrix (Panggung studio berita isometrik dengan matriks grafik suara biru-merah presisi tinggi)",
    recommendedStyle: "cyber-precision", recommendedPalette: "void-sky",
    keywords: ["election day", "vote", "broadcast graphics", "news background", "american politics"],
  },
  {
    id: "us-veterans-day", month: 11, dateLabel: "11 November", country: "us", rule: fixed(11, 11),
    title: "Veterans Day (US) & Honor Monument", category: "National & Civic", demand: "Tinggi",
    desc: "Penghormatan veteran militer AS; banyak dipakai broadcast & korporat.",
    promptTheme: "Honor Star Monolith & Waving Light Banner Ribbons (Monolit bintang kehormatan dengan pita panji cahaya biru-merah-putih)",
    recommendedStyle: "isometric-fintech", recommendedPalette: "void-sky",
    keywords: ["veterans day", "honor", "military tribute", "patriotic", "thank you veterans"],
  },
  {
    id: "us-super-saturday", month: 12, dateLabel: "Sabtu terakhir sebelum Natal", country: "us", countries: ["us", "ca", "uk"],
    rule: { type: "onOrBefore", month: 12, day: 24, weekday: 6 },
    title: "Super Saturday (Last-Minute Holiday Shopping Rush)", category: "Commercial & Retail", demand: "Sangat Tinggi",
    desc: "Sabtu terakhir sebelum Natal — puncak diskon ritel & e-commerce akhir tahun di AS, Kanada, dan UK.",
    promptTheme: "High-Speed Luxury Gift Cube Cascade & Golden Ribbon Portal (Aliran kubus kado hitam-emas isometrik menembus portal cahaya diskon akhir tahun)",
    recommendedStyle: "isometric-fintech", recommendedPalette: "obsidian-gold",
    keywords: ["super saturday", "holiday sale", "last minute gift", "christmas shopping", "retail promo"],
  },
  {
    id: "us-kwanzaa", month: 12, dateLabel: "26 Desember – 1 Januari", country: "us", countries: ["us", "ca"], rule: fixed(12, 26),
    title: "Kwanzaa (Kinara Seven Candles & Heritage Celebration)", category: "Cultural & Holiday", demand: "Tinggi",
    desc: "Perayaan warisan budaya Afrika-Amerika selama 7 hari (26 Des – 1 Jan) di Amerika Serikat dan Kanada.",
    promptTheme: "Illuminated Seven-Candle Kinara Geometry & Pan-African Silk Ribbons (Konstruksi 7 pilar lilin bercahaya emas-merah-hijau dengan anyaman geometris modern)",
    recommendedStyle: "swiss-kinetic", recommendedPalette: "crimson-imperial",
    keywords: ["kwanzaa", "kinara", "seven candles", "african american heritage", "december holiday"],
  },
  {
    id: "global-cyber-monday", month: 12, dateLabel: "Senin setelah Thanksgiving", country: "global", rule: nth(11, 4, 4, 4),
    title: "Cyber Monday Digital Mega Deals", category: "Commercial & Retail", demand: "Sangat Tinggi",
    desc: "Hari belanja online terbesar setelah Black Friday — kebutuhan visual tech & e-commerce sangat tinggi.",
    promptTheme: "Neon Circuit Shopping Portal & Digital Deal Cube Stream (Portal belanja sirkuit neon dengan aliran kubus diskon digital)",
    recommendedStyle: "cyber-precision", recommendedPalette: "titanium-ultraviolet",
    keywords: ["cyber monday", "online sale", "ecommerce", "digital deals", "tech sale"],
  },
  {
    id: "global-giving-tuesday", month: 12, dateLabel: "Selasa setelah Thanksgiving", country: "global", rule: nth(11, 4, 4, 5),
    title: "Giving Tuesday (Charity & Donation)", category: "Cultural & Holiday", demand: "Tinggi",
    desc: "Gerakan donasi global; dipakai NGO, yayasan, dan CSR perusahaan.",
    promptTheme: "Interlocking Hands of Light Particles & Heart Prism Network (Jaringan partikel cahaya yang saling terhubung membentuk prisma hati)",
    recommendedStyle: "frosted-glass", recommendedPalette: "sakura-aurora",
    keywords: ["giving tuesday", "charity", "donation", "nonprofit", "kindness"],
  },
  {
    id: "global-hanukkah", month: 12, dateLabel: "25 Kislev (Kalender Ibrani)", country: "global",
    rule: { type: "lunar", calendar: "hebrew", month: "Kislev", day: 25 },
    title: "Hanukkah Festival of Lights", category: "Cultural & Holiday", demand: "Tinggi",
    desc: "Festival cahaya 8 malam; permintaan tinggi di AS & Eropa bersamaan musim liburan.",
    promptTheme: "Sapphire Glass Candelabra Geometry & Silver Starlight Particles (Konstruksi geometris kaca safir dengan 9 cahaya lilin dan partikel perak)",
    recommendedStyle: "frosted-glass", recommendedPalette: "arctic-slate",
    keywords: ["hanukkah", "festival of lights", "menorah", "blue silver", "holiday season"],
  },

  // ======================================================================
  // 🇨🇦 KANADA
  // ======================================================================
  {
    id: "ca-family-day", month: 2, dateLabel: "Senin ke-3 Februari", country: "ca", rule: nth(2, 1, 3),
    title: "Family Day (Canada) & Winter Lodge Warmth", category: "National & Civic", demand: "Stabil",
    desc: "Libur provinsi Kanada (ON, AB, BC, dll.) untuk kebersamaan keluarga di musim dingin.",
    promptTheme: "Cozy Glass Cabin Glow & Falling Maple Snow Crystals (Kabin kaca bercahaya hangat dengan kristal salju berbentuk maple)",
    recommendedStyle: "frosted-glass", recommendedPalette: "arctic-slate",
    keywords: ["family day canada", "winter family", "cozy cabin", "maple snow", "canada holiday"],
  },
  {
    id: "ca-truth-reconciliation", month: 9, dateLabel: "30 September", country: "ca", rule: fixed(9, 30),
    title: "National Day for Truth and Reconciliation", category: "National & Civic", demand: "Stabil",
    desc: "Hari peringatan nasional Kanada (Orange Shirt Day).",
    promptTheme: "Orange Light Feather Ribbons & Healing Circle Geometry (Pita bulu cahaya oranye dengan geometri lingkar penyembuhan)",
    recommendedStyle: "organic-ribbon", recommendedPalette: "obsidian-gold",
    keywords: ["truth and reconciliation", "orange shirt day", "canada", "remembrance", "healing"],
  },

  // ======================================================================
  // 🇩🇪 JERMAN & EROPA
  // ======================================================================
  {
    id: "de-rosenmontag", month: 2, dateLabel: "Senin sebelum Rabu Abu", country: "de", rule: easter(-48),
    title: "Karneval / Rosenmontag (Köln, Düsseldorf, Mainz)", category: "Cultural & Holiday", demand: "Tinggi",
    desc: "Puncak musim karnaval Jerman dengan parade besar di kota-kota Rhine.",
    promptTheme: "Harlequin Diamond Kaleidoscope & Confetti Light Streams (Kaleidoskop pola berlian harlequin dengan aliran konfeti cahaya)",
    recommendedStyle: "swiss-kinetic", recommendedPalette: "titanium-ultraviolet",
    keywords: ["karneval", "rosenmontag", "carnival germany", "harlequin pattern", "confetti"],
  },
  {
    id: "de-pentecost", month: 5, dateLabel: "50 hari setelah Paskah", country: "de", rule: easter(49),
    title: "Pentecost / Pfingsten & Whit Monday", category: "Cultural & Holiday", demand: "Stabil",
    desc: "Libur panjang di Jerman, Prancis, dan Eropa (Pfingstmontag / Lundi de Pentecôte).",
    promptTheme: "Descending Flame Light Prisms & Soft Dove Wing Ribbons (Prisma cahaya api lembut yang turun dengan pita sayap merpati)",
    recommendedStyle: "organic-ribbon", recommendedPalette: "obsidian-gold",
    keywords: ["pentecost", "pfingsten", "whit monday", "spiritual light", "europe holiday"],
  },
  {
    id: "de-st-martin", month: 11, dateLabel: "11 November", country: "de", rule: fixed(11, 11),
    title: "St. Martin's Day Lantern Parade (Martinstag)", category: "Cultural & Holiday", demand: "Stabil",
    desc: "Parade lentera anak-anak di Jerman, Belanda, dan Austria.",
    promptTheme: "Paper Lantern Procession Glow & Autumn Night Mist (Iring-iringan lentera kertas geometris bercahaya di kabut malam musim gugur)",
    recommendedStyle: "frosted-glass", recommendedPalette: "obsidian-gold",
    keywords: ["st martins day", "lantern parade", "martinstag", "autumn night", "lantern glow"],
  },
  {
    id: "de-advent", month: 11, dateLabel: "Minggu Advent ke-1 (27 Nov – 3 Des)", country: "de",
    rule: { type: "onOrBefore", month: 12, day: 3, weekday: 0 },
    title: "First Advent & Christmas Market Season (Weihnachtsmarkt)", category: "Cultural & Holiday", demand: "Sangat Tinggi",
    desc: "Pembukaan musim pasar Natal Eropa — Jerman, Austria, Prancis (Strasbourg), dan UK.",
    promptTheme: "Isometric Christmas Market Chalets & Warm Mulled Light Glow (Deretan kios kayu isometrik dengan cahaya hangat dan salju lembut)",
    recommendedStyle: "isometric-fintech", recommendedPalette: "crimson-imperial",
    keywords: ["advent", "christmas market", "weihnachtsmarkt", "winter market", "festive europe"],
  },
  {
    id: "de-nikolaus", month: 12, dateLabel: "6 Desember", country: "de", rule: fixed(12, 6),
    title: "St. Nicholas Day (Nikolaustag / Sinterklaas)", category: "Cultural & Holiday", demand: "Tinggi",
    desc: "Tradisi hadiah sepatu di Jerman, Belanda, Belgia, dan Eropa Tengah.",
    promptTheme: "Golden Star Gift Cascade & Crimson Velvet Ribbon Swirls (Air terjun bintang emas dan hadiah dengan pusaran pita beludru merah)",
    recommendedStyle: "organic-ribbon", recommendedPalette: "crimson-imperial",
    keywords: ["st nicholas day", "nikolaustag", "sinterklaas", "christmas gifts", "europe tradition"],
  },

  // ======================================================================
  // 🇫🇷 PRANCIS
  // ======================================================================
  {
    id: "fr-epiphany", month: 1, dateLabel: "6 Januari", country: "fr", rule: fixed(1, 6),
    title: "Epiphany / Galette des Rois (Fête des Rois)", category: "Cultural & Holiday", demand: "Stabil",
    desc: "Tradisi kue raja Prancis & Eropa Selatan; populer untuk bakery dan F&B.",
    promptTheme: "Golden Crown Pastry Spiral & Gilded Light Flakes (Spiral pastry emas dengan mahkota kristal dan serpihan cahaya keemasan)",
    recommendedStyle: "organic-ribbon", recommendedPalette: "obsidian-gold",
    keywords: ["epiphany", "galette des rois", "kings cake", "french tradition", "golden crown"],
  },
  {
    id: "fr-fete-musique", month: 6, dateLabel: "21 Juni", country: "fr", rule: fixed(6, 21),
    title: "Fête de la Musique (World Music Day)", category: "Cultural & Holiday", demand: "Tinggi",
    desc: "Festival musik jalanan dari Prancis yang kini dirayakan di 120+ negara.",
    promptTheme: "Kinetic Sound Wave Pillars & Neon Equalizer Ribbons (Pilar gelombang suara 3D yang berdenyut dengan pita equalizer neon)",
    recommendedStyle: "cyber-precision", recommendedPalette: "titanium-ultraviolet",
    keywords: ["world music day", "fete de la musique", "sound wave", "music festival", "equalizer"],
  },
  {
    id: "fr-beaujolais", month: 11, dateLabel: "Kamis ke-3 November", country: "fr", rule: nth(11, 4, 3),
    title: "Beaujolais Nouveau Day (Wine Celebration)", category: "Commercial & Retail", demand: "Stabil",
    desc: "Peluncuran anggur baru Prancis yang dirayakan di Jepang, Eropa, dan AS.",
    promptTheme: "Crimson Liquid Glass Swirl & Vineyard Contour Light (Pusaran cairan kaca merah anggur di atas kontur kebun anggur bercahaya)",
    recommendedStyle: "organic-ribbon", recommendedPalette: "crimson-imperial",
    keywords: ["beaujolais nouveau", "wine celebration", "french wine", "liquid swirl", "vineyard"],
  },

  // ======================================================================
  // 🇦🇺 AUSTRALIA
  // ======================================================================
  {
    id: "au-melbourne-cup", month: 11, dateLabel: "Selasa pertama November", country: "au", rule: nth(11, 2, 1),
    title: "Melbourne Cup Day (The Race That Stops a Nation)", category: "Commercial & Retail", demand: "Tinggi",
    desc: "Event pacuan kuda & fashion terbesar Australia; iklan premium dan hospitality.",
    promptTheme: "Golden Trophy Cup Prism & Racing Light Trails (Prisma piala emas dengan jejak cahaya kecepatan melingkar lintasan)",
    recommendedStyle: "cyber-precision", recommendedPalette: "obsidian-gold",
    keywords: ["melbourne cup", "horse racing", "golden trophy", "spring racing", "australia event"],
  },
  {
    id: "au-summer-christmas", month: 12, dateLabel: "Desember (musim panas)", country: "au", rule: fixed(12, 20),
    title: "Aussie Summer Christmas & Beach Holiday", category: "Seasonal & Nature", demand: "Tinggi",
    desc: "Natal musim panas di Australia & Selandia Baru — visual Natal tropis/pantai yang jarang dibuat kreator.",
    promptTheme: "Coastal Crystal Christmas Tree & Turquoise Wave Light (Pohon Natal kristal di tepi pantai dengan gelombang cahaya turquoise)",
    recommendedStyle: "frosted-glass", recommendedPalette: "void-sky",
    keywords: ["summer christmas", "australian christmas", "beach holiday", "tropical christmas", "coastal"],
  },

  // ======================================================================
  // 🇯🇵 JEPANG
  // ======================================================================
  {
    id: "jp-setsubun", month: 2, dateLabel: "3 Februari", country: "jp", rule: fixed(2, 3),
    title: "Setsubun (Bean Throwing & Spring Eve)", category: "Cultural & Holiday", demand: "Stabil",
    desc: "Malam pergantian musim di Jepang; tradisi melempar kacang untuk keberuntungan.",
    promptTheme: "Scattering Golden Bead Particles & Shoji Lattice Light (Partikel butiran emas yang tersebar di depan kisi shoji bercahaya)",
    recommendedStyle: "swiss-kinetic", recommendedPalette: "crimson-imperial",
    keywords: ["setsubun", "japanese tradition", "shoji lattice", "spring eve", "japan festival"],
  },
  {
    id: "jp-hinamatsuri", month: 3, dateLabel: "3 Maret", country: "jp", rule: fixed(3, 3),
    title: "Hinamatsuri (Girls' Day Doll Festival)", category: "Cultural & Holiday", demand: "Stabil",
    desc: "Festival boneka Jepang dengan nuansa bunga persik merah muda.",
    promptTheme: "Tiered Peach Blossom Glass Platforms & Silk Pastel Ribbons (Panggung kaca bertingkat dengan bunga persik dan pita sutra pastel)",
    recommendedStyle: "isometric-fintech", recommendedPalette: "sakura-aurora",
    keywords: ["hinamatsuri", "girls day", "peach blossom", "japanese doll festival", "pastel"],
  },
  {
    id: "global-white-day", month: 3, dateLabel: "14 Maret", country: "jp", rule: fixed(3, 14),
    title: "White Day (Jepang, Korea, China, Taiwan)", category: "Commercial & Retail", demand: "Tinggi",
    desc: "Balasan Valentine di Asia Timur — puncak belanja cokelat putih, perhiasan, dan kosmetik.",
    promptTheme: "Pearl White Crystal Gift Box & Silver Silk Ribbon Flow (Kotak hadiah kristal putih mutiara dengan aliran pita sutra perak)",
    recommendedStyle: "frosted-glass", recommendedPalette: "arctic-slate",
    keywords: ["white day", "asian valentine", "pearl white", "gift box", "romance asia"],
  },
  {
    id: "jp-kodomo", month: 5, dateLabel: "5 Mei", country: "jp", rule: fixed(5, 5),
    title: "Children's Day (Kodomo no Hi & Koinobori)", category: "Cultural & Holiday", demand: "Tinggi",
    desc: "Hari Anak Jepang & Korea (Eorininal) — bendera ikan koi berkibar.",
    promptTheme: "Flowing Koi Scale Ribbons & Sky Breeze Streamlines (Pita sisik ikan koi 3D yang berkibar di arus angin langit)",
    recommendedStyle: "organic-ribbon", recommendedPalette: "void-sky",
    keywords: ["childrens day", "kodomo no hi", "koinobori", "koi ribbon", "japan may"],
  },
  {
    id: "jp-obon", month: 8, dateLabel: "13 – 16 Agustus", country: "jp", rule: fixed(8, 13),
    title: "Obon Festival & Floating Lantern (Toro Nagashi)", category: "Cultural & Holiday", demand: "Tinggi",
    desc: "Festival leluhur musim panas Jepang dengan lentera terapung di sungai.",
    promptTheme: "Floating Glass Lanterns on Reflective Water Grid (Lentera kaca mengapung di permukaan air reflektif dengan riak cahaya lembut)",
    recommendedStyle: "frosted-glass", recommendedPalette: "obsidian-gold",
    keywords: ["obon", "floating lantern", "toro nagashi", "japanese summer", "water reflection"],
  },
  {
    id: "jp-momiji", month: 11, dateLabel: "November (puncak musim gugur)", country: "jp", rule: fixed(11, 15),
    title: "Momiji Autumn Leaves & Shichi-Go-San", category: "Seasonal & Nature", demand: "Tinggi",
    desc: "Puncak daun merah musim gugur Jepang & festival anak Shichi-Go-San (15 Nov).",
    promptTheme: "Crimson Maple Glass Leaves & Torii Gate Light Corridor (Daun maple kaca merah berjatuhan di koridor gerbang torii bercahaya)",
    recommendedStyle: "frosted-glass", recommendedPalette: "crimson-imperial",
    keywords: ["momiji", "autumn japan", "red maple", "torii gate", "shichi go san"],
  },
  {
    id: "jp-omisoka", month: 12, dateLabel: "31 Desember", country: "jp", rule: fixed(12, 31),
    title: "Ōmisoka & Joya no Kane (Japanese New Year's Eve)", category: "Cultural & Holiday", demand: "Stabil",
    desc: "Malam tahun baru Jepang dengan 108 dentang lonceng kuil.",
    promptTheme: "Resonant Temple Bell Ripples & Midnight Ink Wash Mist (Riak gelombang suara lonceng kuil dengan kabut tinta tengah malam)",
    recommendedStyle: "swiss-kinetic", recommendedPalette: "arctic-slate",
    keywords: ["omisoka", "japanese new year", "temple bell", "joya no kane", "ink wash"],
  },

  // ======================================================================
  // 🇰🇷 KOREA SELATAN
  // ======================================================================
  {
    id: "kr-liberation", month: 8, dateLabel: "15 Agustus", country: "kr", rule: fixed(8, 15),
    title: "Gwangbokjeol (Korean Liberation Day)", category: "National & Civic", demand: "Stabil",
    desc: "Hari kemerdekaan Korea Selatan.",
    promptTheme: "Taeguk Harmony Spiral & Ascending Light Trigrams (Spiral harmoni merah-biru dengan trigram cahaya yang naik)",
    recommendedStyle: "swiss-kinetic", recommendedPalette: "void-sky",
    keywords: ["liberation day korea", "gwangbokjeol", "taeguk", "korean national day", "harmony"],
  },
  {
    id: "kr-hangul", month: 10, dateLabel: "9 Oktober", country: "kr", rule: fixed(10, 9),
    title: "Hangul Day (Korean Alphabet Typography)", category: "National & Civic", demand: "Stabil",
    desc: "Perayaan aksara Hangeul — cocok untuk motion typography geometris.",
    promptTheme: "Modular Geometric Glyph Blocks & Ink Stroke Light Trails (Blok glyph geometris modular yang tersusun dengan jejak sapuan tinta cahaya)",
    recommendedStyle: "swiss-kinetic", recommendedPalette: "arctic-slate",
    keywords: ["hangul day", "korean typography", "geometric glyph", "korean culture", "ink stroke"],
  },
  {
    id: "kr-pepero", month: 11, dateLabel: "11 November", country: "kr", rule: fixed(11, 11),
    title: "Pepero Day (Korea Snack Gift Day)", category: "Commercial & Retail", demand: "Tinggi",
    desc: "Hari hadiah stik cokelat di Korea; kampanye ritel & K-pop sangat masif.",
    promptTheme: "Parallel Chocolate Stick Pillars & Candy Light Sprinkles (Pilar stik paralel isometrik dengan taburan partikel permen cahaya)",
    recommendedStyle: "isometric-fintech", recommendedPalette: "sakura-aurora",
    keywords: ["pepero day", "korea gift", "chocolate sticks", "k-culture", "sweet celebration"],
  },

  // ======================================================================
  // 🇨🇳 CHINA & ASIA TIMUR
  // ======================================================================
  {
    id: "cn-lantern", month: 2, dateLabel: "15 Bulan 1 Imlek", country: "cn", rule: lunarCn(1, 15),
    title: "Lantern Festival (Yuanxiao / Cap Go Meh)", category: "Cultural & Holiday", demand: "Tinggi",
    desc: "Penutup perayaan Imlek; juga dirayakan sebagai Cap Go Meh di Indonesia & Malaysia.",
    promptTheme: "Ascending Crimson Glass Lanterns & Full Moon Halo Glow (Ratusan lentera kaca merah naik perlahan menuju halo bulan purnama)",
    recommendedStyle: "frosted-glass", recommendedPalette: "crimson-imperial",
    keywords: ["lantern festival", "cap go meh", "yuanxiao", "red lanterns", "lunar celebration"],
  },
  {
    id: "cn-dragon-boat", month: 6, dateLabel: "5 Bulan 5 Imlek", country: "cn", rule: lunarCn(5, 5),
    title: "Dragon Boat Festival (Duanwu)", category: "Cultural & Holiday", demand: "Tinggi",
    desc: "Festival perahu naga di China, Taiwan, Hong Kong, dan Singapura.",
    promptTheme: "Serpentine Dragon Scale Ribbon & Jade River Wave Matrix (Pita sisik naga meliuk di atas matriks gelombang sungai giok)",
    recommendedStyle: "organic-ribbon", recommendedPalette: "emerald-mint",
    keywords: ["dragon boat festival", "duanwu", "dragon scale", "jade river", "chinese festival"],
  },
  {
    id: "cn-qixi", month: 8, dateLabel: "7 Bulan 7 Imlek", country: "cn", rule: lunarCn(7, 7),
    title: "Qixi Festival (Chinese Valentine's Day)", category: "Commercial & Retail", demand: "Tinggi",
    desc: "Hari kasih sayang China — kampanye perhiasan, kosmetik, dan e-commerce besar.",
    promptTheme: "Celestial Star Bridge of Glass & Magpie Light Trails (Jembatan bintang kaca melintasi galaksi dengan jejak cahaya burung)",
    recommendedStyle: "frosted-glass", recommendedPalette: "titanium-ultraviolet",
    keywords: ["qixi festival", "chinese valentine", "star bridge", "romance", "galaxy"],
  },
  {
    id: "cn-national-day", month: 10, dateLabel: "1 Oktober (Golden Week)", country: "cn", rule: fixed(10, 1),
    title: "China National Day & Golden Week Travel", category: "National & Civic", demand: "Tinggi",
    desc: "Libur seminggu dengan lonjakan travel & belanja terbesar di China.",
    promptTheme: "Imperial Gold Star Array & Crimson Silk Banner Waves (Susunan bintang emas imperial dengan gelombang panji sutra merah)",
    recommendedStyle: "swiss-kinetic", recommendedPalette: "crimson-imperial",
    keywords: ["china national day", "golden week", "imperial gold", "crimson silk", "celebration"],
  },
  {
    id: "cn-double-12", month: 12, dateLabel: "12 Desember (12.12)", country: "cn", rule: fixed(12, 12),
    title: "12.12 Shopping Festival (Double Twelve / Harbolnas)", category: "Commercial & Retail", demand: "Sangat Tinggi",
    desc: "Festival belanja akhir tahun di China, Indonesia (Harbolnas), Malaysia, dan Filipina.",
    promptTheme: "Twin Numeral Monolith 12.12 & Neon Shopping Cart Stream (Monolit angka kembar 3D dengan aliran ikon belanja neon)",
    recommendedStyle: "cyber-precision", recommendedPalette: "titanium-ultraviolet",
    keywords: ["12.12 sale", "harbolnas", "double twelve", "year end sale", "ecommerce asia"],
  },

  // ======================================================================
  // 🇸🇦 TIMUR TENGAH & DUNIA ISLAM (tanggal Hijriah otomatis — Umm al-Qura)
  // ======================================================================
  {
    id: "me-isra-miraj", month: 1, dateLabel: "27 Rajab", country: "me", rule: hijri(7, 27),
    title: "Isra Mi'raj (Night Journey)", category: "Cultural & Holiday", demand: "Tinggi",
    desc: "Peringatan Isra Mi'raj — libur resmi di Indonesia dan beberapa negara Muslim.",
    promptTheme: "Ascending Celestial Light Pathway & Starlit Arabesque Dome (Jalur cahaya naik menembus langit malam berbintang dengan kubah arabesque)",
    recommendedStyle: "frosted-glass", recommendedPalette: "titanium-ultraviolet",
    keywords: ["isra miraj", "islamic night", "celestial journey", "arabesque dome", "starlit sky"],
  },
  {
    id: "me-laylat-qadr", month: 3, dateLabel: "27 Ramadan", country: "me", rule: hijri(9, 27),
    title: "Laylat al-Qadr (Night of Power)", category: "Cultural & Holiday", demand: "Tinggi",
    desc: "Malam paling mulia di bulan Ramadan; konten religi dan broadcast TV sangat tinggi.",
    promptTheme: "Descending Golden Light Particles & Sacred Geometric Star Canopy (Partikel cahaya emas turun dari kanopi bintang geometris suci)",
    recommendedStyle: "swiss-kinetic", recommendedPalette: "obsidian-gold",
    keywords: ["laylat al qadr", "night of power", "ramadan night", "golden light", "islamic geometry"],
  },
  {
    id: "me-arafah", month: 6, dateLabel: "9 Dzulhijjah", country: "me", rule: hijri(12, 9),
    title: "Day of Arafah & Hajj Pilgrimage", category: "Cultural & Holiday", demand: "Tinggi",
    desc: "Puncak ibadah haji sehari sebelum Idul Adha.",
    promptTheme: "Vast Desert Plain Contour Lines & Sunrise Sacred Light Columns (Garis kontur padang pasir luas dengan pilar cahaya matahari terbit)",
    recommendedStyle: "isometric-fintech", recommendedPalette: "obsidian-gold",
    keywords: ["day of arafah", "hajj", "pilgrimage", "desert sunrise", "islamic"],
  },
  {
    id: "me-islamic-new-year", month: 7, dateLabel: "1 Muharram", country: "me", rule: hijri(1, 1),
    title: "Islamic New Year (Hijri / 1 Muharram)", category: "Cultural & Holiday", demand: "Tinggi",
    desc: "Tahun Baru Hijriah — libur resmi di Indonesia, Malaysia, Saudi, UAE, dan Mesir.",
    promptTheme: "Crescent Moon Crystal & Expanding Arabesque Star Tessellation (Bulan sabit kristal dengan tessellasi bintang arabesque yang meluas)",
    recommendedStyle: "swiss-kinetic", recommendedPalette: "emerald-mint",
    keywords: ["islamic new year", "hijri new year", "1 muharram", "crescent moon", "arabesque"],
  },
  {
    id: "me-mawlid", month: 9, dateLabel: "12 Rabiul Awal", country: "me", rule: hijri(3, 12),
    title: "Mawlid an-Nabi (Maulid Nabi)", category: "Cultural & Holiday", demand: "Tinggi",
    desc: "Peringatan kelahiran Nabi Muhammad SAW — libur resmi di banyak negara Muslim.",
    promptTheme: "Illuminated Emerald Lantern Arches & Floral Arabesque Light (Lengkungan lentera zamrud bercahaya dengan pola arabesque floral)",
    recommendedStyle: "frosted-glass", recommendedPalette: "emerald-mint",
    keywords: ["mawlid", "maulid nabi", "islamic celebration", "emerald lantern", "arabesque floral"],
  },

  // ======================================================================
  // 🇮🇳 INDIA & ASIA SELATAN
  // ======================================================================
  {
    id: "in-raksha-bandhan", month: 8, dateLabel: "Purnama Shravan (Agustus)", country: "in",
    title: "Raksha Bandhan (Sibling Bond Festival)", category: "Cultural & Holiday", demand: "Tinggi",
    desc: "Festival ikatan saudara di India; puncak belanja hadiah & perhiasan.",
    promptTheme: "Intertwined Golden Thread Ribbons & Jewel Mandala Knot (Jalinan benang emas yang saling mengikat membentuk simpul mandala permata)",
    recommendedStyle: "organic-ribbon", recommendedPalette: "crimson-imperial",
    keywords: ["raksha bandhan", "rakhi", "sibling bond", "golden thread", "indian festival"],
  },
  {
    id: "in-ganesh", month: 9, dateLabel: "Agustus / September", country: "in",
    title: "Ganesh Chaturthi Festival", category: "Cultural & Holiday", demand: "Tinggi",
    desc: "Festival 10 hari di Maharashtra & seluruh India dengan dekorasi marigold.",
    promptTheme: "Marigold Petal Mandala Cascade & Saffron Light Rings (Air terjun kelopak marigold membentuk mandala dengan cincin cahaya saffron)",
    recommendedStyle: "swiss-kinetic", recommendedPalette: "obsidian-gold",
    keywords: ["ganesh chaturthi", "marigold mandala", "indian festival", "saffron", "celebration"],
  },
  {
    id: "in-navratri", month: 10, dateLabel: "September / Oktober", country: "in",
    title: "Navratri & Dussehra (Garba Dance Season)", category: "Cultural & Holiday", demand: "Tinggi",
    desc: "Sembilan malam festival tari Garba, ditutup Dussehra; musim belanja menjelang Diwali.",
    promptTheme: "Spinning Mirror-Work Dandiya Patterns & Vibrant Ribbon Whirl (Pola cermin berputar khas Garba dengan pusaran pita warna cerah)",
    recommendedStyle: "organic-ribbon", recommendedPalette: "titanium-ultraviolet",
    keywords: ["navratri", "dussehra", "garba", "dandiya", "indian festival"],
  },

  // ======================================================================
  // 🇧🇷 BRASIL & AMERIKA LATIN
  // ======================================================================
  {
    id: "br-namorados", month: 6, dateLabel: "12 Juni", country: "br", rule: fixed(6, 12),
    title: "Dia dos Namorados (Brazil Valentine's Day)", category: "Commercial & Retail", demand: "Tinggi",
    desc: "Valentine versi Brasil — salah satu momen ritel terbesar Amerika Latin.",
    promptTheme: "Twin Crystal Hearts Orbit-Free Dance & Tropical Rose Light (Dua prisma hati kristal bergerak harmonis dengan cahaya mawar tropis)",
    recommendedStyle: "frosted-glass", recommendedPalette: "sakura-aurora",
    keywords: ["dia dos namorados", "brazil valentine", "crystal hearts", "romance", "latin retail"],
  },
  {
    id: "br-festa-junina", month: 6, dateLabel: "24 Juni (São João)", country: "br", rule: fixed(6, 24),
    title: "Festa Junina (São João Harvest Festival)", category: "Cultural & Holiday", demand: "Tinggi",
    desc: "Festival desa musim dingin Brasil dengan bendera kecil warna-warni dan api unggun.",
    promptTheme: "Colorful Bunting Flag Grid & Bonfire Ember Swirls (Grid bendera segitiga warna-warni dengan pusaran bara api unggun)",
    recommendedStyle: "swiss-kinetic", recommendedPalette: "crimson-imperial",
    keywords: ["festa junina", "sao joao", "bunting flags", "brazil festival", "bonfire"],
  },
  {
    id: "mx-dia-muertos", month: 11, dateLabel: "1 – 2 November", country: "br", rule: fixed(11, 1),
    title: "Día de los Muertos (Mexico & Amerika Latin)", category: "Cultural & Holiday", demand: "Sangat Tinggi",
    desc: "Festival budaya Meksiko yang populer secara global; visual marigold & papel picado.",
    promptTheme: "Papel Picado Lattice Layers & Marigold Light Petal Path (Lapisan kisi kertas potong berwarna dengan jalur kelopak marigold bercahaya)",
    recommendedStyle: "swiss-kinetic", recommendedPalette: "titanium-ultraviolet",
    keywords: ["dia de los muertos", "day of the dead", "papel picado", "marigold", "mexican festival"],
  },

  // ======================================================================
  // 🇮🇩 INDONESIA & ASEAN
  // ======================================================================
  {
    id: "id-nyepi", month: 3, dateLabel: "Maret (Tahun Baru Saka)", country: "id",
    title: "Hari Raya Nyepi (Bali Day of Silence)", category: "Cultural & Holiday", demand: "Stabil",
    desc: "Tahun Baru Saka umat Hindu Bali — hari hening total; visual meditatif dan tenang.",
    promptTheme: "Silent Stone Temple Silhouette & Breathing Moonlight Mist (Siluet pura batu minimalis dengan kabut cahaya bulan yang bernapas pelan)",
    recommendedStyle: "isometric-fintech", recommendedPalette: "arctic-slate",
    keywords: ["nyepi", "bali", "day of silence", "balinese temple", "meditation"],
  },
  {
    id: "id-kartini", month: 4, dateLabel: "21 April", country: "id", rule: fixed(4, 21),
    title: "Hari Kartini (Emansipasi Perempuan Indonesia)", category: "National & Civic", demand: "Tinggi",
    desc: "Peringatan R.A. Kartini; banyak dipakai sekolah, instansi, dan brand fashion/kecantikan.",
    promptTheme: "Batik Kawung Glass Lattice & Rising Light Petals (Kisi kaca bermotif batik kawung dengan kelopak cahaya yang naik anggun)",
    recommendedStyle: "swiss-kinetic", recommendedPalette: "obsidian-gold",
    keywords: ["hari kartini", "women empowerment indonesia", "batik pattern", "kebaya", "emansipasi"],
  },
  {
    id: "id-hardiknas", month: 5, dateLabel: "2 Mei", country: "id", rule: fixed(5, 2),
    title: "Hari Pendidikan Nasional (Hardiknas)", category: "National & Civic", demand: "Stabil",
    desc: "Hari pendidikan nasional; kebutuhan visual sekolah, kampus, dan EdTech.",
    promptTheme: "Stacked Isometric Book Towers & Knowledge Light Network (Menara buku isometrik bertingkat dengan jaringan cahaya pengetahuan)",
    recommendedStyle: "isometric-fintech", recommendedPalette: "void-sky",
    keywords: ["hari pendidikan nasional", "education", "books 3d", "knowledge", "school indonesia"],
  },
  {
    id: "id-pancasila", month: 6, dateLabel: "1 Juni", country: "id", rule: fixed(6, 1),
    title: "Hari Lahir Pancasila", category: "National & Civic", demand: "Tinggi",
    desc: "Libur nasional; kebutuhan video instansi, BUMN, dan sekolah.",
    promptTheme: "Five-Pointed Golden Star Pentagon & Garuda Wing Light Geometry (Pentagon bintang emas lima sila dengan geometri sayap cahaya)",
    recommendedStyle: "swiss-kinetic", recommendedPalette: "crimson-imperial",
    keywords: ["hari lahir pancasila", "pancasila", "garuda", "indonesia national", "golden star"],
  },
  {
    id: "id-batik", month: 10, dateLabel: "2 Oktober", country: "id", rule: fixed(10, 2),
    title: "Hari Batik Nasional", category: "Cultural & Holiday", demand: "Tinggi",
    desc: "Perayaan warisan budaya UNESCO; peluang visual pola batik geometris modern.",
    promptTheme: "Parametric Batik Parang Wave Matrix & Indigo Gold Light (Matriks gelombang batik parang parametrik dengan cahaya indigo dan emas)",
    recommendedStyle: "organic-ribbon", recommendedPalette: "obsidian-gold",
    keywords: ["hari batik nasional", "batik pattern", "indonesian heritage", "parang motif", "unesco"],
  },
  {
    id: "id-sumpah-pemuda", month: 10, dateLabel: "28 Oktober", country: "id", rule: fixed(10, 28),
    title: "Hari Sumpah Pemuda", category: "National & Civic", demand: "Tinggi",
    desc: "Peringatan persatuan pemuda Indonesia; kebutuhan konten sekolah & instansi tinggi.",
    promptTheme: "Converging Youth Light Streams & Unity Crimson-White Monolith (Aliran cahaya dari berbagai arah menyatu ke monolit merah-putih)",
    recommendedStyle: "cyber-precision", recommendedPalette: "crimson-imperial",
    keywords: ["sumpah pemuda", "youth unity", "indonesia", "merah putih", "persatuan"],
  },
  {
    id: "id-pahlawan", month: 11, dateLabel: "10 November", country: "id", rule: fixed(11, 10),
    title: "Hari Pahlawan (Heroes' Day)", category: "National & Civic", demand: "Tinggi",
    desc: "Peringatan pertempuran Surabaya; konten penghormatan nasional.",
    promptTheme: "Heroic Monument Spire & Ascending Crimson Ember Rays (Menara monumen pahlawan dengan sinar bara merah yang naik megah)",
    recommendedStyle: "isometric-fintech", recommendedPalette: "crimson-imperial",
    keywords: ["hari pahlawan", "heroes day indonesia", "monument", "10 november", "tribute"],
  },
  {
    id: "id-hari-ibu", month: 12, dateLabel: "22 Desember", country: "id", rule: fixed(12, 22),
    title: "Hari Ibu Indonesia", category: "Cultural & Holiday", demand: "Tinggi",
    desc: "Hari Ibu versi Indonesia (berbeda dari Mother's Day internasional).",
    promptTheme: "Embracing Glass Petal Bloom & Warm Golden Light Ribbons (Kelopak kaca yang merangkul lembut dengan pita cahaya emas hangat)",
    recommendedStyle: "frosted-glass", recommendedPalette: "sakura-aurora",
    keywords: ["hari ibu", "mothers day indonesia", "warm love", "glass bloom", "22 desember"],
  },

  // ======================================================================
  // 🌐 HARI PERINGATAN INTERNASIONAL (PBB & Global Awareness)
  // ======================================================================
  {
    id: "global-happiness", month: 3, dateLabel: "20 Maret", country: "global", rule: fixed(3, 20),
    title: "International Day of Happiness", category: "Cultural & Holiday", demand: "Stabil",
    desc: "Hari kebahagiaan PBB — tema wellbeing, HR, dan lifestyle.",
    promptTheme: "Bouncing Soft Glass Spheres & Sunburst Light Ribbons (Bola kaca lembut memantul ritmis dengan pita cahaya sinar matahari)",
    recommendedStyle: "frosted-glass", recommendedPalette: "sakura-aurora",
    keywords: ["day of happiness", "wellbeing", "joy", "positive vibes", "lifestyle"],
  },
  {
    id: "global-water-day", month: 3, dateLabel: "22 Maret", country: "global", rule: fixed(3, 22),
    title: "World Water Day", category: "Seasonal & Nature", demand: "Tinggi",
    desc: "Kampanye konservasi air PBB; dipakai NGO, utilitas, dan laporan ESG.",
    promptTheme: "Liquid Glass Droplet Cascade & Caustic Light Ripples (Tetesan air kaca bertingkat dengan riak cahaya kaustik bawah air)",
    recommendedStyle: "frosted-glass", recommendedPalette: "void-sky",
    keywords: ["world water day", "water droplet", "conservation", "sustainability", "caustic light"],
  },
  {
    id: "global-earth-hour", month: 3, dateLabel: "Sabtu terakhir Maret", country: "global", rule: nth(3, 6, -1),
    title: "Earth Hour (Lights Off for the Planet)", category: "Seasonal & Nature", demand: "Stabil",
    desc: "Gerakan mematikan lampu 1 jam secara global oleh WWF.",
    promptTheme: "Dimming City Grid to Starfield Transition & Glowing Planet Core (Grid kota isometrik yang meredup berganti medan bintang dan inti planet bercahaya)",
    recommendedStyle: "isometric-fintech", recommendedPalette: "emerald-mint",
    keywords: ["earth hour", "lights off", "energy saving", "climate action", "wwf"],
  },
  {
    id: "global-health-day", month: 4, dateLabel: "7 April", country: "global", rule: fixed(4, 7),
    title: "World Health Day & MedTech Innovation", category: "Tech & Corporate", demand: "Tinggi",
    desc: "Hari kesehatan WHO; kebutuhan visual rumah sakit, farmasi, dan healthtech.",
    promptTheme: "Holographic DNA Helix Glass & Pulse Line Data Matrix (Heliks DNA kaca holografik dengan matriks data garis denyut jantung)",
    recommendedStyle: "cyber-precision", recommendedPalette: "emerald-mint",
    keywords: ["world health day", "medical technology", "dna helix", "healthcare", "pulse line"],
  },
  {
    id: "global-ocean-day", month: 6, dateLabel: "8 Juni", country: "global", rule: fixed(6, 8),
    title: "World Oceans Day", category: "Seasonal & Nature", demand: "Tinggi",
    desc: "Kampanye perlindungan laut PBB; visual laut abstrak selalu laku.",
    promptTheme: "Layered Ocean Depth Glass Waves & Bioluminescent Particles (Gelombang kaca berlapis kedalaman laut dengan partikel bioluminesensi)",
    recommendedStyle: "organic-ribbon", recommendedPalette: "void-sky",
    keywords: ["world oceans day", "ocean waves", "bioluminescent", "marine conservation", "deep sea"],
  },
  {
    id: "global-coffee-day", month: 10, dateLabel: "1 Oktober", country: "global", rule: fixed(10, 1),
    title: "International Coffee Day", category: "Commercial & Retail", demand: "Tinggi",
    desc: "Hari kopi internasional; kampanye kafe, F&B, dan brand kopi.",
    promptTheme: "Swirling Crema Liquid Spiral & Roasted Bean Geometry (Spiral cairan krema berputar dengan geometri biji kopi panggang)",
    recommendedStyle: "organic-ribbon", recommendedPalette: "obsidian-gold",
    keywords: ["international coffee day", "coffee swirl", "cafe", "espresso", "coffee beans"],
  },
  {
    id: "global-pink-october", month: 10, dateLabel: "Oktober (sebulan penuh)", country: "global", rule: fixed(10, 1),
    title: "Breast Cancer Awareness Month (Pink October)", category: "Cultural & Holiday", demand: "Tinggi",
    desc: "Kampanye kesehatan global dengan pita pink — dipakai rumah sakit, NGO, dan brand.",
    promptTheme: "Flowing Pink Awareness Ribbon & Soft Hope Light Particles (Pita pink 3D yang mengalir anggun dengan partikel cahaya harapan)",
    recommendedStyle: "organic-ribbon", recommendedPalette: "sakura-aurora",
    keywords: ["breast cancer awareness", "pink october", "pink ribbon", "health campaign", "hope"],
  },
  {
    id: "global-mental-health", month: 10, dateLabel: "10 Oktober", country: "global", rule: fixed(10, 10),
    title: "World Mental Health Day", category: "Cultural & Holiday", demand: "Tinggi",
    desc: "Hari kesehatan mental; kebutuhan visual HR, wellness app, dan edukasi.",
    promptTheme: "Calm Breathing Glass Layers & Untangling Light Thread (Lapisan kaca yang 'bernapas' perlahan dengan benang cahaya yang terurai rapi)",
    recommendedStyle: "frosted-glass", recommendedPalette: "emerald-mint",
    keywords: ["mental health day", "wellbeing", "mindfulness", "calm", "self care"],
  },
  {
    id: "global-movember", month: 11, dateLabel: "November (sebulan penuh)", country: "global", rule: fixed(11, 1),
    title: "Movember (Men's Health Awareness)", category: "Cultural & Holiday", demand: "Stabil",
    desc: "Kampanye kesehatan pria global (AU, UK, US, CA).",
    promptTheme: "Bold Geometric Moustache Monolith & Steel Blue Light Grid (Monolit geometris tegas dengan grid cahaya biru baja)",
    recommendedStyle: "swiss-kinetic", recommendedPalette: "arctic-slate",
    keywords: ["movember", "mens health", "awareness month", "moustache", "november campaign"],
  },
  {
    id: "global-kindness", month: 11, dateLabel: "13 November", country: "global", rule: fixed(11, 13),
    title: "World Kindness Day", category: "Cultural & Holiday", demand: "Stabil",
    desc: "Hari kebaikan sedunia — konten sosial, sekolah, dan CSR.",
    promptTheme: "Chain Reaction Glass Domino Hearts & Warm Light Ripple (Reaksi berantai domino kaca berbentuk hati dengan riak cahaya hangat)",
    recommendedStyle: "isometric-fintech", recommendedPalette: "sakura-aurora",
    keywords: ["world kindness day", "kindness", "compassion", "community", "chain reaction"],
  },
  {
    id: "global-aids-day", month: 12, dateLabel: "1 Desember", country: "global", rule: fixed(12, 1),
    title: "World AIDS Day (Red Ribbon)", category: "Cultural & Holiday", demand: "Stabil",
    desc: "Hari kesadaran HIV/AIDS dengan simbol pita merah.",
    promptTheme: "Crimson Awareness Ribbon Loop & Solidarity Light Network (Lilitan pita merah 3D dengan jaringan cahaya solidaritas)",
    recommendedStyle: "organic-ribbon", recommendedPalette: "crimson-imperial",
    keywords: ["world aids day", "red ribbon", "awareness", "solidarity", "health"],
  },
];
