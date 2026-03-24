import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  
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
  Search, Wallet, Settings2, Lock, KeyRound, Filter, Check, Download
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
    welcome: "स्वागत आहे", today: "आजचा खर्च", monthly: "मासिक खर्च", budget: "માસિક બજેટ", remaining: "ઉર્વરિત રકમ",
    add: "નવીન ખર્ચ", edit: "સંપાદિત કરા", search: "ખર્ચ શોધા...", save: "જતન કરા", cancel: "રદ્દ કરા",
    all: "સર્વ શ્રેણી", milk: "દૂધ", vegetables: "ભાજ્યા", oil: "તેલ", grocery: "કિરાણા", other: "ઇતર",
    footerCredits: "દ્વારે નિર્મિત", overspent: "બજેટ બાહેર", confirmDelete: "હે હટવાયચે?", bulkDelete: "નિવડલેલે હટવા",
    success: "યશસ્વી", loginTitle: "વ્હૉલ્ટ એક્સેસ", loginSub: "ડેટા સિંક કર્યાસાર્ઠી નાવ આણિ પાસવર્ડ પ્રવિષ્ટ કરા",
    startSync: "લેજર ઉઘડા", setBudget: "બજેટ સેટ કરા", updateBudget: "અપડેટ કરા", authError: "ચુકીચે તપશીલ",
    filters: "ફિલ્ટર્સ", reset: "રીસેટ", idTaken: "હે ID આધીચ ઘેતલે આહે! કૃપયા એક અદ્વિતીય નાવ નિવડા.", empty: "કોણતાહી ખર્ચ આઢળલા નાહી"
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
    all: "அனைத்தும்", milk: "பால்", vegetables: "காயறிகள்", oil: "எண்ணெய்", grocery: "มளிகை", other: "மற்றவை",
    footerCredits: "உருவாக்கியவர்", overspent: "பட்ஜெட் தாண்டியது", confirmDelete: "அழிக்கவா?", bulkDelete: "தேர்ந்தெடுத்ததை அழி",
    success: "வெற்றி", loginTitle: "வால்ட் அணுகல்", loginSub: "தரவை ஒத்திசைக்க பெயர் மற்றும் கடவுச்சொல்லை உள்ளிடவும்",
    startSync: "திறக்க", setBudget: "பட்ஜெட் அமைக்க", updateBudget: "புதுப்பி", authError: "தவறான விவரங்கள்",
    filters: "வடிகட்டிகள்", reset: "மீட்டமை", idTaken: "இந்த ID ஏற்கனவே எடுக்கப்பட்டுள்ளது! தனித்துவமான பெயரைத் தேர்ந்தெடுக்கவும்.", empty: "செலவுகள் எதுவும் இல்லை"
  },
  te: {
    welcome: "స్వాగతం", today: "నేడు", monthly: "నెలవారీ ఖర్చు", budget: "నెలవారీ బడ్జెట్", remaining: "మిగిలినది",
    add: "జోడించు", edit: "సవరించు", search: "శోధించు...", save: "సేవ్ చేయి", cancel: "రద్దు చేయি",
    all: "అన్నీ", milk: "పాలు", vegetables: "కూరగాయలు", oil: "నూనె", grocery: "కిరాణా", other: "ఇతర",
    footerCredits: "సృష్టించినవారు", overspent: "బడ్జెట్ దాటింది", confirmDelete: "తొలগించాలా?", bulkDelete: "ఎంచుకున్నవి తొলগించు",
    success: "విజయం", loginTitle: "వాల్ట్ యాక్సెస్", loginSub: "సమాచారాన్ని సింక్ చేయడానికి పేరు మరియు పాస్‌వర్డ్ నమోదు చేయండి",
    startSync: "తెరువు", setBudget: "బడ్జెট సెట్ చేయండి", updateBudget: "అప్‌డేట్ చేయండి", authError: "తప్పు వివరాలు",
    filters: "ఫిల్టర్లు", reset: "రీసెట్", idTaken: "ఈ ID ఇప్పటికే తీసుకోబడింది! ప్రత్యేక పేరును ఎంచుకోండి.", empty: "ఖర్చులు కనుగొనబడలేదు"
  }
};

const CATEGORIES = [
  { id: 'Milk', Icon: Milk, color: 'bg-[#ADD8E6] bg-opacity-30 text-[#000080]', hex: '#ADD8E6', activeGlow: 'shadow-[0_0_20px_rgba(0,0,128,0.1)]' },
  { id: 'Vegetables', Icon: Carrot, color: 'bg-emerald-100 text-emerald-700', hex: '#10b981', activeGlow: 'shadow-[0_0_20px_rgba(16,185,129,0.1)]' },
  { id: 'Oil', Icon: Droplet, color: 'bg-[#6D8196] bg-opacity-10 text-[#000080]', hex: '#6D8196', activeGlow: 'shadow-[0_0_20px_rgba(109,129,150,0.1)]' },
  { id: 'Grocery', Icon: ShoppingBag, color: 'bg-[#ADD8E6] bg-opacity-50 text-[#000080]', hex: '#4682B4', activeGlow: 'shadow-[0_0_20px_rgba(0,0,128,0.2)]' },
  { id: 'Other', Icon: MoreHorizontal, color: 'bg-slate-100 text-slate-600', hex: '#6D8196', activeGlow: 'shadow-[0_0_20px_rgba(0,0,0,0.05)]' }
];

const QTY_PRESETS = {
  L: [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 10],
  KG: [0.25, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 10],
  G: [50, 100, 200, 250, 500]
};

export default function App() {
  const [nickname, setNickname] = useState(localStorage.getItem('gharkharcha_nickname') || '');
  const [password, setPassword] = useState(localStorage.getItem('gharkharcha_pass') || '');
  const [inputNick, setInputNick] = useState('');
  const [inputPass, setInputPass] = useState('');
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userConfig, setUserConfig] = useState({ budget: 5000, lang: 'en', darkMode: false });
  
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

  const [selectedCategory, setSelectedCategory] = useState('Milk');
  const [unit, setUnit] = useState('L');
  const [qty, setQty] = useState(1);
  const [rate, setRate] = useState('');
  const [totalAmount, setTotalAmount] = useState('');

  const t = i18n[userConfig.lang] || i18n.en;
  const todayString = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const styleId = 'ghar-kharcha-global-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; -webkit-tap-highlight-color: transparent; background-color: #FFFAFA; color: #000080; }
        .font-brand { font-family: 'Kalam', cursive !important; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #6D8196; border-radius: 20px; }
        @media (max-width: 640px) { input, select { font-size: 16px !important; } }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
  const initAuth = async () => {
    try {
      await signInAnonymously(auth);
    } catch (err) {
      console.error(err);
    }
  };

  initAuth();

  const unsubscribe = onAuthStateChanged(auth, (u) => {
    setUser(u);
    setLoading(false);
  });

  return () => unsubscribe();
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
    });
    
    return () => { unsubExpenses(); unsubSettings(); };
  }, [user, nickname]);

  const showMsg = (text, type) => {
    setMessage({ text: String(text), type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!inputNick.trim() || !inputPass.trim()) return;
    const formattedNick = inputNick.toLowerCase().trim();
    const settingsRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', formattedNick);
    try {
      const snap = await getDoc(settingsRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.password === inputPass) {
          setNickname(formattedNick); setPassword(inputPass);
          localStorage.setItem('gharkharcha_nickname', formattedNick);
          localStorage.setItem('gharkharcha_pass', inputPass);
          showMsg(t.success, "success");
        } else { showMsg(t.idTaken, "error"); }
      } else {
        await setDoc(settingsRef, { 
          password: inputPass, budget: 5000, lang: userConfig.lang, createdAt: new Date().toISOString()
        });
        setNickname(formattedNick); setPassword(inputPass);
        localStorage.setItem('gharkharcha_nickname', formattedNick);
        localStorage.setItem('gharkharcha_pass', inputPass);
        showMsg("Vault Created", "success");
      }
    } catch (e) { showMsg("Access Failure", "error"); }
  };

  const logout = () => {
    localStorage.removeItem('gharkharcha_nickname');
    localStorage.removeItem('gharkharcha_pass');
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

  useEffect(() => {
    if (rate && qty) {
      const q = unit === 'G' ? (parseFloat(qty) * 0.001) : parseFloat(qty);
      setTotalAmount((q * parseFloat(rate)).toFixed(2));
    }
  }, [rate, qty, unit]);

  const saveExpense = async (e) => {
    e.preventDefault();
    if (!user || !nickname) return;
    const formData = new FormData(e.target);
    const data = {
      itemName: formData.get('itemName') || 'Untitled',
      category: selectedCategory,
      amount: parseFloat(totalAmount) || 0,
      quantity: parseFloat(qty) || 1,
      unit: unit || 'L', 
      rate: parseFloat(rate) || 0,
      date: formData.get('date') || todayString,
      nickname: nickname.toLowerCase().trim(),
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
      setUnit(expense.unit || 'L');
      setQty(expense.quantity || 1);
      setRate(expense.rate || '');
      setTotalAmount(expense.amount || '');
    } else {
      setEditingExpense(null);
      setSelectedCategory('Milk');
      setUnit('L');
      setQty(1);
      setRate('');
      setTotalAmount('');
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
    const headers = ["Date", "Description", "Category", "Amount", "Quantity", "Unit"];
    const dQ = '"';
    const ddQ = '""';
    let csvContent = headers.join(",") + "\n";
    
    filteredExpenses.forEach(exp => {
      let desc = String(exp.itemName || '').split(dQ).join(ddQ);
      csvContent += String(exp.date || '') + ',' + dQ + desc + dQ + ',' + String(exp.category || '') + ',' + String(exp.amount || 0) + ',' + String(exp.quantity || 0) + ',' + String(exp.unit || '') + '\n';
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
      borderColor: '#ffffff', 
      borderWidth: 4
    }]
  };

  const pieChartOptions = { 
    plugins: { legend: { position: 'bottom', labels: { color: '#000080', font: { family: 'sans-serif', weight: 'bold', size: 10 } } } } 
  };

  const lineChartData = {
    labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    datasets: [{
      label: 'Expense',
      data: [120, 450, 300, 800, 200, 500, stats.today],
      borderColor: '#000080', 
      backgroundColor: 'rgba(0, 0, 128, 0.1)',
      fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#ffffff', pointBorderColor: '#000080', pointBorderWidth: 2
    }]
  };

  const lineChartOptions = { 
    scales: { 
      y: { display: false }, 
      x: { grid: { display: false }, ticks: { color: '#6D8196', font: { weight: 'bold' } } } 
    } 
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFAFA]">
        <Loader2 className="w-8 h-8 text-[#000080] animate-spin" />
      </div>
    );
  }

  if (!nickname || !password) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#FFFAFA] text-[#000080]">
         <div className="w-full max-w-sm p-8 sm:p-10 rounded-[3rem] border border-[#6D8196] border-opacity-30 bg-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#000080]"></div>
            <div className="flex justify-center mb-8">
               <div className="p-4 bg-[#ADD8E6] bg-opacity-30 text-[#000080] rounded-2xl"><Lock size={32} /></div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-center font-brand text-[#000080]">घर खर्चा <span className="text-xl text-[#6D8196] font-brand">by Dharam</span></h1>
            <p className="text-[#6D8196] text-sm mb-10 text-center">{t.loginSub}</p>
            
            {message && (
              <div className={`mb-6 p-4 rounded-xl text-xs font-bold uppercase tracking-widest text-center border ${message.type === 'error' ? 'bg-red-50 text-red-500 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                 {message.text}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
               <div className="relative">
                  <User className="absolute left-4 top-[50%] -translate-y-[50%] text-[#6D8196]" size={18} />
                  <input type="text" required value={inputNick} onChange={(e) => setInputNick(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[#6D8196] border-opacity-30 bg-[#FFFAFA] text-[#000080] outline-none focus:border-[#000080] transition-all font-medium placeholder-[#6D8196]" placeholder="Nickname" />
               </div>
               <div className="relative">
                  <KeyRound className="absolute left-4 top-[50%] -translate-y-[50%] text-[#6D8196]" size={18} />
                  <input type="password" required value={inputPass} onChange={(e) => setInputPass(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[#6D8196] border-opacity-30 bg-[#FFFAFA] text-[#000080] outline-none focus:border-[#000080] transition-all font-medium placeholder-[#6D8196]" placeholder="Password" />
               </div>
               <button type="submit" className="w-full bg-[#000080] hover:bg-[#6D8196] text-white font-semibold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-[#000080]/20 uppercase tracking-widest text-xs"> Unlock </button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-[#6D8196] border-opacity-20 flex justify-center">
               <div className="relative flex items-center gap-2 text-[#6D8196] hover:text-[#000080] transition-colors cursor-pointer">
                  <Languages size={14} />
                  <select 
                    value={userConfig.lang} 
                    onChange={(e) => {
                      setUserConfig(Object.assign({}, userConfig, { lang: e.target.value }));
                    }}
                    className="bg-transparent text-[10px] font-bold uppercase tracking-widest outline-none cursor-pointer appearance-none text-center text-[#000080]"
                  >
                    {LANGUAGES.map(l => (
                      <option key={l.code} value={l.code} className="bg-white text-[#000080]">{l.label}</option>
                    ))}
                  </select>
               </div>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFAFA] text-[#000080]">
      {message && (
        <div className="fixed top-6 left-[50%] -translate-x-[50%] z-[300] px-6 py-3 rounded-full bg-white border border-[#6D8196] border-opacity-30 shadow-xl animate-in fade-in slide-in-from-top-4">
          <p className="text-sm font-medium flex items-center gap-2 text-[#000080]">
             <CheckCircle2 size={16} className="text-[#000080]" /> {message.text}
          </p>
        </div>
      )}

      <header className="sticky top-0 z-50 backdrop-blur-md bg-white bg-opacity-90 border-b border-[#6D8196] border-opacity-20 h-20 flex items-center justify-between px-4 sm:px-12">
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer truncate" onClick={() => { setView('dashboard'); setFilterCategory('all'); }}>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#000080] rounded-xl flex-shrink-0 flex items-center justify-center text-white shadow-lg"><Zap size={16} fill="currentColor" className="sm:w-5 sm:h-5 text-white" /></div>
          <span className="font-bold text-xl sm:text-3xl tracking-tight font-brand text-[#000080] truncate">घर खर्चा <span className="text-sm sm:text-xl text-[#6D8196] font-brand">by Dharam</span></span>
        </div>
        <nav className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
          <button onClick={() => { setView('dashboard'); setFilterCategory('all'); }} className={`p-2 sm:p-3 rounded-xl transition-all ${view === 'dashboard' && filterCategory === 'all' ? 'bg-[#000080] bg-opacity-10 text-[#000080]' : 'text-[#6D8196] hover:text-[#000080]'}`}><LayoutDashboard size={20} /></button>
          <button onClick={() => setView('analytics')} className={`p-2 sm:p-3 rounded-xl transition-all ${view === 'analytics' ? 'bg-[#000080] bg-opacity-10 text-[#000080]' : 'text-[#6D8196] hover:text-[#000080]'}`}><TrendingUp size={20} /></button>
          <button onClick={() => setView('profile')} className={`p-2 sm:p-3 rounded-xl transition-all ${view === 'profile' ? 'bg-[#000080] bg-opacity-10 text-[#000080]' : 'text-[#6D8196] hover:text-[#000080]'}`}><User size={20} /></button>
          <div className="w-px h-6 bg-[#6D8196] bg-opacity-30 mx-1 sm:mx-2"></div>
          <button onClick={logout} className="p-2 sm:p-3 text-[#6D8196] hover:text-red-600"><LogOut size={20} /></button>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-12 flex-grow">
        {view === 'dashboard' && (
          <div className="space-y-8 sm:space-y-12 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#6D8196] border-opacity-30 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-start mb-8 sm:mb-10">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-medium text-[#6D8196] uppercase tracking-wider">{t.budget}</p>
                        <button onClick={() => setShowBudgetModal(true)} className="p-1 text-[#6D8196] hover:text-[#000080]"><Settings2 size={12} /></button>
                    </div>
                    <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#000080]">₹{userConfig.budget.toLocaleString()}</h3>
                  </div>
                  <div className="p-3 bg-[#ADD8E6] bg-opacity-30 text-[#000080] rounded-2xl"><Wallet size={20} /></div>
                </div>
                <div className="relative h-2 bg-[#FFFAFA] rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${stats.month > userConfig.budget ? 'bg-red-500' : 'bg-[#000080]'}`} style={{ width: `${budgetPct}%` }}></div>
                </div>
                <div className="flex justify-between mt-4 text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-[#6D8196]">{t.monthly}: ₹{stats.month.toLocaleString()}</span>
                  <span className={stats.month > userConfig.budget ? 'text-red-500 animate-pulse' : 'text-[#000080]'}>
                    {stats.month > userConfig.budget ? t.overspent : `${t.remaining}: ₹${(userConfig.budget - stats.month).toLocaleString()}`}
                  </span>
                </div>
              </div>
              <div className="p-6 sm:p-8 rounded-3xl bg-[#000080] text-white shadow-xl shadow-[#000080]/10 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#ADD8E6] rounded-full blur-[80px] opacity-20 translate-x-10 -translate-y-10"></div>
                <span className="text-xs font-bold uppercase tracking-widest text-white text-opacity-80">{t.today}</span>
                <h3 className="text-4xl sm:text-5xl font-bold tracking-tighter text-white mt-4">₹{stats.today.toLocaleString()}</h3>
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-white border-opacity-20 text-[10px] font-bold uppercase tracking-widest text-white text-opacity-80 truncate px-1 sm:px-2">{nickname} • SECURE SYNC</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end px-1">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#6D8196]">Focus Section</h3>
                {filterCategory !== 'all' && (
                  <button onClick={() => setFilterCategory('all')} className="text-[9px] font-bold uppercase tracking-widest text-[#000080] hover:text-[#6D8196]">View All</button>
                )}
              </div>
              <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 no-scrollbar snap-x">
                {CATEGORIES.map(c => {
                  const IconComp = c.Icon;
                  return (
                    <button 
                      key={c.id} 
                      onClick={() => setFilterCategory(filterCategory === c.id ? 'all' : c.id)} 
                      className={`flex-shrink-0 min-w-[120px] sm:min-w-[140px] p-5 sm:p-6 rounded-3xl transition-all snap-center border-2 text-left ${filterCategory === c.id ? `bg-[#ADD8E6] bg-opacity-20 border-[#000080] shadow-sm` : 'bg-white border-[#6D8196] border-opacity-30 hover:border-[#6D8196]'}`}
                    >
                      <div className={`p-3 sm:p-4 rounded-2xl w-fit mb-3 sm:mb-4 shadow-inner ${c.color}`}>
                        <IconComp size={18} />
                      </div>
                      <div className="space-y-1">
                        <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest block ${filterCategory === c.id ? 'text-[#000080]' : 'text-[#6D8196]'}`}>{t[c.id.toLowerCase()] || c.id}</span>
                        <span className="text-base sm:text-lg font-bold tracking-tight text-[#000080]">₹{(stats.byCat[c.id] || 0).toLocaleString()}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-between border-b border-[#6D8196] border-opacity-30 pb-6">
                <div className="flex items-center gap-3 w-full sm:max-w-md">
                   <div className="relative flex-1">
                      <Search className="absolute left-4 top-[50%] -translate-y-[50%] text-[#6D8196]" size={16} />
                      <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.search} className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#6D8196] border-opacity-30 bg-white outline-none text-sm focus:border-[#000080] transition-all text-[#000080] placeholder-[#6D8196]" />
                   </div>
                   <button onClick={() => setShowFilters(!showFilters)} className={`p-3 rounded-xl border transition-all flex-shrink-0 ${showFilters ? 'bg-[#000080] border-[#000080] text-white' : 'bg-white border-[#6D8196] border-opacity-30 text-[#6D8196]'}`}><Filter size={18} /></button>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                   <button onClick={downloadCSV} className="p-3 rounded-xl border border-[#6D8196] border-opacity-30 bg-white text-[#000080] hover:text-[#000080] transition-all flex-shrink-0" title="Export to CSV">
                     <Download size={18} />
                   </button>
                   {selectedIds.length > 0 && (
                     <button onClick={bulkDelete} className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-bold uppercase px-4 sm:px-5 flex-shrink-0 animate-in slide-in-from-right-4"><Trash2 size={16} /><span className="hidden sm:inline"> {t.bulkDelete}</span></button>
                   )}
                   <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="flex-1 sm:flex-none p-3 rounded-xl border border-[#6D8196] border-opacity-30 bg-white text-[#000080] text-xs font-bold uppercase tracking-wider outline-none cursor-pointer">
                     <option value="date-desc">Newest First</option>
                     <option value="amount-desc">Highest Value</option>
                     <option value="amount-asc">Lowest Value</option>
                   </select>
                </div>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-6 rounded-2xl bg-white border border-[#6D8196] border-opacity-30 animate-in slide-in-from-top-4 shadow-sm">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#6D8196] ml-1">Category</label>
                      <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full p-3 rounded-xl border border-transparent bg-[#FFFAFA] bg-opacity-80 text-[#000080] text-sm outline-none focus:border-[#000080]">
                        <option value="all">{t.all}</option>
                        {CATEGORIES.map(c => <option key={c.id} value={c.id}>{t[c.id.toLowerCase()]}</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#6D8196] ml-1">Amount Range</label>
                      <div className="flex items-center gap-2">
                        <input type="number" value={amountRange.min} onChange={(e) => setAmountRange(Object.assign({}, amountRange, { min: e.target.value }))} placeholder="Min" className="w-full p-3 rounded-xl border border-transparent bg-[#FFFAFA] bg-opacity-80 text-[#000080] placeholder-[#6D8196] text-sm outline-none focus:border-[#000080]" />
                        <input type="number" value={amountRange.max} onChange={(e) => setAmountRange(Object.assign({}, amountRange, { max: e.target.value }))} placeholder="Max" className="w-full p-3 rounded-xl border border-transparent bg-[#FFFAFA] bg-opacity-80 text-[#000080] placeholder-[#6D8196] text-sm outline-none focus:border-[#000080]" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#6D8196] ml-1">Date Range</label>
                      <div className="flex items-center gap-2">
                        <input type="date" value={dateRange.start} onChange={(e) => setDateRange(Object.assign({}, dateRange, { start: e.target.value }))} className="w-full p-3 rounded-xl border border-transparent bg-[#FFFAFA] bg-opacity-80 text-[#000080] text-xs outline-none focus:border-[#000080]" />
                        <input type="date" value={dateRange.end} onChange={(e) => setDateRange(Object.assign({}, dateRange, { end: e.target.value }))} className="w-full p-3 rounded-xl border border-transparent bg-[#FFFAFA] bg-opacity-80 text-[#000080] text-xs outline-none focus:border-[#000080]" />
                      </div>
                   </div>
                   <div className="sm:col-span-3 flex justify-end gap-3 mt-2">
                      <button onClick={() => { setFilterCategory('all'); setDateRange({start:'',end:''}); setAmountRange({min:'',max:''}); }} className="text-[10px] font-bold uppercase text-[#6D8196] hover:text-[#000080] transition-colors">{t.reset}</button>
                   </div>
                </div>
              )}

              <div className="space-y-8 sm:space-y-10 pb-24 sm:pb-20">
                {Object.keys(groupedExpenses).length === 0 ? (
                  <div className="py-16 sm:py-24 flex flex-col items-center justify-center border-2 border-dashed border-[#6D8196] border-opacity-20 rounded-3xl bg-white bg-opacity-50">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 rounded-full bg-[#FFFAFA] border border-[#6D8196] border-opacity-20 flex items-center justify-center shadow-inner">
                          <Search size={28} className="text-[#6D8196] sm:w-8 sm:h-8" />
                      </div>
                      <h4 className="text-[#000080] font-bold tracking-widest uppercase text-xs mb-2">No Data Visible</h4>
                      <p className="text-[#6D8196] text-[10px] tracking-widest uppercase">{t.empty}</p>
                  </div>
                ) : (
                  Object.keys(groupedExpenses).map(monthYear => (
                    <div key={monthYear} className="space-y-4 sm:space-y-6">
                      <div className="flex items-center gap-4">
                        <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#000080] whitespace-nowrap">{monthYear}</h3>
                        <div className="flex-1 h-px bg-[#6D8196] bg-opacity-20"></div>
                      </div>
                      <div className="grid gap-3">
                        {groupedExpenses[monthYear].map((exp) => {
                          const CatData = CATEGORIES.find(c => c.id === exp.category);
                          const IconColor = CatData ? CatData.color : "bg-slate-50 text-[#6D8196]";
                          const isSelected = selectedIds.includes(exp.id);
                          const ListIcon = CatData ? CatData.Icon : MoreHorizontal;
                          
                          return (
                            <div key={exp.id} className={`group p-4 sm:p-5 flex items-center justify-between rounded-2xl transition-all border ${isSelected ? 'bg-[#ADD8E6] bg-opacity-20 border-[#000080] shadow-sm' : 'bg-white border-[#6D8196] border-opacity-20 hover:border-[#6D8196]'}`}>
                              <div className="flex items-center gap-3 sm:gap-5 overflow-hidden flex-1">
                                <button onClick={() => toggleSelection(exp.id)} className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all flex-shrink-0 ${isSelected ? 'bg-[#000080] border-[#000080] text-white' : 'border-[#6D8196] border-opacity-50 text-transparent hover:border-[#000080]'}`}>
                                  <Check size={14} />
                                </button>
                                <div className={`p-2 sm:p-3 rounded-xl hidden sm:flex flex-shrink-0 ${IconColor}`}>
                                  <ListIcon size={18} />
                                </div>
                                <div className="truncate pr-2">
                                  <h4 className="font-semibold text-sm sm:text-base text-[#000080] truncate uppercase">{exp.itemName}</h4>
                                  <div className="flex gap-2 sm:gap-3 mt-1 items-center">
                                    <span className="text-[9px] sm:text-[10px] font-bold text-[#6D8196] uppercase tracking-widest whitespace-nowrap">{exp.date}</span>
                                    <div className="w-1 h-1 rounded-full bg-[#6D8196] bg-opacity-50 flex-shrink-0"></div>
                                    <span className="text-[9px] sm:text-[10px] font-bold text-[#000080] text-opacity-70 uppercase tracking-widest whitespace-nowrap">{exp.quantity} {exp.unit}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 sm:gap-6 pl-2">
                                <span className="font-bold text-lg sm:text-xl tracking-tight text-[#000080]">₹{exp.amount}</span>
                                <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                                  <button onClick={() => openModal(exp)} className="p-1 sm:p-2 text-[#000080] text-opacity-50 hover:text-[#000080]"><Edit2 size={14} className="sm:w-4 sm:h-4" /></button>
                                  <button onClick={() => deleteExpense(exp.id)} className="p-1 sm:p-2 text-[#000080] text-opacity-50 hover:text-red-500"><Trash2 size={14} className="sm:w-4 sm:h-4" /></button>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 animate-in fade-in pb-24 sm:pb-20">
             <div className="p-6 sm:p-10 rounded-3xl bg-white border border-[#6D8196] border-opacity-30 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#6D8196] mb-8 sm:mb-10 text-center">Metric Mapping</h3>
                <div className="max-w-[240px] sm:max-w-[280px] mx-auto">
                  <Pie data={pieChartData} options={pieChartOptions} />
                </div>
             </div>
             <div className="p-6 sm:p-10 rounded-3xl bg-white border border-[#6D8196] border-opacity-30 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#6D8196] mb-8 sm:mb-10 text-center">Temporal Flow</h3>
                <div className="h-[200px] sm:h-auto">
                  <Line data={lineChartData} options={lineChartOptions} />
                </div>
             </div>
          </div>
        )}

        {view === 'profile' && (
          <div className="max-w-md mx-auto space-y-6 sm:space-y-8 animate-in fade-in text-center pb-24 sm:pb-20">
             <div className="p-8 sm:p-12 rounded-[2rem] sm:rounded-[2.5rem] bg-white border border-[#6D8196] border-opacity-30 relative overflow-hidden shadow-sm">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-[#FFFAFA] rounded-3xl flex items-center justify-center mb-6">
                   <User size={36} className="#000080 sm:w-10 sm:h-10" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight uppercase font-brand text-[#000080]">{nickname}</h3>
                <p className="text-[9px] sm:text-[10px] font-bold text-[#6D8196] uppercase tracking-widest mt-2 italic">Neural Sync Channel Active</p>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="relative p-6 sm:p-8 rounded-3xl bg-white border border-[#6D8196] border-opacity-30 hover:border-[#000080] transition-all flex flex-col items-center gap-3 active:scale-95 group overflow-hidden shadow-sm">
                   <Languages size={24} className="text-[#000080] group-hover:scale-110 transition-transform" />
                   <span className="font-bold text-[9px] sm:text-[10px] uppercase tracking-widest text-[#000080] group-hover:text-[#000080] transition-colors">
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
                       <option key={l.code} value={l.code} className="bg-white text-[#000080]">{l.label}</option>
                     ))}
                   </select>
                </div>
                <button onClick={() => setShowBudgetModal(true)} className="p-6 sm:p-8 rounded-3xl bg-white border border-[#6D8196] border-opacity-30 hover:border-[#000080] transition-all flex flex-col items-center gap-3 active:scale-95 group shadow-sm text-[#000080]">
                   <Settings2 size={24} className="group-hover:rotate-90 transition-transform" />
                   <span className="font-bold text-[9px] sm:text-[10px] uppercase tracking-widest">BUDGET</span>
                </button>
             </div>
          </div>
        )}
      </main>

      <button onClick={() => openModal()} className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 bg-[#000080] text-white rounded-2xl shadow-xl shadow-[#000080]/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50">
        <PlusCircle size={24} className="sm:w-7 sm:h-7" />
      </button>

      {(showAddModal || showBudgetModal) && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-[#000080] bg-opacity-40 backdrop-blur-sm" onClick={() => { setShowAddModal(false); setShowBudgetModal(false); }}></div>
          
          {showBudgetModal ? (
            <div className="relative w-full max-w-sm p-8 sm:p-10 rounded-t-[2.5rem] sm:rounded-[2.5rem] bg-white border border-[#6D8196] border-opacity-30 shadow-2xl animate-in slide-in-from-bottom-8">
               <h3 className="text-base sm:text-lg font-bold uppercase tracking-widest mb-8 text-center text-[#000080]">{t.setBudget}</h3>
               <div className="space-y-6">
                  <input type="number" defaultValue={userConfig.budget} id="b-in" className="w-full p-4 bg-[#FFFAFA] rounded-xl border border-transparent text-2xl sm:text-3xl font-bold text-center outline-none focus:border-[#000080] text-[#000080]" />
                  <button onClick={() => updateCloudSetting('budget', parseInt(document.getElementById('b-in').value) || 0)} className="w-full py-4 bg-[#000080] hover:bg-[#6D8196] text-white font-bold uppercase tracking-widest rounded-xl text-xs transition-all shadow-lg"> {t.updateBudget} </button>
               </div>
            </div>
          ) : (
            <div className="relative w-full sm:max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar p-6 sm:p-8 rounded-t-[2.5rem] sm:rounded-3xl bg-white border-t border-[#6D8196] border-opacity-20 animate-in slide-in-from-bottom-20 shadow-2xl">
              <div className="flex justify-between items-center mb-8 sm:mb-10">
                <h3 className="text-lg sm:text-xl font-bold uppercase tracking-widest text-[#000080]">{editingExpense ? t.edit : t.add}</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 rounded-lg text-[#000080] hover:text-[#000080] bg-[#FFFAFA] bg-opacity-80 transition-colors"><X size={18} /></button>
              </div>
              <form onSubmit={saveExpense} className="space-y-6 sm:space-y-8 pb-4">
                <div className="space-y-2">
                  <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#6D8196] ml-1">Input Description</label>
                  <input name="itemName" defaultValue={editingExpense?.itemName} required className="w-full p-4 rounded-xl border border-[#6D8196] border-opacity-40 bg-[#FFFAFA] text-base sm:text-lg font-medium outline-none focus:border-[#000080] transition-all uppercase italic text-[#000080] placeholder-[#6D8196]" placeholder="Description..." />
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#6D8196] ml-1">Sector Link</label>
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full p-4 rounded-xl border border-[#6D8196] border-opacity-40 bg-[#FFFAFA] font-medium text-sm outline-none appearance-none cursor-pointer text-[#000080] focus:border-[#000080]">
                      {CATEGORIES.map(c => <option key={c.id} value={c.id} className="bg-white">{t[c.id.toLowerCase()] || c.id}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#6D8196] ml-1">Timestamp</label>
                    <input name="date" type="date" defaultValue={editingExpense?.date || todayString} required className="w-full p-4 rounded-xl border border-[#6D8196] border-opacity-40 bg-[#FFFAFA] font-medium outline-none text-[#000080] focus:border-[#000080]" />
                  </div>
                </div>
                <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFAFA] bg-opacity-80 border border-[#6D8196] border-opacity-20">
                  <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <div className="flex bg-white p-1 rounded-lg gap-1 shadow-inner w-full justify-between border border-[#6D8196] border-opacity-20">
                      {['KG', 'G', 'L'].map(u => (
                        <button key={u} type="button" onClick={() => setUnit(u)} className={`flex-1 py-2 text-[10px] font-bold rounded-md transition-all ${unit === u ? 'bg-[#000080] text-white' : 'text-[#6D8196] hover:bg-[#FFFAFA]'}`}>{u}</button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="space-y-1">
                      <label className="text-[8px] sm:text-[9px] font-bold uppercase text-[#6D8196] text-center block tracking-widest">Rate per {unit}</label>
                      <input type="number" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} className="w-full p-2 sm:p-3 bg-transparent text-center border-b border-[#6D8196] border-opacity-30 font-bold text-lg sm:text-xl outline-none focus:border-[#000080] transition-all text-[#000080]" placeholder="0" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] sm:text-[9px] font-bold uppercase text-[#6D8196] text-center block tracking-widest">Total Sum (₹)</label>
                      <input type="number" step="0.01" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} required className="w-full p-2 sm:p-3 bg-transparent text-center border-b border-[#6D8196] border-opacity-30 font-bold text-xl sm:text-2xl text-[#000080] outline-none focus:border-[#000080] transition-all" placeholder="0" />
                    </div>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {(QTY_PRESETS[unit] || []).map(q => (
                      <button key={q} type="button" onClick={() => setQty(q)} className={`flex-shrink-0 px-4 sm:px-5 py-2 text-[9px] sm:text-[10px] font-bold rounded-lg border transition-all ${String(qty) === String(q) ? 'bg-[#000080] text-white border-[#000080]' : 'bg-white text-[#000080] border-[#6D8196] border-opacity-40 hover:border-[#000080]'}`}>{q}{unit}</button>
                    ))}
                    <input type="number" step="0.01" value={qty} onChange={(e) => setQty(e.target.value)} className="w-16 sm:w-20 flex-shrink-0 px-2 sm:px-3 py-2 bg-white text-[#000080] font-bold rounded-lg outline-none border border-[#6D8196] border-opacity-40 text-center text-[10px] focus:border-[#000080]" placeholder="Custom" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-[#000080] hover:bg-[#6D8196] text-white font-bold py-4 sm:py-5 rounded-xl transition-all shadow-lg active:scale-[0.98] uppercase tracking-[0.2em] text-xs"> {t.save} </button>
              </form>
            </div>
          )}
        </div>
      )}

      <footer className="mt-auto py-8 sm:py-10 border-t border-[#6D8196] border-opacity-10 text-center bg-[#FFFAFA] relative z-10 pb-20 sm:pb-10">
         <p className="text-[8px] sm:text-[9px] font-bold text-[#000080] text-opacity-40 uppercase tracking-[0.6em] mb-3">NEURAL LEDGER v9.3</p>
         <div className="flex items-center justify-center gap-2 text-[9px] sm:text-[10px] font-medium text-[#6D8196] uppercase tracking-widest">
           {t.footerCredits} <Heart size={12} className="text-[#000080] text-opacity-40" fill="currentColor" /> By DHARAM RATHOD
         </div>
      </footer>
    </div>
  );
}