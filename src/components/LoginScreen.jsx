import React, { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { LOGO_URL, ROLES } from "../config/roles";
import { getUsers } from "../lib/requests";

export default function LoginScreen({ onLogin, authHook }) {
  const { login, register } = authHook;

  const [isRegistering, setIsRegistering] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Register states
  const [regName, setRegName] = useState("");
  const [regRole, setRegRole] = useState(Object.values(ROLES)[0]);
  const [regPin, setRegPin] = useState("");

  // โหลด users ตอนเปิด
  useEffect(() => {
    refreshUsers();
  }, []);

  async function refreshUsers() {
    try {
      setLoadingUsers(true);
      const data = await getUsers();
      setUsers(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
    } catch (err) {
      setError("ไม่สามารถโหลดรายชื่อผู้ใช้ได้ - " + err.message);
    } finally {
      setLoadingUsers(false);
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(selectedId, pin);
      onLogin(user);
    } catch (err) {
      setError(err.message || "เข้าสู่ระบบไม่สำเร็จ");
      setSuccessMsg("");
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
    if (regPin.length < 4) {
      setError("PIN ต้องมีอย่างน้อย 4 หลัก");
      return;
    }

    setLoading(true);
    try {
      const newUser = await register({
        name: regName,
        role: regRole,
        pin: regPin,
      });
      await refreshUsers();
      setSelectedId(newUser.id);
      setIsRegistering(false);
      setRegName("");
      setRegPin("");
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
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative bg-white p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-full max-w-md border-t-[8px] border-red-600 animate-slide-down">
        <div className="flex justify-center mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <img src={LOGO_URL} alt="Logo" className="h-16 object-contain" />
        </div>

        <h2 className="text-3xl font-black text-center text-slate-900 mb-2 tracking-tight uppercase">
          {isRegistering ? "Create Account" : "KPH Sourcing"}
        </h2>
        <p className="text-slate-500 text-center mb-8 text-sm font-bold tracking-widest">
          {isRegistering ? "ลงทะเบียนผู้ใช้งานใหม่" : "Management Portal"}
        </p>

        {successMsg && !isRegistering && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-bold text-center rounded-xl flex items-center justify-center gap-2 animate-fade-in">
            <CheckCircle size={16} /> {successMsg}
          </div>
        )}

        {!isRegistering ? (
          // ===================== LOGIN =====================
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1 tracking-widest">
                Select User Profile
              </label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all cursor-pointer shadow-inner disabled:opacity-50"
                value={selectedId}
                onChange={(e) => {
                  setSelectedId(e.target.value);
                  setError("");
                  setSuccessMsg("");
                }}
                disabled={loadingUsers || users.length === 0}
              >
                {loadingUsers && <option>กำลังโหลด...</option>}
                {!loadingUsers && users.length === 0 && (
                  <option>ไม่พบผู้ใช้ในระบบ</option>
                )}
                {users.map((u) => (
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
                disabled={loading}
              />
              {error && (
                <p className="text-red-500 text-xs mt-3 text-center font-bold flex items-center justify-center gap-1.5">
                  <AlertCircle size={14} /> {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !selectedId || !pin}
              className="w-full bg-red-600 text-white font-black py-4 rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all text-sm tracking-widest uppercase mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "Login Now"}
            </button>

            <div className="mt-8 text-center border-t border-slate-100 pt-6">
              <p className="text-xs text-slate-500 font-bold mb-2">
                ไม่มีรายชื่อในระบบ?
              </p>
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
          // ===================== REGISTER =====================
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
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-2 ml-1 tracking-widest">
                Role (ตำเเหน่ง)
              </label>
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all cursor-pointer shadow-inner"
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
                disabled={loading}
              >
                {Object.values(ROLES).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
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
                disabled={loading}
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
                {loading ? "กำลังบันทึก..." : "Create Account"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(false);
                  setError("");
                }}
                disabled={loading}
                className="w-full bg-white text-slate-500 font-bold py-3.5 rounded-xl border-2 border-slate-100 hover:border-slate-300 hover:text-slate-700 transition-all text-sm tracking-widest uppercase flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
