/**
 * GLOBAL EVENT RADAR — KALENDER RISET TEMA MICROSTOCK PER NEGARA & BULAN
 * ----------------------------------------------------------------------
 * Terinspirasi dari timeanddate.com, dikurasi khusus untuk kebutuhan
 * Microstock Motion Graphics (Adobe Stock, Shutterstock, Pond5, Vecteezy).
 *
 * Mudah di-update kapan saja: cukup tambahkan item baru ke array CALENDAR_EVENTS
 * atau gunakan fitur Custom Event di UI yang tersimpan di localStorage.
 */

export type CountryCode =
  | "all"
  | "global"
  | "us"
  | "jp"
  | "de"
  | "uk"
  | "me"
  | "cn"
  | "in"
  | "id";

export type EventCategory =
  | "Cultural & Holiday"
  | "Commercial & Retail"
  | "Seasonal & Nature"
  | "National & Civic"
  | "Tech & Corporate";

export type DemandLevel = "Sangat Tinggi" | "Tinggi" | "Stabil";

export interface CalendarEventItem {
  id: string;
  month: number; // 1 = Januari ... 12 = Desember
  dateLabel: string;
  country: Exclude<CountryCode, "all">;
  title: string;
  category: EventCategory;
  demand: DemandLevel;
  desc: string;
  /** Tema spesifik Anti-Similarity yang langsung masuk ke Studio Master Prompt */
  promptTheme: string;
  /** ID dari STUDIO_STYLE_ANCHORS */
  recommendedStyle:
    | "cyber-precision"
    | "swiss-kinetic"
    | "frosted-glass"
    | "isometric-fintech"
    | "organic-ribbon";
  /** ID dari STUDIO_HEX_PALETTES */
  recommendedPalette:
    | "void-sky"
    | "obsidian-gold"
    | "emerald-mint"
    | "titanium-ultraviolet"
    | "arctic-slate"
    | "crimson-imperial"
    | "sakura-aurora";
  /** Kata kunci microstock bahasa Inggris untuk mempermudah metadata saat upload */
  keywords: string[];
  isCustom?: boolean;
}

export const COUNTRIES: {
  id: CountryCode;
  label: string;
  flag: string;
  marketNote: string;
}[] = [
  {
    id: "all",
    label: "Semua Negara",
    flag: "🌍",
    marketNote: "Menampilkan seluruh kalender event global & regional",
  },
  {
    id: "global",
    label: "Global / Internasional",
    flag: "🌐",
    marketNote: "Event seluruh dunia — volume pencarian tertinggi sepanjang tahun",
  },
  {
    id: "us",
    label: "Amerika Serikat (USA)",
    flag: "🇺🇸",
    marketNote: "Pasar pembeli microstock #1 terbesar di dunia (Corporate, Retail, Holiday)",
  },
  {
    id: "de",
    label: "Jerman & Eropa",
    flag: "🇩🇪",
    marketNote: "Pasar pembeli Eropa terbesar (Engineering, Green Tech, Festival Musiman)",
  },
  {
    id: "uk",
    label: "Inggris (UK)",
    flag: "🇬🇧",
    marketNote: "Pasar agensi kreatif, perbankan, dan event ritel kerajaan/musiman",
  },
  {
    id: "jp",
    label: "Jepang (Japan)",
    flag: "🇯🇵",
    marketNote: "Permintaan tinggi untuk tema musim (Sakura, Momiji), teknologi, dan tradisi",
  },
  {
    id: "cn",
    label: "China & Asia Timur",
    flag: "🇨🇳",
    marketNote: "Pasar raksasa untuk Imlek, Festival Pertengahan Musim Gugur & E-Commerce 11.11",
  },
  {
    id: "me",
    label: "Timur Tengah & Dunia Islam",
    flag: "🇸🇦",
    marketNote: "Permintaan premium untuk geometri Islam, Ramadan, Idul Fitri, dan visi masa depan",
  },
  {
    id: "in",
    label: "India & Asia Selatan",
    flag: "🇮🇳",
    marketNote: "Kebutuhan masif untuk festival cahaya (Diwali), warna (Holi), dan FinTech",
  },
  {
    id: "id",
    label: "Indonesia & ASEAN",
    flag: "🇮🇩",
    marketNote: "Event nasional, kemerdekaan, Lebaran, dan kampanye digital lokal",
  },
];

export const MONTH_NAMES: { num: number; short: string; full: string }[] = [
  { num: 1, short: "Jan", full: "Januari" },
  { num: 2, short: "Feb", full: "Februari" },
  { num: 3, short: "Mar", full: "Maret" },
  { num: 4, short: "Apr", full: "April" },
  { num: 5, short: "Mei", full: "Mei" },
  { num: 6, short: "Jun", full: "Juni" },
  { num: 7, short: "Jul", full: "Juli" },
  { num: 8, short: "Agu", full: "Agustus" },
  { num: 9, short: "Sep", full: "September" },
  { num: 10, short: "Okt", full: "Oktober" },
  { num: 11, short: "Nov", full: "November" },
  { num: 12, short: "Des", full: "Desember" },
];

export type UploadWindowType = "golden" | "active" | "upcoming" | "prep";

export interface UploadWindowStatus {
  type: UploadWindowType;
  label: string;
  desc: string;
  badgeClass: string;
}

/**
 * Menghitung status waktu upload ideal untuk microstock.
 * Agensi & pembeli biasanya membeli aset 1 - 2 bulan SEBELUM hari-H event.
 */
export function getUploadWindowStatus(
  eventMonth: number,
  currentMonth: number = new Date().getMonth() + 1
): UploadWindowStatus {
  const diff = (eventMonth - currentMonth + 12) % 12;

  if (diff === 1 || diff === 2) {
    return {
      type: "golden",
      label: "🔥 Golden Upload Window",
      desc: `${diff} bulan lagi — Waktu paling ideal buat & upload sekarang agar terindeks sebelum puncak pembelian!`,
      badgeClass:
        "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-950/50",
    };
  }
  if (diff === 0) {
    return {
      type: "active",
      label: "🟢 Event Bulan Ini",
      desc: "Sedang berlangsung bulan ini — Cocok untuk pembeli last-minute atau persiapan stok tahun depan.",
      badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    };
  }
  if (diff === 3) {
    return {
      type: "upcoming",
      label: "⚡ Early Bird (3 Bln Lagi)",
      desc: "3 bulan menuju event — Sangat bagus untuk mencuri start di kata kunci kompetitif.",
      badgeClass: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    };
  }
  return {
    type: "prep",
    label: "📅 Riset & Stok Jangka Panjang",
    desc: "Evergreen / persiapan katalog jangka panjang.",
    badgeClass: "bg-white/5 text-zinc-400 border-white/10",
  };
}

export const CALENDAR_EVENTS: CalendarEventItem[] = [
  // ==========================================
  // JANUARI (Bulan 1)
  // ==========================================
  {
    id: "jan-global-newyear",
    month: 1,
    dateLabel: "1 Januari",
    country: "global",
    title: "New Year & Futuristic Countdown Matrix",
    category: "Cultural & Holiday",
    demand: "Sangat Tinggi",
    desc: "Transisi tahun baru, perayaan korporat, dan peluncuran visi tahunan. Hindari kembang api klise; gunakan arsitektur jam/monumen cahaya isometrik.",
    promptTheme:
      "Isometric 3D Chronometer Monolith & Golden Kinetic Portal (Lempengan jam kaca berlapis berputar presisi dengan pancaran partikel emas perayaan tahun baru)",
    recommendedStyle: "frosted-glass",
    recommendedPalette: "obsidian-gold",
    keywords: ["new year", "countdown", "celebration", "golden luxury", "future portal"],
  },
  {
    id: "jan-us-ces-tech",
    month: 1,
    dateLabel: "Minggu ke-1 Januari",
    country: "us",
    title: "Global Consumer Tech & AI Keynote Season (CES)",
    category: "Tech & Corporate",
    demand: "Sangat Tinggi",
    desc: "Awal tahun adalah puncak peluncuran produk teknologi, AI, dan semikonduktor di AS.",
    promptTheme:
      "Next-Gen Silicon Wafer Architecture & Holographic Neural Core (Susunan chip mikroprosesor isometrik 4 tingkat dengan aliran sinyal optik sian)",
    recommendedStyle: "cyber-precision",
    recommendedPalette: "void-sky",
    keywords: ["artificial intelligence", "semiconductor", "quantum processor", "tech keynote", "isometric chip"],
  },
  {
    id: "jan-jp-seijin",
    month: 1,
    dateLabel: "Senin ke-2 Januari",
    country: "jp",
    title: "Seijin no Hi (Coming of Age & New Beginnings)",
    category: "Cultural & Holiday",
    demand: "Tinggi",
    desc: "Hari kedewasaan dan awal musim baru di Jepang; visual pita origami geometris dan pola Asanoha modern sangat diminati.",
    promptTheme:
      "Parametric Origami Crane & Asanoha Geometric Lattice (Jalinan pita lipatan kertas 3D modern dengan aksen emas dan sakura bercahaya)",
    recommendedStyle: "swiss-kinetic",
    recommendedPalette: "sakura-aurora",
    keywords: ["japanese pattern", "origami 3d", "asanoha geometry", "seijin no hi", "modern japan"],
  },
  {
    id: "jan-global-davos",
    month: 1,
    dateLabel: "Pertengahan Januari",
    country: "de",
    title: "European Economic Forum & Global FinTech Forecast",
    category: "Tech & Corporate",
    demand: "Tinggi",
    desc: "Musim laporan tahunan perbankan Eropa (Jerman/Swiss) dan prediksi ekonomi global.",
    promptTheme:
      "Executive FinTech Wealth Monolith & Ascending Data Blocks (Monumen blok finansial 3D isometrik yang naik ritmis dengan garis indeks likuiditas)",
    recommendedStyle: "isometric-fintech",
    recommendedPalette: "arctic-slate",
    keywords: ["economic forum", "financial forecast", "fintech 3d", "corporate data", "wealth management"],
  },
  {
    id: "jan-in-republic",
    month: 1,
    dateLabel: "26 Januari",
    country: "in",
    title: "India Republic Day & Digital India Innovation",
    category: "National & Civic",
    demand: "Tinggi",
    desc: "Perayaan nasional besar di India yang banyak membutuhkan latar belakang korporat dan teknologi modern.",
    promptTheme:
      "Kinetic Chakra Geometry & Tri-Layer Light Ribbon Matrix (Pita gelombang 3D dinamis dengan pusat roda geometris presisi tinggi)",
    recommendedStyle: "organic-ribbon",
    recommendedPalette: "emerald-mint",
    keywords: ["republic day", "digital india", "kinetic ribbon", "chakra geometry", "national celebration"],
  },

  // ==========================================
  // FEBRUARI (Bulan 2)
  // ==========================================
  {
    id: "feb-cn-lunar",
    month: 2,
    dateLabel: "Januari Akhir / Februari",
    country: "cn",
    title: "Lunar New Year / Imlek (Spring Festival)",
    category: "Cultural & Holiday",
    demand: "Sangat Tinggi",
    desc: "Event terbesar di Asia Timur & global. Visual lentera kaca 3D, kisi oriental emas, dan pita merah imperial sangat laris.",
    promptTheme:
      "Imperial Oriental Lattice & Floating 3D Glass Lanterns (Arsitektur kisi oriental emas berlapis dengan lentera kristal melayang dan partikel cahaya hangat)",
    recommendedStyle: "frosted-glass",
    recommendedPalette: "crimson-imperial",
    keywords: ["lunar new year", "chinese new year", "spring festival", "oriental lantern", "imperial gold"],
  },
  {
    id: "feb-global-valentine",
    month: 2,
    dateLabel: "14 Februari",
    country: "global",
    title: "Valentine's Day & Luxury Romance Retail",
    category: "Commercial & Retail",
    demand: "Sangat Tinggi",
    desc: "Kampanye parfum, perhiasan, dan ritel romantis. Hindari hati kartun datar; buat kristal prismatik atau pita sutra 3D.",
    promptTheme:
      "Faceted Rose-Quartz Crystal Prism & Flowing Silk Ribbons (Permata kuarsa mawar multi-faset berputar halus dikelilingi pita cahaya Bezier 3D elegan)",
    recommendedStyle: "organic-ribbon",
    recommendedPalette: "sakura-aurora",
    keywords: ["valentine day", "luxury romance", "rose quartz crystal", "silk ribbon 3d", "jewelry background"],
  },
  {
    id: "feb-us-superbowl",
    month: 2,
    dateLabel: "Minggu ke-2 Februari",
    country: "us",
    title: "Championship Arena & Broadcast Sports HUD",
    category: "Commercial & Retail",
    demand: "Tinggi",
    desc: "Puncak siaran olahraga dan iklan TV di Amerika Serikat; grafis pembuka siaran (broadcast bumper) sangat dicari.",
    promptTheme:
      "Broadcast Stadium Light Matrix & Kinetic Titanium Shield (Konstruksi perisai metalik 3D terbelah dengan sorot lampu matriks arena olahraga futuristik)",
    recommendedStyle: "cyber-precision",
    recommendedPalette: "void-sky",
    keywords: ["sports broadcast", "stadium lights", "championship bumper", "titanium shield", "esports hud"],
  },
  {
    id: "feb-me-founding",
    month: 2,
    dateLabel: "22 Februari",
    country: "me",
    title: "Saudi Founding Day & Arabian Futuristic Vision",
    category: "National & Civic",
    demand: "Tinggi",
    desc: "Pasar Timur Tengah membeli banyak visual arsitektur gurun futuristik dan geometri Arabesque modern.",
    promptTheme:
      "Futuristic Desert Megastructure & Golden Arabesque Tessellation (Monolit kaca reflektif di atas kisi geometris Arabesque emas yang berdenyut harmonis)",
    recommendedStyle: "isometric-fintech",
    recommendedPalette: "obsidian-gold",
    keywords: ["saudi founding day", "arabesque geometry", "future city", "middle east luxury", "golden monolith"],
  },

  // ==========================================
  // MARET (Bulan 3)
  // ==========================================
  {
    id: "mar-global-iwd",
    month: 3,
    dateLabel: "8 Maret",
    country: "global",
    title: "International Women's Day (Empowerment & Leadership)",
    category: "Cultural & Holiday",
    demand: "Sangat Tinggi",
    desc: "Dipakai oleh hampir seluruh perusahaan global untuk kampanye kesetaraan, kepemimpinan, dan acara korporat.",
    promptTheme:
      "Harmonic Blooming Glass Petals & Ascending Pearl Curves (Kelopak kaca frosted berlapis yang mekar anggun dengan kurva cahaya mutiara dan violet)",
    recommendedStyle: "organic-ribbon",
    recommendedPalette: "sakura-aurora",
    keywords: ["international womens day", "empowerment", "elegant abstract", "blooming glass", "leadership event"],
  },
  {
    id: "mar-me-ramadan",
    month: 3,
    dateLabel: "Maret / April (Kalender Hijriah)",
    country: "me",
    title: "Ramadan Kareem & Sacred Islamic Geometry",
    category: "Cultural & Holiday",
    demand: "Sangat Tinggi",
    desc: "Permintaan raksasa di Timur Tengah, Indonesia, Malaysia, dan global untuk broadcast TV, iklan ritel, dan ucapan perusahaan.",
    promptTheme:
      "Sacred 3D Islamic Star Mandalas & Illuminated Crescent Archway (Kisi bintang delapan sudut isometrik berlapis emas dan zamrud dengan lentera kaca bercahaya lembut)",
    recommendedStyle: "swiss-kinetic",
    recommendedPalette: "obsidian-gold",
    keywords: ["ramadan kareem", "islamic geometry", "golden lantern", "arabesque 3d", "eid mubarak"],
  },
  {
    id: "mar-jp-sakura",
    month: 3,
    dateLabel: "Akhir Maret – Awal April",
    country: "jp",
    title: "Sakura Season (Spring Cherry Blossom & Hanami)",
    category: "Seasonal & Nature",
    demand: "Sangat Tinggi",
    desc: "Musim semi Jepang dan promosi wisata/ritel Asia. Visual kelopak kaca transparan dengan angin partikel halus sangat populer.",
    promptTheme:
      "Translucent Sakura Crystal Petals & Breeze Flow Streamlines (Aliran angin kurva Bezier lembut yang membawa kelopak kristal sakura semi-transparan)",
    recommendedStyle: "frosted-glass",
    recommendedPalette: "sakura-aurora",
    keywords: ["cherry blossom", "sakura season", "spring background", "japanese spring", "pink petals 3d"],
  },
  {
    id: "mar-us-stpatrick",
    month: 3,
    dateLabel: "17 Maret",
    country: "us",
    title: "St. Patrick's Emerald Festival (US & UK)",
    category: "Cultural & Holiday",
    demand: "Tinggi",
    desc: "Event ritel, F&B, dan hiburan besar di AS, Irlandia, dan Inggris dengan dominasi warna zamrud dan emas.",
    promptTheme:
      "Faceted Emerald Clover Prism & Liquid Gold Light Trails (Prisma zamrud geometris berfaset tajam dengan pusaran partikel emas mewah)",
    recommendedStyle: "frosted-glass",
    recommendedPalette: "emerald-mint",
    keywords: ["st patricks day", "emerald green", "clover prism", "gold particles", "irish festival"],
  },
  {
    id: "mar-in-holi",
    month: 3,
    dateLabel: "Maret (Purnama Phalguna)",
    country: "in",
    title: "Holi Festival of Colors & Fluid Wave Spectrum",
    category: "Cultural & Holiday",
    demand: "Tinggi",
    desc: "Festival warna musim semi yang juga banyak dipakai untuk iklan produk layar/kamera/kreatif.",
    promptTheme:
      "Volumetric Color Wave Ribbons & Luminous Pigment Particles (Jalinan pita gelombang 3D multi-gradasi ultraviolet dan sian dengan partikel pendaran cahaya)",
    recommendedStyle: "organic-ribbon",
    recommendedPalette: "titanium-ultraviolet",
    keywords: ["festival of colors", "holi festival", "vibrant wave", "color spectrum", "fluid ribbon"],
  },

  // ==========================================
  // APRIL (Bulan 4)
  // ==========================================
  {
    id: "apr-id-lebaran",
    month: 4,
    dateLabel: "Maret Akhir / April (1 Syawal)",
    country: "id",
    title: "Idul Fitri / Eid Al-Fitr Celebration",
    category: "Cultural & Holiday",
    demand: "Sangat Tinggi",
    desc: "Puncak kampanye iklan, perbankan, dan ritel di Indonesia & Timur Tengah.",
    promptTheme:
      "woven 3D Diamond Ketupat Lattice & Emerald Gold Archway (Anyaman berlian isometrik 3D presisi tinggi dengan lengkungan kubah zamrud dan pendaran emas)",
    recommendedStyle: "isometric-fintech",
    recommendedPalette: "emerald-mint",
    keywords: ["eid al fitr", "idul fitri", "islamic archway", "emerald gold", "ketupat geometry"],
  },
  {
    id: "apr-global-earthday",
    month: 4,
    dateLabel: "22 April",
    country: "global",
    title: "Earth Day, ESG & Clean Energy Sustainability",
    category: "Seasonal & Nature",
    demand: "Sangat Tinggi",
    desc: "Salah satu tema korporat paling laku sepanjang tahun untuk laporan ESG, energi terbarukan, dan green tech.",
    promptTheme:
      "Isometric Clean Energy Biosphere & Solar Terraced Grid (Terasering bio-energi hijau isometrik dengan sirkuit energi bersih zamrud dan kubah kaca murni)",
    recommendedStyle: "isometric-fintech",
    recommendedPalette: "emerald-mint",
    keywords: ["earth day", "clean energy", "sustainability esg", "green technology", "carbon neutral"],
  },
  {
    id: "apr-de-easter",
    month: 4,
    dateLabel: "Minggu Paskah (Maret/April)",
    country: "de",
    title: "European Spring & Modern Geometric Easter",
    category: "Cultural & Holiday",
    demand: "Tinggi",
    desc: "Musim libur musim semi dan ritel keluarga di Jerman, Inggris, dan AS.",
    promptTheme:
      "Sculpted Kinetic Ovoid Sculpture & Pastel Glass Rings (Konstruksi pahatan oval bertingkat yang berotasi halus dengan cincin kaca transparan bercahaya)",
    recommendedStyle: "swiss-kinetic",
    recommendedPalette: "sakura-aurora",
    keywords: ["spring holiday", "easter geometry", "kinetic sculpture", "pastel glass", "spring sale"],
  },
  {
    id: "apr-us-tax-finance",
    month: 4,
    dateLabel: "15 April (Q1 Financial Close)",
    country: "us",
    title: "US Tax Season, Q1 Earnings & Audit Analytics",
    category: "Tech & Corporate",
    demand: "Tinggi",
    desc: "Perusahaan finansial, akuntansi, dan SaaS AS banyak membeli visualisasi data dan grafik pertumbuhan.",
    promptTheme:
      "Precision Financial Ledger Matrix & Isometric Growth Columns (Kolom kuartal finansial 3D presisi dengan aliran data audit terenkripsi)",
    recommendedStyle: "isometric-fintech",
    recommendedPalette: "arctic-slate",
    keywords: ["financial report", "tax season", "quarterly earnings", "data analytics", "fintech chart"],
  },

  // ==========================================
  // MEI (Bulan 5)
  // ==========================================
  {
    id: "may-global-labour",
    month: 5,
    dateLabel: "1 Mei",
    country: "global",
    title: "International Workers' Day & Industrial Automation",
    category: "National & Civic",
    demand: "Tinggi",
    desc: "Tema industri 4.0, manufaktur pintar, dan kolaborasi tim global.",
    promptTheme:
      "Interlocking Precision Gear Tessellation & Robotic Assembly Grid (Konstruksi modul mekanikal presisi tinggi yang bergerak sinkron dan harmonis)",
    recommendedStyle: "swiss-kinetic",
    recommendedPalette: "arctic-slate",
    keywords: ["industry 4.0", "smart manufacturing", "precision engineering", "automation grid", "team synergy"],
  },
  {
    id: "may-jp-goldenweek",
    month: 5,
    dateLabel: "29 April – 5 Mei",
    country: "jp",
    title: "Golden Week Travel & Koinobori Wind Matrix",
    category: "Cultural & Holiday",
    demand: "Tinggi",
    desc: "Musim liburan terpanjang di Jepang; visual pita sisik geometris yang berkibar elegan di udara sangat diminati.",
    promptTheme:
      "Parametric Scale Ribbon Waves & Golden Breeze Particles (Gelombang pita berlapis dengan pola sisik geometris modern yang mengalir dinamis)",
    recommendedStyle: "organic-ribbon",
    recommendedPalette: "obsidian-gold",
    keywords: ["golden week", "japanese festival", "flowing ribbon", "parametric wave", "luxury travel"],
  },
  {
    id: "may-us-mothersday",
    month: 5,
    dateLabel: "Minggu ke-2 Mei",
    country: "us",
    title: "Mother's Day Luxury Retail & Floral Prism",
    category: "Commercial & Retail",
    demand: "Sangat Tinggi",
    desc: "Salah satu puncak belanja konsumen terbesar di AS, UK, dan Eropa untuk kosmetik, perhiasan, dan gift card.",
    promptTheme:
      "Luminous Frosted Glass Botanical Sculpture & Pearl Bokeh (Pahatan kelopak bunga dari kaca buram berlapis dengan bias cahaya hangat dan bokeh mutiara)",
    recommendedStyle: "frosted-glass",
    recommendedPalette: "sakura-aurora",
    keywords: ["mothers day", "floral glass", "cosmetic background", "luxury gift", "pearl bokeh"],
  },
  {
    id: "may-us-memorial",
    month: 5,
    dateLabel: "Senin Terakhir Mei",
    country: "us",
    title: "Memorial Day & Summer Kickoff Retail Campaign",
    category: "National & Civic",
    demand: "Tinggi",
    desc: "Penanda awal musim panas dan diskon ritel nasional di Amerika Serikat.",
    promptTheme:
      "Architectural Star Monolith & Radiant Crimson-Blue Light Beams (Monumen bintang 3D presisi dengan sorot cahaya ke atas yang megah dan terhormat)",
    recommendedStyle: "cyber-precision",
    recommendedPalette: "void-sky",
    keywords: ["memorial day", "patriotic background", "star monolith", "american holiday", "summer sale"],
  },

  // ==========================================
  // JUNI (Bulan 6)
  // ==========================================
  {
    id: "jun-global-env",
    month: 6,
    dateLabel: "5 Juni",
    country: "global",
    title: "World Environment Day & Hydrogen/Solar Grid",
    category: "Seasonal & Nature",
    demand: "Sangat Tinggi",
    desc: "Kampanye PBB dan perusahaan multinasional tentang kelestarian ekosistem dan transisi energi bersih.",
    promptTheme:
      "Hydro-Solar Clean Energy Matrix & Floating Glass Leaves (Matriks energi bersih dengan bilah kaca hijau zamrud dan aliran partikel oksigen bercahaya)",
    recommendedStyle: "frosted-glass",
    recommendedPalette: "emerald-mint",
    keywords: ["world environment day", "green energy", "renewable power", "eco technology", "sustainable future"],
  },
  {
    id: "jun-cn-618-midyear",
    month: 6,
    dateLabel: "18 Juni",
    country: "cn",
    title: "618 Mid-Year Mega E-Commerce & Digital Retail",
    category: "Commercial & Retail",
    demand: "Tinggi",
    desc: "Festival belanja pertengahan tahun terbesar di Asia; membutuhkan latar panggung produk 3D (product podium) yang mewah.",
    promptTheme:
      "Isometric Luxury Product Podium & Neon Laser Ring Matrix (Panggung silinder/heksagonal bertingkat 3D untuk showcase produk dengan cincin cahaya dinamis)",
    recommendedStyle: "cyber-precision",
    recommendedPalette: "titanium-ultraviolet",
    keywords: ["product podium", "e-commerce sale", "3d stage", "shopping festival", "luxury showcase"],
  },
  {
    id: "jun-me-hajj-adha",
    month: 6,
    dateLabel: "Juni (10 Dzulhijjah)",
    country: "me",
    title: "Eid Al-Adha & Illuminated Architectural Sanctuary",
    category: "Cultural & Holiday",
    demand: "Sangat Tinggi",
    desc: "Hari raya besar umat Islam di seluruh dunia; visual arsitektur suci minimalis berlapis emas sangat dicari.",
    promptTheme:
      "Minimalist Sacred Cubic Monolith & Concentric Golden Light Ripples (Arsitektur kubus hitam-emas megah di tengah pusaran cincin cahaya geometris yang khidmat)",
    recommendedStyle: "isometric-fintech",
    recommendedPalette: "obsidian-gold",
    keywords: ["eid al adha", "islamic architecture", "golden ripples", "sacred geometry", "hajj season"],
  },
  {
    id: "jun-uk-summer-solstice",
    month: 6,
    dateLabel: "21 Juni",
    country: "uk",
    title: "Summer Solstice, Music Festivals & Solar Wave",
    category: "Seasonal & Nature",
    demand: "Tinggi",
    desc: "Awal musim panas di Inggris, Eropa, dan AS; banyak dipakai untuk visual festival musik, travel, dan event outdoor.",
    promptTheme:
      "Radiant Solar Horizon Matrix & Equalizer Sound Ribbons (Gelombang pita frekuensi suara 3D yang menyatu dengan cakrawala matahari keemasan)",
    recommendedStyle: "organic-ribbon",
    recommendedPalette: "obsidian-gold",
    keywords: ["summer solstice", "music festival", "solar wave", "sound visualizer", "summer party"],
  },

  // ==========================================
  // JULI (Bulan 7)
  // ==========================================
  {
    id: "jul-us-july4",
    month: 7,
    dateLabel: "4 Juli",
    country: "us",
    title: "US Independence Day (4th of July Celebration)",
    category: "National & Civic",
    demand: "Sangat Tinggi",
    desc: "Hari kemerdekaan AS; permintaan sangat tinggi untuk kampanye ritel, TV, dan acara perusahaan.",
    promptTheme:
      "Kinetic Geometric Starburst & Sapphire-Crimson Prism Array (Formasi prisma bintang 3D yang memancarkan gelombang cahaya merah-putih-biru futuristik)",
    recommendedStyle: "swiss-kinetic",
    recommendedPalette: "void-sky",
    keywords: ["4th of july", "independence day", "starburst 3d", "american celebration", "patriotic motion"],
  },
  {
    id: "jul-jp-tanabata",
    month: 7,
    dateLabel: "7 Juli",
    country: "jp",
    title: "Tanabata Star Festival & Milky Way Streamlines",
    category: "Cultural & Holiday",
    demand: "Tinggi",
    desc: "Festival bintang musim panas di Jepang; visual sungai bintang (Milky Way) dan pita harapan warna-warni sangat indah.",
    promptTheme:
      "Celestial Starlight Streamlines & Translucent Tanzaku Ribbons (Jalinan pita kaca bercahaya yang melintasi arus partikel galaksi sian dan ungu)",
    recommendedStyle: "organic-ribbon",
    recommendedPalette: "titanium-ultraviolet",
    keywords: ["tanabata", "star festival", "milky way stream", "celestial ribbon", "japanese summer"],
  },
  {
    id: "jul-global-midyear-corp",
    month: 7,
    dateLabel: " sepanjang Juli",
    country: "global",
    title: "H2 Corporate Strategy & Cloud Cybersecurity Summit",
    category: "Tech & Corporate",
    demand: "Tinggi",
    desc: "Awal semester kedua tahun bisnis; banyak konferensi cloud, keamanan siber, dan perbankan global.",
    promptTheme:
      "Isometric Cyber-Defense Vault & Encrypted Data Shield (Konstruksi perisai heksagonal berlapis yang melindungi inti data kristal dari luar)",
    recommendedStyle: "cyber-precision",
    recommendedPalette: "arctic-slate",
    keywords: ["cybersecurity", "data protection", "encrypted vault", "cloud computing", "network shield"],
  },

  // ==========================================
  // AGUSTUS (Bulan 8)
  // ==========================================
  {
    id: "aug-id-merdeka",
    month: 8,
    dateLabel: "17 Agustus",
    country: "id",
    title: "HUT Kemerdekaan RI (17 Agustus Merah Putih)",
    category: "National & Civic",
    demand: "Sangat Tinggi",
    desc: "Kebutuhan masif di seluruh instansi, BUMN, brand, dan kreator Indonesia sepanjang bulan Agustus.",
    promptTheme:
      "Majestic Crimson-White 3D Ribbon Waves & Golden Garuda Geometry (Gelombang pita 3D Merah-Putih berlapis yang mengalir gagah dengan aksen kilau emas kemerdekaan)",
    recommendedStyle: "organic-ribbon",
    recommendedPalette: "crimson-imperial",
    keywords: ["indonesia independence", "merah putih", "17 agustus", "red white ribbon", "dirgahayu indonesia"],
  },
  {
    id: "aug-us-backtoschool",
    month: 8,
    dateLabel: "Agustus – Awal September",
    country: "us",
    title: "Back to School, EdTech & University Season",
    category: "Commercial & Retail",
    demand: "Sangat Tinggi",
    desc: "Musim belanja terbesar ke-2 di AS dan Eropa untuk laptop, edukasi online (EdTech), dan perlengkapan kampus.",
    promptTheme:
      "Modular Knowledge Cube Matrix & Illuminated Geometric Pathways (Susunan kubus modul pembelajaran 3D isometrik yang saling terhubung membentuk jembatan inovasi)",
    recommendedStyle: "swiss-kinetic",
    recommendedPalette: "void-sky",
    keywords: ["back to school", "edtech", "online learning", "knowledge matrix", "education technology"],
  },
  {
    id: "aug-in-independence",
    month: 8,
    dateLabel: "15 Agustus",
    country: "in",
    title: "India Independence Day & Tech Sovereignty",
    category: "National & Civic",
    demand: "Tinggi",
    desc: "Event nasional raksasa untuk perusahaan teknologi dan media di India.",
    promptTheme:
      "Ascending Tri-Color Light Monoliths & Precision Geometric Hub (Tiga lapisan cahaya dinamis yang mengelilingi arsitektur teknologi masa depan)",
    recommendedStyle: "isometric-fintech",
    recommendedPalette: "emerald-mint",
    keywords: ["independence day india", "national pride", "future tech hub", "dynamic monolith", "celebration background"],
  },

  // ==========================================
  // SEPTEMBER (Bulan 9)
  // ==========================================
  {
    id: "sep-cn-midautumn",
    month: 9,
    dateLabel: "September / Awal Oktober",
    country: "cn",
    title: "Mid-Autumn Moon Festival (China & East Asia)",
    category: "Cultural & Holiday",
    demand: "Sangat Tinggi",
    desc: "Festival bulan purnama musim gugur terbesar kedua setelah Imlek di China, Taiwan, Singapura, dan Vietnam.",
    promptTheme:
      "Luminous Golden Full Moon Sphere & Floating Jade Clouds (Bola purnama emas bercahaya lembut di atas lapisan awan kaca giok isometrik dan lentera terbang)",
    recommendedStyle: "frosted-glass",
    recommendedPalette: "obsidian-gold",
    keywords: ["mid autumn festival", "moon festival", "golden moon", "oriental clouds", "lantern night"],
  },
  {
    id: "sep-de-oktoberfest-autumn",
    month: 9,
    dateLabel: "Pertengahan September – Oktober",
    country: "de",
    title: "European Autumn Harvest, Oktoberfest & Mobility Tech",
    category: "Cultural & Holiday",
    demand: "Tinggi",
    desc: "Musim festival musim gugur di Jerman serta pameran otomotif/mobilitas pintar Eropa (IAA).",
    promptTheme:
      "Bavarian Diamond Lattice & Warm Amber Liquid Gold Flow (Kisi pola berlian geometris presisi tinggi dengan aliran gelombang emas amber yang hangat)",
    recommendedStyle: "swiss-kinetic",
    recommendedPalette: "obsidian-gold",
    keywords: ["autumn festival", "amber gold", "diamond lattice", "german engineering", "harvest season"],
  },
  {
    id: "sep-us-autumn-equinox",
    month: 9,
    dateLabel: "22 September",
    country: "us",
    title: "Autumn Equinox & Golden Fall Foliage Matrix",
    category: "Seasonal & Nature",
    demand: "Sangat Tinggi",
    desc: "Pergantian musim gugur di AS, Kanada, Eropa, dan Jepang (Momiji); sangat laris untuk ritel fashion dan lifestyle.",
    promptTheme:
      "Floating Amber-Gold Faceted Maple Leaves & Warm Light Rays (Dedaunan musim gugur berbentuk kristal amber 3D yang melayang lembut menembus sorot cahaya hangat)",
    recommendedStyle: "frosted-glass",
    recommendedPalette: "obsidian-gold",
    keywords: ["autumn background", "fall season", "golden leaves", "warm bokeh", "autumn equinox"],
  },
  {
    id: "sep-me-saudinational",
    month: 9,
    dateLabel: "23 September",
    country: "me",
    title: "Saudi National Day (Green & Gold Vision 2030)",
    category: "National & Civic",
    demand: "Tinggi",
    desc: "Puncak belanja iklan korporat dan megaprojek di Arab Saudi & Teluk dengan palet Hijau Zamrud dan Emas.",
    promptTheme:
      "Emerald Laser Horizon & Futuristic Neom-Style Glass Towers (Menara kaca masa depan yang memancarkan garis cahaya hijau zamrud dan emas di malam hari)",
    recommendedStyle: "cyber-precision",
    recommendedPalette: "emerald-mint",
    keywords: ["saudi national day", "emerald green", "vision 2030", "futuristic architecture", "arabian gulf"],
  },

  // ==========================================
  // OKTOBER (Bulan 10)
  // ==========================================
  {
    id: "oct-us-halloween",
    month: 10,
    dateLabel: "31 Oktober",
    country: "us",
    title: "Halloween Dark Luxury & Mystery Portal (US/UK/Global)",
    category: "Cultural & Holiday",
    demand: "Sangat Tinggi",
    desc: "Event komersial raksasa di AS, UK, Jepang, dan global. Visual portal gelap misterius dengan neon ungu/oranye sangat dicari.",
    promptTheme:
      "Obsidian Geometric Portal & Glowing Ultraviolet-Amber Fog (Gerbang monolit hitam berfaset tajam yang membuka celah cahaya ultraviolet dan kabut amber misterius)",
    recommendedStyle: "cyber-precision",
    recommendedPalette: "titanium-ultraviolet",
    keywords: ["halloween background", "dark portal", "mysterious fog", "ultraviolet glow", "october event"],
  },
  {
    id: "oct-in-diwali",
    month: 10,
    dateLabel: "Oktober Akhir / November",
    country: "in",
    title: "Diwali Festival of Lights (Luxury Gold & Diya Mandala)",
    category: "Cultural & Holiday",
    demand: "Sangat Tinggi",
    desc: "Musim belanja emas, elektronik, dan perayaan terbesar di India & diaspora global.",
    promptTheme:
      "Illuminated 3D Rangoli Mandala & Floating Golden Light Flames (Kisi mandala berlapis emas dan permata merah yang berputar anggun dengan ratusan titik cahaya hangat)",
    recommendedStyle: "swiss-kinetic",
    recommendedPalette: "crimson-imperial",
    keywords: ["diwali", "festival of lights", "golden mandala", "rangoli 3d", "indian celebration"],
  },
  {
    id: "oct-de-unity",
    month: 10,
    dateLabel: "3 Oktober",
    country: "de",
    title: "German Unity Day & European Cybersecurity Month",
    category: "Tech & Corporate",
    demand: "Tinggi",
    desc: "Oktober juga merupakan Bulan Kesadaran Keamanan Siber (Cybersecurity Awareness Month) di AS & Eropa.",
    promptTheme:
      "Quantum Encryption Lattice & Interconnected European Node Matrix (Jaringan simpul data isometrik yang saling mengunci dengan sinyal keamanan sian)",
    recommendedStyle: "isometric-fintech",
    recommendedPalette: "void-sky",
    keywords: ["cyber security month", "quantum encryption", "network nodes", "digital unity", "european tech"],
  },

  // ==========================================
  // NOVEMBER (Bulan 11)
  // ==========================================
  {
    id: "nov-global-blackfriday",
    month: 11,
    dateLabel: "Jumat ke-4 November",
    country: "global",
    title: "Black Friday & Cyber Monday Mega Sale",
    category: "Commercial & Retail",
    demand: "Sangat Tinggi",
    desc: "Puncak belanja e-commerce dan ritel terbesar di dunia. Visual hitam-emas (Black & Gold Luxury) adalah raja penjualan!",
    promptTheme:
      "Matte Obsidian 3D Showcase Cubes & Liquid Gold Laser Borders (Susunan kubus hitam matte bertepi emas cair berkilau yang membuka panggung promo eksklusif)",
    recommendedStyle: "cyber-precision",
    recommendedPalette: "obsidian-gold",
    keywords: ["black friday", "cyber monday", "luxury sale", "black and gold", "3d podium"],
  },
  {
    id: "nov-cn-singlesday",
    month: 11,
    dateLabel: "11 November (11.11)",
    country: "cn",
    title: "11.11 Global Shopping Festival (Asia & E-Commerce)",
    category: "Commercial & Retail",
    demand: "Sangat Tinggi",
    desc: "Festival belanja online terbesar di China, Indonesia, dan Asia Tenggara.",
    promptTheme:
      "High-Energy Neon Portal & Isometric Gift Box Conveyor Matrix (Arus matriks 3D berkecepatan tinggi dengan cincin neon magenta-sian untuk kampanye mega sale)",
    recommendedStyle: "cyber-precision",
    recommendedPalette: "titanium-ultraviolet",
    keywords: ["11.11 sale", "shopping festival", "ecommerce background", "neon stage", "mega discount"],
  },
  {
    id: "nov-us-thanksgiving",
    month: 11,
    dateLabel: "Kamis ke-4 November",
    country: "us",
    title: "Thanksgiving Warm Harvest & Gratitude Season",
    category: "Cultural & Holiday",
    demand: "Sangat Tinggi",
    desc: "Hari libur keluarga dan ritel utama di Amerika Serikat dan Kanada.",
    promptTheme:
      "Warm Bronze & Amber Silk Waves with Golden Dust Bokeh (Aliran gelombang pita perunggu dan emas hangat dengan taburan partikel cahaya musim panen)",
    recommendedStyle: "organic-ribbon",
    recommendedPalette: "obsidian-gold",
    keywords: ["thanksgiving", "warm autumn", "golden harvest", "gratitude background", "amber waves"],
  },
  {
    id: "nov-uk-bonfire",
    month: 11,
    dateLabel: "5 November",
    country: "uk",
    title: "UK Bonfire Night & Winter Light Installations",
    category: "Cultural & Holiday",
    demand: "Stabil",
    desc: "Awal musim festival cahaya musim dingin di Inggris dan Eropa.",
    promptTheme:
      "Kinetic Sparkler Trails & Ascending Ember Geometry (Lintasan partikel bara emas dan merah yang naik berputar membentuk struktur spiral 3D)",
    recommendedStyle: "organic-ribbon",
    recommendedPalette: "crimson-imperial",
    keywords: ["bonfire night", "fire sparks", "golden embers", "winter lights", "spiral particles"],
  },

  // ==========================================
  // DESEMBER (Bulan 12)
  // ==========================================
  {
    id: "dec-global-christmas",
    month: 12,
    dateLabel: "25 Desember",
    country: "global",
    title: "Christmas & Winter Wonderland Luxury Holiday",
    category: "Cultural & Holiday",
    demand: "Sangat Tinggi",
    desc: "Tema dengan volume pembelian tertinggi di seluruh dunia selama Q4 (Oktober–Desember).",
    promptTheme:
      "Geometric Crystal Christmas Tree & Golden Starlight Snowfall (Konstruksi pohon kristal kerucut berfaset berlian yang berputar anggun di tengah salju bokeh emas)",
    recommendedStyle: "frosted-glass",
    recommendedPalette: "crimson-imperial",
    keywords: ["christmas background", "winter holiday", "crystal tree", "golden bokeh", "festive luxury"],
  },
  {
    id: "dec-de-winter-snowflake",
    month: 12,
    dateLabel: "Desember – Januari",
    country: "de",
    title: "Alpine Winter Frost & Crystalline Snowflake Matrix",
    category: "Seasonal & Nature",
    demand: "Sangat Tinggi",
    desc: "Visual musim dingin non-religius yang bisa dipakai oleh semua brand global dari Desember hingga Februari.",
    promptTheme:
      "Macro 3D Ice Crystal Fractal & Glacier Cyan Aurora (Struktur kristal salju heksagonal kaca buram presisi tinggi dengan bias cahaya aurora biru es)",
    recommendedStyle: "frosted-glass",
    recommendedPalette: "arctic-slate",
    keywords: ["winter background", "ice crystal", "snowflake 3d", "glacier blue", "frost glass"],
  },
  {
    id: "dec-global-yearreview",
    month: 12,
    dateLabel: "Akhir Desember",
    country: "global",
    title: "Year-in-Review, Annual Awards & Gala Ceremony",
    category: "Tech & Corporate",
    demand: "Sangat Tinggi",
    desc: "Setiap perusahaan, stasiun TV, dan kreator membuat video kilas balik tahunan (Wrapped / Rewind) dan malam penghargaan.",
    promptTheme:
      "Luxury Award Stage Monolith & Ascending Golden Confetti Stream (Panggung trofi monolit hitam-emas mewah dengan tirai partikel cahaya vertikal)",
    recommendedStyle: "isometric-fintech",
    recommendedPalette: "obsidian-gold",
    keywords: ["awards ceremony", "gala background", "year in review", "golden stage", "luxury trophy"],
  },
  {
    id: "dec-me-uaenational",
    month: 12,
    dateLabel: "2 Desember",
    country: "me",
    title: "UAE National Day (Eid Al Etihad) & Dubai Future Skyline",
    category: "National & Civic",
    demand: "Tinggi",
    desc: "Event besar di Uni Emirat Arab (Dubai/Abu Dhabi) dengan anggaran produksi visual yang sangat tinggi.",
    promptTheme:
      "Futuristic Skyscraper Light Matrix & Falcon Wing Geometry (Siluet arsitektur menara masa depan dengan bentangan sayap geometris emas dan cahaya laser)",
    recommendedStyle: "cyber-precision",
    recommendedPalette: "obsidian-gold",
    keywords: ["uae national day", "dubai skyline", "future architecture", "golden falcon", "luxury celebration"],
  },
];
