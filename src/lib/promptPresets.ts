/**
 * Preset tema & gaya visual untuk Prompt AI mode Canvas.
 * - Kategori bertanda "✨ … (Rare)" berisi niche yang jarang dipakai di microstock
 *   (persaingan rendah, peluang laku lebih tinggi).
 * - Item duplikat (huruf besar/kecil diabaikan) otomatis dibuang; kemunculan pertama dipakai.
 */

export interface PresetCategory {
  id: string;
  label: string; // termasuk emoji
  items: string[];
}

/** Buang item duplikat lintas kategori dan kategori kosong. */
function dedupe(cats: PresetCategory[]): PresetCategory[] {
  const seen = new Set<string>();
  return cats
    .map((c) => ({
      ...c,
      items: c.items.filter((raw) => {
        const k = raw.trim().toLowerCase();
        if (!k || seen.has(k)) return false;
        seen.add(k);
        return true;
      }),
    }))
    .filter((c) => c.items.length > 0);
}

/** Urutkan agar kategori referensi tampil paling atas sesuai urutan app referensi. */
function orderFirst(cats: PresetCategory[], ids: string[]): PresetCategory[] {
  const rank = (c: PresetCategory) => {
    const i = ids.indexOf(c.id);
    return i < 0 ? ids.length : i;
  };
  // sort stabil: kategori tambahan tetap pada urutan aslinya
  return cats.map((c, i) => ({ c, i })).sort((a, b) => rank(a.c) - rank(b.c) || a.i - b.i).map((x) => x.c);
}

/** 9 kategori tema dari app referensi, sesuai urutan dropdown-nya. */
const REFERENCE_THEME_ORDER = [
  "business",
  "tech",
  "ecommerce",
  "edu-health",
  "lifestyle",
  "holiday",
  "nature",
  "architecture",
  "ui",
];

// ============================== TEMA VIDEO ==============================

export const THEME_CATEGORIES: PresetCategory[] = dedupe(orderFirst([
  {
    id: "business",
    label: "💼 Business & Finance",
    items: [
      // referensi
      "Business", "Finance", "Investment", "Banking", "Digital Payment", "Cryptocurrency", "Blockchain",
      "Stock Market", "Trading Dashboard", "Tax & Accounting", "Invoice & Payment", "Business Growth", "Startup",
      "Teamwork", "Corporate Presentation", "Remote Work", "Office Workflow", "Project Management", "Productivity",
      // tambahan
      "Corporate Infographics & Charts", "Financial Growth Graph", "Investment Portfolio", "Global Trade",
      "Business Strategy Roadmap", "Profit & Loss Report", "Merger & Acquisition", "Franchise Business",
      "Small Business (UMKM)", "Marketing Funnel",
    ],
  },
  {
    id: "fintech-rare",
    label: "💳 ✨ Fintech & Ekonomi Niche (Rare)",
    items: [
      "Inflation Explained", "Interest Rate Change", "Compound Interest Growth", "Micro Investing",
      "Buy Now Pay Later", "QRIS Payment", "Cross-border Remittance", "Sharia Banking", "Zakat & Charity Giving",
      "Gold Savings", "Carbon Credit Trading", "ESG Investing", "Supply Chain Disruption", "Gig Economy",
      "Creator Economy", "Subscription Economy", "Asset Tokenization", "Digital Currency (CBDC)",
      "Personal Budgeting", "Emergency Fund", "Debt Payoff Plan", "Retirement Planning",
    ],
  },
  {
    id: "tech",
    label: "⚡ Technology & AI",
    items: [
      // referensi
      "Data Analytics", "Big Data", "Cloud Computing", "Cyber Security", "Password Protection", "Data Privacy",
      "Artificial Intelligence", "Machine Learning", "AI Assistant", "AI Automation", "Robot Technology",
      "Neural Network", "SaaS Dashboard", "App Promo", "Website UI", "Mobile App", "Software Update",
      "Code Development", "No-Code Platform",
      // tambahan
      "Futuristic HUD Interface", "Data Center & Server", "Digital Circuit Board", "Internet of Things",
      "5G Network Connection", "Prompt Engineering", "AI Image Generation", "Chatbot Conversation",
      "Computer Vision Detection", "Voice Assistant Waveform", "API Integration", "DevOps Pipeline",
      "Open Source Collaboration",
    ],
  },
  {
    id: "future-rare",
    label: "🚀 ✨ Future Tech & Emerging (Rare)",
    items: [
      "Quantum Computing", "Fusion Energy Reactor", "Hydrogen Fuel Cell", "Carbon Capture Technology",
      "Brain-Computer Interface", "Digital Twin", "Edge Computing", "Spatial Computing AR",
      "Autonomous Vehicle Lidar", "Drone Swarm", "Wearable Health Sensor", "6G Network",
      "Satellite Internet Constellation", "Vertical Farming", "Precision Agriculture Drone", "Battery Recycling",
      "E-waste Recycling", "Space Elevator", "Asteroid Mining", "Exoskeleton Robotics",
      "Biometric Authentication", "Smart Contact Lens",
    ],
  },
  {
    id: "ecommerce",
    label: "📣 E-Commerce & Marketing",
    items: [
      // referensi
      "E-commerce", "Online Shopping", "Flash Sale", "Discount Promo", "Shopping Cart", "Delivery Service",
      "Package Tracking", "Customer Review", "Loyalty Program", "Upload File", "Download File", "Cloud Storage",
      "Notification Popup", "Social Media Notification", "Chat Message", "Email Marketing", "Newsletter",
      "Content Creator", "Influencer Marketing",
      // tambahan
      "Affiliate Marketing", "Live Shopping", "Product Launch", "Price Comparison", "Cashback Reward",
      "Voucher Code", "Checkout Process", "Dropshipping", "Marketplace Seller Dashboard", "Unboxing Moment",
    ],
  },
  {
    id: "ui",
    label: "🎨 UI Elements & Backdrops",
    items: [
      // referensi
      "Loading Bar", "Progress Bar", "Infographic", "Chart Animation", "Percentage Count Up", "Number Counter",
      "Statistics", "Timeline", "Checklist", "Success Animation", "Error Alert", "Warning Notification",
      "Coming Soon", "Opening Title", "Lower Third", "Logo Reveal Placeholder", "Abstract Background",
      "Gradient Background", "Geometric Background", "Loop Background", "Green Screen Element",
      "Transparent Overlay Element",
    ],
  },
  {
    id: "app-ui",
    label: "📲 Social Media & App UI",
    items: [
      "Like & Follow Counter", "Subscribe Button", "Chat Bubbles", "App Onboarding Screens", "Mobile App Mockup",
      "Dashboard UI", "Emoji Reactions", "Live Streaming Badge", "QR Code Scan", "Password Strength Meter",
      "Toggle Switch UI", "Rating Stars", "Calendar Event", "Weather Widget", "Story Progress Bar",
      "Search Bar Typing", "Dark Mode Toggle",
    ],
  },
  {
    id: "data-rare",
    label: "📊 ✨ Data Storytelling & Infografis (Rare)",
    items: [
      "Population Growth Map", "World Time Zones", "Election Results Chart", "Weather Forecast Graphic",
      "Earthquake Seismograph", "Traffic Heatmap", "Air Quality Index", "Global Temperature Rise",
      "Migration Flow Map", "Pie Chart Breakdown", "Bar Chart Race", "Venn Diagram", "Org Chart",
      "Flowchart Process", "Mind Map", "Gantt Timeline", "KPI Scorecard", "Survey Results",
      "Before vs After Comparison", "Step-by-Step Tutorial",
    ],
  },
  {
    id: "edu-health",
    label: "🎓 Education & Healthcare",
    items: [
      // referensi
      "Online Course", "E-Learning", "Back to School", "Education Technology", "Graduation", "Reading & Study",
      "Science & Research", "Medical Technology", "Healthcare", "Hospital Service", "Doctor Appointment",
      "Mental Health",
      // tambahan
      "Math & Formulas", "Science for Kids", "Books & Library", "Alphabet & Numbers", "Creative Ideas Lightbulb",
      "Puzzle & Problem Solving", "World Map Geography", "Chemistry Experiment", "Language Learning",
      "Exam Preparation", "Scholarship Program", "Telemedicine", "Pharmacy & Pills", "Heartbeat ECG",
      "Vaccination Campaign", "Blood Donation", "Dental Care",
    ],
  },
  {
    id: "science",
    label: "🔬 Science & Medical",
    items: [
      "DNA Helix", "Molecular Structure", "Virus & Immune System", "Brain & Neuroscience", "Laboratory Research",
      "Atom & Physics", "Genetic Engineering", "Microscopic Cells", "Photosynthesis Process", "Water Cycle",
      "Plate Tectonics", "Earth Magnetic Field", "Light Spectrum Prism",
    ],
  },
  {
    id: "science-rare",
    label: "🧬 ✨ Sains Langka (Rare)",
    items: [
      "Mycelium Network", "Bioluminescent Plankton", "Tardigrade Micro World", "CRISPR Gene Editing",
      "Protein Folding", "Synthetic Biology", "Lab-Grown Meat", "Microplastics in Ocean", "Coral Bleaching",
      "Gut Microbiome", "Circadian Rhythm", "Sleep Cycle Science", "mRNA Vaccine Mechanism",
      "Antibiotic Resistance", "Neurotransmitter Synapse", "Stem Cell Division", "Nanotechnology Robots",
    ],
  },
  {
    id: "lifestyle",
    label: "☀️ Lifestyle, Fitness & Sports",
    items: [
      // referensi
      "Fitness App", "Healthy Lifestyle", "Nutrition", "Yoga & Wellness", "Gaming", "Esports", "Live Streaming",
      "Scoreboard", "Sports Event", "Fitness Challenge", "Countdown Timer", "Stopwatch",
      // tambahan
      "Marathon Running", "Cycling Route", "Football Match Stats", "Basketball Score", "Badminton Rally",
      "Swimming Lap", "Hiking Trail", "Camping Night", "Meal Prep", "Morning Routine", "Podcast Recording",
      "Music Equalizer", "Music & Concert", "Fashion & Shopping",
    ],
  },
  {
    id: "wellbeing-rare",
    label: "🧘 ✨ Health & Wellbeing Niche (Rare)",
    items: [
      "Burnout Recovery", "Breathing Exercise Guide", "Hydration Reminder", "Step Counter", "Sleep Tracker",
      "Heart Rate Monitor", "Posture Correction", "Digital Detox", "Self-Care Routine", "Skin Care Routine",
      "Eye Health", "Stress Relief", "Gratitude Journal", "Elderly Care", "Menstrual Cycle Tracker",
    ],
  },
  {
    id: "gaming-rare",
    label: "🎮 ✨ Gaming & Interactive (Rare)",
    items: [
      "Pixel Arcade", "Level Up XP Bar", "Loot Box Reveal", "Achievement Unlocked", "Health Bar HUD",
      "Retro Game Over", "Racing Speedometer", "Battle Zone Shrinking", "Card Game Deal", "Chess Strategy",
      "Dice Roll", "Puzzle Tiles", "Rhythm Game Beats", "Spin Wheel Prize", "Quiz Game Show",
    ],
  },
  {
    id: "holiday",
    label: "🛍️ Holidays & Celebrations",
    items: [
      // referensi
      "Black Friday", "Cyber Monday", "Christmas Sale", "New Year", "Ramadan", "Eid Mubarak", "Halloween",
      "Valentine", "Happy Birthday", "Wedding", "Anniversary", "Mother's Day", "Father's Day",
      "Independence Day", "World Health Day", "Earth Day",
      // tambahan
      "Chinese New Year", "Diwali", "Thanksgiving", "Easter", "International Women's Day",
      "World Environment Day", "World Oceans Day", "Mid-Autumn Festival", "Holi Festival", "Songkran",
      "Día de Muertos", "Hanukkah",
    ],
  },
  {
    id: "holiday-id-rare",
    label: "🇮🇩 ✨ Hari Besar Indonesia & Islam (Rare)",
    items: [
      "Hari Kemerdekaan RI (17 Agustus)", "Hari Batik Nasional", "Hari Kartini", "Hari Guru Nasional",
      "Hari Pahlawan", "Hari Sumpah Pemuda", "Nyepi", "Waisak", "Isra Miraj", "Maulid Nabi",
      "Tahun Baru Islam (1 Muharram)", "Idul Adha (Qurban)", "Lailatul Qadar", "Mudik Lebaran",
      "Ngabuburit Sore Ramadan",
    ],
  },
  {
    id: "nature",
    label: "🏝️ Nature, Travel & Services",
    items: [
      // referensi
      "Environment", "Green Energy", "Solar Panel", "Wind Energy", "Recycling", "Sustainability", "Climate Change",
      "Nature Background", "Ocean", "Beach", "Summer", "Travel", "Tourism", "Hotel Booking", "Flight Booking",
      "Map Navigation", "Adventure", "Food Delivery", "Restaurant Promo", "Coffee Shop", "Cooking",
      // tambahan
      "Tropical Forest", "Mountain Landscape", "Sunrise & Sunset", "Rain & Weather", "Seasons Change",
      "Flowers Blooming", "Desert Dunes", "Waterfall", "Wildlife Silhouette", "Underwater Coral Reef",
      "Electric Vehicle Charging", "Carbon Neutral", "Water Conservation", "Green City", "Smart Grid",
    ],
  },
  {
    id: "phenomena-rare",
    label: "🌋 ✨ Fenomena Alam Langka (Rare)",
    items: [
      "Northern Lights Aurora", "Bioluminescent Beach", "Volcanic Lava Flow", "Lightning Storm",
      "Tornado Formation", "Glacier Melting", "Sand Ripples by Wind", "Monsoon Rain", "Firefly Forest Night",
      "Cherry Blossom Falling", "Autumn Leaves Falling", "Desert Mirage", "Rainbow Formation",
      "Fog Valley Morning", "Mangrove Forest", "Rice Terrace", "Deep Sea Creatures", "Jellyfish Swarm",
      "Solar Eclipse",
    ],
  },
  {
    id: "space",
    label: "🌌 Space & Cosmos",
    items: [
      "Galaxy Spiral", "Solar System Planets", "Rocket Launch", "Starfield Hyperspace", "Black Hole",
      "Astronaut Orbit", "Nebula Clouds", "Moon Phases", "Satellite Network", "Meteor Shower", "Alien Planet",
      "Constellation Map", "Mars Colony", "Space Station Docking",
    ],
  },
  {
    id: "architecture",
    label: "🏠 Architecture & Legal Services",
    items: [
      // referensi
      "Real Estate", "Smart Home", "Interior Design", "Architecture", "Construction", "Insurance",
      "Legal Service", "Recruitment", "Human Resources", "Job Hiring", "Resume / CV", "Customer Support",
      "Call Center",
      // tambahan
      "Smart City Skyline", "Night City Lights", "Traffic & Transportation", "Property Mortgage",
      "Notary Service", "Event Organizer", "Photography Studio",
    ],
  },
  {
    id: "services-rare",
    label: "🧰 ✨ Jasa Lokal & UMKM (Rare)",
    items: [
      "Pet Care & Veterinary", "Laundry Service", "Cleaning Service", "Car Repair Workshop", "Motorcycle Service",
      "Courier Logistics", "Printing Service", "Barbershop", "Beauty Salon", "Tailor & Sewing",
      "Catering Service", "Home Renovation", "AC Service & Repair", "Driving School", "Daycare Service",
    ],
  },
  {
    id: "industry",
    label: "🏭 Industry & Engineering",
    items: [
      "Factory Automation", "Gears & Machinery", "Oil & Gas", "Logistics Warehouse", "3D Printing",
      "Manufacturing Line", "Electrical Power", "Engineering Blueprint", "Mining Industry", "Shipping Containers",
      "Drone Delivery", "Robotic Arm Assembly", "Quality Control Inspection",
    ],
  },
  {
    id: "food-rare",
    label: "🍜 ✨ Food & Kuliner Niche (Rare)",
    items: [
      "Coffee Latte Art", "Bubble Tea", "Ramen Steam", "Sushi Conveyor", "Bakery Bread Rising", "Spice Market",
      "Fruit Splash", "Smoothie Blend", "Chocolate Melting", "Night Market Street Food", "Nusantara Coffee",
      "Plant-Based Food", "Nutrition Facts Label", "Recipe Steps", "Sambal & Rempah", "Jamu Herbal Drink",
    ],
  },
  {
    id: "culture-rare",
    label: "🕌 ✨ Budaya Nusantara & Dunia (Rare)",
    items: [
      "Batik Indonesia", "Wayang Kulit Silhouette", "Gamelan Rhythm", "Songket Pattern", "Ondel-ondel",
      "Reog Ponorogo", "Toraja Ornament", "Dayak Motif", "Rumah Gadang", "Borobudur Stupa",
      "Islamic Geometric Pattern", "Arabic Calligraphy Ornament", "Moroccan Zellige Tile",
      "Japanese Seigaiha Wave", "Chinese Lantern", "Indian Rangoli", "Mexican Papel Picado",
      "African Kente Pattern", "Nordic Folk Pattern", "Celtic Knot", "Mandala Art", "Japanese Zen Garden",
      "World Heritage Monuments",
    ],
  },
  {
    id: "spiritual",
    label: "🌙 Spiritual & Mindfulness",
    items: [
      "Mosque Silhouette", "Prayer Times Reminder", "Quran Light Glow", "Tasbih Prayer Beads", "Hajj Pilgrimage",
      "Sahur & Iftar Time", "Meditation & Mindfulness", "Yoga Chakra", "Lantern Festival",
      "Candle Prayer Vigil", "Sacred Geometry",
    ],
  },
], REFERENCE_THEME_ORDER));

// ============================== GAYA VISUAL ==============================

export const STYLE_CATEGORIES: PresetCategory[] = dedupe([
  {
    id: "vector",
    label: "📐 Vector & Flat Design",
    items: [
      // referensi
      "Flat Vector", "Modern Flat Vector", "Bold Vector", "Minimal Vector", "Premium Vector", "Line Art",
      "Outline Style", "Monoline", "Thick Stroke", "Doodle Style", "Hand Drawn", "Cartoon Vector",
      "Cute Rounded", "Playful Colorful", "Pastel Soft",
      // tambahan
      "Flat Illustration", "Material Design", "Corporate Memphis", "Isometric Flat", "Duotone Vector",
      "Long Shadow Flat", "Geometric Vector", "Infographic Style",
    ],
  },
  {
    id: "corporate",
    label: "🏢 Corporate & Minimal",
    items: [
      // referensi
      "Corporate Clean", "Corporate Modern", "Luxury Minimal", "Elegant Minimal", "Business Professional",
      "Warm Minimal", "Cool Minimal", "Light Mode", "Dark Mode",
      // tambahan
      "Swiss Design", "Data Visualization", "Elegant Luxury Gold", "Monochrome Professional",
      "Navy & White Corporate", "Editorial Layout", "Dashboard Analytics", "Clean White Space", "Premium Dark",
    ],
  },
  {
    id: "gradient",
    label: "🌈 Gradients & Backdrops",
    items: [
      // referensi
      "Soft Gradient", "Mesh Gradient", "Abstract Gradient", "Dark Gradient", "Pastel Gradient",
      "Colorful Gradient", "Abstract Background", "Gradient Background", "Geometric Background", "Loop Background",
      // tambahan
      "Aurora Gradient", "Duotone Gradient", "Vibrant Gradient", "Gradient Blob", "Spotlight Gradient",
    ],
  },
  {
    id: "glass3d",
    label: "🔮 Modern UI & 3D Glass",
    items: [
      // referensi
      "Glassmorphism", "Neumorphism", "Clay Style", "3D Vector", "Pseudo 3D", "Isometric", "Semi Isometric",
      // tambahan
      "Soft 3D Clay", "Low Poly 3D", "Glossy 3D", "3D Extruded", "Paper Cut Layered", "Parallax Depth",
      "Voxel Style", "Frosted Glass", "Glass 3D",
    ],
  },
  {
    id: "cyber",
    label: "🤖 Cyber, Tech & AI HUD",
    items: [
      // referensi
      "Neon Glow", "Cyberpunk", "Futuristic", "Sci-Fi", "Holographic", "Hologram UI", "Dark Tech", "Blue Tech",
      "Digital Tech", "Cyber Security Style", "AI Tech Style", "HUD Interface", "Wireframe", "Digital Grid",
      "Data Stream", "Circuit Board Style", "Particle Glow", "Glowing Lines", "Abstract Geometric",
      "Geometric Minimal", "Liquid Shape", "Blob Shape", "Morphing Shape", "Paper Cutout", "Collage Style",
      // tambahan
      "Synthwave Retro", "Tron Grid", "Laser Lines", "Matrix Digital Rain", "Electric Glow",
    ],
  },
  {
    id: "organic",
    label: "🌀 Abstract & Organic",
    items: [
      "Abstract Organic", "Fluid Liquid", "Generative Art", "Particle Flow", "Wavy Lines", "Bauhaus Abstract",
      "Organic Blobs", "Noise Texture", "Fractal Pattern", "Flow Field", "Op Art",
    ],
  },
  {
    id: "retro",
    label: "🕹️ High Contrast & Retro",
    items: [
      // referensi
      "High Contrast", "Monochrome", "Black And White", "Duotone", "Retro Futuristic", "Y2K", "Vaporwave",
      "Memphis", "Retro Pop", "Analog Nostalgia", "Brutalist", "Editorial Modern",
      // tambahan
      "Retro 80s", "Vintage 70s", "Pixel Art", "Halftone Pop Art", "Retro Poster", "Art Deco", "VHS Glitch",
      "Old Film Grain",
    ],
  },
  {
    id: "texture",
    label: "💎 Textures & Materials",
    items: [
      // referensi
      "Tactile Texture", "Grain Texture", "Soft Shadow", "Depth Shadow", "Glossy", "Matte", "Metallic", "Chrome",
      "Gold Luxury", "Silver Tech",
    ],
  },
  {
    id: "hand",
    label: "✏️ Hand-drawn & Artistic",
    items: [
      "Hand-drawn Sketch", "Watercolor", "Chalkboard", "Ink Brush", "Crayon Kids", "Paper Texture",
      "Cartoon Style", "Comic Style", "Stencil Art", "Origami",
    ],
  },
  {
    id: "motion",
    label: "🎬 Industry & Motion Niches",
    items: [
      // referensi
      "Medical Clean", "Education Friendly", "Kids Friendly", "Social Media Modern", "E-commerce Bold",
      "Finance Premium", "Technology Modern", "Nature Organic", "Eco Green", "Smooth Loop", "Fast Motion",
      "Elastic Motion", "Bounce Motion", "Cinematic Motion", "Premium Motion",
      // tambahan
      "Cinematic Dark", "Kinetic Typography", "Light Leaks", "Lens Flare Glow", "Dynamic Transitions",
      "Bokeh Cinematic", "Film Title Sequence", "Dramatic Spotlight", "Explainer Video",
    ],
  },
  {
    id: "minimal",
    label: "🧩 Minimal & Geometric",
    items: [
      "Minimal Geometric", "Swiss Grid", "Dots & Lines", "Circle Composition", "Triangle Pattern",
      "Hexagon Minimal", "Grid System", "Shape Morphing", "Line Motion",
    ],
  },
  {
    id: "chroma",
    label: "🟢 Green Screen & Transparent",
    items: [
      // referensi
      "Background Green Screen", "Transparent Background", "Clean White Background",
      // tambahan
      "Blue Screen Chroma Key", "Solid Black Background",
    ],
  },
  {
    id: "style-rare",
    label: "🎨 ✨ Gaya Langka & Artistik (Rare)",
    items: [
      "Risograph Print", "Cyanotype Blueprint", "Ukiyo-e Wave", "Batik Motif Style", "Stained Glass",
      "Mosaic Tile", "Linocut Print", "Topographic Contour Lines", "Bioluminescent Glow", "Aurora Borealis Glow",
      "Thermal Camera Heatmap", "Infrared Night Vision", "X-Ray Scan", "Blueprint Technical Drawing",
      "Constructivism Poster", "Kirigami Paper Layers", "Chalk Pastel", "Neon Sign Tubes", "Holographic Foil",
      "Iridescent Chrome", "Liquid Metal", "Bokeh Dreamy",
    ],
  },
]);

// ============================== OPSI TAMBAHAN PROMPT ==============================
export const COLOR_PALETTES = [
  "Bebas, serahkan ke AI",
  "🎨 Cyberpunk Neon (Hot Pink, Cyan, Lime Green)",
  "🎨 Retro Vaporwave (Magenta, Deep Purple, Neon Orange)",
  "🎨 Corporate Luxury (Navy Blue, Gold, Platinum White)",
  "🎨 Eco Organic (Forest Green, Sage, Earth Brown)",
  "🎨 Pastel Minimalist (Beige, Soft Peach, Lilac)",
  "🎨 Dark Mode Tech (Very Dark Grey, Electric Blue, Bright White)",
  "🎨 Monochrome High Contrast (Black, White, 1 Accent Color)",
  "🎨 Sunset Gradient (Deep Red, Orange, Warm Yellow)",
  "🎨 Holographic Iris (Iridescent Pearl, Light Violet, Soft Cyan)",
];

export const MOTION_STYLES = [
  "Bebas, serahkan ke AI",
  "🚀 Cinematic Slow-mo (Elegan, pelan, sangat mulus)",
  "🚀 Bouncy & Elastic (Ceria, memantul, kartunis)",
  "🚀 Glitch & Stutter (Patah-patah, cyberpunk, error digital)",
  "🚀 Fluid & Organic (Meliuk-liuk, seperti air, continuous)",
  "🚀 Fast & Energetic (Cepat, agresif, ritmis)",
  "🚀 Parallax Depth (Layer bergerak dengan kecepatan beda, 3D effect)",
];

export const DECORATIVE_ELEMENTS = [
  "Bebas, serahkan ke AI",
  "✨ Floating Particles / Dust (Debu halus/partikel melayang)",
  "✨ Digital Grid / Wireframe (Garis-garis cyber teknologis)",
  "✨ Glowing Orbs (Cahaya bulat berpendar di latar belakang)",
  "✨ Halftone / Grain (Bintik-bintik retro/vintage grain)",
  "✨ Light Leaks / Bokeh (Bocoran cahaya sinematik out-of-focus)",
  "✨ Geometric Overlays (Garis dan bangun datar melayang transparan)",
];

export const ENERGY_MOODS = [
  "Bebas, serahkan ke AI",
  "⚡ Energetic (Tempo cepat, dynamic, punchy, hyped)",
  "🌿 Calm (Santai, damai, slow/zen, bernapas mulus)",
  "👑 Elegant (Poised, sophisticated, slow-luxury, anggun)",
  "🚨 Alert / Urgent (Tegang, darurat, bahaya, warning)",
  "🎉 Celebratory (Meriah, festive, ceria, party/promo)",
  "⚖️ Neutral / Balanced (Seimbang, tempo terukur, serbaguna)",
];

export const BACKGROUND_OPTIONS = [
  "Bebas, serahkan ke AI (Sesuai Konsep)",
  "🏁 Transparan Murni (Alpha / clearRect)",
  "🟢 Green Screen Chroma Key (#00FF00)",
  "⚪ Clean Solid White (#FFFFFF)",
  "⚫ Deep Solid Black (#000000)",
  "🔵 Blue Screen Chroma Key (#0000FF)",
];

export const countItems = (cats: PresetCategory[]) => cats.reduce((n, c) => n + c.items.length, 0);

/** Kategori yang memuat item ini (huruf besar/kecil diabaikan), atau -1. */
export function findCategoryIndex(cats: PresetCategory[], value: string): number {
  const v = value.trim().toLowerCase();
  return cats.findIndex((c) => c.items.some((i) => i.toLowerCase() === v));
}

export function searchPresets(cats: PresetCategory[], query: string, limit = 40) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const out: { category: PresetCategory; item: string; index: number }[] = [];
  cats.forEach((category, index) => {
    for (const item of category.items) {
      const hay = `${item} ${category.label}`.toLowerCase();
      if (words.every((w) => hay.includes(w))) out.push({ category, item, index });
    }
  });
  return out.slice(0, limit);
}
