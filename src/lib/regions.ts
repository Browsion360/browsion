import { DISTRICTS } from "@/lib/format";

export type Region = "bd" | "ar" | "es" | "global";

export type RegionConfig = {
  slug: Region;
  label: string;
  flag: string;
  locale: "bn" | "ar" | "es" | "en";
  dir: "ltr" | "rtl";
  countries: string[];
  /** Field label shown in the filter bar (district for BD, country otherwise) */
  locationLabel: string;
  copy: {
    eyebrow: string;
    titlePrefix: string;
    titleHighlight: string;
    moreHeading: string;
    newTodayHeading: string;
    newTodaySubtitle: string;
    emptyHeading: string;
    loadingMore: string;
    endOfList: string;
    seoTitle: string;
    seoDescription: string;
    ogImage?: string;
  };
  labels: {
    about: string;
    lookingFor: string;
    profession: string;
    education: string;
    family: string;
    religion: string;
    district: string;
    country: string;
    currentLocation: string;
    weight: string;
    children: string;
    maritalStatus: string;
    income: string;
    skinTone: string;
    ancestralAddress: string;
    father: string;
    mother: string;
    siblings: string;
    save: string;
    saved: string;
    favourite: string;
    sendMessage: string;
    yourFirstMessage: string;
    messageHelper: string;
    messagePlaceholder: string;
    sendMessageBtn: string;
    openFullProfile: string;
    signUpToMessage: string;
    previous: string;
    nextProfile: string;
    viewFullProfile: string;
    visitNote: string;
    nextBride: string;
    moreProfiles: string;
    loadingMore: string;
    endOfList: string;
    allProfiles: string;
    backToDiscover: string;
    expectations: string;
    close: string;
  };
  cta: {
    signIn: string;
    browseFree: string;
    pricing: string;
    exploreMode: string;
    noMatches: string;
    signupBandTitle: string;
    signupBandSubtitle: string;
    createFreeAccount: string;
    howTitle: string;
    howSubtitle: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    testimonialQuote: string;
    testimonialAuthor: string;
    footerNote: string;
    verifiedContact: string;
    talkDirectly: string;
    contactNow: string;
    or: string;
    identityHidden: string;
    ownContact: string;
  };
};

export const REGIONS: Record<Region, RegionConfig> = {
  bd: {
    slug: "bd",
    label: "Bangladesh",
    flag: "🇧🇩",
    locale: "bn",
    dir: "ltr",
    countries: DISTRICTS,
    locationLabel: "District",
    copy: {
      eyebrow: "পাত্রী biodata · প্রতিদিন নতুন",
      titlePrefix: "Bengali",
      titleHighlight: "পাত্রী",
      moreHeading: "আরও পাত্রী",
      newTodayHeading: "আজকের নতুন পাত্রী",
      newTodaySubtitle: "New today",
      emptyHeading: "এই পর্যন্তই · আরও পাত্রী শীঘ্রই আসছে",
      loadingMore: "আরও পাত্রী লোড হচ্ছে…",
      endOfList: "এই পর্যন্তই · আরও পাত্রী শীঘ্রই আসছে",
      seoTitle: "Bengali পাত্রী Biodata · ProthomAlap",
      seoDescription: "Bangladeshi bride biodata — verified profiles, daily new additions. Browse freely without sign-up.",
    },
    labels: {
      about: "About", lookingFor: "প্রত্যাশা",
      profession: "পেশা", education: "শিক্ষা", family: "পরিবার", religion: "ধর্ম",
      district: "জেলা", country: "দেশ", currentLocation: "বর্তমান ঠিকানা",
      weight: "ওজন", children: "সন্তান", maritalStatus: "বৈবাহিক অবস্থা",
      income: "আয়", skinTone: "গায়ের রঙ", ancestralAddress: "পৈতৃক ঠিকানা",
      father: "পিতা", mother: "মাতা", siblings: "ভাইবোন",
      save: "Save", saved: "Saved", favourite: "Favourite",
      sendMessage: "Send message", yourFirstMessage: "Your first message",
      messageHelper: "Messages are reviewed and forwarded on your behalf.",
      messagePlaceholder: "Hello, I came across your profile and…",
      sendMessageBtn: "Send message",
      openFullProfile: "Open full profile", signUpToMessage: "Sign up to message",
      previous: "Previous", nextProfile: "Next profile",
      viewFullProfile: "পুরো প্রোফাইল দেখুন",
      visitNote: "📅 সাক্ষাতের সুযোগ",
      nextBride: "পরবর্তী পাত্রী", moreProfiles: "আরও পাত্রী",
      loadingMore: "আরও পাত্রী লোড হচ্ছে…",
      endOfList: "আজকের জন্য এতটুকুই",
      allProfiles: "সব পাত্রী দেখুন",
      backToDiscover: "← Back to discover",
      expectations: "প্রত্যাশা",
      close: "Close",
    },
    cta: {
      signIn: "সাইন ইন", browseFree: "ফ্রি ব্রাউজ", pricing: "প্রাইসিং", exploreMode: "এক্সপ্লোর মোড",
      noMatches: "এই ফিল্টারে এখনও কোনো প্রোফাইল নেই। শীঘ্রই দেখুন।",
      signupBandTitle: "প্রিয় প্রোফাইল সংরক্ষণ · মেসেজ পাঠান",
      signupBandSubtitle: "ফ্রি সাইন আপ করে পছন্দের প্রোফাইল সেভ করুন এবং প্রথম মেসেজ পাঠান।",
      createFreeAccount: "ফ্রি অ্যাকাউন্ট খুলুন",
      howTitle: "শুরু করার শান্ত উপায়।", howSubtitle: "তিন ধাপ। কোনো হৈচৈ নেই।",
      step1Title: "মুক্তভাবে ব্রাউজ", step1Desc: "সাইন আপ ছাড়াই ছবি ও বায়োডাটা দেখুন। কোনো চাপ নেই।",
      step2Title: "সাইন আপ ও সেভ", step2Desc: "ফ্রি অ্যাকাউন্ট খুলে পছন্দের প্রোফাইল সেভ করুন।",
      step3Title: "আনলক ও মেসেজ", step3Desc: "প্রোফাইল মনে ধরলে আনলক করে প্রথম মেসেজ পাঠান।",
      testimonialQuote: "অবশেষে এমন একটা ম্যাট্রিমোনিয়াল অ্যাপ যেটা ডেটাবেজের মতো লাগে না। শান্ত, সুন্দর — আমাদের জন্যই বানানো।",
      testimonialAuthor: "— প্রাথমিক ব্যবহারকারী, ঢাকা",
      footerNote: "যত্নের সাথে বাংলাদেশে তৈরি",
      verifiedContact: "যাচাইকৃত যোগাযোগ", talkDirectly: "সরাসরি কথা বলুন",
      contactNow: "যোগাযোগ করুন", or: "অথবা",
      identityHidden: "আপনার পরিচয় গোপন রাখা হবে", ownContact: "এই প্রোফাইলের নিজস্ব যোগাযোগ",
    },
  },
  ar: {
    slug: "ar",
    label: "Arabian",
    flag: "🌙",
    locale: "ar",
    dir: "rtl",
    countries: ["Saudi Arabia", "United Arab Emirates", "Qatar", "Kuwait", "Bahrain", "Oman", "Egypt", "Jordan", "Morocco", "Lebanon"],
    locationLabel: "Country",
    copy: {
      eyebrow: "بيانات العرائس · جديد كل يوم",
      titlePrefix: "Arabian",
      titleHighlight: "عروس",
      moreHeading: "المزيد من البيانات",
      newTodayHeading: "جديد اليوم",
      newTodaySubtitle: "New today",
      emptyHeading: "لا توجد ملفات بعد",
      loadingMore: "جارٍ تحميل المزيد…",
      endOfList: "هذا كل ما لدينا اليوم",
      seoTitle: "Arabian Bride Biodata · ProthomAlap",
      seoDescription: "Verified bride biodata from across the Arab world. Saudi, UAE, Qatar, Egypt and more.",
      ogImage: "/social/arabian-social-share.webp",
    },
    labels: {
      about: "نبذة", lookingFor: "ما تبحث عنه",
      profession: "المهنة", education: "التعليم", family: "العائلة", religion: "الدين",
      district: "المنطقة", country: "الدولة", currentLocation: "العنوان الحالي",
      weight: "الوزن", children: "الأبناء", maritalStatus: "الحالة الاجتماعية",
      income: "الدخل", skinTone: "لون البشرة", ancestralAddress: "العنوان الأصلي",
      father: "الأب", mother: "الأم", siblings: "الإخوة",
      save: "حفظ", saved: "تم الحفظ", favourite: "المفضلة",
      sendMessage: "إرسال رسالة", yourFirstMessage: "رسالتك الأولى",
      messageHelper: "تتم مراجعة الرسائل وإرسالها نيابة عنك.",
      messagePlaceholder: "السلام عليكم، اطلعت على ملفك و…",
      sendMessageBtn: "إرسال",
      openFullProfile: "عرض الملف الكامل", signUpToMessage: "سجّل للمراسلة",
      previous: "السابق", nextProfile: "التالي",
      viewFullProfile: "عرض الملف الكامل",
      visitNote: "📅 فرصة اللقاء",
      nextBride: "العروس التالية", moreProfiles: "المزيد من البيانات",
      loadingMore: "جارٍ تحميل المزيد…",
      endOfList: "هذا كل شيء لليوم",
      allProfiles: "عرض جميع البيانات",
      backToDiscover: "← العودة",
      expectations: "ما تبحث عنه",
      close: "إغلاق",
    },
    cta: {
      signIn: "تسجيل الدخول", browseFree: "تصفّح مجاناً", pricing: "الأسعار", exploreMode: "وضع الاستكشاف",
      noMatches: "لا توجد ملفات تطابق هذه الفلاتر بعد. عُد لاحقاً.",
      signupBandTitle: "احفظ المفضلة · أرسل رسائل",
      signupBandSubtitle: "سجّل مجاناً لحفظ الملفات التي تعجبك وإرسال رسالتك الأولى.",
      createFreeAccount: "أنشئ حساباً مجانياً",
      howTitle: "طريقة هادئة للبداية.", howSubtitle: "ثلاث خطوات. بلا ضجيج.",
      step1Title: "تصفّح بحرية", step1Desc: "شاهد الصور والبيانات دون تسجيل. بلا ضغط.",
      step2Title: "سجّل واحفظ", step2Desc: "أنشئ حساباً مجانياً لحفظ الملفات التي تعجبك.",
      step3Title: "افتح وراسل", step3Desc: "عندما يناسبك ملف، افتحه وأرسل رسالتك الأولى.",
      testimonialQuote: "أخيراً تطبيق زواج لا يبدو كقاعدة بيانات. هادئ، جميل، ومصمم لنا.",
      testimonialAuthor: "— مستخدم مبكر",
      footerNote: "صُنع بعناية",
      verifiedContact: "تواصل موثّق", talkDirectly: "تحدّث مباشرة",
      contactNow: "تواصل الآن", or: "أو",
      identityHidden: "هويتك ستبقى خاصة", ownContact: "تواصل خاص بهذا الملف",
    },
  },
  es: {
    slug: "es",
    label: "Español",
    flag: "💃",
    locale: "es",
    dir: "ltr",
    countries: ["España", "México", "Argentina", "Colombia", "Chile", "Perú", "Venezuela", "Ecuador", "Cuba", "República Dominicana"],
    locationLabel: "País",
    copy: {
      eyebrow: "Perfiles de novias · nuevos cada día",
      titlePrefix: "Spanish",
      titleHighlight: "novias",
      moreHeading: "Más perfiles",
      newTodayHeading: "Nuevas hoy",
      newTodaySubtitle: "New today",
      emptyHeading: "Aún no hay perfiles",
      loadingMore: "Cargando más perfiles…",
      endOfList: "Eso es todo por hoy",
      seoTitle: "Perfiles de Novias en Español · ProthomAlap",
      seoDescription: "Biodatos verificados de novias en español — España y América Latina. Navega gratis.",
    },
    labels: {
      about: "Acerca de", lookingFor: "Lo que busca",
      profession: "Profesión", education: "Educación", family: "Familia", religion: "Religión",
      district: "Distrito", country: "País", currentLocation: "Ubicación actual",
      weight: "Peso", children: "Hijos", maritalStatus: "Estado civil",
      income: "Ingresos", skinTone: "Tono de piel", ancestralAddress: "Dirección familiar",
      father: "Padre", mother: "Madre", siblings: "Hermanos",
      save: "Guardar", saved: "Guardado", favourite: "Favorito",
      sendMessage: "Enviar mensaje", yourFirstMessage: "Tu primer mensaje",
      messageHelper: "Los mensajes son revisados y enviados en tu nombre.",
      messagePlaceholder: "Hola, vi tu perfil y…",
      sendMessageBtn: "Enviar mensaje",
      openFullProfile: "Ver perfil completo", signUpToMessage: "Regístrate para escribir",
      previous: "Anterior", nextProfile: "Siguiente",
      viewFullProfile: "Ver perfil completo",
      visitNote: "📅 Disponibilidad para conocer",
      nextBride: "Siguiente novia", moreProfiles: "Más perfiles",
      loadingMore: "Cargando más…",
      endOfList: "Eso es todo por hoy",
      allProfiles: "Ver todos",
      backToDiscover: "← Volver",
      expectations: "Lo que busca",
      close: "Cerrar",
    },
    cta: {
      signIn: "Iniciar sesión", browseFree: "Explorar gratis", pricing: "Precios", exploreMode: "Modo explorar",
      noMatches: "Ningún perfil coincide aún. Vuelve pronto.",
      signupBandTitle: "Guarda favoritos · Envía mensajes",
      signupBandSubtitle: "Regístrate gratis para guardar perfiles que te gusten y enviar tu primer mensaje.",
      createFreeAccount: "Crear cuenta gratis",
      howTitle: "Una forma más tranquila de empezar.", howSubtitle: "Tres pasos. Sin ruido.",
      step1Title: "Explora libremente", step1Desc: "Mira fotos y biodatos sin registrarte. Sin presión.",
      step2Title: "Regístrate y guarda", step2Desc: "Crea una cuenta gratis para guardar tus favoritos.",
      step3Title: "Desbloquea y escribe", step3Desc: "Cuando un perfil te convenza, desbloquéalo y envía tu primer mensaje.",
      testimonialQuote: "Por fin una app matrimonial que no parece una base de datos. Tranquila, bonita y hecha para nosotros.",
      testimonialAuthor: "— Usuaria temprana",
      footerNote: "Hecho con cariño",
      verifiedContact: "Contacto verificado", talkDirectly: "Habla directamente",
      contactNow: "Contactar ahora", or: "o",
      identityHidden: "Tu identidad se mantiene privada", ownContact: "Contacto propio del perfil",
    },
  },
  global: {
    slug: "global",
    label: "Global",
    flag: "🌍",
    locale: "en",
    dir: "ltr",
    countries: ["United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Italy", "Netherlands", "India", "Pakistan", "Turkey", "Indonesia", "Malaysia", "Other"],
    locationLabel: "Country",
    copy: {
      eyebrow: "Bride biodata · new every day",
      titlePrefix: "Global",
      titleHighlight: "brides",
      moreHeading: "More profiles",
      newTodayHeading: "New today",
      newTodaySubtitle: "Fresh profiles",
      emptyHeading: "No profiles match yet",
      loadingMore: "Loading more profiles…",
      endOfList: "That's all for today",
      seoTitle: "Global Bride Biodata · ProthomAlap",
      seoDescription: "Verified bride biodata from around the world. Browse freely without sign-up.",
    },
    labels: {
      about: "About", lookingFor: "Looking for",
      profession: "Profession", education: "Education", family: "Family", religion: "Religion",
      district: "District", country: "Country", currentLocation: "Current location",
      weight: "Weight", children: "Children", maritalStatus: "Marital status",
      income: "Income", skinTone: "Skin tone", ancestralAddress: "Ancestral address",
      father: "Father", mother: "Mother", siblings: "Siblings",
      save: "Save", saved: "Saved", favourite: "Favourite",
      sendMessage: "Send message", yourFirstMessage: "Your first message",
      messageHelper: "Messages are reviewed and forwarded on your behalf.",
      messagePlaceholder: "Hi, I came across your profile and…",
      sendMessageBtn: "Send message",
      openFullProfile: "Open full profile", signUpToMessage: "Sign up to message",
      previous: "Previous", nextProfile: "Next profile",
      viewFullProfile: "Open full profile",
      visitNote: "📅 Availability to meet",
      nextBride: "Next profile", moreProfiles: "More profiles",
      loadingMore: "Loading more profiles…",
      endOfList: "That's all for today",
      allProfiles: "Browse all",
      backToDiscover: "← Back",
      expectations: "Looking for",
      close: "Close",
    },
    cta: {
      signIn: "Sign in", browseFree: "Browse free", pricing: "Pricing", exploreMode: "Explore mode",
      noMatches: "No profiles match your filters yet. Check back soon.",
      signupBandTitle: "Save favourites · Send messages",
      signupBandSubtitle: "Sign up free to favourite profiles you like and send your first message.",
      createFreeAccount: "Create free account",
      howTitle: "A calmer way to start.", howSubtitle: "Three steps. No noise. No infinite swiping.",
      step1Title: "Browse openly", step1Desc: "Read photos and biodata without signing up. No pressure.",
      step2Title: "Sign up & save", step2Desc: "Make a free account to favourite profiles you like.",
      step3Title: "Unlock & message", step3Desc: "When a profile feels right, unlock it and send your first message.",
      testimonialQuote: "Finally a matrimonial app that doesn't feel like a database. Calm, beautiful, and built for us.",
      testimonialAuthor: "— Early user",
      footerNote: "Made with care",
      verifiedContact: "Verified contact", talkDirectly: "Talk directly",
      contactNow: "Contact now", or: "or",
      identityHidden: "Your identity stays private", ownContact: "Profile's own contact",
    },
  },
};

export const REGION_LIST: Region[] = ["bd", "ar", "es", "global"];

export function getRegion(slug?: string | null): RegionConfig {
  if (slug && (REGIONS as any)[slug]) return (REGIONS as any)[slug];
  return REGIONS.bd;
}
