import React, { useState, useEffect } from "react";
import {
  FileText,
  CheckCircle,
  XCircle,
  Bell,
  Clock,
  TrendingUp,
  Plus,
} from "lucide-react";
import { getStats, listRequests } from "../lib/requests";
import { STATUS_COLORS, STATUS_LABELS, ROLE_COLORS } from "../config/roles";

export default function Dashboard({ currentUser, setCurrentPage, setSelectedRequestId }) {
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [awaitingMe, setAwaitingMe] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  async function loadData() {
    try {
      setLoading(true);
      const [s, list] = await Promise.all([
        getStats(currentUser),
        listRequests(),
      ]);
      setStats(s);
      setRecentRequests(list.slice(0, 5));
      setAwaitingMe(
        list.filter(
          (r) =>
            r.status === "pending" &&
            r.current_approver_role === currentUser.role
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-10 text-center text-slate-400 font-bold">
        กำลังโหลด...
      </div>
    );
  }

  const statCards = [
    {
      label: "รออนุมัติของฉัน",
      value: stats?.awaitingMe || 0,
      icon: Bell,
      color: "from-red-500 to-red-600",
      highlight: true,
    },
    {
      label: "ทั้งหมดที่รอ",
      value: stats?.pending || 0,
      icon: Clock,
      color: "from-amber-500 to-amber-600",
    },
    {
      label: "อนุมัติเเล้ว",
      value: stats?.approved || 0,
      icon: CheckCircle,
      color: "from-green-500 to-green-600",
    },
    {
      label: "ปฏิเสธ",
      value: stats?.rejected || 0,
      icon: XCircle,
      color: "from-slate-500 to-slate-600",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            สวัสดี, {currentUser.name.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-slate-500 font-bold mt-1">
            ภาพรวมระบบจัดซื้อจัดจ้าง KPH Sourcing
          </p>
        </div>
        <button
          onClick={() => setCurrentPage("create")}
          className="flex items-center gap-2 bg-red-600 text-white font-black px-5 py-3 rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all text-sm uppercase tracking-widest"
        >
          <Plus size={18} />
          สร้างคำขอใหม่
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`relative overflow-hidden rounded-2xl p-6 border ${
                stat.highlight
                  ? "bg-gradient-to-br " + stat.color + " text-white border-transparent shadow-xl"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className={`text-xs font-bold uppercase tracking-widest mb-2 ${
                      stat.highlight ? "text-white/80" : "text-slate-500"
                    }`}
                  >
                    {stat.label}
                  </p>
                  <p
                    className={`text-4xl font-black ${
                      stat.highlight ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`p-2.5 rounded-xl ${
                    stat.highlight
                      ? "bg-white/20"
                      : "bg-gradient-to-br " + stat.color
                  }`}
                >
                  <Icon
                    size={20}
                    className={stat.highlight ? "text-white" : "text-white"}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Awaiting My Approval */}
      {awaitingMe.length > 0 && (
        <div className="bg-gradient-to-br from-red-50 to-amber-50 border-2 border-red-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-600 rounded-xl text-white">
              <Bell size={18} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                คำขอที่รอคุณอนุมัติ
              </h2>
              <p className="text-xs text-slate-500 font-bold">
                {awaitingMe.length} รายการ - กรุณาดำเนินการ
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {awaitingMe.slice(0, 3).map((req) => (
              <button
                key={req.id}
                onClick={() => {
                  setSelectedRequestId(req.id);
                  setCurrentPage("detail");
                }}
                className="w-full bg-white rounded-xl p-4 border border-slate-200 hover:border-red-300 hover:shadow-md transition-all text-left flex items-center justify-between"
              >
                <div>
                  <p className="font-black text-sm text-slate-900">
                    {req.doc_number}
                  </p>
                  <p className="text-xs text-slate-500 font-bold">
                    {req.title}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">
                    ฿{Number(req.total_amount).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold">
                    {new Date(req.created_at).toLocaleDateString("th-TH")}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Requests */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              คำขอล่าสุด
            </h2>
            <p className="text-xs text-slate-500 font-bold">5 รายการล่าสุดในระบบ</p>
          </div>
          <button
            onClick={() => setCurrentPage("list")}
            className="text-xs font-black text-red-600 hover:underline uppercase tracking-widest"
          >
            ดูทั้งหมด →
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {recentRequests.length === 0 && (
            <div className="p-10 text-center text-slate-400 font-bold text-sm">
              ยังไม่มีคำขอในระบบ
            </div>
          )}
          {recentRequests.map((req) => (
            <button
              key={req.id}
              onClick={() => {
                setSelectedRequestId(req.id);
                setCurrentPage("detail");
              }}
              className="w-full p-5 hover:bg-slate-50 transition-all text-left flex items-center gap-4"
            >
              <div className="p-2.5 bg-slate-100 rounded-xl">
                <FileText size={18} className="text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-black text-sm text-slate-900">
                    {req.doc_number}
                  </p>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${STATUS_COLORS[req.status]}`}
                  >
                    {STATUS_LABELS[req.status]}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-bold truncate">
                  {req.title} • โดย {req.creator?.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-slate-900">
                  ฿{Number(req.total_amount).toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-400 font-bold">
                  {new Date(req.created_at).toLocaleDateString("th-TH")}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
