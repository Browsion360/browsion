import * as XLSX from "xlsx";

const EXAMPLE = {
  slug: "shahana-parvin-34",
  name: "শাহানা পারভীন",
  age: 34,
  height_cm: 157,
  weight_kg: 58,
  district: "রংপুর",
  current_location: "রংপুর শহর, ধাপ এলাকা",
  ancestral_address: "পীরগঞ্জ, রংপুর",
  education: "বি.বি.এ (ফিন্যান্স), বেগম রোকেয়া বিশ্ববিদ্যালয়, ২০১২; এম.বি.এ চলমান",
  profession: "সিনিয়র অফিসার, সোনালী ব্যাংক — রংপুর প্রধান শাখা",
  income_range: "৫০,০০০–৬৫,০০০ টাকা/মাস",
  religion: "ইসলাম",
  sect: "সুন্নি",
  family_type: "nuclear",
  father_profession: "অবসরপ্রাপ্ত সরকারি কর্মকর্তা",
  mother_profession: "গৃহিণী (প্রয়াত)",
  siblings_count: 2,
  marital_status: "widowed",
  skin_tone: "wheatish",
  children_info:
    "দুই সন্তান — ছেলে রিদওয়ান (১২), ক্রিকেট ভালোবাসে, ক্লাস সেভেনে পড়ে। মেয়ে রাইশা (৯), ছবি আঁকে, ক্লাস ফোরে। দুজনেই পড়াশোনায় ভালো, রংপুরের ক্যান্টনমেন্ট স্কুলে পড়ছে।",
  about:
    "জীবনের সবচেয়ে কঠিন রাতটা ছিল চার বছর আগে। হাসপাতাল থেকে ফোন এলো — 'আপনার স্বামী আর নেই।' ৩২ বছর বয়সে হঠাৎ বিধবা, কোলে দুটো ছোট বাচ্চা। সেই রাতটা এখনো কোথাও থমকে আছে।\n\nকিন্তু থামিনি। থামার উপায় ছিল না। রিদওয়ান তখন ৮, রাইশা ৫ — ওদের চোখের দিকে তাকিয়ে কান্নাটাও লুকিয়ে রাখতে হতো। ব্যাংকের চাকরি, বাচ্চাদের স্কুল, রান্নাঘর, ডাক্তার — সব একা সামলেছি। প্রথম বছরটা শুধু টিকে থাকার যুদ্ধ ছিল।\n\nএখন একটু দাঁড়িয়েছি। সকাল ৭টায় বাচ্চাদের স্কুলে দিয়ে ব্যাংকে যাই, বিকেলে ফিরে রাইশার ছবি আঁকা দেখি, রিদওয়ানের সাথে ক্রিকেট ম্যাচ দেখি। শুক্রবারে তিনজন মিলে নানীবাড়ি যাই। ছোট ছোট রুটিনগুলোই এখন আমার শক্তি।\n\nতবু রাত গভীর হলে একটা শূন্যতা আসে। রিদওয়ান গত মাসে জিজ্ঞেস করেছিল — 'আম্মু, আমাদের কি কখনো বাবা হবে?' উত্তর দিতে পারিনি।\n\nআমি কোনো সুপারহিরো না। অনেক ক্লান্ত, অনেক একা। একজন মানুষ চাই — যে শুধু আমাকে না, রিদওয়ান-রাইশাকেও আপন করে নেবে। যার সাথে রাত ১১টায় চা খেতে খেতে বলতে পারব, 'আজকে অফিসে এমন একটা ঘটনা হয়েছে…'",
  expectations:
    "সবচেয়ে বড় শর্ত — আমার দুই সন্তানকে ভালোবাসার মন থাকতে হবে। ওরা সংবেদনশীল, ওদের সাথে ধৈর্য লাগবে। এটা negotiable না।\n\nবয়স: ৩৬–৪৮। বিপত্নীক বা ডিভোর্সি হলেও সমস্যা নেই — মানুষটা কেমন সেটাই আসল। নিজের সন্তান থাকলেও বিবেচনা করব, যদি উনি আমার বাচ্চাদেরও সমান ভালোবাসতে পারেন।\n\nপ্রতিষ্ঠিত হতে হবে — চাকরি বা ব্যবসা, যাই হোক স্থিতিশীল। আমি অর্থের পেছনে ছুটি না, কিন্তু পরিবারের দায়িত্ব নেওয়ার সামর্থ্য থাকা চাই।\n\nরংপুরে থাকতে পারবেন বা আসতে ইচ্ছুক — এই শর্তটুকু আছে, কারণ বাচ্চাদের স্কুল, আমার চাকরি সবই এখানে।\n\nযা চাই না: ধূমপান, রাগী মেজাজ, সন্তানদের প্রতি উদাসীনতা।",
  visit_note:
    "আগামী ১৮–২৪ তারিখ ছুটিতে আছি, রংপুরেই থাকব। সিরিয়াস পাত্রপক্ষ এই সময়ে পরিবার নিয়ে দেখা করতে পারেন। বাচ্চাদের সম্পর্কে নেতিবাচক মনোভাব থাকলে দয়া করে যোগাযোগ করবেন না।",
  photos: [
    "shahana-parvin-01.jpg",
    "shahana-parvin-02.jpg",
    "shahana-parvin-03.jpg",
  ],
  is_published: true,
};

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadJsonTemplate() {
  const blob = new Blob([JSON.stringify([EXAMPLE], null, 2)], { type: "application/json" });
  download(blob, "profiles.json");
}

export function downloadXlsxTemplate() {
  const row = { ...EXAMPLE, photos: EXAMPLE.photos.join(", ") };
  const ws = XLSX.utils.json_to_sheet([row]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "profiles");
  const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  download(new Blob([buf], { type: "application/octet-stream" }), "profiles.xlsx");
}
