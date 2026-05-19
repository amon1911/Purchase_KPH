import React, { useState, useMemo, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Upload,
  Plus,
  Trash2,
  Search,
  CheckCircle,
  FileText,
  Database,
  User,
  LogOut,
  AlertCircle,
  Printer,
  Copy,
  LayoutDashboard,
  Calendar,
  MapPin,
  Menu,
  Bell,
  XCircle,
  Save,
  Building,
} from "lucide-react";

// ============================================================
// SUPABASE CLIENT
// ============================================================
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ============================================================
// MD5 (สำหรับ verify PIN กับ users table ใน Supabase)
// ============================================================
function md5(string) {
  function rotateLeft(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function addUnsigned(lX, lY) {
    const lX8 = lX & 0x80000000;
    const lY8 = lY & 0x80000000;
    const lX4 = lX & 0x40000000;
    const lY4 = lY & 0x40000000;
    const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    }
    return lResult ^ lX8 ^ lY8;
  }
  function f(x, y, z) { return (x & y) | (~x & z); }
  function g(x, y, z) { return (x & z) | (y & ~z); }
  function h(x, y, z) { return x ^ y ^ z; }
  function i(x, y, z) { return y ^ (x | ~z); }
  function ff(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(f(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function gg(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(g(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function hh(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(h(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function ii(a, b, c, d, x, s, ac) {
    a = addUnsigned(a, addUnsigned(addUnsigned(i(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function convertToWordArray(str) {
    let lWordCount;
    const lMessageLength = str.length;
    const lNumberOfWords_temp1 = lMessageLength + 8;
    const lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    const lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    const lWordArray = Array(lNumberOfWords - 1);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition);
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }
  function wordToHex(lValue) {
    let wordToHexValue = "", wordToHexValue_temp = "", lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      wordToHexValue_temp = "0" + lByte.toString(16);
      wordToHexValue = wordToHexValue + wordToHexValue_temp.substr(wordToHexValue_temp.length - 2, 2);
    }
    return wordToHexValue;
  }
  function utf8Encode(str) {
    str = str.replace(/\r\n/g, "\n");
    let utftext = "";
    for (let n = 0; n < str.length; n++) {
      const c = str.charCodeAt(n);
      if (c < 128) utftext += String.fromCharCode(c);
      else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  }
  let x = [];
  let k, AA, BB, CC, DD, a, b, c, d;
  const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  const S41 = 6, S42 = 10, S43 = 15, S44 = 21;
  string = utf8Encode(string);
  x = convertToWordArray(string);
  a = 0x67452301; b = 0xefcdab89; c = 0x98badcfe; d = 0x10325476;
  for (k = 0; k < x.length; k += 16) {
    AA = a; BB = b; CC = c; DD = d;
    a = ff(a, b, c, d, x[k + 0], S11, 0xd76aa478);
    d = ff(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
    c = ff(c, d, a, b, x[k + 2], S13, 0x242070db);
    b = ff(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
    a = ff(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
    d = ff(d, a, b, c, x[k + 5], S12, 0x4787c62a);
    c = ff(c, d, a, b, x[k + 6], S13, 0xa8304613);
    b = ff(b, c, d, a, x[k + 7], S14, 0xfd469501);
    a = ff(a, b, c, d, x[k + 8], S11, 0x698098d8);
    d = ff(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
    c = ff(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
    b = ff(b, c, d, a, x[k + 11], S14, 0x895cd7be);
    a = ff(a, b, c, d, x[k + 12], S11, 0x6b901122);
    d = ff(d, a, b, c, x[k + 13], S12, 0xfd987193);
    c = ff(c, d, a, b, x[k + 14], S13, 0xa679438e);
    b = ff(b, c, d, a, x[k + 15], S14, 0x49b40821);
    a = gg(a, b, c, d, x[k + 1], S21, 0xf61e2562);
    d = gg(d, a, b, c, x[k + 6], S22, 0xc040b340);
    c = gg(c, d, a, b, x[k + 11], S23, 0x265e5a51);
    b = gg(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
    a = gg(a, b, c, d, x[k + 5], S21, 0xd62f105d);
    d = gg(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = gg(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
    b = gg(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
    a = gg(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
    d = gg(d, a, b, c, x[k + 14], S22, 0xc33707d6);
    c = gg(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
    b = gg(b, c, d, a, x[k + 8], S24, 0x455a14ed);
    a = gg(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
    d = gg(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
    c = gg(c, d, a, b, x[k + 7], S23, 0x676f02d9);
    b = gg(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);
    a = hh(a, b, c, d, x[k + 5], S31, 0xfffa3942);
    d = hh(d, a, b, c, x[k + 8], S32, 0x8771f681);
    c = hh(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
    b = hh(b, c, d, a, x[k + 14], S34, 0xfde5380c);
    a = hh(a, b, c, d, x[k + 1], S31, 0xa4beea44);
    d = hh(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
    c = hh(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
    b = hh(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
    a = hh(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
    d = hh(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
    c = hh(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
    b = hh(b, c, d, a, x[k + 6], S34, 0x4881d05);
    a = hh(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
    d = hh(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
    c = hh(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
    b = hh(b, c, d, a, x[k + 2], S34, 0xc4ac5665);
    a = ii(a, b, c, d, x[k + 0], S41, 0xf4292244);
    d = ii(d, a, b, c, x[k + 7], S42, 0x432aff97);
    c = ii(c, d, a, b, x[k + 14], S43, 0xab9423a7);
    b = ii(b, c, d, a, x[k + 5], S44, 0xfc93a039);
    a = ii(a, b, c, d, x[k + 12], S41, 0x655b59c3);
    d = ii(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
    c = ii(c, d, a, b, x[k + 10], S43, 0xffeff47d);
    b = ii(b, c, d, a, x[k + 1], S44, 0x85845dd1);
    a = ii(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
    d = ii(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
    c = ii(c, d, a, b, x[k + 6], S43, 0xa3014314);
    b = ii(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
    a = ii(a, b, c, d, x[k + 4], S41, 0xf7537e82);
    d = ii(d, a, b, c, x[k + 11], S42, 0xbd3af235);
    c = ii(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
    b = ii(b, c, d, a, x[k + 9], S44, 0xeb86d391);
    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }
  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}

// --- CONFIG & INITIAL DATA ---
const LOGO_URL =
  "https://kasetphandgroup.com/wp-content/uploads/2024/08/kasetphand-group.png";

const ROLES = {
  ENGINEER: "Engineer Onsite (Philippines)",
  SUPERVISOR: "Supervisor",
  PROJECT_ANALYSIS: "Project Analysis",
  PROJECT_MANAGER: "Project Manager",
  PURCHASING: "Purchasing",
};

const APPROVAL_FLOW = [
  ROLES.ENGINEER,
  ROLES.SUPERVISOR,
  ROLES.PROJECT_ANALYSIS,
  ROLES.PROJECT_MANAGER,
  ROLES.PURCHASING,
];

// ----------------------------------------------------------------------
// 1. LOGIN & REGISTER SCREEN COMPONENT
// ----------------------------------------------------------------------
const LoginScreen = ({ usersList, onLogin, onRegister, refreshUsers }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const [regName, setRegName] = useState("");
  const [regRole, setRegRole] = useState(Object.values(ROLES)[0]);
  const [regPin, setRegPin] = useState("");

  useEffect(() => {
    if (usersList.length > 0 && !selectedId) {
      setSelectedId(usersList[0].id);
    }
  }, [usersList]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await onLogin(selectedId, pin);
      if (!user) setError("รหัส PIN ไม่ถูกต้อง");
    } catch (err) {
      setError(err.message || "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!regName.trim() || !regPin.trim()) {
      setError("กรุณากรอกชื่อและรหัส PIN ให้ครบถ้วน");
      return;
    }
    setLoading(true);
    try {
      const newUser = await onRegister({ name: regName, role: regRole, pin: regPin });
      await refreshUsers();
      setSelectedId(newUser.id);
      setIsRegistering(false);
      setRegName("");
      setRegPin("");
      setError("");
      setPin("");
      setSuccessMsg("สมัครสมาชิกสำเร็จ! กรุณาใส่รหัส PIN เพื่อเข้าสู่ระบบ");
    } catch (err) {
      setError(err.message || "สมัครสมาชิกไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans overflow-hidden w-full">
      <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-full max-w-md border-t-[8px] border-red-600 animate-slide-down">
        <div className="flex justify-center mb-6 sm:mb-8 bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100">
          <img src={LOGO_URL} alt="Logo" className="h-12 sm:h-16 object-contain" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-center text-slate-900 mb-2 tracking-tight uppercase">
          {isRegistering ? "Create Account" : "KPH Sourcing"}
        </h2>
        <p className="text-slate-500 text-center mb-8 text-sm font-bold tracking-widest">
          {isRegistering ? "ลงทะเบียนผู้ใช้งานใหม่" : "Management Portal"}
        </p>

        {successMsg && !isRegistering && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-bold text-center rounded-xl flex items-center justify-center gap-2">
            <CheckCircle size={16} /> {successMsg}
          </div>
        )}

        {!isRegistering ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1 tracking-widest">
                Select User Profile
              </label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all cursor-pointer shadow-inner"
                value={selectedId}
                onChange={(e) => {
                  setSelectedId(e.target.value);
                  setError("");
                  setSuccessMsg("");
                }}
              >
                {usersList.length === 0 && <option>กำลังโหลด...</option>}
                {usersList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1 tracking-widest">
                Enter Security PIN
              </label>
              <input
                type="password"
                placeholder="••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center text-2xl font-black tracking-[0.5em] focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all shadow-inner"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
              {error && (
                <p className="text-red-500 text-xs mt-3 text-center font-bold flex items-center justify-center gap-1.5">
                  <AlertCircle size={14} /> {error}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white font-black py-4 rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all text-sm tracking-widest uppercase mt-4 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Login Now"}
            </button>

            <div className="mt-8 text-center border-t border-slate-100 pt-6">
              <p className="text-xs text-slate-500 font-bold mb-2">ไม่มีรายชื่อในระบบ?</p>
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(true);
                  setError("");
                  setSuccessMsg("");
                }}
                className="text-red-600 font-black text-sm hover:underline tracking-widest uppercase transition-colors"
              >
                สมัครสมาชิกใหม่ (Sign Up)
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1 tracking-widest">
                Full Name (ชื่อ-สกุล)
              </label>
              <input
                type="text"
                placeholder="ระบุชื่อของคุณ..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all shadow-inner"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1 tracking-widest">
                Role (ตำแหน่ง)
              </label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all cursor-pointer shadow-inner"
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
              >
                {Object.values(ROLES).map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1 tracking-widest">
                Set Security PIN (ตั้งรหัสผ่าน)
              </label>
              <input
                type="password"
                placeholder="••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-center text-2xl font-black tracking-[0.5em] focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all shadow-inner"
                value={regPin}
                onChange={(e) => setRegPin(e.target.value)}
              />
              {error && (
                <p className="text-red-500 text-xs mt-3 text-center font-bold flex items-center justify-center gap-1.5">
                  <AlertCircle size={14} /> {error}
                </p>
              )}
            </div>

            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white font-black py-4 rounded-xl shadow-lg hover:bg-slate-800 transition-all text-sm tracking-widest uppercase disabled:opacity-50"
              >
                {loading ? "Loading..." : "Create Account"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(false);
                  setError("");
                }}
                className="w-full bg-white text-slate-500 font-bold py-3.5 rounded-xl border-2 border-slate-100 hover:bg-slate-50 transition-all text-xs tracking-widest uppercase"
              >
                Cancel (กลับไปล็อกอิน)
              </button>
            </div>
          </form>
        )}
      </div>
      <style>{`
        @keyframes slide-down { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-down { animation: slide-down 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

// ----------------------------------------------------------------------
// 2. DASHBOARD COMPONENT
// ----------------------------------------------------------------------
const Dashboard = ({ requests, currentUser, onApprove, onReject, setPrintingReq, setCloningData, setActiveTab }) => {
  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 lg:space-y-8 max-w-6xl mx-auto pb-20 w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">ติดตามและอนุมัติใบเสนอราคาโครงการ</p>
        </div>
        <button
          onClick={() => setActiveTab("request")}
          className="w-full sm:w-auto bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-200 hover:bg-red-700 transition-all uppercase tracking-wider"
        >
          <Plus size={18} /> New Request
        </button>
      </div>

      <div className="grid gap-6">
        {requests.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-200">
            <FileText className="mx-auto text-slate-200 mb-6" size={80} />
            <p className="text-2xl font-black text-slate-300 uppercase tracking-widest">No Requests</p>
          </div>
        ) : (
          requests.map((req) => {
            const isMyTurn = req.currentStage === currentUser?.role && req.status === "Pending";
            const stepIndex = APPROVAL_FLOW.indexOf(req.currentStage);
            const isRejected = req.status === "Rejected";

            return (
              <div
                key={req.id}
                className={`bg-white rounded-2xl lg:rounded-3xl border p-4 sm:p-6 lg:p-8 transition-all duration-300 ${
                  isMyTurn ? "border-red-500 shadow-xl ring-[4px] ring-red-50" : "border-slate-100 shadow-sm"
                }`}
              >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6 mb-6 lg:mb-8">
                  <div className="flex gap-3 sm:gap-5 items-center w-full lg:w-auto">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-lg sm:text-2xl shadow-inner shrink-0 ${
                      isRejected ? "bg-red-50 text-red-600" : req.status === "Completed" ? "bg-green-50 text-green-600" : "bg-slate-50 text-slate-600"
                    }`}>
                      {isRejected ? <XCircle size={24} className="sm:hidden" /> : req.status === "Completed" ? <CheckCircle size={24} className="sm:hidden" /> : <span className="sm:hidden">SR</span>}
                      {isRejected ? <XCircle size={32} className="hidden sm:inline" /> : req.status === "Completed" ? <CheckCircle size={32} className="hidden sm:inline" /> : <span className="hidden sm:inline">SR</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <h3 className="text-base sm:text-xl font-black text-slate-900 truncate">{req.projectName}</h3>
                        {isRejected && (
                          <span className="bg-red-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest shrink-0">Rejected</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-semibold text-slate-500 mt-2">
                        <span className="text-red-600 bg-red-50 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md font-mono">{req.id}</span>
                        <span className="flex items-center gap-1"><User size={12} /> {req.requestor}</span>
                        <span className="flex items-center gap-1"><Calendar size={12} /> {req.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full lg:w-auto">
                    <button
                      onClick={() => setPrintingReq(req)}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all"
                    >
                      <FileText size={16} /> PDF
                    </button>
                    <button
                      onClick={() => {
                        setCloningData(req);
                        setActiveTab("request");
                      }}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all"
                    >
                      <Copy size={16} /> Clone
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3 mb-6">
                  {APPROVAL_FLOW.map((role, idx) => {
                    const done = (req.status === "Completed" || idx < stepIndex) && !isRejected;
                    const active = req.status === "Pending" && idx === stepIndex;
                    const rejHere = isRejected && idx === stepIndex;
                    return (
                      <div key={role} className="flex items-center gap-3 sm:block sm:space-y-2">
                        {/* Mobile: เเถบสีอยู่ซ้าย / Desktop: อยู่บน */}
                        <div className={`h-2 w-12 sm:w-full rounded-full transition-all duration-500 shrink-0 ${
                          rejHere ? "bg-red-500 animate-pulse" : done ? "bg-green-500" : active ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-slate-200"
                        }`}></div>
                        <span className={`flex-1 text-[10px] font-bold uppercase tracking-widest leading-tight ${
                          rejHere ? "text-red-600" : done ? "text-green-600" : active ? "text-red-600" : "text-slate-400"
                        }`}>
                          {role}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {isMyTurn && (
                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100 mt-4 bg-slate-50/50 -mx-6 -mb-6 lg:-mx-8 lg:-mb-8 p-6 lg:p-8 rounded-b-3xl">
                    <button
                      onClick={() => onApprove(req.id)}
                      className="flex-[2] bg-red-600 text-white py-3.5 rounded-xl font-black text-sm uppercase shadow-md hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} /> Approve & Forward
                    </button>
                    <button
                      onClick={() => onReject(req.id)}
                      className="flex-1 bg-white border-2 border-red-200 text-red-600 py-3.5 rounded-xl font-black text-sm uppercase hover:bg-red-50 transition-all active:scale-95"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 3. SOURCING FORM COMPONENT (UI เดิมเป๊ะ)
// ----------------------------------------------------------------------
const SourcingForm = ({ currentUser, itemDatabase, projectDatabase, requests, onSave, onCancel, cloningData, notify }) => {
  const [header, setHeader] = useState({
    date: new Date().toISOString().split("T")[0],
    projectName: cloningData?.projectName || "",
    projectResponsible: cloningData?.projectResponsible || "",
    projectPeriod: cloningData?.projectPeriod || "",
    projectLocation: cloningData?.projectLocation || "",
    requestor: currentUser?.name || "",
    phone: cloningData?.phone || "0955591158",
    email: cloningData?.email || "naruebes@kpg.co.th",
    department: "KPGreenergy",
  });

  const [items, setItems] = useState(
    cloningData ? [...cloningData.items] : [{
      code: "", name: "", brand: "", model: "", size: "",
      qty: 1, uom: "", usageType: "ต่อเนื่อง", remarks: "", reqDate: "",
    }]
  );

  const [searchItemTerm, setSearchItemTerm] = useState("");
  const [activeItemIdx, setActiveItemIdx] = useState(null);
  const [searchProjTerm, setSearchProjTerm] = useState("");
  const [activeProjDrop, setActiveProjDrop] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");

  const filteredDB = useMemo(() => {
    if (!searchItemTerm) return [];
    return itemDatabase.filter(
      (i) => (i?.code && i.code.toLowerCase().includes(searchItemTerm.toLowerCase())) ||
             (i?.name && i.name.toLowerCase().includes(searchItemTerm.toLowerCase()))
    ).slice(0, 10);
  }, [searchItemTerm, itemDatabase]);

  const globalFilteredDB = useMemo(() => {
    if (!globalSearchTerm) return [];
    return itemDatabase.filter(
      (i) => (i?.code && i.code.toLowerCase().includes(globalSearchTerm.toLowerCase())) ||
             (i?.name && i.name.toLowerCase().includes(globalSearchTerm.toLowerCase()))
    ).slice(0, 15);
  }, [globalSearchTerm, itemDatabase]);

  const filteredProjects = useMemo(() => {
    if (!searchProjTerm) return [];
    return projectDatabase.filter(
      (p) => (p?.code && p.code.toLowerCase().includes(searchProjTerm.toLowerCase())) ||
             (p?.name && p.name.toLowerCase().includes(searchProjTerm.toLowerCase()))
    ).slice(0, 10);
  }, [searchProjTerm, projectDatabase]);

  const handleProjectChange = (val) => {
    setHeader({ ...header, projectName: val });
    setSearchProjTerm(val);
    setActiveProjDrop(true);
  };

  const selectProject = (proj) => {
    setHeader({
      ...header,
      projectName: `${proj?.code || ""} ${proj?.name || ""}`.trim(),
      projectLocation: proj?.address || header.projectLocation,
    });
    setActiveProjDrop(false);
    setSearchProjTerm("");
  };

  const handleItemChange = (idx, field, val) => {
    const newItems = [...items];
    newItems[idx][field] = val;
    if (field === "code") {
      setSearchItemTerm(val);
      setActiveItemIdx(idx);
      const match = itemDatabase.find((i) => i?.code && i.code.toLowerCase() === val.toLowerCase());
      if (match) newItems[idx].name = match.name || "";
    }
    setItems(newItems);
  };

  const selectProduct = (idx, product) => {
    const newItems = [...items];
    newItems[idx].code = product?.code || "";
    newItems[idx].name = product?.name || "";
    setItems(newItems);
    setActiveItemIdx(null);
    setSearchItemTerm("");
  };

  const handleQuickAdd = (product) => {
    const newItem = {
      code: product?.code || "", name: product?.name || "", brand: "", model: "", size: "",
      qty: 1, uom: "", usageType: "ต่อเนื่อง", remarks: "", reqDate: "",
    };
    if (items.length === 1 && !items[0].code && !items[0].name) setItems([newItem]);
    else setItems([...items, newItem]);
    setGlobalSearchTerm("");
    notify(`เพิ่มรหัส ${product?.code || ""} สำเร็จ`, "success");
  };

  const addItemRow = () => setItems([...items, {
    code: "", name: "", brand: "", model: "", size: "",
    qty: 1, uom: "", usageType: "ต่อเนื่อง", remarks: "", reqDate: "",
  }]);
  const removeItemRow = (idx) => setItems(items.filter((_, i) => i !== idx));

  const handleSubmit = () => {
    if (!header.projectName) return notify("กรุณาระบุชื่อโครงการ!", "error");
    onSave(header, items);
  };

  const inputClass = "w-full bg-white border border-slate-200 rounded-lg p-3 text-sm font-semibold focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all shadow-sm";
  const labelClass = "text-[11px] font-black uppercase text-slate-500 tracking-widest mb-1.5 block";

  return (
    <div className="p-3 sm:p-6 lg:p-10 max-w-[1400px] mx-auto space-y-6 lg:space-y-10 pb-32">
      <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg border border-slate-100 overflow-visible relative">
        <div className="bg-red-600 p-5 sm:p-8 lg:p-12 text-white rounded-t-2xl lg:rounded-t-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[40px]"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tight">Sourcing Form</h2>
              <p className="text-red-100 text-[10px] sm:text-xs mt-1 lg:mt-1.5 font-bold uppercase tracking-widest opacity-90">Material & Service Requisition</p>
            </div>
            <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg w-full md:w-80">
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-white">ดึงข้อมูลจาก SR เดิม (Copy form)</p>
              <select
                className="w-full bg-white text-slate-900 border-none rounded-lg p-2.5 text-sm font-bold outline-none shadow-sm cursor-pointer"
                onChange={(e) => {
                  const found = requests.find((r) => r.id === e.target.value);
                  if (found) {
                    setHeader({ ...header, projectName: `${found.projectName} (Ref: ${found.id})` });
                    setItems([...found.items]);
                    notify("ดึงข้อมูลสำเร็จ!", "success");
                  }
                }}
                defaultValue=""
              >
                <option value="">-- เลือกเลขที่ SR --</option>
                {requests.map((r) => (
                  <option key={r.id} value={r.id}>{r.id} | {r.projectName}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-12 space-y-6 lg:space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 bg-slate-50 p-4 sm:p-6 lg:p-8 rounded-2xl border border-slate-100">
            <div className="space-y-5">
              <div className="relative">
                <label className={labelClass}>Project Code / Name</label>
                <input
                  className={inputClass}
                  value={header.projectName || ""}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  onFocus={() => {
                    setActiveProjDrop(true);
                    setSearchProjTerm(header.projectName || "");
                  }}
                  onBlur={() => setTimeout(() => setActiveProjDrop(false), 250)}
                  placeholder="พิมพ์รหัส 9524... หรือชื่อโครงการ..."
                />
                {activeProjDrop && filteredProjects.length > 0 && (
                  <div className="absolute left-0 top-full mt-1 w-full bg-white rounded-xl shadow-2xl border border-slate-200 z-[100] max-h-60 overflow-y-auto">
                    <div className="p-2 bg-slate-50 border-b border-slate-100 text-center font-bold text-slate-400 uppercase tracking-widest text-[10px]">Projects Found</div>
                    {filteredProjects.map((p) => (
                      <button
                        key={p.code}
                        className="w-full text-left p-3 hover:bg-red-50 hover:text-red-700 transition-colors border-b border-slate-50 last:border-0"
                        onMouseDown={(e) => { e.preventDefault(); selectProject(p); }}
                      >
                        <div className="font-black text-sm text-red-600">{p.code}</div>
                        <div className="text-xs font-bold mt-0.5 text-slate-700">{p.name}</div>
                        <div className="text-[10px] text-slate-500 mt-1 truncate">{p.address}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className={labelClass}>Responsible Person</label>
                <input
                  className={inputClass}
                  value={header.projectResponsible || ""}
                  onChange={(e) => setHeader({ ...header, projectResponsible: e.target.value })}
                  placeholder="ผู้รับผิดชอบ..."
                />
              </div>
              <div>
                <label className={labelClass}>Project Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input
                    className={`${inputClass} pl-10`}
                    value={header.projectLocation || ""}
                    onChange={(e) => setHeader({ ...header, projectLocation: e.target.value })}
                    placeholder="สถานที่..."
                  />
                </div>
              </div>
            </div>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Date</label>
                  <input type="date" className={`${inputClass} bg-slate-100 text-slate-500`} value={header.date || ""} readOnly />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input
                    className={inputClass}
                    value={header.phone || ""}
                    onChange={(e) => setHeader({ ...header, phone: e.target.value })}
                    placeholder="09X-XXX-XXXX"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Email Address</label>
                <input
                  className={inputClass}
                  value={header.email || ""}
                  onChange={(e) => setHeader({ ...header, email: e.target.value })}
                  placeholder="example@kpg.co.th"
                />
              </div>
              <div>
                <label className={labelClass}>Project Period</label>
                <input
                  className={inputClass}
                  value={header.projectPeriod || ""}
                  onChange={(e) => setHeader({ ...header, projectPeriod: e.target.value })}
                  placeholder="Jan - Dec 2026"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 px-2">
              <h3 className="text-lg font-black uppercase tracking-widest text-slate-900">Items List</h3>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                <div className="relative w-full sm:w-80">
                  <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 transition-all">
                    <Search size={16} className="text-slate-400" />
                    <input
                      placeholder="ค้นหา & เพิ่มรหัสด่วน..."
                      className="w-full outline-none text-xs font-bold text-slate-700 placeholder-slate-400"
                      value={globalSearchTerm}
                      onChange={(e) => setGlobalSearchTerm(e.target.value)}
                    />
                  </div>
                  {globalSearchTerm && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 z-[200] max-h-60 overflow-y-auto">
                      {globalFilteredDB.length > 0 ? (
                        globalFilteredDB.map((p) => (
                          <button
                            key={p.code}
                            className="w-full text-left p-3 hover:bg-red-50 transition-colors border-b border-slate-50 last:border-0 flex flex-col gap-0.5"
                            onMouseDown={(e) => { e.preventDefault(); handleQuickAdd(p); }}
                          >
                            <span className="font-black text-xs text-red-600">{p.code}</span>
                            <span className="font-bold text-[10px] text-slate-700 truncate uppercase">{p.name}</span>
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-center text-[10px] font-bold text-slate-400">ไม่พบรายการสินค้า</div>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={addItemRow}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg font-bold text-xs shadow-md hover:bg-red-700 transition-all active:scale-95 shrink-0"
                >
                  <Plus size={16} /> Add Row
                </button>
              </div>
            </div>

            {/* MOBILE: Cards View */}
            <div className="lg:hidden space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Item #{idx + 1}
                    </span>
                    <button
                      onClick={() => removeItemRow(idx)}
                      className="text-red-400 p-1.5 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="relative">
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Material No.</label>
                    <input
                      className="w-full border border-slate-200 rounded-lg p-2.5 font-mono text-red-600 font-bold text-xs uppercase mt-1"
                      placeholder="Type code..."
                      value={item.code || ""}
                      onChange={(e) => handleItemChange(idx, "code", e.target.value)}
                      onFocus={() => { setActiveItemIdx(idx); setSearchItemTerm(item.code || ""); }}
                      onBlur={() => setTimeout(() => setActiveItemIdx(null), 250)}
                    />
                    {activeItemIdx === idx && filteredDB.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-slate-200 z-[100] max-h-60 overflow-y-auto">
                        {filteredDB.map((p) => (
                          <button
                            key={p.code}
                            className="w-full text-left p-3 hover:bg-red-50 border-b border-slate-50 last:border-0"
                            onMouseDown={(e) => { e.preventDefault(); selectProduct(idx, p); }}
                          >
                            <div className="font-black text-xs">{p.code}</div>
                            <div className="text-[10px] font-bold opacity-70 uppercase truncate">{p.name || "-"}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Description</label>
                    <input
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-bold uppercase mt-1"
                      value={item.name || ""}
                      onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Brand</label>
                      <input className="w-full border border-slate-200 rounded-lg p-2.5 text-xs uppercase mt-1" value={item.brand || ""} onChange={(e) => handleItemChange(idx, "brand", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Model</label>
                      <input className="w-full border border-slate-200 rounded-lg p-2.5 text-xs uppercase mt-1" value={item.model || ""} onChange={(e) => handleItemChange(idx, "model", e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Qty</label>
                      <input type="number" className="w-full border border-slate-200 rounded-lg p-2.5 text-center font-bold text-sm mt-1" value={item.qty || ""} onChange={(e) => handleItemChange(idx, "qty", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">UOM</label>
                      <input className="w-full border border-slate-200 rounded-lg p-2.5 text-center font-bold text-xs uppercase text-red-600 mt-1" value={item.uom || ""} onChange={(e) => handleItemChange(idx, "uom", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Date</label>
                      <input type="date" className="w-full border border-slate-200 rounded-lg p-2 text-[10px] mt-1" value={item.reqDate || ""} onChange={(e) => handleItemChange(idx, "reqDate", e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP: Table View */}
            <div className="hidden lg:block overflow-x-auto rounded-2xl border border-slate-200 overflow-y-visible pb-32">
              <table className="w-full min-w-[1200px] border-collapse bg-white">
                <thead className="bg-slate-900 text-white uppercase font-bold tracking-widest text-center text-xs">
                  <tr>
                    <th className="p-3 w-12">#</th>
                    <th className="p-3 w-56">Material No.</th>
                    <th className="p-3 w-72">Description</th>
                    <th className="p-3 w-40">Brand</th>
                    <th className="p-3 w-40">Model</th>
                    <th className="p-3 w-40 text-center">Qty / UOM</th>
                    <th className="p-3 w-40 text-center">Req. Date</th>
                    <th className="p-3 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-all">
                      <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-2 relative">
                        <input
                          className="w-full border border-slate-200 rounded-lg p-2.5 font-mono text-red-600 font-bold focus:border-red-500 outline-none text-xs shadow-inner uppercase"
                          placeholder="Type code..."
                          value={item.code || ""}
                          onChange={(e) => handleItemChange(idx, "code", e.target.value)}
                          onFocus={() => { setActiveItemIdx(idx); setSearchItemTerm(item.code || ""); }}
                          onBlur={() => setTimeout(() => setActiveItemIdx(null), 250)}
                        />
                        {activeItemIdx === idx && filteredDB.length > 0 && (
                          <div className="absolute left-0 top-full mt-1 w-[350px] bg-white rounded-lg shadow-xl border border-slate-200 z-[100] max-h-60 overflow-y-auto">
                            <div className="p-2 bg-slate-50 border-b border-slate-100 text-center font-bold text-slate-400 uppercase tracking-widest text-[9px]">Suggestions</div>
                            {filteredDB.map((p) => (
                              <button
                                key={p.code}
                                className="w-full text-left p-3 hover:bg-red-50 hover:text-red-700 transition-colors border-b border-slate-50 last:border-0"
                                onMouseDown={(e) => { e.preventDefault(); selectProduct(idx, p); }}
                              >
                                <div className="font-black text-xs">{p.code}</div>
                                <div className="text-[10px] font-bold opacity-70 uppercase truncate">{p.name || "-"}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="p-2">
                        <input
                          className="w-full border border-slate-200 rounded-lg p-2.5 font-bold text-slate-700 text-xs shadow-sm uppercase"
                          value={item.name || ""}
                          onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                          placeholder="Description..."
                        />
                      </td>
                      <td className="p-2">
                        <input
                          className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-semibold uppercase"
                          value={item.brand || ""}
                          onChange={(e) => handleItemChange(idx, "brand", e.target.value)}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-semibold uppercase"
                          value={item.model || ""}
                          onChange={(e) => handleItemChange(idx, "model", e.target.value)}
                        />
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <input
                            type="number"
                            className="w-2/3 border border-slate-200 rounded-lg p-2.5 text-center font-bold text-sm"
                            value={item.qty || ""}
                            onChange={(e) => handleItemChange(idx, "qty", e.target.value)}
                          />
                          <input
                            className="w-1/3 border border-slate-200 rounded-lg p-2.5 text-center font-bold text-[10px] uppercase text-red-600"
                            value={item.uom || ""}
                            onChange={(e) => handleItemChange(idx, "uom", e.target.value)}
                            placeholder="Unit"
                          />
                        </div>
                      </td>
                      <td className="p-2">
                        <input
                          type="date"
                          className="w-full border border-slate-200 rounded-lg p-2.5 text-[11px]"
                          value={item.reqDate || ""}
                          onChange={(e) => handleItemChange(idx, "reqDate", e.target.value)}
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => removeItemRow(idx)}
                          className="text-red-400 p-2 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end items-center gap-6 border-t-2 border-slate-100 pt-8 mt-10">
            <button
              onClick={onCancel}
              className="px-6 py-2.5 text-slate-400 font-bold text-sm uppercase tracking-widest hover:text-slate-600 transition-all"
            >
              Discard
            </button>
            <button
              onClick={handleSubmit}
              className="px-12 py-4 rounded-full font-black text-sm uppercase shadow-xl flex items-center gap-2 transition-all active:scale-95 tracking-widest bg-red-600 text-white hover:bg-red-700 shadow-red-200"
            >
              <Save size={20} /> Submit SR Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 4. DATABASE MANAGER (UI เดิม + Save to Supabase)
// ----------------------------------------------------------------------
const DatabaseManager = ({ itemDatabase, projectDatabase, onUploadItems, onUploadProjects, notify }) => {
  const itemInputRef = useRef(null);
  const projInputRef = useRef(null);
  const [searchItem, setSearchItem] = useState("");
  const [searchProj, setSearchProj] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchItem) return itemDatabase;
    return itemDatabase.filter(
      (i) => (i?.code && i.code.toLowerCase().includes(searchItem.toLowerCase())) ||
             (i?.name && i.name.toLowerCase().includes(searchItem.toLowerCase()))
    );
  }, [searchItem, itemDatabase]);

  const filteredProjects = useMemo(() => {
    if (!searchProj) return projectDatabase;
    return projectDatabase.filter(
      (p) => (p?.code && p.code.toLowerCase().includes(searchProj.toLowerCase())) ||
             (p?.name && p.name.toLowerCase().includes(searchProj.toLowerCase())) ||
             (p?.address && p.address.toLowerCase().includes(searchProj.toLowerCase()))
    );
  }, [searchProj, projectDatabase]);

  const handleUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        let text = ev.target.result;
        text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        const lines = text.split("\n").filter((l) => l.trim() !== "");
        if (lines.length < 2) throw new Error("ไฟล์ไม่มีข้อมูล");

        let delim = ",";
        if (lines[0].includes("\t")) delim = "\t";
        else if (lines[0].includes(";")) delim = ";";
        else if (lines[0].includes("|")) delim = "|";

        const news = lines.slice(1).map((l) => {
          let cs = []; let cur = ""; let q = false;
          for (let j = 0; j < l.length; j++) {
            let c = l[j];
            if (q) {
              if (c === '"' && l[j + 1] === '"') { cur += '"'; j++; }
              else if (c === '"') q = false;
              else cur += c;
            } else {
              if (c === '"') q = true;
              else if (c === delim) { cs.push(cur); cur = ""; }
              else cur += c;
            }
          }
          cs.push(cur);

          if (type === "item") {
            return cs.length >= 2 ? {
              code: cs[0] ? String(cs[0]).trim().replace(/^"|"$/g, "") : "",
              name: cs[1] ? String(cs[1]).trim().replace(/^"|"$/g, "") : "",
            } : null;
          } else {
            const code = cs[1] ? String(cs[1]).trim().replace(/^"|"$/g, "") : "";
            const name = cs[2] ? String(cs[2]).trim().replace(/^"|"$/g, "") : "";
            const address = cs[5] ? String(cs[5]).trim().replace(/^"|"$/g, "") : "";
            return code ? { code, name, address } : null;
          }
        }).filter((i) => i && i.code && i.code !== "Itemcode SL");

        if (type === "item") {
          await onUploadItems(news);
          if (itemInputRef.current) itemInputRef.current.value = "";
        } else {
          await onUploadProjects(news);
          if (projInputRef.current) projInputRef.current.value = "";
        }
      } catch (err) {
        notify("❌ รูปแบบไฟล์ไม่ถูกต้อง", "error");
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-12 max-w-6xl mx-auto space-y-6 lg:space-y-8 pb-32">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col justify-between items-start gap-6 shadow-lg relative overflow-hidden border-b-[6px] border-red-600">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[50px]"></div>
          <div className="z-10 space-y-2">
            <h3 className="text-xl font-black uppercase tracking-tight text-red-500 flex items-center gap-2">
              <Database size={20} /> Material DB
            </h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              อัปโหลดไฟล์รหัสสินค้า (Item Code) แบบ CSV หรือ TXT
            </p>
          </div>
          <button
            onClick={() => itemInputRef.current.click()}
            className="z-10 bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold uppercase text-[11px] shadow-md hover:bg-red-700 active:scale-95 transition-all flex items-center gap-2"
          >
            <Upload size={14} /> Upload Material DB
          </button>
          <input type="file" ref={itemInputRef} className="hidden" accept=".txt,.csv" onChange={(e) => handleUpload(e, "item")} />
        </div>

        <div className="bg-slate-800 rounded-3xl p-8 text-white flex flex-col justify-between items-start gap-6 shadow-lg relative overflow-hidden border-b-[6px] border-blue-500">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[50px]"></div>
          <div className="z-10 space-y-2">
            <h3 className="text-xl font-black uppercase tracking-tight text-blue-400 flex items-center gap-2">
              <Building size={20} /> Project DB
            </h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              อัปโหลดไฟล์ข้อมูลโครงการ (Project Name) แบบ CSV หรือ TXT
            </p>
          </div>
          <button
            onClick={() => projInputRef.current.click()}
            className="z-10 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold uppercase text-[11px] shadow-md hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
          >
            <Upload size={14} /> Upload Project DB
          </button>
          <input type="file" ref={projInputRef} className="hidden" accept=".txt,.csv" onChange={(e) => handleUpload(e, "project")} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-6">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-slate-900 uppercase flex items-center gap-2 text-sm">Inventory ({itemDatabase.length})</h3>
          <div className="bg-white px-3 py-2 rounded-lg border border-slate-200 flex items-center gap-2 shadow-sm w-full sm:w-72">
            <Search size={14} className="text-slate-400" />
            <input placeholder="ค้นหา Material Code หรือ ชื่อ..." className="outline-none text-xs font-semibold w-full" value={searchItem} onChange={(e) => setSearchItem(e.target.value)} />
          </div>
        </div>
        <div className="overflow-y-auto max-h-[350px]">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-white sticky top-0 z-10 font-bold uppercase text-slate-500 border-b border-slate-200 text-[10px]">
              <tr><th className="p-4 text-left">Code</th><th className="p-4 text-left">Description</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.slice(0, 50).map((i, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-4 font-mono text-red-600 font-semibold">{i?.code}</td>
                  <td className="p-4 text-slate-700">{i?.name}</td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr><td colSpan="2" className="p-6 text-center text-slate-400 font-bold">ไม่พบข้อมูล</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-6">
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-slate-900 uppercase flex items-center gap-2 text-sm">Projects ({projectDatabase.length})</h3>
          <div className="bg-white px-3 py-2 rounded-lg border border-slate-200 flex items-center gap-2 shadow-sm w-full sm:w-72">
            <Search size={14} className="text-slate-400" />
            <input placeholder="ค้นหา Project Code หรือ ชื่อ..." className="outline-none text-xs font-semibold w-full" value={searchProj} onChange={(e) => setSearchProj(e.target.value)} />
          </div>
        </div>
        <div className="overflow-y-auto max-h-[350px]">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-white sticky top-0 z-10 font-bold uppercase text-slate-500 border-b border-slate-200 text-[10px]">
              <tr><th className="p-4 text-left">Project Code</th><th className="p-4 text-left">Project Name</th><th className="p-4 text-left">Address</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.slice(0, 50).map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-4 font-mono text-blue-600 font-semibold">{p?.code}</td>
                  <td className="p-4 text-slate-700 font-bold">{p?.name}</td>
                  <td className="p-4 text-slate-500 text-[10px] truncate max-w-xs">{p?.address}</td>
                </tr>
              ))}
              {filteredProjects.length === 0 && (
                <tr><td colSpan="3" className="p-6 text-center text-slate-400 font-bold">ไม่พบข้อมูลโครงการ</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 5. PRINT VIEW (Download PDF + Dynamic Signatures)
// ----------------------------------------------------------------------
const PrintView = ({ req, onClose }) => {
  const [downloading, setDownloading] = useState(false);

  if (!req) return null;

  // หาคน approve เเต่ละ stage
  const findApprover = (role) => {
    const approval = (req.history || []).find(
      (h) => h.action === "Approved" && h.role === role
    );
    if (approval) return approval;
    // fallback: ดูจาก history เรียงตามลำดับ + match กับ APPROVAL_FLOW
    return null;
  };

  // map: role → ใครเป็นคน approve
  const approversByRole = {};
  const submittedBy = (req.history || []).find((h) => h.action === "Submitted");
  if (submittedBy) approversByRole[ROLES.ENGINEER] = submittedBy;

  let flowIdx = 1; // เริ่มจาก Supervisor (Engineer = คนสร้าง)
  (req.history || []).forEach((h) => {
    if (h.action === "Approved" && flowIdx < APPROVAL_FLOW.length) {
      approversByRole[APPROVAL_FLOW[flowIdx]] = h;
      flowIdx++;
    }
  });

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      // โหลด html2pdf ผ่าน CDN dynamically
      if (!window.html2pdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // โหลด logo เป็น base64 ก่อน เพื่อป้องกัน CORS
      const logoImg = document.getElementById("pdf-logo");
      if (logoImg && !logoImg.src.startsWith("data:")) {
        try {
          const response = await fetch(LOGO_URL, { mode: "cors" });
          const blob = await response.blob();
          const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
          logoImg.src = base64;
          // รอให้ภาพโหลดเสร็จก่อน
          await new Promise((r) => setTimeout(r, 200));
        } catch (e) {
          console.warn("Logo load failed, using text fallback");
        }
      }

      const element = document.getElementById("print-area");
      const opt = {
        margin: 10,
        filename: `${req.id}_SR_${req.projectName?.split(" ")[0] || "document"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true, logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };
      await window.html2pdf().from(element).set(opt).save();
    } catch (err) {
      alert("ดาวน์โหลด PDF ไม่สำเร็จ: " + err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 lg:p-8 overflow-y-auto no-print">
      <div className="bg-white w-full max-w-[900px] rounded-2xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50">
          <h3 className="text-sm sm:text-lg font-bold text-slate-900 uppercase">Document Preview - {req.id}</h3>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex-1 sm:flex-none bg-red-600 text-white px-4 sm:px-6 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:bg-red-700 disabled:opacity-50"
            >
              <FileText size={16} /> {downloading ? "กำลังโหลด..." : "Download PDF"}
            </button>
            <button onClick={onClose} className="flex-1 sm:flex-none bg-white border border-slate-200 text-slate-600 px-4 sm:px-6 py-2 rounded-lg font-bold text-xs sm:text-sm hover:bg-slate-50">
              Close
            </button>
          </div>
        </div>
        <div id="print-area" className="p-6 sm:p-8 lg:p-12 overflow-y-auto bg-white text-black font-sans text-xs">
          <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
            <div className="flex items-center gap-4">
              <img id="pdf-logo" src={LOGO_URL} alt="Logo" crossOrigin="anonymous" className="h-12 w-auto" />
              <div>
                <h1 className="text-xl font-black uppercase">Kasetphand Group</h1>
                <p className="text-[10px] font-bold uppercase mt-0.5">Sourcing Requisition (SR)</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-mono font-bold text-black">{req.id}</div>
              <div className={`mt-2 inline-block px-3 py-1 rounded text-[10px] font-black uppercase ${
                req.status === "Completed" ? "bg-green-100 text-green-700" :
                req.status === "Rejected" ? "bg-red-100 text-red-700" :
                "bg-amber-100 text-amber-700"
              }`}>
                {req.status}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-6 p-4 rounded-lg border border-black font-bold uppercase text-[10px]">
            <div className="col-span-2 text-center text-sm font-black border-b border-black pb-2 mb-2">แบบฟอร์มขอราคา (Sourcing Request)</div>
            <div className="col-span-2"><strong>Project Name:</strong> <span className="font-black underline text-red-600">{req.projectName}</span></div>
            <div><strong>Date:</strong> {req.date}</div>
            <div><strong>Requested By:</strong> {req.requestor}</div>
            <div><strong>Responsible:</strong> {req.projectResponsible || "-"}</div>
            <div><strong>Contact:</strong> {req.phone}</div>
            <div className="col-span-2"><strong>Location:</strong> {req.projectLocation || "-"}</div>
          </div>
          <table className="w-full border-collapse">
            <thead className="bg-slate-100 font-bold uppercase text-[10px]">
              <tr>
                <th className="w-8 border border-black p-1.5">#</th>
                <th className="w-32 border border-black p-1.5">Material No.</th>
                <th className="text-left border border-black p-1.5">Description</th>
                <th className="w-24 text-center border border-black p-1.5">Qty/UOM</th>
              </tr>
            </thead>
            <tbody>
              {req.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="text-center border border-black p-1.5">{idx + 1}</td>
                  <td className="font-mono text-center border border-black p-1.5">{item?.code || "-"}</td>
                  <td className="border border-black p-1.5">
                    <div>{item?.name || "-"}</div>
                    <div className="text-[9px] opacity-70 italic">{item?.brand} {item?.model}</div>
                  </td>
                  <td className="text-center border border-black p-1.5">{item?.qty} {item?.uom}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Dynamic Signatures - 5 ขั้นตาม Approval Flow */}
          <div className="mt-12">
            <div className="text-[10px] font-black uppercase tracking-widest mb-3 text-slate-600 border-b border-slate-300 pb-2">
              Approval Signatures
            </div>
            <div className="grid grid-cols-5 gap-3 text-center font-bold uppercase text-[9px]">
              {APPROVAL_FLOW.map((role) => {
                const approval = approversByRole[role];
                return (
                  <div key={role}>
                    <div className="h-14 border-b border-black flex flex-col items-center justify-end pb-1">
                      {approval ? (
                        <>
                          <div className="italic font-serif text-[11px] normal-case">
                            {approval.by}
                          </div>
                          <div className="text-[8px] text-slate-500 normal-case mt-0.5">
                            {approval.date}
                          </div>
                        </>
                      ) : (
                        <div className="text-slate-300 text-[8px]">รอดำเนินการ</div>
                      )}
                    </div>
                    <div className="mt-2 text-[8px] leading-tight">{role}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-[9px] text-slate-400 text-center">
            Generated by KPH Sourcing System • {new Date().toLocaleString("th-TH")}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// SUPABASE HELPERS
// ============================================================
async function loadUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, role, is_active")
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  return data || [];
}

async function loginUser(userId, pin) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  if (error || !data) return null;
  if (data.pin_hash !== md5(pin)) return null;
  return { id: data.id, name: data.name, role: data.role };
}

async function registerUser({ name, role, pin }) {
  const { data, error } = await supabase
    .from("users")
    .insert({ name: name.trim(), role, pin_hash: md5(pin) })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

// Convert DB row → app object
function rowToRequest(row) {
  return {
    id: row.id,
    date: row.date,
    projectName: row.project_name,
    projectResponsible: row.project_responsible,
    projectPeriod: row.project_period,
    projectLocation: row.project_location,
    requestor: row.requestor,
    department: row.department,
    phone: row.phone,
    email: row.email,
    status: row.status,
    currentStage: row.current_stage,
    items: row.items || [],
    history: row.history || [],
  };
}

async function loadRequests() {
  const { data, error } = await supabase
    .from("sourcing_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToRequest);
}

async function loadMaterials() {
  const { data, error } = await supabase.from("materials_db").select("*").order("code");
  if (error) throw error;
  return data || [];
}

async function loadProjects() {
  const { data, error } = await supabase.from("projects_db").select("*").order("code");
  if (error) throw error;
  return data || [];
}

// ----------------------------------------------------------------------
// 6. MAIN APP
// ----------------------------------------------------------------------
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [usersList, setUsersList] = useState([]);
  const [itemDatabase, setItemDatabase] = useState([]);
  const [projectDatabase, setProjectDatabase] = useState([]);
  const [requests, setRequests] = useState([]);

  const [printingReq, setPrintingReq] = useState(null);
  const [cloningData, setCloningData] = useState(null);
  const [message, setMessage] = useState(null);

  const notify = (text, type = "info") => {
    setMessage({ text: String(text), type });
    setTimeout(() => setMessage(null), 4000);
  };

  // Load initial data
  const refreshUsers = async () => {
    try {
      const data = await loadUsers();
      setUsersList(data);
    } catch (err) {
      notify("โหลด users ไม่สำเร็จ", "error");
    }
  };

  const refreshRequests = async () => {
    try {
      const data = await loadRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshMaterials = async () => {
    try {
      const data = await loadMaterials();
      setItemDatabase(data);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshProjects = async () => {
    try {
      const data = await loadProjects();
      setProjectDatabase(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refreshRequests();
      refreshMaterials();
      refreshProjects();
    }
  }, [isAuthenticated]);

  // Login handlers
  const handleLogin = async (userId, pin) => {
    const user = await loginUser(userId, pin);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
    return user;
  };

  const handleRegister = async (data) => {
    return await registerUser(data);
  };

  // Save Request → Supabase
  const handleSaveRequest = async (header, items) => {
    const prefix = `SR-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, "0")}-`;
    const srId = `${prefix}${String(requests.filter((r) => r.id.startsWith(prefix)).length + 1).padStart(3, "0")}`;

    const newRow = {
      id: srId,
      date: header.date,
      project_name: header.projectName,
      project_responsible: header.projectResponsible,
      project_period: header.projectPeriod,
      project_location: header.projectLocation,
      requestor: header.requestor,
      department: header.department,
      phone: header.phone,
      email: header.email,
      status: "Pending",
      current_stage: ROLES.SUPERVISOR,
      items,
      history: [{
        action: "Submitted",
        by: currentUser?.name || "Unknown",
        role: currentUser?.role || ROLES.ENGINEER,
        date: new Date().toLocaleString(),
      }],
    };

    const { error } = await supabase.from("sourcing_requests").insert(newRow);
    if (error) {
      notify(`Error: ${error.message}`, "error");
      return;
    }
    await refreshRequests();
    setCloningData(null);
    setActiveTab("dashboard");
    notify(`สร้าง SR เลขที่ ${srId} สำเร็จ!`, "success");
  };

  // Approve → Supabase
  const handleApprove = async (id) => {
    const req = requests.find((r) => r.id === id);
    if (!req) return;
    const idx = APPROVAL_FLOW.indexOf(req.currentStage);
    const nextRole = APPROVAL_FLOW[idx + 1];
    const newStage = nextRole || "Completed";
    const newStatus = nextRole ? "Pending" : "Completed";
    const newHistory = [
      ...(req.history || []),
      { action: "Approved", by: currentUser?.name || "Unknown", role: currentUser?.role || "", date: new Date().toLocaleString() },
    ];

    const { error } = await supabase
      .from("sourcing_requests")
      .update({ current_stage: newStage, status: newStatus, history: newHistory })
      .eq("id", id);
    if (error) {
      notify(`Error: ${error.message}`, "error");
      return;
    }
    await refreshRequests();
    notify("อนุมัติสำเร็จ", "success");
  };

  // Reject → Supabase
  const handleReject = async (id) => {
    if (!window.confirm("คุณต้องการปฏิเสธรายการนี้ใช่หรือไม่?")) return;
    const req = requests.find((r) => r.id === id);
    if (!req) return;
    const newHistory = [
      ...(req.history || []),
      { action: "Rejected", by: currentUser?.name || "Unknown", role: currentUser?.role || "", date: new Date().toLocaleString() },
    ];
    const { error } = await supabase
      .from("sourcing_requests")
      .update({ status: "Rejected", history: newHistory })
      .eq("id", id);
    if (error) {
      notify(`Error: ${error.message}`, "error");
      return;
    }
    await refreshRequests();
    notify("ปฏิเสธสำเร็จ", "error");
  };

  // Upload Materials → Supabase
  const handleUploadItems = async (items) => {
    if (!items.length) return;
    const { error } = await supabase.from("materials_db").upsert(items, { onConflict: "code" });
    if (error) {
      notify(`Error: ${error.message}`, "error");
      return;
    }
    await refreshMaterials();
    notify(`✅ นำเข้าข้อมูลสินค้าสำเร็จ ${items.length} รายการ`, "success");
  };

  // Upload Projects → Supabase
  const handleUploadProjects = async (projects) => {
    if (!projects.length) return;
    const { error } = await supabase.from("projects_db").upsert(projects, { onConflict: "code" });
    if (error) {
      notify(`Error: ${error.message}`, "error");
      return;
    }
    await refreshProjects();
    notify(`✅ นำเข้าข้อมูลโครงการสำเร็จ ${projects.length} รายการ`, "success");
  };

  if (!isAuthenticated) {
    return (
      <LoginScreen
        usersList={usersList}
        onLogin={handleLogin}
        onRegister={handleRegister}
        refreshUsers={refreshUsers}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-900 overflow-x-hidden selection:bg-red-100 selection:text-red-900">
      {message && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 rounded-full shadow-lg text-white font-bold text-sm uppercase flex items-center gap-2 transition-all ${
          message.type === "error" ? "bg-red-600" : message.type === "success" ? "bg-green-600" : "bg-slate-800"
        }`}>
          {message.type === "error" ? <XCircle size={18} /> : <CheckCircle size={18} />}
          {String(message.text)}
        </div>
      )}

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 z-[75] bg-black/50 backdrop-blur-sm no-print"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-[80] w-64 bg-slate-900 text-slate-300 transition-transform lg:relative lg:translate-x-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } no-print border-r border-slate-800 shadow-xl`}>
        <div className="h-full flex flex-col p-6">
          <div className="bg-white p-4 rounded-xl shadow-sm mb-8 flex justify-center border-b-4 border-red-600 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
            <img src={LOGO_URL} alt="Logo" className="h-10 w-auto" />
          </div>
          <nav className="flex-1 space-y-2">
            <button
              onClick={() => { setActiveTab("dashboard"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm uppercase tracking-wide transition-all ${
                activeTab === "dashboard" ? "bg-red-600 text-white shadow-md" : "hover:bg-slate-800"
              }`}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button
              onClick={() => { setCloningData(null); setActiveTab("request"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm uppercase tracking-wide transition-all ${
                activeTab === "request" ? "bg-red-600 text-white shadow-md" : "hover:bg-slate-800"
              }`}
            >
              <Plus size={18} /> Create SR
            </button>
            <button
              onClick={() => { setActiveTab("database"); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm uppercase tracking-wide transition-all ${
                activeTab === "database" ? "bg-red-600 text-white shadow-md" : "hover:bg-slate-800"
              }`}
            >
              <Database size={18} /> Master DB
            </button>
          </nav>
          <div className="mt-auto bg-slate-800/50 p-4 rounded-xl flex items-center gap-3 border border-white/5">
            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-xl">
              {currentUser?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{currentUser?.name || ""}</p>
              <p className="text-[10px] text-red-400 font-bold uppercase truncate">{currentUser?.role || ""}</p>
            </div>
            <button onClick={() => { setIsAuthenticated(false); setCurrentUser(null); }} className="text-slate-500 hover:text-red-400 p-2 transition-all">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-[70] no-print shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-md">
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-slate-400 uppercase">KPGreenergy</p>
              <p className="text-sm font-black text-red-600 uppercase leading-none mt-0.5">Sourcing V4.0</p>
            </div>
            <div className="w-px h-8 bg-slate-200 mx-2"></div>
            <button className="p-2 text-slate-400 hover:text-red-600 relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50/50 p-0">
          {activeTab === "dashboard" && (
            <Dashboard
              requests={requests}
              currentUser={currentUser}
              onApprove={handleApprove}
              onReject={handleReject}
              setPrintingReq={setPrintingReq}
              setCloningData={setCloningData}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === "request" && (
            <SourcingForm
              currentUser={currentUser}
              itemDatabase={itemDatabase}
              projectDatabase={projectDatabase}
              requests={requests}
              onSave={handleSaveRequest}
              cloningData={cloningData}
              notify={notify}
              onCancel={() => setActiveTab("dashboard")}
            />
          )}
          {activeTab === "database" && (
            <DatabaseManager
              itemDatabase={itemDatabase}
              projectDatabase={projectDatabase}
              onUploadItems={handleUploadItems}
              onUploadProjects={handleUploadProjects}
              notify={notify}
            />
          )}
        </main>
      </div>

      <PrintView req={printingReq} onClose={() => setPrintingReq(null)} />

      <style>{`
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        @keyframes slide-down { from { transform: translate(-50%, -100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
        .animate-slide-down { animation: slide-down 0.3s cubic-bezier(0.2, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}