import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  signInWithCustomToken
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  deleteDoc, 
  updateDoc,
  setDoc,
  getDoc,
  writeBatch
} from 'firebase/firestore';
import { 
  LayoutDashboard, PlusCircle, LogOut, Trash2, Edit2, 
  Languages, Milk, Carrot, Droplet, ShoppingBag, 
  MoreHorizontal, TrendingUp, X, CheckCircle2, 
  User, Heart, Zap, Loader2, 
  Search, Wallet, Settings2, Lock, KeyRound, Filter, Check, Download,
  BrainCircuit, Sparkles, AlertTriangle, UploadCloud, FileText, Bell, UserPlus,
  Shield, Users, Activity, CreditCard, Lightbulb, TrendingDown, CalendarDays
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

// --- CONFIGURATION ---

const firebaseConfig = {
  apiKey: "AIzaSyDho5QVgrilcjtGv5l60LD34l48R8CDgfM",
  authDomain: "ghar-kharcha-2.firebaseapp.com",
  projectId: "ghar-kharcha-2",
  storageBucket: "ghar-kharcha-2.firebasestorage.app",
  messagingSenderId: "156973348495",
  appId: "1:156973348495:web:ea97242143741fd2d162fa"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "ghar-kharcha-2";

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'mr', label: 'મરાઠી' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' }
];

const i18n = {
  en: {
    welcome: "Welcome back", today: "Today", monthly: "Monthly Total", budget: "Monthly Limit", remaining: "Balance",
    add: "Add Entry", edit: "Edit Entry", search: "Search expenses...", save: "Save Changes", cancel: "Cancel",
    all: "Global View", milk: "Milk", vegetables: "Vegetables", oil: "Oil", grocery: "Groceries", other: "Other",
    footerCredits: "Handcrafted by", overspent: "Over Budget", confirmDelete: "Delete this entry?", bulkDelete: "Purge Selected",
    success: "Success", loginTitle: "Vault Access", loginSub: "Enter Nickname & Password to sync data",
    startSync: "Unlock Ledger", setBudget: "Set Budget", updateBudget: "Update", authError: "Invalid Credentials",
    filters: "Filters", reset: "Reset", idTaken: "ID is taken! Please choose a unique Nickname.", empty: "No expenses recorded yet"
  },
  hi: {
    welcome: "नमस्ते", today: "आज का खर्च", monthly: "इस महीने", budget: "मासिक बजट", remaining: "शेष राशि",
    add: "नया खर्च", edit: "बदलाव करें", search: "खोजें...", save: "सुरक्षित करें", cancel: "रद्द करें",
    all: "सब कुछ", milk: "दूध", vegetables: "सબ્जियाँ", oil: "तेल", grocery: "किराना", other: "अन्य",
    footerCredits: "निर्माता", overspent: "बजट से ज्यादा", confirmDelete: "क्या आप इसे हटाना चाहते हैं?", bulkDelete: "चयनित हटाएं",
    success: "सफल", loginTitle: "वॉल्ट एक्सेस", loginSub: "डेटा सिंक करने के लिए नाम और पासवर्ड डालें",
    startSync: "लेजर खोलें", setBudget: "बजट सेट करें", updateBudget: "अपडेट करें", authError: "गलत विवरण",
    filters: "फ़िल्टर", reset: "रीसेट", idTaken: "यह आईडी पहले से मौजूद है! कृपया एक अनोखा नाम चुनें।", empty: "कोई खर्च नहीं मिला"
  },
  gu: {
    welcome: "સ્વાગત છે", today: "આજનો ખર્ચ", monthly: "માસિક ખર્ચ", budget: "માસિક બજેટ", remaining: "બાકી રકમ",
    add: "નવો ખર્ચ", edit: "ફેરફાર કરો", search: "ખર્ચ શોધો...", save: "સાચવો", cancel: "રદ કરો",
    all: "બધી શ્રેણીઓ", milk: "દૂધ", vegetables: "શાકભાજી", oil: "તેલ", grocery: "કરિયાણું", other: "અન્ય",
    footerCredits: "દ્વારા બનાવવામાં આવેલ", overspent: "બજેટ બહાર", confirmDelete: "આ કાઢી નાખવું છે?", bulkDelete: "પસંદ કરેલ કાઢી નાખો",
    success: "સફળ", loginTitle: "વૉલ્ટ ઍક્સેસ", loginSub: "ડેટા સિંક કરવા માટે નામ અને પાસવર્ડ નાખો",
    startSync: "લેજર ખોલો", setBudget: "બજેટ સેટ કરો", updateBudget: "અપડેટ કરો", authError: "ખોટી વિગતો",
    filters: "ફિલ્ટર્સ", reset: "રીસેટ", idTaken: "આ ID પહેલેથી જ લેવાયેલ છે! અનન્ય નામ પસંદ કરો.", empty: "કોઈ ખર્ચ મળ્યો નથી"
  },
  mr: {
    welcome: "स्वागत आहे", today: "आजचा खर्च", monthly: "मासिक खर्च", budget: "मासिक बજેટ", remaining: "ઉર્વરિત રકમ",
    add: "नवीिन खर्च", edit: "संपादित करा", search: "खर्च शोधा...", save: "जतन करा", cancel: "रद्द करा",
    all: "सर्व श्रेणी", milk: "दूध", vegetables: "भाज्या", oil: "तेल", grocery: "किराणा", other: "इतर",
    footerCredits: "द्वारे निर्मित", overspent: "बजेट बाहेर", confirmDelete: "हे हटवायचे?", bulkDelete: "निवडलेले हटवा",
    success: "यशस्वी", loginTitle: "व्हॉल्ट एक्सेस", loginSub: "डेटा सिंक करण्यासाठी नाव आणि पासवर्ड प्रविष्ट करा",
    startSync: "लेजर उघडा", setBudget: "बजेट सेट करा", updateBudget: "अपडेट करा", authError: "चुकीचे तपशील",
    filters: "फिल्टर्स", reset: "रीसेट", idTaken: "हे ID आधीच घेतले आहे! कृपया एक अद्वितीय नाव निवडा.", empty: "कोणताही खर्च आढळला नाही"
  },
  bn: {
    welcome: "স্বাগতম", today: "আজকের খরচ", monthly: "মাসিক খরচ", budget: "মাসিক বাজেট", remaining: "অবশিষ্ট",
    add: "নতুন এন্ট্রি", edit: "সম্পাদনা করুন", search: "খরচ খুঁজুন...", save: "সংরক্ষণ করুন", cancel: "বাতিল করুন",
    all: "সব বিভাগ", milk: "দুধ", vegetables: "শাকসবজি", oil: "তেল", grocery: "মুদি", other: "অন্যান্য",
    footerCredits: "তৈরি করেছেন", overspent: "বাজেট অতিক্রম করেছে", confirmDelete: "এটি মুছে ফেলতে চান?", bulkDelete: "নির্বাচিত মুছুন",
    success: "সফল", loginTitle: "ভল্ট অ্যাক্সেস", loginSub: "ডেটা সিঙ্ক করতে নাম এবং পাসওয়ার্ড দিন",
    startSync: "লেজার খুলুন", setBudget: "বাজেট সেট করুন", updateBudget: "আপডেট করুন", authError: "ভুল তথ্য",
    filters: "ফিল্টার", reset: "রিসেট", idTaken: "এই আইডিটি ইতিমধ্যেই নেওয়া হয়েছে! একটি অনন্য নাম চয়ন করুন।", empty: "কোনো খরচ পাওয়া যায়নি"
  },
  ta: {
    welcome: "வருக", today: "இன்று", monthly: "மாதாந்திர செலவு", budget: "பட்ஜெட்", remaining: "மீதம்",
    add: "சேர்க்க", edit: "திருத்து", search: "தேடு...", save: "சேமி", cancel: "ரத்துசெய்",
    all: "அனைத்தும்", milk: "பால்", vegetables: "காயறிகள்", oil: "எண்ணெய்", grocery: "மளிகை", other: "மற்றவை",
    footerCredits: "உருவாக்கியவர்", overspent: "பட்ஜெட் தாண்டியது", confirmDelete: "அழிக்கவா?", bulkDelete: "தேர்ந்தெடுத்ததை அழி",
    success: "வெற்றி", loginTitle: "வால்ட் அணுகல்", loginSub: "தரவை ஒத்திசைக்க பெயர் மற்றும் கடவுச்சொல்லை உள்ளிடவும்",
    startSync: "திறக்க", setBudget: "பட்ஜெட் அமைக்க", updateBudget: "புதுப்பி", authError: "தவறான விவரங்கள்",
    filters: "வடிகட்டிகள்", reset: "மீட்டமை", idTaken: "இந்த ID ஏற்கனவே எடுக்கப்பட்டுள்ளது! தனித்துவமான பெயரைத் தேர்ந்தெடுக்கவும்.", empty: "செலவுகள் எதுவும் இல்லை"
  },
  te: {
    welcome: "స్వాగతం", today: "నేడు", monthly: "నెలవారీ ఖర్చు", budget: "నెలవారీ బడ్జెట్", remaining: "మిగిలినది",
    add: "జోడించు", edit: "సవరించు", search: "శోధించు...", save: "సేవ్ చేయి", cancel: "రద్దు చేయి",
    all: "అన్నీ", milk: "పాలు", vegetables: "కూరగాయలు", oil: "నూనె", grocery: "కిరాణా", other: "ఇతర",
    footerCredits: "సృష్టించినవారు", overspent: "బడ్జెట్ దాటింది", confirmDelete: "తొలగించాలా?", bulkDelete: "ఎంచుకున్నవి తొలగించు",
    success: "విజయం", loginTitle: "వాల్ట్ యాక్సెస్", loginSub: "సమాచారాన్ని సింక్ చేయడానికి పేరు మరియు పాస్‌వర్డ్ నమోదు చేయండి",
    startSync: "తెరువు", setBudget: "బడ్జెట్ సెట్ చేయండి", updateBudget: "అప్‌డేట్ చేయండి", authError: "తప్పు వివరాలు",
    filters: "ఫిల్టర్లు", reset: "రీసెట్", idTaken: "ఈ ID ఇప్పటికే తీసుకోబడింది! ప్రత్యేక పేరును ఎంచుకోండి.", empty: "ఖర్చులు కనుగొనబడలేదు"
  }
};

// Updated categories using the full 5-color Cyber Palette combinations
const CATEGORIES = [
  { id: 'Milk', Icon: Milk, color: 'bg-[#66FCF1] bg-opacity-20 text-[#66FCF1]', hex: '#66FCF1', activeGlow: 'shadow-[0_0_20px_rgba(102,252,241,0.4)]' },
  { id: 'Vegetables', Icon: Carrot, color: 'bg-[#45A29E] bg-opacity-20 text-[#45A29E]', hex: '#45A29E', activeGlow: 'shadow-[0_0_20px_rgba(69,162,158,0.4)]' },
  { id: 'Oil', Icon: Droplet, color: 'bg-[#C5C6C7] bg-opacity-20 text-[#C5C6C7]', hex: '#C5C6C7', activeGlow: 'shadow-[0_0_20px_rgba(197,198,199,0.4)]' },
  { id: 'Grocery', Icon: ShoppingBag, color: 'bg-[#1F2833] text-[#66FCF1] border border-[#66FCF1]/30', hex: '#1F2833', activeGlow: 'shadow-[0_0_20px_rgba(102,252,241,0.2)]' },
  { id: 'Other', Icon: MoreHorizontal, color: 'bg-[#0B0C10] text-[#45A29E] border border-[#45A29E]/30', hex: '#0B0C10', activeGlow: 'shadow-[0_0_20px_rgba(69,162,158,0.2)]' }
];

const DEFAULT_UNITS = ['L', 'KG', 'G', 'Pcs'];

// Updated presets based on your specific request
const QTY_PRESETS = {
  L: [1, 2, 3, 4, 5, 10],
  KG: [0.5, 1, 2, 5, 10, 20],
  G: [50, 100, 200, 250, 500],
  Pcs: [1, 2, 5, 10, 12, 24]
};

export default function App() {
  const [nickname, setNickname] = useState(localStorage.getItem('gharkharcha_nickname') || '');
  const [password, setPassword] = useState(localStorage.getItem('gharkharcha_pass') || '');
  const [memberName, setMemberName] = useState(localStorage.getItem('gharkharcha_member') || 'Family Member');
  const [inputNick, setInputNick] = useState('');
  const [inputPass, setInputPass] = useState('');
  const [inputMember, setInputMember] = useState('');
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userConfig, setUserConfig] = useState({ budget: 5000, lang: 'en', darkMode: true });
  
  const [allExpenses, setAllExpenses] = useState([]);
  const [sortBy, setSortBy] = useState('date-desc');
  const [view, setView] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [message, setMessage] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [selectedIds, setSelectedIds] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('Milk');
  const [totalAmount, setTotalAmount] = useState('');
  const [qty, setQty] = useState('');
  const [rate, setRate] = useState('');
  const [unit, setUnit] = useState('L');
  const [isCustomUnit, setIsCustomUnit] = useState(false);

  // --- ADMIN STATE ---
  const [allSystemVaults, setAllSystemVaults] = useState([]);
  const [allSystemExpenses, setAllSystemExpenses] = useState([]);

  const t = i18n[userConfig.lang] || i18n.en;
  const todayString = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const styleId = 'ghar-kharcha-global-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; -webkit-tap-highlight-color: transparent; background-color: #0B0C10; color: #C5C6C7; }
        .font-brand { font-family: 'Kalam', cursive !important; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #45A29E; border-radius: 20px; }
        @media (max-width: 640px) { input, select { font-size: 16px !important; } }
        
        /* Micro-Animations */
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }

        /* Override autofill colors in dark mode */
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active{
            -webkit-box-shadow: 0 0 0 30px #0B0C10 inset !important;
            -webkit-text-fill-color: #66FCF1 !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

useEffect(() => {
  const initAuth = async () => {
    try {
      const __initial_auth_token = process.env.REACT_APP_INITIAL_AUTH_TOKEN; // <-- here

      if (__initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    } catch (err) {
      console.error(err);
    }
  };

  initAuth();
}, []);

   

  useEffect(() => {
    if (!user || !nickname) return;
    
    const expensesCol = collection(db, 'artifacts', appId, 'public', 'data', 'expenses');
    const unsubExpenses = onSnapshot(expensesCol, 
      (snap) => {
        const data = snap.docs
          .map(d => Object.assign({ id: d.id }, d.data()))
          .filter(exp => String(exp.nickname).toLowerCase().trim() === nickname.toLowerCase().trim());
        setAllExpenses(data);
      }, 
      (error) => console.error("Firestore error:", error)
    );

    const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', nickname.toLowerCase().trim());
    const unsubSettings = onSnapshot(settingsRef, (snap) => {
      if (snap.exists()) setUserConfig(prev => Object.assign({}, prev, snap.data()));
    }, (error) => console.error("Firestore Settings Error:", error));
    
    return () => { unsubExpenses(); unsubSettings(); };
  }, [user, nickname]);

  useEffect(() => {
    if (!user || nickname !== 'admin') return;

    const settingsCol = collection(db, 'artifacts', appId, 'public', 'data', 'settings');
    const unsubAllSettings = onSnapshot(settingsCol, (snap) => {
      setAllSystemVaults(snap.docs.map(d => Object.assign({ id: d.id }, d.data())));
    }, (error) => console.error(error));

    const expensesCol = collection(db, 'artifacts', appId, 'public', 'data', 'expenses');
    const unsubAllExpenses = onSnapshot(expensesCol, (snap) => {
      setAllSystemExpenses(snap.docs.map(d => Object.assign({ id: d.id }, d.data())));
    }, (error) => console.error(error));

    return () => { unsubAllSettings(); unsubAllExpenses(); };
  }, [user, nickname]);

  const showMsg = (text, type) => {
    setMessage({ text: String(text), type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!inputNick.trim() || !inputPass.trim() || !inputMember.trim()) return showMsg("Fill all fields", "error");
    const formattedNick = inputNick.toLowerCase().trim();
    const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', formattedNick);
    try {
      const snap = await getDoc(settingsRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.password === inputPass) {
          setNickname(formattedNick); setPassword(inputPass); setMemberName(inputMember.trim());
          localStorage.setItem('gharkharcha_nickname', formattedNick);
          localStorage.setItem('gharkharcha_pass', inputPass);
          localStorage.setItem('gharkharcha_member', inputMember.trim());
          showMsg(t.success, "success");
        } else { showMsg(t.idTaken, "error"); }
      } else {
        await setDoc(settingsRef, { 
          password: inputPass, budget: 5000, lang: userConfig.lang, createdAt: new Date().toISOString()
        });
        setNickname(formattedNick); setPassword(inputPass); setMemberName(inputMember.trim());
        localStorage.setItem('gharkharcha_nickname', formattedNick);
        localStorage.setItem('gharkharcha_pass', inputPass);
        localStorage.setItem('gharkharcha_member', inputMember.trim());
        showMsg("Vault Created", "success");
      }
    } catch (e) { showMsg("Access Failure", "error"); }
  };

  const logout = () => {
    localStorage.removeItem('gharkharcha_nickname');
    localStorage.removeItem('gharkharcha_pass');
    localStorage.removeItem('gharkharcha_member');
    window.location.reload();
  };

  const updateCloudSetting = async (key, value) => {
    if (!user || !nickname) return;
    const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', nickname.toLowerCase().trim());
    try {
      const updateData = {};
      updateData[key] = value;
      await setDoc(settingsRef, updateData, { merge: true });
      if(key === 'budget') setShowBudgetModal(false);
      showMsg(t.success, "success");
    } catch (e) { showMsg("Error", "error"); }
  };

  const stats = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const month = now.getMonth();
    const year = now.getFullYear();
    return allExpenses.reduce((acc, exp) => {
      const d = new Date(exp.date);
      const amt = parseFloat(exp.amount) || 0;
      if (exp.date === today) acc.today += amt;
      if (d.getMonth() === month && d.getFullYear() === year) acc.month += amt;
      acc.byCat[exp.category] = (acc.byCat[exp.category] || 0) + amt;
      return acc;
    }, { today: 0, month: 0, byCat: {} });
  }, [allExpenses]);

  const filteredExpenses = useMemo(() => {
    let result = allExpenses.filter(e => {
      const matchesSearch = String(e.itemName || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = filterCategory === 'all' || e.category === filterCategory;
      const matchesDate = (!dateRange.start || e.date >= dateRange.start) && (!dateRange.end || e.date <= dateRange.end);
      const matchesAmount = (!amountRange.min || parseFloat(e.amount) >= parseFloat(amountRange.min)) && 
                           (!amountRange.max || parseFloat(e.amount) <= parseFloat(amountRange.max));
      return matchesSearch && matchesCat && matchesDate && matchesAmount;
    });
    if (sortBy === 'date-desc') result.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (sortBy === 'amount-desc') result.sort((a, b) => (parseFloat(b.amount) || 0) - (parseFloat(a.amount) || 0));
    if (sortBy === 'amount-asc') result.sort((a, b) => (parseFloat(a.amount) || 0) - (parseFloat(b.amount) || 0));
    return result;
  }, [allExpenses, searchQuery, sortBy, filterCategory, dateRange, amountRange]);

  // Auto-calculator effect
  useEffect(() => {
    if (rate && qty) {
      const q = parseFloat(qty) || 0;
      const r = parseFloat(rate) || 0;
      setTotalAmount((q * r).toFixed(2));
    }
  }, [rate, qty]);

  const activeNotifications = useMemo(() => {
    const notifs = [];
    if (stats.today === 0) {
        notifs.push({ id: 1, text: "You haven't added any expenses today. Tap + to keep your ledger updated.", type: "info" });
    }
    if (userConfig.budget > 0) {
        if (stats.month > userConfig.budget) {
            notifs.push({ id: 2, text: `Alert: You've crossed your monthly budget by ₹${(stats.month - userConfig.budget).toLocaleString()}!`, type: "critical" });
        } else if (stats.month > userConfig.budget * 0.8) {
            notifs.push({ id: 3, text: `Warning: You have used over 80% of your monthly budget.`, type: "warning" });
        }
    }
    return notifs;
  }, [stats, userConfig.budget]);

  const saveExpense = async (e) => {
    e.preventDefault();
    if (!user || !nickname) return;
    const formData = new FormData(e.target);
    
    let itemName = formData.get('itemName');
    if (!itemName || itemName.trim() === '') {
        itemName = t[selectedCategory.toLowerCase()] || selectedCategory;
    }

    const data = {
      itemName: itemName,
      category: selectedCategory,
      amount: parseFloat(totalAmount) || 0,
      quantity: parseFloat(qty) || 1,
      rate: parseFloat(rate) || 0,
      unit: unit,
      date: formData.get('date') || todayString,
      nickname: nickname.toLowerCase().trim(),
      addedBy: memberName,
      createdAt: new Date().toISOString()
    };
    try {
      const col = collection(db, 'artifacts', appId, 'public', 'data', 'expenses');
      if (editingExpense) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'expenses', editingExpense.id), data);
      else await addDoc(col, data);
      setShowAddModal(false);
      setEditingExpense(null);
      showMsg(t.success, "success");
    } catch (err) { showMsg("Error", 'error'); }
  };

  const bulkDelete = async () => {
    if (!window.confirm("Permanently remove selected entries?")) return;
    const batch = writeBatch(db);
    selectedIds.forEach(id => {
      batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'expenses', id));
    });
    try {
      await batch.commit();
      setSelectedIds([]);
      showMsg("Purge Success", "success");
    } catch (e) { showMsg("Error", "error"); }
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const openModal = (expense = null) => {
    if (expense) {
      setEditingExpense(expense);
      setSelectedCategory(expense.category || 'Milk');
      setTotalAmount(expense.amount || '');
      setQty(expense.quantity || '');
      setRate(expense.rate || '');
      const expUnit = expense.unit || 'L';
      setUnit(expUnit);
      setIsCustomUnit(!DEFAULT_UNITS.includes(expUnit));
    } else {
      setEditingExpense(null);
      setSelectedCategory('Milk');
      setTotalAmount('');
      setQty('');
      setRate('');
      setUnit('L');
      setIsCustomUnit(false);
    }
    setShowAddModal(true);
  };

  const deleteExpense = async (id) => {
    if (!window.confirm(t.confirmDelete)) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'expenses', id));
      showMsg(t.success, "success");
    } catch (err) { showMsg("Error", 'error'); }
  };

  const downloadCSV = () => {
    if (filteredExpenses.length === 0) return showMsg("No data to export", "error");
    const headers = ["Date", "Description", "Category", "Amount", "Quantity", "Rate", "Unit", "Added By"];
    const dQ = '"';
    const ddQ = '""';
    let csvContent = headers.join(",") + "\n";
    
    filteredExpenses.forEach(exp => {
      let desc = String(exp.itemName || '').split(dQ).join(ddQ);
      csvContent += String(exp.date || '') + ',' + dQ + desc + dQ + ',' + String(exp.category || '') + ',' + String(exp.amount || 0) + ',' + String(exp.quantity || 1) + ',' + String(exp.rate || 0) + ',' + String(exp.unit || 'L') + ',' + String(exp.addedBy || '') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Ghar_Kharcha_Export.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showMsg("Download Started", "success");
  };

  const groupedExpenses = useMemo(() => {
    const groups = {};
    const locales = {
      en: 'en-US', hi: 'hi-IN', gu: 'gu-IN', mr: 'mr-IN', bn: 'bn-IN', ta: 'ta-IN', te: 'te-IN'
    };
    const currentLocale = locales[userConfig.lang] || 'en-US';

    filteredExpenses.forEach(exp => {
      let dateObj = new Date(exp.date);
      if (isNaN(dateObj.getTime())) dateObj = new Date();
      const monthYear = dateObj.toLocaleDateString(currentLocale, { month: 'long', year: 'numeric' });
      if (!groups[monthYear]) groups[monthYear] = [];
      groups[monthYear].push(exp);
    });
    return groups;
  }, [filteredExpenses, userConfig.lang]);

  const spendingInsights = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate() || 1;

    const dailyAvg = stats.month / currentDay;
    const projectedTotal = dailyAvg * daysInMonth;
    
    const predictedNextMonth = projectedTotal > 0 ? projectedTotal * 1.02 : 0;
    
    const sortedCats = Object.entries(stats.byCat).sort((a,b) => b[1] - a[1]);
    const topCategory = sortedCats.length > 0 ? sortedCats[0] : null;

    let healthStatus = 'Optimal';
    let healthColor = 'text-[#66FCF1]';
    let healthBg = 'bg-[#0B0C10] border border-[#66FCF1]/30';

    if (userConfig.budget > 0) {
        if (projectedTotal > userConfig.budget) {
            healthStatus = 'Critical - Overspending';
            healthColor = 'text-[#0B0C10]';
            healthBg = 'bg-[#66FCF1] shadow-[0_0_15px_rgba(102,252,241,0.6)]';
        } else if (projectedTotal > userConfig.budget * 0.85) {
            healthStatus = 'Warning - Approaching Limit';
            healthColor = 'text-[#0B0C10]';
            healthBg = 'bg-[#45A29E]';
        }
    }

    let suggestion = "Track more expenses to unlock personalized AI savings advice.";
    if (topCategory && topCategory[1] > 0) {
        const catName = t[topCategory[0].toLowerCase()] || topCategory[0];
        const potentialSavings = (topCategory[1] * 0.20).toFixed(0); 
        if (potentialSavings > 0) {
            suggestion = `Smart Advice: Reduce spending on ${catName} by 20% to easily save ₹${potentialSavings} next month.`;
        }
    }

    return { dailyAvg, projectedTotal, topCategory, healthStatus, healthColor, healthBg, predictedNextMonth, suggestion };
  }, [stats, userConfig.budget, t]);

  const offlineAI = useMemo(() => {
    const patterns = [];
    if (allExpenses.length < 5) {
      patterns.push({ id: 1, type: 'info', icon: <Lightbulb size={18} className="text-[#45A29E]" />, title: 'Data Gathering Phase', message: 'Log more expenses to unlock local AI pattern recognition.' });
      return patterns;
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthExpenses = allExpenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    if (monthExpenses.length === 0) return patterns;

    let weekendSpend = 0;
    let weekdaySpend = 0;
    monthExpenses.forEach(e => {
       const day = new Date(e.date).getDay();
       const amt = parseFloat(e.amount) || 0;
       if (day === 0 || day === 6) weekendSpend += amt;
       else weekdaySpend += amt;
    });
    const avgWeekendDaily = weekendSpend / 8;
    const avgWeekdayDaily = weekdaySpend / 22;
    
    if (avgWeekendDaily > avgWeekdayDaily * 1.5) {
       patterns.push({
          id: 'p_weekend',
          icon: <CalendarDays size={18} className="text-[#C5C6C7]" />,
          bgColor: 'bg-[#1F2833]',
          borderColor: 'border-[#C5C6C7]/30',
          title: 'Weekend Spend Spike',
          message: `Your weekend daily spend (₹${avgWeekendDaily.toFixed(0)}) is significantly higher than weekdays. Plan weekend meals in advance to easily save ₹${(weekendSpend * 0.2).toFixed(0)}.`
       });
    }

    const frequencyMap = {};
    monthExpenses.forEach(e => {
       const name = String(e.itemName).toLowerCase().trim();
       if(!frequencyMap[name]) frequencyMap[name] = { count: 0, total: 0 };
       frequencyMap[name].count++;
       frequencyMap[name].total += parseFloat(e.amount) || 0;
    });

    const sortedFreq = Object.entries(frequencyMap).sort((a,b) => b[1].count - a[1].count);
    if (sortedFreq.length > 0 && sortedFreq[0][1].count >= 4) {
       const topFreq = sortedFreq[0];
       patterns.push({
          id: 'p_freq',
          icon: <TrendingDown size={18} className="text-[#66FCF1]" />,
          bgColor: 'bg-[#1F2833]',
          borderColor: 'border-[#66FCF1]/50',
          title: `Habit Detected: ${topFreq[0].toUpperCase()}`,
          message: `You bought this ${topFreq[1].count} times this month (Total: ₹${topFreq[1].total}). Try buying in bulk or reducing frequency by half to save ₹${(topFreq[1].total / 2).toFixed(0)}.`
       });
    }

    const topCat = spendingInsights.topCategory;
    if (topCat && userConfig.budget > 0 && topCat[1] > userConfig.budget * 0.4) {
       patterns.push({
           id: 'p_cat',
           icon: <AlertTriangle size={18} className="text-[#0B0C10]" />,
           bgColor: 'bg-[#66FCF1]',
           borderColor: 'border-[#66FCF1]',
           title: `${t[topCat[0].toLowerCase()] || topCat[0]} Drain`,
           message: `Over 40% of your budget goes here. A simple 10% reduction saves you ₹${(topCat[1] * 0.1).toFixed(0)} instantly.`
       });
    }

    if (patterns.length === 0) {
       patterns.push({
          id: 'p_good',
          icon: <Sparkles size={18} className="text-[#0B0C10]" />,
          bgColor: 'bg-[#45A29E]',
          borderColor: 'border-[#45A29E]',
          title: 'Optimal Pattern',
          message: 'Your spending is highly balanced across all vectors. Keep it up!'
       });
    }

    return patterns;
  }, [allExpenses, userConfig.budget, spendingInsights.topCategory, t]);

  const adminStats = useMemo(() => {
     const totalVolume = allSystemExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
     const simulatedMRR = allSystemVaults.length * 99;
     
     const recentActivity = [...allSystemExpenses].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)).slice(0, 5);
     
     return { totalVolume, simulatedMRR, recentActivity };
  }, [allSystemExpenses, allSystemVaults]);

  const heatmapData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); 

    const dailyTotals = {};
    allExpenses.forEach(exp => {
        const expDate = new Date(exp.date);
        if (expDate.getFullYear() === year && expDate.getMonth() === month) {
            const day = expDate.getDate();
            dailyTotals[day] = (dailyTotals[day] || 0) + parseFloat(exp.amount || 0);
        }
    });

    const dailyBudget = userConfig.budget > 0 ? userConfig.budget / daysInMonth : 500; 

    const days = [];
    for (let i = 0; i < firstDay; i++) {
        days.push({ day: null, total: 0, level: 'empty' });
    }
    for (let i = 1; i <= daysInMonth; i++) {
        const total = dailyTotals[i] || 0;
        let level = 'empty';
        if (total > 0) {
            if (total <= dailyBudget) level = 'low';
            else level = 'high';
        }
        days.push({ day: i, total, level });
    }
    return days;
  }, [allExpenses, userConfig.budget]);

  let budgetPct = 0;
  if (userConfig.budget && userConfig.budget > 0) {
    budgetPct = (stats.month / userConfig.budget) * 100;
    if (budgetPct > 100) budgetPct = 100;
  }

  const pieChartData = {
    labels: CATEGORIES.map(c => c.id),
    datasets: [{
      data: CATEGORIES.map(c => stats.byCat[c.id] || 0),
      backgroundColor: CATEGORIES.map(c => c.hex),
      borderColor: '#1F2833', 
      borderWidth: 4
    }]
  };

  const pieChartOptions = { 
    plugins: { legend: { position: 'bottom', labels: { color: '#C5C6C7', font: { family: 'sans-serif', weight: 'bold', size: 10 } } } } 
  };

  const lineChartData = {
    labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    datasets: [{
      label: 'Expense',
      data: [120, 450, 300, 800, 200, 500, stats.today],
      borderColor: '#66FCF1', 
      backgroundColor: 'rgba(102, 252, 241, 0.1)',
      fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#45A29E', pointBorderColor: '#66FCF1', pointBorderWidth: 2
    }]
  };

  const lineChartOptions = { 
    scales: { 
      y: { display: false }, 
      x: { grid: { display: false }, ticks: { color: '#C5C6C7', font: { weight: 'bold' } } } 
    } 
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0C10]">
        <Loader2 className="w-8 h-8 text-[#66FCF1] animate-spin" />
      </div>
    );
  }

  if (!nickname || !password) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#0B0C10] text-[#C5C6C7]">
         <div className="w-full max-w-sm p-8 sm:p-10 rounded-[3rem] border border-[#45A29E]/30 bg-[#1F2833] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#66FCF1]"></div>
            <div className="flex justify-center mb-8">
               <div className="p-4 bg-[#0B0C10] text-[#66FCF1] rounded-2xl border border-[#45A29E]/30"><Lock size={32} /></div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-center font-brand text-[#66FCF1]">घर खर्चा <span className="text-xl text-[#45A29E] font-brand">by Dharam</span></h1>
            <p className="text-[#C5C6C7] text-sm mb-10 text-center">{t.loginSub}</p>
            
            {message && (
              <div className={`mb-6 p-4 rounded-xl text-xs font-bold uppercase tracking-widest text-center border ${message.type === 'error' ? 'bg-[#66FCF1] text-[#0B0C10] border-[#66FCF1]' : 'bg-[#45A29E] text-[#0B0C10] border-[#45A29E]'}`}>
                 {message.text}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
               <div className="relative">
                  <User className="absolute left-4 top-[50%] -translate-y-[50%] text-[#45A29E]" size={18} />
                  <input type="text" required value={inputNick} onChange={(e) => setInputNick(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[#45A29E]/30 bg-[#0B0C10] text-[#66FCF1] outline-none focus:border-[#66FCF1] transition-all font-medium placeholder-[#45A29E]" placeholder="Vault ID (e.g. SharmaFamily)" />
               </div>
               <div className="relative">
                  <KeyRound className="absolute left-4 top-[50%] -translate-y-[50%] text-[#45A29E]" size={18} />
                  <input type="password" required value={inputPass} onChange={(e) => setInputPass(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[#45A29E]/30 bg-[#0B0C10] text-[#66FCF1] outline-none focus:border-[#66FCF1] transition-all font-medium placeholder-[#45A29E]" placeholder="Vault Password" />
               </div>
               <div className="relative">
                  <UserPlus className="absolute left-4 top-[50%] -translate-y-[50%] text-[#45A29E]" size={18} />
                  <input type="text" required value={inputMember} onChange={(e) => setInputMember(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[#45A29E]/30 bg-[#0B0C10] text-[#66FCF1] outline-none focus:border-[#66FCF1] transition-all font-medium placeholder-[#45A29E]" placeholder="Your Name (e.g. Husband/Wife)" />
               </div>
               <button type="submit" className="w-full bg-[#66FCF1] hover:bg-[#66FCF1]/90 text-[#0B0C10] font-semibold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-[#66FCF1]/20 uppercase tracking-widest text-xs"> Unlock Shared Vault </button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-[#45A29E]/20 flex justify-center">
               <div className="relative flex items-center gap-2 text-[#45A29E] hover:text-[#66FCF1] transition-colors cursor-pointer">
                  <Languages size={14} />
                  <select 
                    value={userConfig.lang} 
                    onChange={(e) => {
                      setUserConfig(Object.assign({}, userConfig, { lang: e.target.value }));
                    }}
                    className="bg-transparent text-[10px] font-bold uppercase tracking-widest outline-none cursor-pointer appearance-none text-center text-[#66FCF1]"
                  >
                    {LANGUAGES.map(l => (
                      <option key={l.code} value={l.code} className="bg-[#1F2833] text-[#66FCF1]">{l.label}</option>
                    ))}
                  </select>
               </div>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0C10] text-[#C5C6C7]">
      {message && (
        <div className="fixed top-6 left-[50%] -translate-x-[50%] z-[300] px-6 py-3 rounded-full bg-[#1F2833] border border-[#66FCF1] shadow-xl animate-in fade-in slide-in-from-top-4">
          <p className="text-sm font-medium flex items-center gap-2 text-[#C5C6C7]">
             <CheckCircle2 size={16} className="text-[#66FCF1]" /> {message.text}
          </p>
        </div>
      )}

      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#1F2833]/90 border-b border-[#0B0C10] h-20 flex items-center justify-between px-4 sm:px-12">
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer truncate group" onClick={() => { setView('dashboard'); setFilterCategory('all'); }}>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#66FCF1] rounded-xl flex-shrink-0 flex items-center justify-center text-[#0B0C10] shadow-lg shadow-[#66FCF1]/20 relative transition-transform duration-300 group-hover:scale-110 group-active:scale-90">
            <Zap size={16} fill="currentColor" className="sm:w-5 sm:h-5 text-[#0B0C10]" />
          </div>
          <span className="font-bold text-xl sm:text-3xl tracking-tight font-brand text-[#66FCF1] truncate transition-opacity hover:opacity-80">घर खर्चा <span className="text-sm sm:text-xl text-[#45A29E] font-brand">by Dharam</span></span>
        </div>
        <nav className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
          <button onClick={() => { setView('dashboard'); setFilterCategory('all'); }} className={`p-2 sm:p-3 rounded-xl transition-all duration-300 active:scale-90 group ${view === 'dashboard' && filterCategory === 'all' ? 'bg-[#66FCF1] text-[#0B0C10]' : 'text-[#C5C6C7] hover:text-[#66FCF1] hover:bg-[#0B0C10]'}`}>
             <LayoutDashboard size={20} className="transition-transform group-hover:scale-110" />
          </button>
          <button onClick={() => setView('analytics')} className={`p-2 sm:p-3 rounded-xl transition-all duration-300 active:scale-90 group ${view === 'analytics' ? 'bg-[#66FCF1] text-[#0B0C10]' : 'text-[#C5C6C7] hover:text-[#66FCF1] hover:bg-[#0B0C10]'}`}>
             <TrendingUp size={20} className="transition-transform group-hover:scale-110" />
          </button>
          
          {nickname === 'admin' && (
             <button onClick={() => setView('admin')} className={`p-2 sm:p-3 rounded-xl transition-all duration-300 active:scale-90 group ${view === 'admin' ? 'bg-[#66FCF1] text-[#0B0C10]' : 'text-[#C5C6C7] hover:text-[#66FCF1] hover:bg-[#0B0C10]'}`} title="Admin Dashboard">
               <Shield size={20} className="transition-transform group-hover:scale-110" />
             </button>
          )}

          <div className="relative flex-shrink-0">
            <button onClick={() => setShowNotifications(!showNotifications)} className={`p-2 sm:p-3 rounded-xl transition-all duration-300 active:scale-90 group relative ${showNotifications ? 'bg-[#66FCF1] text-[#0B0C10]' : 'text-[#C5C6C7] hover:text-[#66FCF1] hover:bg-[#0B0C10]'}`}>
              <Bell size={20} className="transition-transform group-hover:rotate-12" />
              {activeNotifications.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-[#66FCF1] rounded-full animate-pulse shadow-[0_0_10px_rgba(102,252,241,0.8)]"></span>}
            </button>
            {showNotifications && (
               <div className="absolute top-full right-0 mt-2 w-64 sm:w-72 bg-[#1F2833] rounded-2xl shadow-2xl shadow-[#0B0C10]/50 border border-[#45A29E] p-4 z-50 animate-in slide-in-from-top-2">
                 <div className="flex justify-between items-center mb-3 border-b border-[#0B0C10] pb-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#66FCF1]">Alerts</h4>
                    <button onClick={() => setShowNotifications(false)} className="text-[#C5C6C7] hover:text-[#66FCF1]"><X size={14}/></button>
                 </div>
                 {activeNotifications.length === 0 ? (
                   <p className="text-[10px] text-[#45A29E] italic text-center py-2">All caught up! No new alerts.</p>
                 ) : (
                   <ul className="space-y-3">
                     {activeNotifications.map(n => (
                       <li key={n.id} className={`text-[10px] p-3 rounded-xl font-bold uppercase tracking-wider leading-relaxed border ${n.type === 'critical' ? 'bg-[#66FCF1] text-[#0B0C10] border-[#66FCF1]' : n.type === 'warning' ? 'bg-[#45A29E] text-[#0B0C10] border-[#45A29E]' : 'bg-[#0B0C10] text-[#C5C6C7] border-[#45A29E]/50'}`}>
                         <div className="flex gap-2 items-start">
                            {n.type === 'critical' && <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />}
                            {n.type === 'info' && <CheckCircle2 size={14} className="flex-shrink-0 mt-0.5" />}
                            <span>{n.text}</span>
                         </div>
                       </li>
                     ))}
                   </ul>
                 )}
               </div>
            )}
          </div>

          <button onClick={() => setView('profile')} className={`p-2 sm:p-3 rounded-xl transition-all duration-300 active:scale-90 group ${view === 'profile' ? 'bg-[#66FCF1] text-[#0B0C10]' : 'text-[#C5C6C7] hover:text-[#66FCF1] hover:bg-[#0B0C10]'}`}>
             <User size={20} className="transition-transform group-hover:scale-110" />
          </button>
          <div className="w-px h-6 bg-[#0B0C10] mx-1 sm:mx-2"></div>
          <button onClick={logout} className="p-2 sm:p-3 text-[#C5C6C7] hover:text-[#66FCF1] transition-all duration-300 active:scale-90 group">
             <LogOut size={20} className="transition-transform group-hover:-translate-x-1" />
          </button>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-12 flex-grow">
        
        {view === 'admin' && nickname === 'admin' && (
           <div className="space-y-6 sm:space-y-8 animate-in fade-in pb-24 sm:pb-20">
              <div className="p-8 sm:p-12 rounded-[2rem] bg-[#45A29E] text-[#0B0C10] shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-[#66FCF1] rounded-full blur-[100px] opacity-30 translate-x-20 -translate-y-20"></div>
                 <div className="relative z-10">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 flex items-center gap-3 text-[#0B0C10]">
                       <Shield size={32} /> Command Center
                    </h2>
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#1F2833]">Global Platform Overview & Metrics</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                 {/* Distinct Colored Cards */}
                 <div className="p-6 rounded-2xl bg-[#1F2833] border border-[#66FCF1] shadow-sm flex flex-col justify-between hover:scale-105 transition-all">
                    <div className="flex justify-between items-start mb-4">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-[#C5C6C7]">Total Users</p>
                       <div className="p-2 bg-[#0B0C10] rounded-lg text-[#66FCF1]"><Users size={18} /></div>
                    </div>
                    <p className="text-3xl font-bold text-[#66FCF1]">{allSystemVaults.length}</p>
                 </div>

                 <div className="p-6 rounded-2xl bg-[#1F2833] border border-[#C5C6C7] shadow-sm flex flex-col justify-between hover:scale-105 transition-all">
                    <div className="flex justify-between items-start mb-4">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-[#C5C6C7]">App Interactions</p>
                       <div className="p-2 bg-[#0B0C10] rounded-lg text-[#C5C6C7]"><Activity size={18} /></div>
                    </div>
                    <p className="text-3xl font-bold text-[#C5C6C7]">{allSystemExpenses.length}</p>
                 </div>

                 <div className="p-6 rounded-2xl bg-[#0B0C10] border border-[#45A29E] shadow-sm flex flex-col justify-between hover:scale-105 transition-all">
                    <div className="flex justify-between items-start mb-4">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-[#45A29E]">Total Vol. Handled</p>
                       <div className="p-2 bg-[#1F2833] rounded-lg text-[#45A29E]"><TrendingUp size={18} /></div>
                    </div>
                    <p className="text-3xl font-bold text-[#45A29E]">₹{adminStats.totalVolume.toLocaleString()}</p>
                 </div>

                 <div className="p-6 rounded-2xl bg-[#66FCF1] text-[#0B0C10] shadow-[0_0_20px_rgba(102,252,241,0.2)] flex flex-col justify-between hover:scale-105 transition-all">
                    <div className="flex justify-between items-start mb-4">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-[#1F2833]">Est. Monthly MRR</p>
                       <div className="p-2 bg-[#0B0C10] rounded-lg text-[#66FCF1]"><CreditCard size={18} /></div>
                    </div>
                    <div>
                       <p className="text-3xl font-bold text-[#0B0C10]">₹{adminStats.simulatedMRR.toLocaleString()}</p>
                       <p className="text-[8px] mt-1 tracking-widest uppercase text-[#1F2833]">Based on ₹99/Vault</p>
                    </div>
                 </div>
              </div>

              <div className="p-6 sm:p-8 rounded-3xl bg-[#1F2833] border border-[#0B0C10] shadow-sm">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-[#C5C6C7] mb-6 border-b border-[#0B0C10] pb-4">Real-Time Platform Activity</h3>
                 {adminStats.recentActivity.length === 0 ? (
                    <p className="text-sm text-[#45A29E] italic text-center py-8">No recent activity detected on the platform.</p>
                 ) : (
                    <div className="space-y-4">
                       {adminStats.recentActivity.map((act, idx) => (
                          <div key={idx} className="flex justify-between items-center p-4 rounded-xl border border-[#45A29E]/30 bg-[#0B0C10]">
                             <div className="flex flex-col">
                                <span className="text-sm font-bold text-[#66FCF1] uppercase">{act.itemName}</span>
                                <span className="text-[10px] font-medium text-[#C5C6C7] uppercase tracking-wider mt-1">Vault: <strong className="text-[#45A29E]">{act.nickname}</strong> • By {act.addedBy || 'Unknown'}</span>
                             </div>
                             <div className="text-right">
                                <span className="block text-base font-bold text-[#66FCF1]">₹{act.amount}</span>
                                <span className="block text-[9px] text-[#45A29E] mt-1">{new Date(act.createdAt || act.date).toLocaleDateString()}</span>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           </div>
        )}

        {view === 'dashboard' && (
          <div className="space-y-8 sm:space-y-12 animate-in fade-in duration-500">
            
            {/* --- POWERFUL TOP SECTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              
              {/* 1. Monthly Budget Hero (Col Span 2) */}
              <div className="lg:col-span-2 p-6 sm:p-8 rounded-[2rem] bg-[#1F2833] border border-[#45A29E]/30 shadow-2xl relative overflow-hidden flex flex-col justify-between group hover:-translate-y-1 transition-all duration-500">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#66FCF1] rounded-full blur-[120px] opacity-10 translate-x-20 -translate-y-20 transition-transform group-hover:scale-110 duration-700"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#45A29E] rounded-full blur-[80px] opacity-10 -translate-x-10 translate-y-10"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8 sm:mb-10">
                    <div className="flex items-center gap-2 bg-[#0B0C10] px-3 py-1.5 rounded-full border border-[#45A29E]/30">
                        <Wallet size={14} className="text-[#C5C6C7]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5C6C7]">Monthly Budget</span>
                    </div>
                    <button onClick={() => setShowBudgetModal(true)} className="p-2 text-[#45A29E] hover:text-[#0B0C10] hover:bg-[#66FCF1] rounded-xl transition-all duration-300 active:scale-90" title="Set Budget">
                        <Settings2 size={18} className="transition-transform hover:rotate-90 duration-500" />
                    </button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 sm:mb-12">
                     <div>
                        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#45A29E] mb-1 sm:mb-2">{t.monthly}</p>
                        <h3 className="text-5xl sm:text-7xl font-black tracking-tighter text-[#66FCF1] leading-none drop-shadow-[0_0_15px_rgba(102,252,241,0.2)]">
                          ₹{stats.month.toLocaleString()}
                        </h3>
                     </div>
                     <div className="text-left sm:text-right border-l-2 sm:border-l-0 sm:border-r-2 border-[#45A29E]/20 pl-4 sm:pl-0 sm:pr-4">
                        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#45A29E] mb-1 sm:mb-2">{t.budget}</p>
                        <p className="text-2xl sm:text-3xl font-bold text-[#C5C6C7] leading-none">₹{userConfig.budget.toLocaleString()}</p>
                     </div>
                  </div>

                  <div className="space-y-3 bg-[#0B0C10] p-4 rounded-2xl border border-[#45A29E]/30 shadow-inner">
                    <div className="flex justify-between text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                        <span className={stats.month > userConfig.budget ? 'text-[#66FCF1]' : 'text-[#C5C6C7]'}>
                           {stats.month > userConfig.budget ? t.overspent : t.remaining}
                        </span>
                        <span className={stats.month > userConfig.budget ? 'text-[#66FCF1] font-black' : 'text-[#66FCF1] font-black'}>
                           ₹{Math.abs(userConfig.budget - stats.month).toLocaleString()}
                        </span>
                    </div>
                    <div className="relative h-3 sm:h-4 bg-[#1F2833] rounded-full overflow-hidden border border-[#0B0C10]">
                      <div 
                         className={`h-full transition-all duration-1000 relative overflow-hidden bg-[#66FCF1]`} 
                         style={{ width: `${budgetPct}%` }}
                      >
                         <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Today's Velocity & Daily Avg (Col Span 1) */}
              <div className="flex flex-col gap-4 sm:gap-6">
                 
                 {/* Today's Spend Card (High Contrast Muted Teal) */}
                 <div className="flex-1 p-6 sm:p-8 rounded-[2rem] bg-[#45A29E] shadow-[0_0_15px_rgba(69,162,158,0.2)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col justify-center group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none transition-transform group-hover:rotate-12 duration-500">
                        <Zap size={80} className="text-[#0B0C10]" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                           <Zap size={16} className="text-[#0B0C10] fill-[#0B0C10] transition-transform group-hover:scale-110 duration-300" />
                           <span className="text-[10px] font-bold uppercase tracking-widest text-[#0B0C10]">Today's Velocity</span>
                        </div>
                        <h3 className="text-4xl sm:text-5xl font-black tracking-tighter text-[#0B0C10]">
                          ₹{stats.today.toLocaleString()}
                        </h3>
                    </div>
                 </div>

                 {/* Daily Average Card (High Contrast Silver Gray) */}
                 <div className="flex-1 p-6 sm:p-8 rounded-[2rem] bg-[#C5C6C7] shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-center group">
                    <div className="flex items-center gap-2 mb-3">
                       <TrendingUp size={16} className="text-[#0B0C10] transition-transform group-hover:-translate-y-1 duration-300" />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-[#0B0C10]">Daily Average</span>
                    </div>
                    <div className="flex items-end gap-2">
                        <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0B0C10]">
                          ₹{spendingInsights.dailyAvg.toFixed(0)}
                        </h3>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#1F2833] mb-1.5">/ Day</span>
                    </div>
                    <p className="text-[8px] sm:text-[9px] uppercase tracking-widest text-[#1F2833] mt-2 font-semibold">Pacing based on {new Date().getDate()} days</p>
                 </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end px-1">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#C5C6C7]">Focus Section</h3>
                {filterCategory !== 'all' && (
                  <button onClick={() => setFilterCategory('all')} className="text-[9px] font-bold uppercase tracking-widest text-[#66FCF1] hover:text-[#C5C6C7] transition-colors active:scale-95">View All</button>
                )}
              </div>
              <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
                {CATEGORIES.map(c => {
                  const IconComp = c.Icon;
                  return (
                    <button 
                      key={c.id} 
                      onClick={() => setFilterCategory(filterCategory === c.id ? 'all' : c.id)} 
                      className={`group flex-shrink-0 min-w-[120px] sm:min-w-[140px] p-5 sm:p-6 rounded-3xl transition-all duration-300 active:scale-95 snap-center border-2 text-left ${filterCategory === c.id ? `bg-[#66FCF1] border-[#66FCF1] shadow-[0_0_15px_rgba(102,252,241,0.3)] -translate-y-1` : 'bg-[#1F2833] border-[#0B0C10] hover:border-[#45A29E] hover:-translate-y-1 hover:shadow-lg'}`}
                    >
                      <div className={`p-3 sm:p-4 rounded-2xl w-fit mb-3 sm:mb-4 shadow-inner transition-transform duration-300 group-hover:scale-110 ${filterCategory === c.id ? 'bg-[#0B0C10] text-[#66FCF1]' : c.color}`}>
                        <IconComp size={18} />
                      </div>
                      <div className="space-y-1">
                        <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest block transition-colors ${filterCategory === c.id ? 'text-[#0B0C10]' : 'text-[#C5C6C7]'}`}>{t[c.id.toLowerCase()] || c.id}</span>
                        <span className={`text-base sm:text-lg font-bold tracking-tight ${filterCategory === c.id ? 'text-[#0B0C10]' : 'text-[#66FCF1]'}`}>₹{(stats.byCat[c.id] || 0).toLocaleString()}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* --- VISUAL SPENDING CALENDAR (EASY UI) --- */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#1F2833] border border-[#0B0C10] shadow-md hover:shadow-lg transition-shadow duration-500 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform group-hover:rotate-12 duration-700">
                   <CalendarDays size={120} className="text-[#C5C6C7] -translate-y-4 translate-x-4" />
               </div>
               <div className="flex justify-between items-end mb-6 relative z-10">
                  <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#C5C6C7] flex items-center gap-2">
                      <CalendarDays size={16} className="text-[#C5C6C7]" /> Visual Calendar
                  </h3>
                  <div className="flex gap-3 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-[#45A29E]">
                      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#45A29E] shadow-sm"></span> Low Spend</div>
                      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#66FCF1] shadow-sm shadow-[#66FCF1]/50"></span> High Spend</div>
                  </div>
               </div>
               <div className="grid grid-cols-7 gap-2 sm:gap-3 relative z-10 max-w-2xl mx-auto">
                   {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                       <div key={d} className="text-[9px] sm:text-[10px] font-bold text-center text-[#C5C6C7] uppercase tracking-widest mb-1">{d}</div>
                   ))}
                   {heatmapData.map((d, i) => {
                       let bgColor = 'bg-transparent';
                       let textColor = 'text-[#C5C6C7]';
                       let borderColor = 'border-transparent';
                       
                       if (d.day !== null) {
                           if (d.level === 'empty') {
                               bgColor = 'bg-[#0B0C10]';
                               borderColor = 'border-[#0B0C10] hover:border-[#45A29E]/30';
                               textColor = 'text-[#45A29E]/30';
                           }
                           else if (d.level === 'low') {
                               bgColor = 'bg-[#45A29E] hover:bg-[#45A29E]/80';
                               borderColor = 'border-[#45A29E]';
                               textColor = 'text-[#0B0C10]';
                           }
                           else if (d.level === 'high') {
                               bgColor = 'bg-[#66FCF1] hover:bg-[#66FCF1]/80';
                               borderColor = 'border-[#66FCF1]';
                               textColor = 'text-[#0B0C10]';
                           }
                       }
                       return (
                           <div key={i} className={`aspect-square rounded-xl border flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all duration-300 relative group cursor-pointer ${bgColor} ${borderColor} ${textColor} ${d.day === null ? 'invisible' : 'shadow-sm hover:shadow-md hover:-translate-y-1 hover:scale-105 active:scale-95'}`}>
                               {d.day}
                               {d.total > 0 && (
                                   <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex z-20 bg-[#C5C6C7] text-[#0B0C10] px-3 py-2 rounded-xl whitespace-nowrap shadow-xl flex-col items-center gap-1 before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-[#C5C6C7] animate-in slide-in-from-bottom-2 fade-in duration-200">
                                       <span className="opacity-80 text-[8px] uppercase tracking-widest">{new Date(new Date().getFullYear(), new Date().getMonth(), d.day).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                                       <span className="font-bold text-xs tracking-wider">₹{d.total.toFixed(0)}</span>
                                   </div>
                               )}
                           </div>
                       );
                   })}
               </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-between border-b border-[#1F2833] pb-6">
                <div className="flex items-center gap-3 w-full sm:max-w-md">
                   <div className="relative flex-1">
                      <Search className="absolute left-4 top-[50%] -translate-y-[50%] text-[#C5C6C7]" size={16} />
                      <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.search} className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#0B0C10] bg-[#1F2833] outline-none text-sm focus:border-[#66FCF1] transition-all text-[#C5C6C7] placeholder-[#45A29E]" />
                   </div>
                   <button onClick={() => setShowFilters(!showFilters)} className={`p-3 rounded-xl border transition-all flex-shrink-0 ${showFilters ? 'bg-[#C5C6C7] border-[#C5C6C7] text-[#0B0C10]' : 'bg-[#1F2833] border-[#0B0C10] text-[#C5C6C7]'}`}><Filter size={18} /></button>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                   <button onClick={downloadCSV} className="p-3 rounded-xl border border-[#0B0C10] bg-[#1F2833] text-[#C5C6C7] hover:text-[#66FCF1] transition-all flex-shrink-0" title="Export to CSV">
                     <Download size={18} />
                   </button>
                   {selectedIds.length > 0 && (
                     <button onClick={bulkDelete} className="p-3 bg-[#66FCF1] text-[#0B0C10] border border-[#66FCF1] rounded-xl flex items-center gap-2 text-xs font-bold uppercase px-4 sm:px-5 flex-shrink-0 animate-in slide-in-from-right-4"><Trash2 size={16} /><span className="hidden sm:inline"> {t.bulkDelete}</span></button>
                   )}
                   <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="flex-1 sm:flex-none p-3 rounded-xl border border-[#0B0C10] bg-[#1F2833] text-[#C5C6C7] text-xs font-bold uppercase tracking-wider outline-none cursor-pointer focus:border-[#66FCF1]">
                     <option value="date-desc">Newest First</option>
                     <option value="amount-desc">Highest Value</option>
                     <option value="amount-asc">Lowest Value</option>
                   </select>
                </div>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-6 rounded-2xl bg-[#1F2833] border border-[#0B0C10] animate-in slide-in-from-top-4 shadow-lg">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#C5C6C7] ml-1">Category</label>
                      <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full p-3 rounded-xl border border-transparent bg-[#0B0C10] text-[#C5C6C7] text-sm outline-none focus:border-[#66FCF1]">
                        <option value="all">{t.all}</option>
                        {CATEGORIES.map(c => <option key={c.id} value={c.id}>{t[c.id.toLowerCase()]}</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#C5C6C7] ml-1">Amount Range</label>
                      <div className="flex items-center gap-2">
                        <input type="number" value={amountRange.min} onChange={(e) => setAmountRange(Object.assign({}, amountRange, { min: e.target.value }))} placeholder="Min" className="w-full p-3 rounded-xl border border-transparent bg-[#0B0C10] text-[#C5C6C7] placeholder-[#45A29E] text-sm outline-none focus:border-[#66FCF1]" />
                        <input type="number" value={amountRange.max} onChange={(e) => setAmountRange(Object.assign({}, amountRange, { max: e.target.value }))} placeholder="Max" className="w-full p-3 rounded-xl border border-transparent bg-[#0B0C10] text-[#C5C6C7] placeholder-[#45A29E] text-sm outline-none focus:border-[#66FCF1]" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#C5C6C7] ml-1">Date Range</label>
                      <div className="flex items-center gap-2">
                        <input type="date" value={dateRange.start} onChange={(e) => setDateRange(Object.assign({}, dateRange, { start: e.target.value }))} className="w-full p-3 rounded-xl border border-transparent bg-[#0B0C10] text-[#C5C6C7] text-xs outline-none focus:border-[#66FCF1]" />
                        <input type="date" value={dateRange.end} onChange={(e) => setDateRange(Object.assign({}, dateRange, { end: e.target.value }))} className="w-full p-3 rounded-xl border border-transparent bg-[#0B0C10] text-[#C5C6C7] text-xs outline-none focus:border-[#66FCF1]" />
                      </div>
                   </div>
                   <div className="sm:col-span-3 flex justify-end gap-3 mt-2">
                      <button onClick={() => { setFilterCategory('all'); setDateRange({start:'',end:''}); setAmountRange({min:'',max:''}); }} className="text-[10px] font-bold uppercase text-[#45A29E] hover:text-[#66FCF1] transition-colors">{t.reset}</button>
                   </div>
                </div>
              )}

              <div className="space-y-8 sm:space-y-10 pb-24 sm:pb-20">
                {Object.keys(groupedExpenses).length === 0 ? (
                  <div className="py-16 sm:py-24 flex flex-col items-center justify-center border-2 border-dashed border-[#1F2833] rounded-3xl bg-[#0B0C10]">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 rounded-full bg-[#1F2833] border border-[#0B0C10] flex items-center justify-center shadow-inner">
                          <Search size={28} className="text-[#45A29E] sm:w-8 sm:h-8" />
                      </div>
                      <h4 className="text-[#C5C6C7] font-bold tracking-widest uppercase text-xs mb-2">No Data Visible</h4>
                      <p className="text-[#45A29E] text-[10px] tracking-widest uppercase">{t.empty}</p>
                  </div>
                ) : (
                  Object.keys(groupedExpenses).map(monthYear => (
                    <div key={monthYear} className="space-y-4 sm:space-y-6">
                      <div className="flex items-center gap-4">
                        <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#C5C6C7] whitespace-nowrap">{monthYear}</h3>
                        <div className="flex-1 h-px bg-[#1F2833]"></div>
                      </div>
                      <div className="grid gap-3">
                        {groupedExpenses[monthYear].map((exp, idx) => {
                          const CatData = CATEGORIES.find(c => c.id === exp.category);
                          const IconColor = CatData ? CatData.color : "bg-[#0B0C10] text-[#C5C6C7]";
                          const isSelected = selectedIds.includes(exp.id);
                          const ListIcon = CatData ? CatData.Icon : MoreHorizontal;
                          
                          return (
                            <div 
                               key={exp.id} 
                               className={`group p-4 sm:p-5 flex items-center justify-between rounded-2xl transition-all duration-300 border animate-slide-up hover:-translate-y-0.5 hover:shadow-lg ${isSelected ? 'bg-[#45A29E] border-[#45A29E] shadow-sm' : 'bg-[#1F2833] border-[#0B0C10] hover:border-[#45A29E]/50'}`}
                               style={{ animationDelay: `${idx * 40}ms` }}
                            >
                              <div className="flex items-center gap-3 sm:gap-5 overflow-hidden flex-1">
                                <button onClick={() => toggleSelection(exp.id)} className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-200 active:scale-90 flex-shrink-0 ${isSelected ? 'bg-[#0B0C10] border-[#0B0C10] text-[#66FCF1] scale-110' : 'border-[#45A29E]/50 text-transparent hover:border-[#66FCF1]'}`}>
                                  <Check size={14} />
                                </button>
                                <div className={`p-2 sm:p-3 rounded-xl hidden sm:flex flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ${isSelected ? 'bg-[#0B0C10] text-[#66FCF1]' : IconColor}`}>
                                  <ListIcon size={18} />
                                </div>
                                <div className="truncate pr-2">
                                  <h4 className={`font-semibold text-sm sm:text-base truncate uppercase ${isSelected ? 'text-[#0B0C10]' : 'text-[#C5C6C7]'}`}>{exp.itemName}</h4>
                                  <div className="flex gap-2 sm:gap-3 mt-1 items-center">
                                    <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ${isSelected ? 'text-[#0B0C10]/70' : 'text-[#45A29E]'}`}>
                                        {exp.date} {exp.quantity ? `• ${exp.quantity} ${exp.unit}` : ''}
                                    </span>
                                    {exp.addedBy && (
                                      <>
                                        <div className={`w-1 h-1 rounded-full flex-shrink-0 ${isSelected ? 'bg-[#0B0C10]/50' : 'bg-[#45A29E]/50'}`}></div>
                                        <span className={`text-[8px] px-1.5 py-0.5 rounded tracking-widest uppercase ${isSelected ? 'bg-[#0B0C10]/20 text-[#0B0C10]' : 'bg-[#0B0C10] text-[#66FCF1]'}`}>BY {exp.addedBy}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 sm:gap-6 pl-2">
                                <span className={`font-bold text-lg sm:text-xl tracking-tight ${isSelected ? 'text-[#0B0C10]' : 'text-[#66FCF1]'}`}>₹{exp.amount}</span>
                                <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 translate-x-2 sm:group-hover:translate-x-0">
                                  <button onClick={() => openModal(exp)} className={`p-1 sm:p-2 transition-transform hover:scale-110 active:scale-90 ${isSelected ? 'text-[#0B0C10] hover:text-[#0B0C10]' : 'text-[#45A29E] hover:text-[#66FCF1]'}`}><Edit2 size={14} className="sm:w-4 sm:h-4" /></button>
                                  <button onClick={() => deleteExpense(exp.id)} className={`p-1 sm:p-2 transition-transform hover:scale-110 active:scale-90 ${isSelected ? 'text-[#0B0C10] hover:text-[#0B0C10]' : 'text-[#45A29E] hover:text-[#66FCF1]'}`}><Trash2 size={14} className="sm:w-4 sm:h-4" /></button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {view === 'analytics' && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in pb-24 sm:pb-20">
             <div className="p-6 sm:p-8 rounded-3xl bg-[#45A29E] text-[#0B0C10] shadow-sm hover:shadow-lg transition-shadow duration-500 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none transition-transform group-hover:rotate-12 duration-700">
                   <BrainCircuit size={120} className="text-[#0B0C10]" />
                </div>
                <div className="flex items-center gap-2 mb-6">
                   <Sparkles size={20} className="text-[#0B0C10] animate-pulse" />
                   <h3 className="text-sm font-bold uppercase tracking-widest text-[#0B0C10]">Neural Insights</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#0B0C10]/70">Daily Average</p>
                      <p className="text-2xl font-bold text-[#0B0C10]">₹{spendingInsights.dailyAvg.toFixed(0)}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#0B0C10]/70">Projected EOM Total</p>
                      <p className="text-2xl font-bold text-[#0B0C10]">₹{spendingInsights.projectedTotal.toFixed(0)}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#0B0C10]/70">Next Month Forecast</p>
                      <p className="text-2xl font-bold text-[#0B0C10]">₹{spendingInsights.predictedNextMonth.toFixed(0)}</p>
                   </div>
                   <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#0B0C10]/70">Health Status</p>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#0B0C10] ${spendingInsights.healthStatus.includes('Critical') ? 'text-[#66FCF1] shadow-[0_0_15px_rgba(102,252,241,0.5)]' : 'text-[#45A29E]'}`}>
                         {spendingInsights.healthStatus.includes('Critical') && <AlertTriangle size={14} />}
                         {spendingInsights.healthStatus}
                      </div>
                   </div>
                   {spendingInsights.topCategory && (
                     <div className="md:col-span-2 lg:col-span-4 pt-4 border-t border-[#0B0C10]/20 mt-2 space-y-4">
                        <p className="text-xs font-bold text-[#0B0C10] leading-relaxed">
                           <strong className="uppercase opacity-80">Analysis:</strong> Your highest spending is currently on <strong>{t[spendingInsights.topCategory[0].toLowerCase()] || spendingInsights.topCategory[0]}</strong> (₹{spendingInsights.topCategory[1].toLocaleString()}). Based on your current daily spending habits, you are pacing to spend around <strong>₹{spendingInsights.projectedTotal.toFixed(0)}</strong> by the end of the month.
                        </p>
                        <div className="bg-[#0B0C10] p-4 rounded-xl border border-[#0B0C10] flex items-start gap-3 shadow-inner">
                           <Sparkles size={18} className="text-[#66FCF1] flex-shrink-0 mt-0.5" />
                           <p className="text-sm font-bold text-[#66FCF1]">{spendingInsights.suggestion}</p>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-[#0B0C10]/20">
                           <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#0B0C10] mb-4 flex items-center gap-2">
                             <BrainCircuit size={14} /> Offline AI Pattern Detection
                           </h4>
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                             {offlineAI.map(pattern => (
                               <div key={pattern.id} className={`p-4 rounded-xl border border-[#0B0C10] bg-[#0B0C10] flex flex-col gap-2 shadow-sm`}>
                                 <div className="flex items-center gap-2">
                                   {pattern.icon}
                                   <span className="text-xs font-bold uppercase tracking-wider text-[#C5C6C7]">{pattern.title}</span>
                                 </div>
                                 <p className="text-[10px] font-medium text-[#45A29E] leading-relaxed">{pattern.message}</p>
                               </div>
                             ))}
                           </div>
                        </div>
                     </div>
                   )}
                </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <div className="p-6 sm:p-10 rounded-3xl bg-[#1F2833] border border-[#0B0C10] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                   <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5C6C7] mb-8 sm:mb-10 text-center">Metric Mapping</h3>
                   <div className="max-w-[240px] sm:max-w-[280px] mx-auto hover:scale-105 transition-transform duration-500">
                     <Pie data={pieChartData} options={pieChartOptions} />
                   </div>
                </div>
                <div className="p-6 sm:p-10 rounded-3xl bg-[#1F2833] border border-[#0B0C10] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                   <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C5C6C7] mb-8 sm:mb-10 text-center">Temporal Flow</h3>
                   <div className="h-[200px] sm:h-auto hover:scale-[1.02] transition-transform duration-500">
                     <Line data={lineChartData} options={lineChartOptions} />
                   </div>
                </div>
             </div>
          </div>
        )}

        {view === 'profile' && (
          <div className="max-w-md mx-auto space-y-6 sm:space-y-8 animate-in fade-in text-center pb-24 sm:pb-20">
             <div className="p-8 sm:p-12 rounded-[2rem] sm:rounded-[2.5rem] bg-[#1F2833] border border-[#0B0C10] relative overflow-hidden shadow-sm">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-[#66FCF1] rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(102,252,241,0.3)]">
                   <UserPlus size={36} className="text-[#0B0C10] sm:w-10 sm:h-10" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight uppercase font-brand text-[#C5C6C7]">{memberName}</h3>
                <p className="text-[9px] sm:text-[10px] font-bold text-[#45A29E] uppercase tracking-widest mt-2 italic">Vault: {nickname}</p>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="relative p-6 sm:p-8 rounded-3xl bg-[#C5C6C7] hover:bg-[#66FCF1] transition-all flex flex-col items-center gap-3 active:scale-95 group overflow-hidden shadow-sm">
                   <Languages size={24} className="text-[#0B0C10] group-hover:scale-110 transition-transform" />
                   <span className="font-bold text-[9px] sm:text-[10px] uppercase tracking-widest text-[#0B0C10]">
                     {LANGUAGES.find(l => l.code === userConfig.lang)?.label || "LANGUAGE"}
                   </span>
                   <select 
                     value={userConfig.lang} 
                     onChange={(e) => {
                       setUserConfig(Object.assign({}, userConfig, { lang: e.target.value }));
                       updateCloudSetting('lang', e.target.value);
                     }}
                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                   >
                     {LANGUAGES.map(l => (
                       <option key={l.code} value={l.code} className="bg-[#1F2833] text-[#66FCF1]">{l.label}</option>
                     ))}
                   </select>
                </div>
                <button onClick={() => setShowBudgetModal(true)} className="p-6 sm:p-8 rounded-3xl bg-[#C5C6C7] hover:bg-[#66FCF1] transition-all flex flex-col items-center gap-3 active:scale-95 group shadow-sm text-[#0B0C10]">
                   <Settings2 size={24} className="group-hover:rotate-90 transition-transform text-[#0B0C10]" />
                   <span className="font-bold text-[9px] sm:text-[10px] uppercase tracking-widest">BUDGET</span>
                </button>
             </div>
          </div>
        )}
      </main>

      {view !== 'admin' && (
         <button onClick={() => openModal()} className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 bg-[#66FCF1] text-[#0B0C10] rounded-2xl shadow-[0_0_20px_rgba(102,252,241,0.5)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50">
           <PlusCircle size={24} className="sm:w-7 sm:h-7" />
         </button>
      )}

      {(showAddModal || showBudgetModal) && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-[#0B0C10] bg-opacity-90 backdrop-blur-sm" onClick={() => { setShowAddModal(false); setShowBudgetModal(false); }}></div>
          
          {showBudgetModal ? (
            <div className="relative w-full max-w-sm p-8 sm:p-10 rounded-t-[2.5rem] sm:rounded-[2.5rem] bg-[#1F2833] border border-[#66FCF1]/30 shadow-[0_0_40px_rgba(102,252,241,0.1)] animate-in slide-in-from-bottom-8">
               <h3 className="text-base sm:text-lg font-bold uppercase tracking-widest mb-8 text-center text-[#66FCF1]">{t.setBudget}</h3>
               <div className="space-y-6">
                  <input type="number" defaultValue={userConfig.budget} id="b-in" className="w-full p-4 bg-[#0B0C10] rounded-xl border border-[#45A29E] text-2xl sm:text-3xl font-bold text-center outline-none focus:border-[#66FCF1] text-[#66FCF1]" />
                  <button onClick={() => updateCloudSetting('budget', parseInt(document.getElementById('b-in').value) || 0)} className="w-full py-4 bg-[#66FCF1] hover:bg-[#66FCF1]/90 text-[#0B0C10] font-bold uppercase tracking-widest rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(102,252,241,0.3)]"> {t.updateBudget} </button>
               </div>
            </div>
          ) : (
            <div className="relative w-full sm:max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar p-6 sm:p-8 rounded-t-[2.5rem] sm:rounded-[2.5rem] bg-[#1F2833] border border-[#66FCF1]/30 animate-in slide-in-from-bottom-10 shadow-[0_0_40px_rgba(102,252,241,0.1)]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold uppercase tracking-widest text-[#66FCF1] flex items-center gap-2">
                  <Zap size={20} className="text-[#66FCF1] fill-[#66FCF1]" /> {editingExpense ? t.edit : "Quick Add"}
                </h3>
                <button type="button" onClick={() => setShowAddModal(false)} className="p-2 rounded-full bg-[#0B0C10] text-[#45A29E] hover:bg-[#0B0C10]/80 hover:text-[#66FCF1] transition-colors"><X size={18} /></button>
              </div>
              
              <form onSubmit={saveExpense} className="space-y-5">
                
                {/* 1. SIMPLE & MOBILE FIRST: Massive Amount Input (Numeric Keyboard) */}
                <div className="text-center bg-[#0B0C10] p-6 rounded-3xl border border-[#45A29E]/30 shadow-inner relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-b from-[#66FCF1]/5 to-transparent pointer-events-none"></div>
                   <label className="text-[10px] font-bold uppercase tracking-widest text-[#45A29E] block mb-2 relative z-10">Total Amount</label>
                   <div className="flex items-center justify-center text-[#66FCF1] relative z-10">
                      <span className="text-4xl sm:text-5xl font-bold mr-1 opacity-50">₹</span>
                      <input 
                         type="number" 
                         step="0.01"
                         inputMode="decimal"
                         value={totalAmount} 
                         onChange={(e) => setTotalAmount(e.target.value)} 
                         required 
                         autoFocus 
                         className="w-full max-w-[200px] bg-transparent text-5xl sm:text-6xl font-bold outline-none text-center placeholder-[#45A29E] placeholder-opacity-30" 
                         placeholder="0" 
                      />
                   </div>
                </div>

                {/* 1.5. NEW: Auto Calculator & Quick Presets */}
                <div className="bg-[#0B0C10] p-4 sm:p-5 rounded-3xl border border-[#45A29E]/20 shadow-sm space-y-4">
                   <div className="flex gap-3">
                       <div className="flex-1 relative">
                           <label className="text-[9px] font-bold uppercase tracking-widest text-[#45A29E] block mb-1.5 ml-1">Rate (₹)</label>
                           <input 
                              type="number" step="0.01" inputMode="decimal"
                              value={rate} onChange={(e) => setRate(e.target.value)}
                              className="w-full p-3 rounded-xl border border-[#1F2833] bg-[#1F2833] text-[#66FCF1] font-bold text-sm outline-none focus:border-[#66FCF1] transition-all placeholder-[#45A29E]/50" 
                              placeholder="Price"
                           />
                       </div>
                       <div className="flex-1 relative">
                           <label className="text-[9px] font-bold uppercase tracking-widest text-[#45A29E] block mb-1.5 ml-1">Qty</label>
                           <input 
                              type="number" step="0.01" inputMode="decimal"
                              value={qty} onChange={(e) => setQty(e.target.value)} 
                              className="w-full p-3 rounded-xl border border-[#1F2833] bg-[#1F2833] text-[#66FCF1] font-bold text-sm outline-none focus:border-[#66FCF1] transition-all placeholder-[#45A29E]/50" 
                              placeholder="Amount" 
                           />
                       </div>
                       <div className="w-[80px] flex flex-col">
                           <label className="text-[9px] font-bold uppercase tracking-widest text-[#45A29E] block mb-1.5 ml-1">Unit</label>
                           {isCustomUnit ? (
                               <div className="relative">
                                   <input 
                                       type="text" 
                                       value={unit} 
                                       onChange={(e) => setUnit(e.target.value)}
                                       className="w-full p-3 rounded-xl border border-[#66FCF1] bg-[#1F2833] text-[#66FCF1] font-bold text-sm outline-none pr-6 placeholder-[#45A29E]/50"
                                       placeholder="Custom"
                                       autoFocus
                                   />
                                   <button type="button" onClick={() => { setIsCustomUnit(false); setUnit('L'); }} className="absolute right-1 top-1/2 -translate-y-1/2 text-[#45A29E] hover:text-[#66FCF1] p-1">
                                       <X size={12} />
                                   </button>
                               </div>
                           ) : (
                               <select 
                                  value={unit} 
                                  onChange={(e) => {
                                      if (e.target.value === 'CUSTOM') {
                                          setIsCustomUnit(true);
                                          setUnit('');
                                      } else {
                                          setUnit(e.target.value);
                                      }
                                  }}
                                  className="w-full p-3 rounded-xl border border-[#1F2833] bg-[#1F2833] text-[#66FCF1] font-bold text-sm outline-none focus:border-[#66FCF1] appearance-none text-center cursor-pointer"
                               >
                                  {DEFAULT_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                  <option value="CUSTOM">+ Custom</option>
                               </select>
                           )}
                       </div>
                   </div>

                   {/* Quick Presets Row */}
                   <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar snap-x">
                       {(QTY_PRESETS[unit] || [1, 2, 3, 5, 10, 20]).map(q => (
                           <button 
                              key={q} type="button" 
                              onClick={() => setQty(q)}
                              className={`flex-shrink-0 snap-center px-4 py-2 rounded-xl font-bold text-xs transition-all duration-200 active:scale-95 border ${parseFloat(qty) === q ? 'bg-[#66FCF1] text-[#0B0C10] border-[#66FCF1] shadow-[0_0_10px_rgba(102,252,241,0.3)]' : 'bg-[#1F2833] text-[#45A29E] border-[#1F2833] hover:border-[#66FCF1]/50 hover:text-[#66FCF1]'}`}
                           >
                              {q} {unit}
                           </button>
                       ))}
                   </div>
                </div>

                {/* 2. VISUAL: Icon Grid for Category Selection */}
                <div>
                   <label className="text-[10px] font-bold uppercase tracking-widest text-[#C5C6C7] ml-1 block mb-3">Select Category</label>
                   <div className="grid grid-cols-5 gap-2 sm:gap-3">
                     {CATEGORIES.map(c => {
                       const IconComp = c.Icon;
                       const isSelected = selectedCategory === c.id;
                       return (
                         <button 
                            key={c.id} 
                            type="button" 
                            onClick={() => setSelectedCategory(c.id)} 
                            className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 ${isSelected ? 'bg-[#66FCF1] text-[#0B0C10] shadow-[0_0_15px_rgba(102,252,241,0.5)] scale-105' : 'bg-[#0B0C10] text-[#45A29E] border border-transparent hover:border-[#45A29E]/50'}`}
                         >
                            <IconComp size={22} className="mb-1.5" />
                            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider truncate w-full text-center">{t[c.id.toLowerCase()] || c.id}</span>
                         </button>
                       )
                     })}
                   </div>
                </div>

                {/* 3. FAST: Minimal details, description defaults to category name if left blank (Alphabet Keyboard) */}
                <div className="space-y-3 bg-[#0B0C10] p-4 rounded-3xl border border-[#45A29E]/30">
                   <div className="relative">
                      <input 
                         name="itemName" 
                         type="text"
                         defaultValue={editingExpense?.itemName} 
                         className="w-full p-4 rounded-xl border border-[#1F2833] bg-[#0B0C10] text-sm font-semibold outline-none focus:border-[#66FCF1] transition-all text-[#66FCF1] placeholder-[#45A29E]" 
                         placeholder="Note / Description (Optional)" 
                      />
                   </div>
                   <div className="relative">
                      <input 
                         name="date" 
                         type="date" 
                         defaultValue={editingExpense?.date || todayString} 
                         required 
                         className="w-full p-4 rounded-xl border border-[#1F2833] bg-[#0B0C10] font-semibold outline-none text-[#66FCF1] text-sm focus:border-[#66FCF1] transition-all appearance-none cursor-pointer" 
                      />
                   </div>
                </div>

                {/* 4. MOBILE FIRST: Big Thumb-Friendly Save Button */}
                <button type="submit" className="w-full bg-[#66FCF1] hover:bg-[#66FCF1]/90 text-[#0B0C10] font-bold py-5 rounded-2xl transition-all shadow-[0_0_20px_rgba(102,252,241,0.4)] active:scale-[0.98] uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2 mt-4">
                   <CheckCircle2 size={20} /> {t.save}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      <footer className="mt-auto py-8 sm:py-10 border-t border-[#1F2833] text-center bg-[#0B0C10] relative z-10 pb-20 sm:pb-10">
         <p className="text-[8px] sm:text-[9px] font-bold text-[#45A29E] text-opacity-60 uppercase tracking-[0.6em] mb-3">NEURAL LEDGER v9.3</p>
         <div className="flex items-center justify-center gap-2 text-[9px] sm:text-[10px] font-medium text-[#C5C6C7] uppercase tracking-widest hover:text-[#66FCF1] transition-colors cursor-default">
           {t.footerCredits} <Heart size={12} className="text-[#66FCF1] animate-pulse" fill="currentColor" /> By DHARAM RATHOD
         </div>
      </footer>
    </div>
  );
}