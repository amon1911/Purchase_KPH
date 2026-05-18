import React from "react";
import {
  LayoutDashboard,
  Plus,
  Database,
  LogOut,
  Bell,
  User,
} from "lucide-react";
import { LOGO_URL, ROLE_COLORS } from "../config/roles";

export default function Sidebar({
  currentPage,
  setCurrentPage,
  currentUser,
  onLogout,
  awaitingCount = 0,
}) {
  const menus = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "create", label: "สร้างคำขอ", icon: Plus },
    {
      id: "list",
      label: "รายการคำขอ",
      icon: Database,
      badge: awaitingCount > 0 ? awaitingCount : null,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="bg-white rounded-2xl p-4 mb-3">
          <img
            src={LOGO_URL}
            alt="Logo"
            className="h-10 object-contain mx-auto"
          />
        </div>
        <h1 className="text-xs font-black tracking-widest text-center text-slate-400 uppercase">
          KPH Sourcing
        </h1>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-black text-sm">
            {currentUser?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{currentUser?.name}</p>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase truncate">
              {currentUser?.role}
            </p>
          </div>
        </div>
      </div>

      {/* Menus */}
      <nav className="flex-1 p-4 space-y-1">
        {menus.map((menu) => {
          const Icon = menu.icon;
          const isActive = currentPage === menu.id;
          return (
            <button
              key={menu.id}
              onClick={() => setCurrentPage(menu.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                isActive
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span className="flex-1 text-left">{menu.label}</span>
              {menu.badge && (
                <span className="bg-white text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {menu.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-red-600 hover:text-white transition-all"
        >
          <LogOut size={18} />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
}
