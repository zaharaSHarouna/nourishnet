import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";

/* =========================================================================
   FoodSave — community food-rescue prototype
   Impact > Safety > Accessibility > Trust > Usability > AI
   ========================================================================= */

/* ---------- i18n ---------------------------------------------------------
   In production these become en.json / fr.json / twi.json / hausa.json and
   are loaded through a real i18n library. Here they live in one object so
   the whole app runs as a single file, but every UI string is looked up
   through t(key) — nothing is hardcoded inline.                         */
const LANGS = [
  { code: "en", label: "EN", name: "English" },
  { code: "fr", label: "FR", name: "Français" },
  { code: "twi", label: "TWI", name: "Twi" },
  { code: "hausa", label: "HAUSA", name: "Hausa" },
];

const DICT = {
  appName: { en: "FoodSave", fr: "FoodSave", twi: "FoodSave", hausa: "FoodSave" },
  tagline: {
    en: "Save food. Feed communities.",
    fr: "Sauvez la nourriture. Nourrissez les communautés.",
    twi: "Gye aduane. Ma amansan aduane.",
    hausa: "Ceci abinci. Ciyar da al'umma.",
  },
  heroSub: {
    en: "FoodSave connects surplus food with people and organizations that can use it — helping communities reduce food waste and make better use of available food.",
    fr: "FoodSave met en relation la nourriture excédentaire avec les personnes et organisations qui peuvent l'utiliser, pour réduire le gaspillage alimentaire.",
    twi: "FoodSave de aduane a aka ma nnipa ne kuw ahorow a ehia won, na ɛboa amansan ma wɔntɔ aduane kwa.",
    hausa: "FoodSave yana haɗa abinci mai yawa da mutane da ƙungiyoyin da za su iya amfani da shi, don rage ɓarnar abinci.",
  },
  shareFood: { en: "Share extra food", fr: "Partager de la nourriture", twi: "Kyɛ aduane a aka", hausa: "Raba abincin da ya rage" },
  findFood: { en: "Find food", fr: "Trouver de la nourriture", twi: "Hwehwɛ aduane", hausa: "Nemo abinci" },
  howItWorks: { en: "How FoodSave works", fr: "Comment ça marche", twi: "Sɛnea FoodSave yɛ adwuma", hausa: "Yadda FoodSave ke aiki" },
  step1Title: { en: "Share", fr: "Partager", twi: "Kyɛ", hausa: "Raba" },
  step1Body: { en: "Businesses, farms, households and organizations list surplus food.", fr: "Entreprises, fermes, ménages et organisations publient leur nourriture excédentaire.", twi: "Adwumakuw, mfuw, afie ne kuw ahorow de aduane a aka gu.", hausa: "Kasuwanci, gonaki, gidaje da ƙungiyoyi suna sanya abincin da ya rage." },
  step2Title: { en: "Match", fr: "Correspondre", twi: "Fa bom", hausa: "Daidaitawa" },
  step2Body: { en: "FoodSave helps connect available food with nearby people and organizations.", fr: "FoodSave aide à relier la nourriture disponible aux personnes et organisations proches.", twi: "FoodSave boa ma aduane no kɔ nnipa a wɔbɛn hɔ nkyɛn.", hausa: "FoodSave yana taimakawa haɗa abinci da mutane da ƙungiyoyi kusa." },
  step3Title: { en: "Collect", fr: "Récupérer", twi: "Gye", hausa: "Karɓa" },
  step3Body: { en: "The recipient arranges collection at the time the provider set.", fr: "Le destinataire organise la collecte à l'heure fixée par le fournisseur.", twi: "Nea ɔbɛgye no yɛ nhyehyɛe sɛ ɔbɛba abegye no.", hausa: "Wanda zai karɓa yana shirya karɓa a lokacin da mai bayarwa ya kayyade." },
  step4Title: { en: "Save", fr: "Sauver", twi: "Kora", hausa: "Ceto" },
  step4Body: { en: "Less edible food goes to waste, and more people get fed.", fr: "Moins de nourriture comestible est gaspillée.", twi: "Aduane pa kakraa na ɛsɛe.", hausa: "Kadan abinci mai kyau ke ɓacewa." },
  availableNearYou: { en: "Available near you", fr: "Disponible près de vous", twi: "Nea ɛbɛn wo", hausa: "Akwai kusa da kai" },
  forOrganizations: { en: "For organizations", fr: "Pour les organisations", twi: "Ma kuw ahorow", hausa: "Ga ƙungiyoyi" },
  responsibleAI: { en: "Responsible AI", fr: "IA responsable", twi: "AI a Wɔde Di Dwuma Yiye", hausa: "AI Mai Kyautatawa" },
  ourImpact: { en: "Our impact", fr: "Notre impact", twi: "Yɛn Nkɛntɛnso", hausa: "Tasirinmu" },
  demoData: { en: "Demo data", fr: "Données de démonstration", twi: "Nhwɛso Data", hausa: "Bayanan Gwaji" },
  browse: { en: "Browse food", fr: "Parcourir", twi: "Hwɛ Aduane", hausa: "Bincika Abinci" },
  dashboard: { en: "Dashboard", fr: "Tableau de bord", twi: "Dashboard", hausa: "Dashboard" },
  assistant: { en: "FoodSave Assistant", fr: "Assistant FoodSave", twi: "FoodSave Boafo", hausa: "Mataimakin FoodSave" },
  signIn: { en: "Sign in", fr: "Se connecter", twi: "Kɔ Mu", hausa: "Shiga" },
  signOut: { en: "Sign out", fr: "Se déconnecter", twi: "Fi Mu", hausa: "Fita" },
  notifications: { en: "Notifications", fr: "Notifications", twi: "Nkrasɛm", hausa: "Sanarwa" },
  search: { en: "Search food", fr: "Rechercher", twi: "Hwehwɛ", hausa: "Bincika" },
  nearMe: { en: "Near me", fr: "Près de moi", twi: "Nea Ɛbɛn Me", hausa: "Kusa da ni" },
  availableToday: { en: "Available today", fr: "Disponible aujourd'hui", twi: "Ɛwɔ hɔ Ɛnnɛ", hausa: "Akwai yau" },
  vegetarian: { en: "Vegetarian", fr: "Végétarien", twi: "Nnua Aduane", hausa: "Ba Nama Ba" },
  largeQty: { en: "Large quantity", fr: "Grande quantité", twi: "Dodow Kɛse", hausa: "Yawan Kaya" },
  freeFood: { en: "Free food", fr: "Nourriture gratuite", twi: "Aduane Kwa", hausa: "Abinci Kyauta" },
  viewFood: { en: "View food", fr: "Voir la nourriture", twi: "Hwɛ Aduane No", hausa: "Duba Abinci" },
  requestFood: { en: "Request this food", fr: "Demander cette nourriture", twi: "Bisa Aduane Yi", hausa: "Nemi Wannan Abincin" },
  reportListing: { en: "Report this listing", fr: "Signaler cette annonce", twi: "Bɔ Amanneɛ", hausa: "Kai Rahoto" },
  safetyReminder: { en: "Please check the food before accepting it. FoodSave does not certify food safety.", fr: "Veuillez vérifier la nourriture avant de l'accepter. FoodSave ne certifie pas la sécurité alimentaire.", twi: "Yɛsrɛ hwɛ aduane no ansa na woagye. FoodSave nkyerɛ sɛ aduane no yɛ dwira.", hausa: "Da fatan za a duba abincin kafin karɓa. FoodSave baya tabbatar da amincin abinci." },
  verified: { en: "Verified provider", fr: "Fournisseur vérifié", twi: "Wɔahwɛ No", hausa: "Mai Bayarwa da aka Tabbatar" },
  noFoodNearby: { en: "No food available nearby right now.", fr: "Aucune nourriture disponible à proximité pour le moment.", twi: "Aduane biara nni hɔ mprempren.", hausa: "Babu abinci kusa a yanzu." },
  tryExpanding: { en: "Try expanding your search area or check again later.", fr: "Essayez d'élargir votre zone de recherche ou revenez plus tard.", twi: "Sɔ hwɛ ma wo hwehwɛ beae ntrɛw anaa san bɛhwɛ akyiri yi.", hausa: "Gwada faɗaɗa yankin bincikenka ko duba daga baya." },
  publish: { en: "Publish", fr: "Publier", twi: "Fa To Gua", hausa: "Buga" },
  next: { en: "Next", fr: "Suivant", twi: "Toa So", hausa: "Gaba" },
  back: { en: "Back", fr: "Retour", twi: "San Kɔ", hausa: "Baya" },
  cancel: { en: "Cancel", fr: "Annuler", twi: "Twa Mu", hausa: "Soke" },
  submit: { en: "Submit", fr: "Envoyer", twi: "Fa Kɔ", hausa: "Aikawa" },
  machineTranslated: { en: "Machine translated — original text preserved below.", fr: "Traduit automatiquement — texte original conservé ci-dessous.", twi: "Wɔasesa saa — nsɛm a edi kan wɔ ase.", hausa: "An fassara ta atomatik — asalin rubutun yana ƙasa." },
};

function t(key, lang) {
  const entry = DICT[key];
  if (!entry) return key;
  return entry[lang] || entry.en || key;
}

/* ---------- category list (translatable) ---------------------------- */
const CATEGORIES = [
  { id: "cooked", en: "Cooked meals", fr: "Plats cuisinés", twi: "Aduane a Wɔanoa", hausa: "Abincin da aka Dafa" },
  { id: "fruit", en: "Fruits", fr: "Fruits", twi: "Nnuaba", hausa: "'Ya'yan Itace" },
  { id: "veg", en: "Vegetables", fr: "Légumes", twi: "Nhabam", hausa: "Kayan Lambu" },
  { id: "bakery", en: "Bread & bakery", fr: "Pain & boulangerie", twi: "Paanoo", hausa: "Burodi" },
  { id: "grains", en: "Grains", fr: "Céréales", twi: "Aburow", hausa: "Hatsi" },
  { id: "dairy", en: "Dairy", fr: "Produits laitiers", twi: "Nufusuo Nnuane", hausa: "Kayan Kiwo" },
  { id: "packaged", en: "Packaged food", fr: "Aliments emballés", twi: "Aduane a Wɔabɔ", hausa: "Abincin da aka Kunsa" },
  { id: "produce", en: "Farm produce", fr: "Produits agricoles", twi: "Mfuwmfuw", hausa: "Amfanin Gona" },
  { id: "drinks", en: "Drinks", fr: "Boissons", twi: "Nsanom", hausa: "Abin Sha" },
  { id: "other", en: "Other", fr: "Autre", twi: "Foforo", hausa: "Sauran" },
];
function catLabel(id, lang) {
  const c = CATEGORIES.find((c) => c.id === id);
  if (!c) return id;
  return c[lang] || c.en;
}

/* ---------- storage helpers ------------------------------------------
   The Claude.ai artifact sandbox provides a built-in window.storage API.
   A real deployed site doesn't have that, so this uses localStorage
   instead. NOTE: localStorage is per-browser only — it is NOT shared
   between different people's devices. For a real multi-user community
   platform, replace these four functions with calls to a real database
   (the original spec calls for Supabase + Postgres + Row Level Security).
   Every other component only talks to these four functions, so that
   swap does not require touching any UI code.                         */
async function loadShared(key, fallback) {
  try {
    const raw = localStorage.getItem("shared:" + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
async function saveShared(key, val) {
  try {
    localStorage.setItem("shared:" + key, JSON.stringify(val));
  } catch (e) {
    console.error("storage save failed", e);
  }
}
async function loadPersonal(key, fallback) {
  try {
    const raw = localStorage.getItem("personal:" + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
async function savePersonal(key, val) {
  try {
    localStorage.setItem("personal:" + key, JSON.stringify(val));
  } catch (e) {
    console.error("storage save failed", e);
  }
}

/* ---------- AI helper --------------------------------------------------
   The browser never talks to api.anthropic.com directly (that would mean
   shipping a secret API key to every visitor). Instead it calls our own
   serverless function at /api/ai, which holds the real key server-side.
   See /api/ai.js. Fails soft: on any error it returns null and callers
   show a plain "AI isn't available right now" message plus a manual
   path — the app never blocks on AI. */
async function askAI(system, userText) {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system, message: userText }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.text || "").trim() || null;
  } catch (e) {
    console.error("AI call failed", e);
    return null;
  }
}

const AI_GUARDRAIL = `You are the FoodSave Assistant, part of a community food-rescue platform.
You help with: explaining matches between food donations and nearby people/organizations,
translating listing text, suggesting a food category from a description, flagging missing
safety information, and helping users navigate the app.
You must NEVER: decide who "deserves" food, judge whether someone is poor or eligible,
declare food medically/definitely safe, make a final donation or approval decision, or
act on race, religion, gender, disability or similar characteristics.
If information is missing or you are unsure, say plainly that you don't have enough
information and suggest the person check manually or ask a human. Keep answers short,
plain, and in simple language suitable for readers with limited digital literacy.`;

/* ---------- demo seed data -------------------------------------------- */
const now = Date.now();
const SEED_LISTINGS = [
  { id: "l1", providerName: "Sunrise Bakery", providerType: "Bakery", verified: true, name: "Assorted bread loaves", category: "bakery", description: "50 loaves of white and wheat bread, baked this morning.", qty: 50, unit: "loaves", veg: true, allergens: "Contains gluten", prep: "2026-09-09 06:00", bestBefore: "2026-09-10", storage: "Room temperature, in bags", area: "Osu, Accra", exactAddress: "12 Oxford St, Osu", lat: 5.5563, lng: -0.1969, pickupDate: "2026-09-09", pickupStart: "16:00", pickupEnd: "19:00", contact: "In-app chat", instructions: "Enter through the side door.", status: "available", createdAt: now - 3600e3 },
  { id: "l2", providerName: "Green Basket Market", providerType: "Supermarket", verified: true, name: "Fresh vegetables — mixed crates", category: "veg", description: "Tomatoes, cabbage and onions, slightly bruised but good to cook.", qty: 12, unit: "crates", veg: true, allergens: "None known", prep: "2026-09-09 08:00", bestBefore: "2026-09-11", storage: "Cool, dry area", area: "Osu, Accra", exactAddress: "45 Cantonments Rd", lat: 5.5590, lng: -0.1801, pickupDate: "2026-09-09", pickupStart: "14:00", pickupEnd: "18:00", contact: "Phone via app", instructions: "Ask for the store manager.", status: "available", createdAt: now - 7200e3 },
  { id: "l3", providerName: "Accra Community Kitchen", providerType: "Community kitchen", verified: true, name: "Cooked jollof rice and chicken", category: "cooked", description: "30 portions of jollof rice with chicken, made for a cancelled event.", qty: 30, unit: "portions", veg: false, allergens: "None known", prep: "2026-09-09 11:00", bestBefore: "2026-09-09 20:00", storage: "Kept warm in insulated boxes", area: "Adabraka, Accra", exactAddress: "8 Kojo Thompson Rd", lat: 5.5605, lng: -0.2110, pickupDate: "2026-09-09", pickupStart: "15:00", pickupEnd: "17:00", contact: "In-app chat", instructions: "Bring your own containers if possible.", status: "available", createdAt: now - 1800e3 },
  { id: "l4", providerName: "Fresh Harvest Farm", providerType: "Farm", verified: false, name: "Ripe plantain and cassava", category: "produce", description: "Surplus harvest, more than we can sell this week.", qty: 200, unit: "kg", veg: true, allergens: "None known", prep: "2026-09-08 07:00", bestBefore: "2026-09-14", storage: "Dry storage", area: "Dodowa road, near Accra", exactAddress: "Farm gate, Dodowa road", lat: 5.8817, lng: -0.1069, pickupDate: "2026-09-10", pickupStart: "07:00", pickupEnd: "12:00", contact: "Phone via app", instructions: "Bring a truck; large quantity.", status: "available", createdAt: now - 10800e3 },
  { id: "l5", providerName: "A. Mensah (household)", providerType: "Household", verified: false, name: "Extra rice and stew from event", category: "cooked", description: "We over-catered a family event, about 20 portions left.", qty: 20, unit: "portions", veg: false, allergens: "Contains groundnut", prep: "2026-09-09 13:00", bestBefore: "2026-09-09 21:00", storage: "Refrigerated", area: "East Legon, Accra", exactAddress: "", lat: 5.6500, lng: -0.1500, pickupDate: "2026-09-09", pickupStart: "18:00", pickupEnd: "20:00", contact: "In-app chat", instructions: "Exact address shared once a request is accepted.", status: "available", createdAt: now - 900e3 },
  { id: "l6", providerName: "Hope Food Initiative", providerType: "NGO", verified: true, name: "Packaged rice and canned goods", category: "packaged", description: "Donated packaged food nearing distribution deadline.", qty: 80, unit: "packs", veg: true, allergens: "Varies by item", prep: "", bestBefore: "2026-09-20", storage: "Dry storage", area: "Madina, Accra", exactAddress: "Madina Zongo Junction", lat: 5.6833, lng: -0.1667, pickupDate: "2026-09-11", pickupStart: "09:00", pickupEnd: "16:00", contact: "In-app chat", instructions: "Volunteers welcome to help sort.", status: "available", createdAt: now - 5400e3 },
];

const ORG_NEEDS = [
  { name: "Accra Community Kitchen", type: "Community kitchen", area: "Adabraka, Accra", lat: 5.5605, lng: -0.2110, needs: ["bakery", "cooked", "veg"] },
  { name: "Hope Food Initiative", type: "NGO", area: "Madina, Accra", lat: 5.6833, lng: -0.1667, needs: ["packaged", "cooked", "grains"] },
  { name: "Shelter of Grace", type: "Shelter", area: "Nima, Accra", lat: 5.5731, lng: -0.2016, needs: ["cooked", "bakery", "produce"] },
];

function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ---------- small reusable UI atoms ----------------------------------- */
function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-stone-100 text-stone-700 border-stone-300",
    good: "bg-emerald-50 text-emerald-800 border-emerald-300",
    warn: "bg-amber-50 text-amber-900 border-amber-300",
    info: "bg-sky-50 text-sky-800 border-sky-300",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

function Button({ children, onClick, variant = "primary", type = "button", ariaLabel, className = "", disabled }) {
  const base = "min-h-[44px] px-4 py-2 rounded-lg font-medium text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-emerald-700 text-white hover:bg-emerald-800",
    secondary: "bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300",
    ghost: "bg-transparent text-stone-700 hover:bg-stone-100 border border-stone-300",
    danger: "bg-orange-700 text-white hover:bg-orange-800",
  };
  return (
    <button type={type} onClick={onClick} aria-label={ariaLabel} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

function Field({ label, hint, children, id, required }) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-stone-800 mb-1">
        {label}
        {required && <span aria-hidden="true" className="text-orange-700"> *</span>}
      </label>
      {hint && <p className="text-xs text-stone-500 mb-1">{hint}</p>}
      {children}
    </div>
  );
}

const inputCls = "w-full min-h-[44px] rounded-lg border border-stone-300 px-3 py-2 text-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700";

function Toast({ toasts }) {
  return (
    <div aria-live="polite" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[92%] max-w-sm">
      {toasts.map((tst) => (
        <div key={tst.id} className="bg-stone-900 text-white text-sm rounded-lg px-4 py-3 shadow-lg">
          {tst.text}
        </div>
      ))}
    </div>
  );
}

/* ---------- App --------------------------------------------------------- */
export default function App() {
  const [lang, setLang] = useState("en");
  const [profile, setProfile] = useState(null); // {id, name, role}
  const [view, setView] = useState("home");
  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeListingId, setActiveListingId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const pushToast = useCallback((text) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((ts) => [...ts, { id, text }]);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 4500);
  }, []);

  useEffect(() => {
    (async () => {
      const p = await loadPersonal("foodsave:profile", null);
      if (p) { setProfile(p); setLang(p.lang || "en"); }
      let ls = await loadShared("foodsave:listings", null);
      if (!ls) { ls = SEED_LISTINGS; await saveShared("foodsave:listings", ls); }
      setListings(ls);
      const rq = await loadShared("foodsave:requests", []);
      setRequests(rq);
      const rp = await loadShared("foodsave:reports", []);
      setReports(rp);
      setLoaded(true);
    })();
  }, []);

  function updateProfile(next) {
    setProfile(next);
    savePersonal("foodsave:profile", next);
  }
  function changeLang(code) {
    setLang(code);
    if (profile) updateProfile({ ...profile, lang: code });
  }
  function persistListings(next) { setListings(next); saveShared("foodsave:listings", next); }
  function persistRequests(next) { setRequests(next); saveShared("foodsave:requests", next); }
  function persistReports(next) { setReports(next); saveShared("foodsave:reports", next); }

  function go(v, listingId) {
    setView(v);
    if (listingId) setActiveListingId(listingId);
    window.scrollTo?.({ top: 0 });
  }

  if (!loaded) {
    return <div className="min-h-screen flex items-center justify-center bg-stone-50 text-stone-600">Loading FoodSave…</div>;
  }

  const activeListing = listings.find((l) => l.id === activeListingId) || null;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:border focus:border-emerald-700">
        Skip to main content
      </a>
      <Header lang={lang} onLang={changeLang} profile={profile} go={go} onSignOut={() => { updateProfile(null); go("home"); }} requestsForBadge={requests} view={view} />

      <main id="main" className="max-w-5xl mx-auto px-4 sm:px-6">
        {view === "home" && <Home lang={lang} go={go} listings={listings} />}
        {view === "auth" && <AuthGate lang={lang} onSignedIn={(p) => { updateProfile(p); go("dashboard"); }} />}
        {view === "browse" && <Browse lang={lang} listings={listings} go={go} />}
        {view === "listing" && activeListing && (
          <ListingDetail
            lang={lang}
            listing={activeListing}
            profile={profile}
            go={go}
            onRequest={(qty, note) => {
              if (!profile) return go("auth");
              const req = { id: "r" + Math.random().toString(36).slice(2), listingId: activeListing.id, requesterId: profile.id, requesterName: profile.name, requesterRole: profile.role, qty, note, status: "pending", createdAt: Date.now() };
              persistRequests([req, ...requests]);
              pushToast(lang === "en" ? "Request sent." : lang === "fr" ? "Demande envoyée." : lang === "twi" ? "Wɔasoma abisadeɛ no." : "An aika bukatar.");
            }}
            onReport={(reason, description) => {
              const rep = { id: "rep" + Math.random().toString(36).slice(2), listingId: activeListing.id, reason, description, status: "open", createdAt: Date.now() };
              persistReports([rep, ...reports]);
              pushToast(lang === "en" ? "Report submitted. An admin will review it." : "Report submitted.");
            }}
          />
        )}
        {view === "share" && (
          <ShareFoodForm
            lang={lang}
            profile={profile}
            go={go}
            onPublish={async (listing) => {
              persistListings([listing, ...listings]);
              pushToast(lang === "en" ? "Your listing is live." : "Listing published.");
              go("matches", listing.id);
            }}
          />
        )}
        {view === "matches" && activeListing && <Matches lang={lang} listing={activeListing} go={go} />}
        {view === "dashboard" && (
          profile ? (
            <Dashboard
              lang={lang}
              profile={profile}
              listings={listings}
              requests={requests}
              go={go}
              onUpdateRequest={(id, status) => {
                const next = requests.map((r) => (r.id === id ? { ...r, status } : r));
                persistRequests(next);
                if (status === "accepted") {
                  const req = requests.find((r) => r.id === id);
                  persistListings(listings.map((l) => (l.id === req?.listingId ? { ...l, status: "claimed" } : l)));
                }
                pushToast(lang === "en" ? "Updated." : "Updated.");
              }}
              onCollected={(listingId) => {
                persistListings(listings.map((l) => (l.id === listingId ? { ...l, status: "collected" } : l)));
                pushToast(lang === "en" ? "Marked as collected. Thank you!" : "Marked as collected.");
              }}
            />
          ) : (
            <AuthGate lang={lang} onSignedIn={(p) => updateProfile(p)} />
          )
        )}
        {view === "responsible-ai" && <ResponsibleAI lang={lang} />}
        {view === "admin" && profile?.role === "admin" && <Admin lang={lang} listings={listings} requests={requests} reports={reports} onResolveReport={(id) => persistReports(reports.map((r) => (r.id === id ? { ...r, status: "resolved" } : r)))} onVerify={(name) => persistListings(listings.map((l) => (l.providerName === name ? { ...l, verified: true } : l)))} onRemoveListing={(id) => persistListings(listings.filter((l) => l.id !== id))} />}
      </main>

      <Footer lang={lang} go={go} />
      <Toast toasts={toasts} />
      <AssistantWidget lang={lang} open={assistantOpen} setOpen={setAssistantOpen} listings={listings} />
    </div>
  );
}

/* ---------- Header / Nav ------------------------------------------------ */
function Header({ lang, onLang, profile, go, onSignOut, requestsForBadge, view }) {
  const myPending = profile ? requestsForBadge.filter((r) => r.requesterId === profile.id && r.status === "pending").length : 0;
  const navItems = [
    { id: "browse", label: t("browse", lang) },
    { id: "share", label: t("shareFood", lang) },
    { id: "dashboard", label: t("dashboard", lang), badge: myPending || null },
    { id: "responsible-ai", label: t("responsibleAI", lang) },
    ...(profile?.role === "admin" ? [{ id: "admin", label: "Admin" }] : []),
  ];
  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <button onClick={() => go("home")} className="flex items-center gap-2 font-serif text-xl font-semibold text-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700 rounded" aria-label="FoodSave home">
          <span aria-hidden="true" className="inline-block w-8 h-8 rounded-full bg-emerald-700 text-white grid place-items-center text-sm">FS</span>
          {t("appName", lang)}
        </button>
        <div className="flex items-center gap-2">
          <label htmlFor="lang-select" className="sr-only">Choose language</label>
          <select id="lang-select" value={lang} onChange={(e) => onLang(e.target.value)} className="rounded-lg border border-stone-300 min-h-[44px] px-2 text-sm font-medium bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700">
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
          {profile ? (
            <Button variant="ghost" onClick={onSignOut} ariaLabel={t("signOut", lang)}>{t("signOut", lang)}</Button>
          ) : (
            <Button variant="primary" onClick={() => go("auth")}>{t("signIn", lang)}</Button>
          )}
        </div>
      </div>
      <nav aria-label="Main navigation" className="border-t border-stone-100 max-w-5xl mx-auto px-2 sm:px-6 flex items-center gap-1 overflow-x-auto">
        {navItems.map((it) => (
          <NavLink key={it.id} onClick={() => go(it.id)} label={it.label} badge={it.badge} active={view === it.id} />
        ))}
      </nav>
    </header>
  );
}
function NavLink({ onClick, label, badge, active }) {
  return (
    <button onClick={onClick} aria-current={active ? "page" : undefined} className={`relative whitespace-nowrap min-h-[44px] px-3 rounded-lg text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700 ${active ? "text-emerald-800 border-b-2 border-emerald-700" : "text-stone-700 hover:bg-stone-100 border-b-2 border-transparent"}`}>
      {label}
      {badge ? <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-700 text-white text-[10px]">{badge}</span> : null}
    </button>
  );
}

function Footer({ lang, go }) {
  return (
    <footer className="border-t border-stone-200 mt-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 text-sm text-stone-600 flex flex-wrap gap-x-6 gap-y-2">
        <button onClick={() => go("responsible-ai")} className="hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700 rounded">{t("responsibleAI", lang)}</button>
        <span>Privacy</span>
        <span>Community guidelines</span>
        <span>© 2026 FoodSave (prototype)</span>
      </div>
    </footer>
  );
}

/* ---------- Home ---------------------------------------------------------*/
function Home({ lang, go, listings }) {
  const available = listings.filter((l) => l.status === "available");
  return (
    <div>
      <section className="py-12 sm:py-16 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-stone-900 leading-tight">{t("tagline", lang)}</h1>
          <p className="mt-4 text-lg text-stone-600 max-w-md">{t("heroSub", lang)}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => go("share")}>{t("shareFood", lang)}</Button>
            <Button variant="secondary" onClick={() => go("browse")}>{t("findFood", lang)}</Button>
          </div>
        </div>
        <div className="rounded-2xl bg-emerald-700 text-white p-8 grid grid-cols-2 gap-6" role="group" aria-label="Impact statistics">
          <StatBlock value="12,450 kg" label="Food rescued" />
          <StatBlock value="1,280" label="Donations completed" />
          <StatBlock value="18,600" label="Meals rescued" />
          <StatBlock value="72" label="Organizations supported" />
          <div className="col-span-2"><Badge tone="warn">{t("demoData", lang)}</Badge></div>
        </div>
      </section>

      <section aria-labelledby="how-heading" className="py-12 border-t border-stone-200">
        <h2 id="how-heading" className="font-serif text-2xl font-semibold mb-6">{t("howItWorks", lang)}</h2>
        <ol className="grid sm:grid-cols-4 gap-4">
          {[["step1Title", "step1Body"], ["step2Title", "step2Body"], ["step3Title", "step3Body"], ["step4Title", "step4Body"]].map(([title, body], i) => (
            <li key={title} className="rounded-xl border border-stone-200 p-4 bg-white">
              <div aria-hidden="true" className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 grid place-items-center font-semibold mb-2">{i + 1}</div>
              <h3 className="font-semibold text-stone-900">{t(title, lang)}</h3>
              <p className="text-sm text-stone-600 mt-1">{t(body, lang)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="near-heading" className="py-12 border-t border-stone-200">
        <div className="flex items-center justify-between mb-4">
          <h2 id="near-heading" className="font-serif text-2xl font-semibold">{t("availableNearYou", lang)}</h2>
          <button onClick={() => go("browse")} className="text-sm font-medium text-emerald-800 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700 rounded">{t("browse", lang)}</button>
        </div>
        {available.length === 0 ? <EmptyState lang={lang} /> : (
          <div className="grid sm:grid-cols-2 gap-4">
            {available.slice(0, 4).map((l) => <ListingCard key={l.id} listing={l} lang={lang} onView={() => go("listing", l.id)} />)}
          </div>
        )}
      </section>

      <section aria-labelledby="org-heading" className="py-12 border-t border-stone-200 grid md:grid-cols-2 gap-6">
        <div>
          <h2 id="org-heading" className="font-serif text-2xl font-semibold mb-2">{t("forOrganizations", lang)}</h2>
          <p className="text-stone-600 mb-4">NGOs, shelters, food banks and community kitchens can register, browse donations, and reserve larger quantities to coordinate distribution.</p>
          <Button variant="secondary" onClick={() => go("auth")}>Register your organization</Button>
        </div>
        <div>
          <h2 className="font-serif text-2xl font-semibold mb-2">{t("responsibleAI", lang)}</h2>
          <p className="text-stone-600 mb-4">AI helps match, translate and organize — people always make the final decisions. See exactly what AI does and doesn't do.</p>
          <Button variant="ghost" onClick={() => go("responsible-ai")}>Read more</Button>
        </div>
      </section>
    </div>
  );
}
function StatBlock({ value, label }) {
  return (
    <div>
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-sm text-emerald-100">{label}</div>
    </div>
  );
}
function EmptyState({ lang }) {
  return (
    <div className="rounded-xl border border-dashed border-stone-300 p-8 text-center">
      <p className="font-medium text-stone-800">{t("noFoodNearby", lang)}</p>
      <p className="text-sm text-stone-500 mt-1">{t("tryExpanding", lang)}</p>
    </div>
  );
}

/* ---------- Listing card / Browse --------------------------------------*/
function ListingCard({ listing, lang, onView }) {
  const statusTone = listing.status === "available" ? "good" : listing.status === "claimed" ? "warn" : "neutral";
  const showApprox = listing.providerType === "Household";
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 flex flex-col gap-2 border-l-4" style={{ borderLeftColor: "#B45309" }}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-stone-900">{listing.name}</h3>
        <Badge tone={statusTone}>
          {listing.status === "available" ? "●" : listing.status === "claimed" ? "◐" : "✓"} {listing.status}
        </Badge>
      </div>
      <p className="text-sm text-stone-600">{listing.providerName}{listing.verified && <span className="text-emerald-700 font-medium"> · {t("verified", lang)} ✓</span>}</p>
      <p className="text-sm text-stone-700">{catLabel(listing.category, lang)} · {listing.qty} {listing.unit}</p>
      <p className="text-xs text-stone-500">{showApprox ? "Approximate area: " : ""}{listing.area} · pickup {listing.pickupStart}–{listing.pickupEnd}</p>
      <div className="mt-2">
        <Button onClick={onView}>{t("viewFood", lang)}</Button>
      </div>
    </div>
  );
}

function Browse({ lang, listings, go }) {
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({ nearMe: false, today: false, veg: false, large: false, category: "" });
  const [radius, setRadius] = useState(50);

  const myLoc = { lat: 5.56, lng: -0.19 }; // demo "current location" (central Accra)

  const filtered = listings.filter((l) => {
    if (l.status !== "available") return false;
    if (q && !(`${l.name} ${l.description}`.toLowerCase().includes(q.toLowerCase()))) return false;
    if (filters.category && l.category !== filters.category) return false;
    if (filters.veg && !l.veg) return false;
    if (filters.large && l.qty < 30) return false;
    if (filters.today && l.pickupDate !== "2026-09-09") return false;
    if (filters.nearMe && distanceKm(myLoc.lat, myLoc.lng, l.lat, l.lng) > radius) return false;
    return true;
  });

  function toggle(key) { setFilters((f) => ({ ...f, [key]: !f[key] })); }

  return (
    <div className="py-8">
      <h1 className="font-serif text-3xl font-semibold mb-4">{t("browse", lang)}</h1>
      <div className="mb-4">
        <label htmlFor="search-food" className="sr-only">{t("search", lang)}</label>
        <input id="search-food" className={inputCls} placeholder={t("search", lang)} value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Filters">
        <FilterChip active={filters.nearMe} onClick={() => toggle("nearMe")} label={t("nearMe", lang)} />
        <FilterChip active={filters.today} onClick={() => toggle("today")} label={t("availableToday", lang)} />
        <FilterChip active={filters.veg} onClick={() => toggle("veg")} label={t("vegetarian", lang)} />
        <FilterChip active={filters.large} onClick={() => toggle("large")} label={t("largeQty", lang)} />
        <FilterChip active={false} onClick={() => {}} label={t("freeFood", lang)} disabled />
        <label className="sr-only" htmlFor="cat-filter">Category</label>
        <select id="cat-filter" className="min-h-[44px] rounded-full border border-stone-300 px-3 text-sm bg-white" value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{catLabel(c.id, lang)}</option>)}
        </select>
      </div>
      {filters.nearMe && (
        <div className="mb-4 max-w-xs">
          <Field label={`Search radius: ${radius} km`} id="radius">
            <input id="radius" type="range" min="1" max="100" value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="w-full" />
          </Field>
        </div>
      )}
      {filtered.length === 0 ? <EmptyState lang={lang} /> : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((l) => <ListingCard key={l.id} listing={l} lang={lang} onView={() => go("listing", l.id)} />)}
        </div>
      )}
      <SimpleMapList lang={lang} listings={filtered} go={go} />
    </div>
  );
}
function FilterChip({ active, onClick, label, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-pressed={active} className={`min-h-[44px] px-3 rounded-full text-sm font-medium border focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700 ${active ? "bg-emerald-700 text-white border-emerald-700" : "bg-white text-stone-700 border-stone-300"} disabled:opacity-40`}>
      {active ? "✓ " : ""}{label}
    </button>
  );
}

/* A lightweight, accessible stand-in for a map view: no external map
   library is available in this sandbox, so distances/areas are shown as
   a sorted list instead of pins. Swapping in Leaflet/OpenStreetMap in
   production is a drop-in replacement for this component. */
function SimpleMapList({ lang, listings, go }) {
  const myLoc = { lat: 5.56, lng: -0.19 };
  const sorted = [...listings].sort((a, b) => distanceKm(myLoc.lat, myLoc.lng, a.lat, a.lng) - distanceKm(myLoc.lat, myLoc.lng, b.lat, b.lng));
  if (sorted.length === 0) return null;
  return (
    <section aria-labelledby="map-heading" className="mt-8 rounded-xl border border-stone-200 bg-white p-4">
      <h2 id="map-heading" className="font-semibold mb-1">Map view (list mode)</h2>
      <p className="text-xs text-stone-500 mb-3">Distances are approximate. Exact addresses are shared only after a request is accepted.</p>
      <ul className="divide-y divide-stone-200">
        {sorted.map((l) => (
          <li key={l.id} className="py-2 flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-stone-800 text-sm">{l.name}</p>
              <p className="text-xs text-stone-500">{l.area} · {distanceKm(myLoc.lat, myLoc.lng, l.lat, l.lng).toFixed(1)} km away</p>
            </div>
            <button onClick={() => go("listing", l.id)} className="text-sm font-medium text-emerald-800 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700 rounded">{t("viewFood", lang)}</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- Listing detail ---------------------------------------------*/
function ListingDetail({ lang, listing, profile, go, onRequest, onReport }) {
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [translated, setTranslated] = useState(null);
  const [translating, setTranslating] = useState(false);

  const missing = [];
  if (!listing.prep) missing.push("preparation time");
  if (!listing.storage) missing.push("storage information");
  if (!listing.bestBefore) missing.push("best-before information");

  async function handleTranslate() {
    if (lang === "en") return;
    setTranslating(true);
    const langName = LANGS.find((l) => l.code === lang)?.name || lang;
    const result = await askAI(
      AI_GUARDRAIL,
      `Translate this food donation description into ${langName}. Keep it short and plain. Only return the translation, nothing else.\n\n"${listing.description}"`
    );
    setTranslated(result);
    setTranslating(false);
  }

  const showApprox = listing.providerType === "Household";

  return (
    <div className="py-8 max-w-2xl">
      <button onClick={() => go("browse")} className="text-sm text-stone-600 hover:underline mb-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-700 rounded">← {t("back", lang)}</button>
      <h1 className="font-serif text-3xl font-semibold">{listing.name}</h1>
      <p className="text-stone-600 mt-1">{listing.providerName}{listing.verified && <span className="text-emerald-700 font-medium"> · {t("verified", lang)} ✓</span>}</p>

      <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-300 text-sm text-amber-900" role="note">
        ⚠ {t("safetyReminder", lang)}
      </div>

      {missing.length > 0 && (
        <div className="mt-3 p-3 rounded-lg bg-orange-50 border border-orange-300 text-sm text-orange-900" role="note">
          This listing is missing: {missing.join(", ")}. Please confirm details with the provider before collecting.
        </div>
      )}

      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div><dt className="text-stone-500">Category</dt><dd className="font-medium">{catLabel(listing.category, lang)}</dd></div>
        <div><dt className="text-stone-500">Quantity</dt><dd className="font-medium">{listing.qty} {listing.unit}</dd></div>
        <div><dt className="text-stone-500">Prepared</dt><dd className="font-medium">{listing.prep || "Not provided"}</dd></div>
        <div><dt className="text-stone-500">Best before</dt><dd className="font-medium">{listing.bestBefore || "Not provided"}</dd></div>
        <div><dt className="text-stone-500">Storage</dt><dd className="font-medium">{listing.storage || "Not provided"}</dd></div>
        <div><dt className="text-stone-500">Allergens</dt><dd className="font-medium">{listing.allergens || "Not provided"}</dd></div>
        <div><dt className="text-stone-500">Pickup area</dt><dd className="font-medium">{showApprox ? "Approximate — " : ""}{listing.area}</dd></div>
        <div><dt className="text-stone-500">Pickup window</dt><dd className="font-medium">{listing.pickupDate}, {listing.pickupStart}–{listing.pickupEnd}</dd></div>
      </dl>

      <div className="mt-6">
        <h2 className="font-semibold mb-1">Description</h2>
        <p className="text-stone-700">{listing.description}</p>
        {lang !== "en" && (
          <div className="mt-2">
            <Button variant="ghost" onClick={handleTranslate} disabled={translating}>{translating ? "Translating…" : `View in ${LANGS.find((l) => l.code === lang)?.name}`}</Button>
            {translated && (
              <div className="mt-2 p-3 rounded-lg bg-sky-50 border border-sky-200 text-sm">
                <p className="text-xs text-sky-700 mb-1">{t("machineTranslated", lang)}</p>
                <p className="text-stone-800">{translated}</p>
                <p className="text-stone-500 mt-1 text-xs">Original: {listing.description}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {listing.instructions && (
        <div className="mt-4">
          <h2 className="font-semibold mb-1">Pickup instructions</h2>
          <p className="text-stone-700 text-sm">{listing.instructions}</p>
        </div>
      )}

      <div className="mt-8 border-t border-stone-200 pt-6">
        <Field label="How much do you need?" id="req-qty">
          <input id="req-qty" type="number" min="1" max={listing.qty} className={inputCls + " max-w-[10rem]"} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
        </Field>
        <Field label="Note to provider (optional)" id="req-note">
          <textarea id="req-note" className={inputCls} rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => onRequest(qty, note)} disabled={listing.status !== "available"}>{t("requestFood", lang)}</Button>
          <Button variant="ghost" onClick={() => setReportOpen(true)}>{t("reportListing", lang)}</Button>
        </div>
        {listing.status !== "available" && <p className="text-sm text-stone-500 mt-2">This item has already been {listing.status}.</p>}
      </div>

      {reportOpen && <ReportModal lang={lang} onClose={() => setReportOpen(false)} onSubmit={(reason, desc) => { onReport(reason, desc); setReportOpen(false); }} />}
    </div>
  );
}

function ReportModal({ lang, onClose, onSubmit }) {
  const [reason, setReason] = useState("unsafe");
  const [desc, setDesc] = useState("");
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="report-title" className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-5 w-full max-w-md">
        <h2 id="report-title" className="font-semibold text-lg mb-3">{t("reportListing", lang)}</h2>
        <Field label="Reason" id="report-reason">
          <select id="report-reason" className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)}>
            <option value="unsafe">Unsafe food</option>
            <option value="suspicious">Suspicious behavior</option>
            <option value="harassment">Harassment</option>
            <option value="misleading">Misleading information</option>
          </select>
        </Field>
        <Field label="Tell us what happened" id="report-desc">
          <textarea id="report-desc" className={inputCls} rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} />
        </Field>
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="ghost" onClick={onClose}>{t("cancel", lang)}</Button>
          <Button variant="danger" onClick={() => onSubmit(reason, desc)}>{t("submit", lang)}</Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Share Extra Food wizard --------------------------------------*/
function ShareFoodForm({ lang, profile, go, onPublish }) {
  const [step, setStep] = useState(1);
  const [suggestion, setSuggestion] = useState(null);
  const [suggesting, setSuggesting] = useState(false);
  const [form, setForm] = useState({
    name: "", category: "", description: "", qty: "", unit: "portions", veg: false, allergens: "",
    prep: "", bestBefore: "", storage: "", area: "", pickupDate: "", pickupStart: "", pickupEnd: "", instructions: "",
  });
  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  if (!profile) return <AuthGate lang={lang} onSignedIn={() => {}} note="Please sign in to share food." />;

  const missing = [];
  if (!form.prep) missing.push("preparation time");
  if (!form.storage) missing.push("storage condition");
  if (!form.bestBefore) missing.push("best-before information");

  async function suggestCategory() {
    if (!form.description) return;
    setSuggesting(true);
    const result = await askAI(
      AI_GUARDRAIL,
      `A food donor wrote this description: "${form.description}". Suggest ONE category from this list only: ${CATEGORIES.map((c) => c.id).join(", ")}. Reply with just the category id, nothing else.`
    );
    setSuggesting(false);
    const found = CATEGORIES.find((c) => c.id === (result || "").trim());
    if (found) { setSuggestion(found.id); }
  }

  function publish() {
    const listing = {
      id: "l" + Math.random().toString(36).slice(2),
      providerName: profile.name, providerType: profile.orgType || "Individual", verified: false,
      name: form.name, category: form.category || "other", description: form.description,
      qty: Number(form.qty) || 1, unit: form.unit, veg: form.veg, allergens: form.allergens || "None known",
      prep: form.prep, bestBefore: form.bestBefore, storage: form.storage,
      area: form.area, exactAddress: "", lat: 5.56 + (Math.random() - 0.5) * 0.05, lng: -0.19 + (Math.random() - 0.5) * 0.05,
      pickupDate: form.pickupDate, pickupStart: form.pickupStart, pickupEnd: form.pickupEnd,
      contact: "In-app chat", instructions: form.instructions, status: "available", createdAt: Date.now(),
    };
    onPublish(listing);
  }

  return (
    <div className="py-8 max-w-xl">
      <h1 className="font-serif text-3xl font-semibold mb-1">{t("shareFood", lang)}</h1>
      <p className="text-stone-600 mb-6">Step {step} of 3</p>
      <div className="h-1.5 bg-stone-200 rounded-full mb-6" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={3}>
        <div className="h-1.5 bg-emerald-700 rounded-full" style={{ width: `${(step / 3) * 100}%` }} />
      </div>

      {step === 1 && (
        <fieldset>
          <legend className="sr-only">Food information</legend>
          <Field label="What food is it?" id="f-name" required><input id="f-name" className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Describe it" hint="What is it, how much, anything people should know." id="f-desc" required>
            <textarea id="f-desc" className={inputCls} rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} onBlur={suggestCategory} />
          </Field>
          {suggesting && <p className="text-xs text-stone-500 -mt-2 mb-3">Suggesting a category…</p>}
          {suggestion && !form.category && (
            <p className="text-xs text-emerald-700 -mt-2 mb-3">
              Suggested category: {catLabel(suggestion, lang)}.{" "}
              <button className="underline" onClick={() => set("category", suggestion)}>Use this</button>
            </p>
          )}
          <Field label="Category" id="f-cat" required>
            <select id="f-cat" className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)}>
              <option value="">Choose a category</option>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{catLabel(c.id, lang)}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="How much?" id="f-qty" required><input id="f-qty" type="number" min="1" className={inputCls} value={form.qty} onChange={(e) => set("qty", e.target.value)} /></Field>
            <Field label="Unit" id="f-unit"><input id="f-unit" className={inputCls} value={form.unit} onChange={(e) => set("unit", e.target.value)} placeholder="portions, kg, loaves…" /></Field>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <input id="f-veg" type="checkbox" className="w-5 h-5" checked={form.veg} onChange={(e) => set("veg", e.target.checked)} />
            <label htmlFor="f-veg" className="text-sm font-medium">Vegetarian</label>
          </div>
          <Field label="Contains common allergens?" id="f-allergen"><input id="f-allergen" className={inputCls} value={form.allergens} onChange={(e) => set("allergens", e.target.value)} placeholder="e.g. groundnut, gluten, none known" /></Field>
        </fieldset>
      )}

      {step === 2 && (
        <fieldset>
          <legend className="sr-only">Safety and pickup information</legend>
          <Field label="When was it prepared?" id="f-prep" required><input id="f-prep" type="text" placeholder="e.g. 2026-09-09 10:00" className={inputCls} value={form.prep} onChange={(e) => set("prep", e.target.value)} /></Field>
          <Field label="Best-before / use-by" id="f-best" required><input id="f-best" type="text" placeholder="e.g. 2026-09-10" className={inputCls} value={form.bestBefore} onChange={(e) => set("bestBefore", e.target.value)} /></Field>
          <Field label="How is it being stored?" id="f-storage" required><input id="f-storage" className={inputCls} value={form.storage} onChange={(e) => set("storage", e.target.value)} placeholder="Refrigerated, room temperature…" /></Field>
          <Field label="Pickup area" id="f-area" required><input id="f-area" className={inputCls} value={form.area} onChange={(e) => set("area", e.target.value)} /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Pickup date" id="f-date"><input id="f-date" type="date" className={inputCls} value={form.pickupDate} onChange={(e) => set("pickupDate", e.target.value)} /></Field>
            <Field label="From" id="f-start"><input id="f-start" type="time" className={inputCls} value={form.pickupStart} onChange={(e) => set("pickupStart", e.target.value)} /></Field>
            <Field label="Until" id="f-end"><input id="f-end" type="time" className={inputCls} value={form.pickupEnd} onChange={(e) => set("pickupEnd", e.target.value)} /></Field>
          </div>
          <Field label="Special instructions (optional)" id="f-instr"><textarea id="f-instr" className={inputCls} rows={2} value={form.instructions} onChange={(e) => set("instructions", e.target.value)} /></Field>
        </fieldset>
      )}

      {step === 3 && (
        <div>
          <h2 className="font-semibold mb-3">Review before you publish</h2>
          {missing.length > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-orange-50 border border-orange-300 text-sm text-orange-900">
              Missing: {missing.join(", ")}. You can still publish, but recipients will see this listing is incomplete.
            </div>
          )}
          <dl className="text-sm grid grid-cols-2 gap-3 mb-4">
            <div><dt className="text-stone-500">Name</dt><dd className="font-medium">{form.name || "—"}</dd></div>
            <div><dt className="text-stone-500">Category</dt><dd className="font-medium">{form.category ? catLabel(form.category, lang) : "—"}</dd></div>
            <div><dt className="text-stone-500">Quantity</dt><dd className="font-medium">{form.qty || "—"} {form.unit}</dd></div>
            <div><dt className="text-stone-500">Pickup</dt><dd className="font-medium">{form.pickupDate || "—"} {form.pickupStart}–{form.pickupEnd}</dd></div>
          </dl>
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-sm text-amber-900 mb-4">⚠ {t("safetyReminder", lang)}</div>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <Button variant="ghost" onClick={() => (step === 1 ? go("home") : setStep(step - 1))}>{t("back", lang)}</Button>
        {step < 3 ? (
          <Button onClick={() => setStep(step + 1)} disabled={step === 1 && (!form.name || !form.category || !form.description || !form.qty)}>{t("next", lang)}</Button>
        ) : (
          <Button onClick={publish}>{t("publish", lang)}</Button>
        )}
      </div>
    </div>
  );
}

/* ---------- Matches (AI-assisted, recommend-only) -----------------------*/
function Matches({ lang, listing, go }) {
  const [explanations, setExplanations] = useState({});
  const [loading, setLoading] = useState(true);

  const ranked = ORG_NEEDS
    .map((org) => ({ org, dist: distanceKm(listing.lat, listing.lng, org.lat, org.lng), needsIt: org.needs.includes(listing.category) }))
    .sort((a, b) => (a.needsIt === b.needsIt ? a.dist - b.dist : a.needsIt ? -1 : 1))
    .slice(0, 3);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const out = {};
      for (const r of ranked) {
        const text = await askAI(
          AI_GUARDRAIL,
          `A food donation was posted: "${listing.qty} ${listing.unit} of ${listing.name}" (category: ${catLabel(listing.category, "en")}) in ${listing.area}, pickup window ${listing.pickupStart}-${listing.pickupEnd}.
A candidate recipient organization: "${r.org.name}" (${r.org.type}), located ${r.dist.toFixed(1)} km away, which currently accepts categories: ${r.org.needs.join(", ")}.
In 1-2 short plain sentences, explain the concrete reasons this could be a good match (distance, category fit, timing) or say it's a weaker match and why. Do not invent facts not given. Do not decide whether they should receive it — only explain the fit factors.`
        );
        out[r.org.name] = text;
      }
      setExplanations(out);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing.id]);

  return (
    <div className="py-8 max-w-2xl">
      <h1 className="font-serif text-3xl font-semibold mb-1">Your listing is live</h1>
      <p className="text-stone-600 mb-6">Here are organizations that might be a good fit. This is only a suggestion — you decide who to work with.</p>
      <div className="space-y-3">
        {ranked.map((r) => (
          <div key={r.org.name} className="rounded-xl border border-stone-200 bg-white p-4">
            <div className="flex justify-between items-start gap-2">
              <div>
                <h2 className="font-semibold">{r.org.name}</h2>
                <p className="text-sm text-stone-500">{r.org.type} · {r.dist.toFixed(1)} km away · {r.org.area}</p>
              </div>
              <Badge tone={r.needsIt ? "good" : "neutral"}>{r.needsIt ? "Accepting this category" : "Category not confirmed"}</Badge>
            </div>
            <div className="mt-2 text-sm bg-stone-50 rounded-lg p-3">
              <p className="text-xs font-medium text-stone-500 mb-1">Why was this recommended?</p>
              {loading ? <p className="text-stone-500">Thinking…</p> : <p className="text-stone-700">{explanations[r.org.name] || "I don't have enough information to explain this match reliably. Please review the details yourself."}</p>}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex gap-3">
        <Button onClick={() => go("dashboard")}>{t("dashboard", lang)}</Button>
        <Button variant="ghost" onClick={() => go("browse")}>{t("browse", lang)}</Button>
      </div>
    </div>
  );
}

/* ---------- Auth (demo) --------------------------------------------------*/
function AuthGate({ lang, onSignedIn, note }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("recipient");
  const [orgType, setOrgType] = useState("Restaurant");
  return (
    <div className="py-12 max-w-md">
      <h1 className="font-serif text-3xl font-semibold mb-2">{t("signIn", lang)}</h1>
      <p className="text-stone-600 mb-1">This prototype uses a simple demo sign-in instead of a live account system.</p>
      {note && <p className="text-orange-800 text-sm mb-4">{note}</p>}
      <Field label="Your name or organization name" id="auth-name" required>
        <input id="auth-name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="I am a…" id="auth-role" required>
        <select id="auth-role" className={inputCls} value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="provider">Food provider (restaurant, market, farm, household…)</option>
          <option value="recipient">Person receiving food</option>
          <option value="organization">Community organization (NGO, shelter, food bank…)</option>
          <option value="admin">Administrator (demo)</option>
        </select>
      </Field>
      {role === "provider" && (
        <Field label="Type of provider" id="auth-orgtype">
          <select id="auth-orgtype" className={inputCls} value={orgType} onChange={(e) => setOrgType(e.target.value)}>
            {["Restaurant", "Supermarket", "Hotel", "Bakery", "Farm", "Household", "Event organizer"].map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
      )}
      <Button disabled={!name} onClick={() => onSignedIn({ id: "u" + Math.random().toString(36).slice(2), name, role, orgType, lang })}>{t("signIn", lang)}</Button>
    </div>
  );
}

/* ---------- Dashboards ---------------------------------------------------*/
function Dashboard({ lang, profile, listings, requests, go, onUpdateRequest, onCollected }) {
  if (profile.role === "provider") return <ProviderDashboard lang={lang} profile={profile} listings={listings} requests={requests} go={go} onUpdateRequest={onUpdateRequest} onCollected={onCollected} />;
  if (profile.role === "organization") return <OrgDashboard lang={lang} profile={profile} listings={listings} requests={requests} go={go} />;
  if (profile.role === "admin") return <div className="py-8"><p className="text-stone-600">Open the Admin panel from the top navigation.</p><Button onClick={() => go("admin")} className="mt-3">Go to Admin</Button></div>;
  return <RecipientDashboard lang={lang} profile={profile} listings={listings} requests={requests} go={go} />;
}

function ProviderDashboard({ lang, profile, listings, requests, go, onUpdateRequest, onCollected }) {
  const mine = listings.filter((l) => l.providerName === profile.name);
  const myRequests = requests.filter((r) => mine.some((l) => l.id === r.listingId));
  const collected = mine.filter((l) => l.status === "collected").reduce((s, l) => s + Number(l.qty || 0), 0);
  return (
    <div className="py-8">
      <h1 className="font-serif text-3xl font-semibold mb-6">{t("dashboard", lang)}</h1>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Active donations" value={mine.filter((l) => l.status === "available").length} />
        <StatCard label="Claimed" value={mine.filter((l) => l.status === "claimed").length} />
        <StatCard label="Portions rescued (est.)" value={collected} />
      </div>
      <Button onClick={() => go("share")} className="mb-6">{t("shareFood", lang)}</Button>

      <h2 className="font-semibold text-lg mb-3">Your listings</h2>
      <div className="space-y-2 mb-8">
        {mine.length === 0 && <p className="text-stone-500 text-sm">No listings yet.</p>}
        {mine.map((l) => (
          <div key={l.id} className="rounded-lg border border-stone-200 bg-white p-3 flex items-center justify-between gap-2">
            <div>
              <p className="font-medium">{l.name}</p>
              <p className="text-xs text-stone-500">{l.qty} {l.unit} · <Badge tone={l.status === "available" ? "good" : l.status === "claimed" ? "warn" : "neutral"}>{l.status}</Badge></p>
            </div>
            {l.status === "claimed" && <Button variant="secondary" onClick={() => onCollected(l.id)}>Mark collected</Button>}
          </div>
        ))}
      </div>

      <h2 className="font-semibold text-lg mb-3">Requests</h2>
      <div className="space-y-2">
        {myRequests.length === 0 && <p className="text-stone-500 text-sm">No requests yet.</p>}
        {myRequests.map((r) => {
          const listing = listings.find((l) => l.id === r.listingId);
          return (
            <div key={r.id} className="rounded-lg border border-stone-200 bg-white p-3 flex items-center justify-between gap-2 flex-wrap">
              <div>
                <p className="font-medium">{r.requesterName} <span className="text-stone-400 font-normal">({r.requesterRole})</span></p>
                <p className="text-xs text-stone-500">wants {r.qty} of "{listing?.name}" {r.note && `— "${r.note}"`}</p>
              </div>
              {r.status === "pending" ? (
                <div className="flex gap-2">
                  <Button variant="primary" onClick={() => onUpdateRequest(r.id, "accepted")}>Accept</Button>
                  <Button variant="ghost" onClick={() => onUpdateRequest(r.id, "rejected")}>Decline</Button>
                </div>
              ) : (
                <Badge tone={r.status === "accepted" ? "good" : "neutral"}>{r.status}</Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecipientDashboard({ lang, profile, listings, requests, go }) {
  const mine = requests.filter((r) => r.requesterId === profile.id);
  return (
    <div className="py-8">
      <h1 className="font-serif text-3xl font-semibold mb-6">{t("dashboard", lang)}</h1>
      <Button onClick={() => go("browse")} className="mb-6">{t("findFood", lang)}</Button>
      <h2 className="font-semibold text-lg mb-3">Your requests</h2>
      <div className="space-y-2">
        {mine.length === 0 && <p className="text-stone-500 text-sm">No requests yet.</p>}
        {mine.map((r) => {
          const listing = listings.find((l) => l.id === r.listingId);
          return (
            <div key={r.id} className="rounded-lg border border-stone-200 bg-white p-3">
              <p className="font-medium">{listing?.name}</p>
              <p className="text-xs text-stone-500">{listing?.area} · pickup {listing?.pickupStart}–{listing?.pickupEnd}</p>
              <Badge tone={r.status === "accepted" ? "good" : r.status === "rejected" ? "warn" : "neutral"}>{r.status}</Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrgDashboard({ lang, profile, listings, requests, go }) {
  const mine = requests.filter((r) => r.requesterId === profile.id);
  const available = listings.filter((l) => l.status === "available");
  return (
    <div className="py-8">
      <h1 className="font-serif text-3xl font-semibold mb-6">{t("dashboard", lang)}</h1>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Available donations" value={available.length} />
        <StatCard label="Pending requests" value={mine.filter((r) => r.status === "pending").length} />
        <StatCard label="Accepted" value={mine.filter((r) => r.status === "accepted").length} />
      </div>
      <Button onClick={() => go("browse")} className="mb-6">Find donations</Button>
      <h2 className="font-semibold text-lg mb-3">Your reservations</h2>
      <div className="space-y-2">
        {mine.length === 0 && <p className="text-stone-500 text-sm">No reservations yet.</p>}
        {mine.map((r) => {
          const listing = listings.find((l) => l.id === r.listingId);
          return (
            <div key={r.id} className="rounded-lg border border-stone-200 bg-white p-3">
              <p className="font-medium">{listing?.name} — {r.qty} {listing?.unit}</p>
              <Badge tone={r.status === "accepted" ? "good" : r.status === "rejected" ? "warn" : "neutral"}>{r.status}</Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="text-2xl font-semibold text-emerald-800">{value}</div>
      <div className="text-sm text-stone-500">{label}</div>
    </div>
  );
}

/* ---------- Admin ---------------------------------------------------------*/
function Admin({ lang, listings, requests, reports, onResolveReport, onVerify, onRemoveListing }) {
  const providers = [...new Set(listings.map((l) => l.providerName))];
  return (
    <div className="py-8">
      <h1 className="font-serif text-3xl font-semibold mb-6">Admin dashboard</h1>
      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total listings" value={listings.length} />
        <StatCard label="Requests" value={requests.length} />
        <StatCard label="Open reports" value={reports.filter((r) => r.status === "open").length} />
        <StatCard label="Providers" value={providers.length} />
      </div>

      <h2 className="font-semibold text-lg mb-3">Reports</h2>
      <div className="space-y-2 mb-8">
        {reports.length === 0 && <p className="text-stone-500 text-sm">No reports.</p>}
        {reports.map((r) => {
          const listing = listings.find((l) => l.id === r.listingId);
          return (
            <div key={r.id} className="rounded-lg border border-stone-200 bg-white p-3 flex justify-between items-center gap-2 flex-wrap">
              <div>
                <p className="font-medium">{r.reason} — {listing?.name || "listing removed"}</p>
                <p className="text-xs text-stone-500">{r.description}</p>
              </div>
              {r.status === "open" ? <Button variant="secondary" onClick={() => onResolveReport(r.id)}>Mark resolved</Button> : <Badge tone="neutral">resolved</Badge>}
            </div>
          );
        })}
      </div>

      <h2 className="font-semibold text-lg mb-3">Providers</h2>
      <div className="space-y-2 mb-8">
        {providers.map((p) => {
          const verified = listings.find((l) => l.providerName === p)?.verified;
          return (
            <div key={p} className="rounded-lg border border-stone-200 bg-white p-3 flex justify-between items-center">
              <p className="font-medium">{p} {verified && <span className="text-emerald-700">✓ {t("verified", lang)}</span>}</p>
              {!verified && <Button variant="secondary" onClick={() => onVerify(p)}>Verify</Button>}
            </div>
          );
        })}
      </div>

      <h2 className="font-semibold text-lg mb-3">All listings</h2>
      <div className="space-y-2">
        {listings.map((l) => (
          <div key={l.id} className="rounded-lg border border-stone-200 bg-white p-3 flex justify-between items-center gap-2">
            <p className="font-medium">{l.name} <span className="text-stone-400 font-normal">— {l.providerName}</span></p>
            <Button variant="danger" onClick={() => onRemoveListing(l.id)}>Remove</Button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Responsible AI page ------------------------------------------*/
function ResponsibleAI({ lang }) {
  return (
    <div className="py-8 max-w-2xl">
      <h1 className="font-serif text-3xl font-semibold mb-4">{t("responsibleAI", lang)}</h1>
      <section className="mb-6">
        <h2 className="font-semibold text-lg mb-2">What AI does</h2>
        <ul className="list-disc pl-5 text-stone-700 space-y-1 text-sm">
          <li>Suggests matches between donations and nearby organizations, with a plain-language reason</li>
          <li>Translates listing text between English, French, Twi and Hausa (always labeled as machine translation)</li>
          <li>Suggests a food category from a description</li>
          <li>Flags when safety information (prep time, storage, best-before) looks incomplete</li>
          <li>Answers questions about how to use FoodSave through the Assistant</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="font-semibold text-lg mb-2">What AI does not do</h2>
        <ul className="list-disc pl-5 text-stone-700 space-y-1 text-sm">
          <li>Decide who "deserves" food, or judge anyone's need or eligibility</li>
          <li>Certify or guarantee that any food is safe to eat</li>
          <li>Make the final decision on a donation, request, or match — a person always does</li>
          <li>Replace human administrators for moderation or verification</li>
          <li>Use race, religion, gender, disability, or similar characteristics in any recommendation</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="font-semibold text-lg mb-2">Data privacy</h2>
        <p className="text-stone-700 text-sm">FoodSave collects only what's needed to coordinate a donation: your name, role, general area, and listing details. Exact home addresses are shown only after a request is accepted. You can view, edit, or delete your information at any time.</p>
      </section>
      <section className="mb-6">
        <h2 className="font-semibold text-lg mb-2">AI limitations</h2>
        <p className="text-stone-700 text-sm">AI can be wrong, especially with incomplete information or less common languages. When it isn't confident, it says so plainly instead of guessing, and every AI-assisted step has a manual alternative.</p>
      </section>
      <section className="mb-6">
        <h2 className="font-semibold text-lg mb-2">How to report an AI error</h2>
        <p className="text-stone-700 text-sm">Use the "Report this listing" button on any listing, or contact an administrator, and choose "misleading information" if an AI suggestion or translation seems wrong. A human reviews every report.</p>
      </section>
      <section>
        <h2 className="font-semibold text-lg mb-2">Human oversight</h2>
        <p className="text-stone-700 text-sm">Administrators can review, verify, or remove any listing, and every accept/reject decision on a request is made by a person, not the AI.</p>
      </section>
    </div>
  );
}

/* ---------- Assistant chat widget ----------------------------------------*/
function AssistantWidget({ lang, open, setOpen, listings }) {
  const [messages, setMessages] = useState([{ role: "assistant", text: "Hi! I'm the FoodSave Assistant. Ask me how to donate, find food, or anything about using the site." }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);

  async function send() {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setBusy(true);
    const context = `There are currently ${listings.filter((l) => l.status === "available").length} available food listings on FoodSave, across categories like bread, cooked meals, vegetables, farm produce and packaged food, mostly around Accra. The interface language is currently set to ${lang}.`;
    const reply = await askAI(AI_GUARDRAIL, `${context}\n\nUser question: ${userMsg.text}`);
    setMessages((m) => [...m, { role: "assistant", text: reply || "I don't have enough information to answer that reliably right now. You can browse food or ask a human admin for help instead." }]);
    setBusy(false);
  }

  return (
    <>
      <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Close FoodSave Assistant" : "Open FoodSave Assistant"} className="fixed bottom-20 md:bottom-6 right-4 z-50 w-14 h-14 rounded-full bg-emerald-700 text-white shadow-lg grid place-items-center text-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-900">
        {open ? "✕" : "💬"}
      </button>
      {open && (
        <div role="dialog" aria-label={t("assistant", lang)} className="fixed bottom-36 md:bottom-24 right-4 z-50 w-[92vw] max-w-sm h-[60vh] bg-white rounded-xl border border-stone-200 shadow-xl flex flex-col">
          <div className="p-3 border-b border-stone-200 font-semibold">{t("assistant", lang)}</div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`text-sm rounded-lg px-3 py-2 max-w-[85%] ${m.role === "user" ? "bg-emerald-700 text-white ml-auto" : "bg-stone-100 text-stone-800"}`}>{m.text}</div>
            ))}
            {busy && <div className="text-sm text-stone-500">Thinking…</div>}
            <div ref={endRef} />
          </div>
          <div className="p-2 border-t border-stone-200 flex gap-2">
            <label htmlFor="assistant-input" className="sr-only">Message the FoodSave Assistant</label>
            <input id="assistant-input" className={inputCls} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask a question…" />
            <Button onClick={send} ariaLabel="Send message">➤</Button>
          </div>
        </div>
      )}
    </>
  );
}
