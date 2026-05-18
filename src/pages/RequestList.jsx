import React, { useState, useEffect } from "react";
import { Search, FileText, Filter } from "lucide-react";
import { listRequests } from "../lib/requests";
import { STATUS_COLORS, STATUS_LABELS, ROLE_COLORS } from "../config/roles";

export default function RequestList({ currentUser, setCurrentPage, setSelectedRequestId }) {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAwaitingMe, setShowAwaitingMe] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [statusFilter]);

  async function load() {
    try {
      setLoading(true);
      const data = await listRequests({
        status: statusFilter === "all" ? null : statusFilter,
      });
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = requests.filter((r) => {
    const matchSearch =
      !search ||
      r.doc_number?.toLowerCase().includes(search.toLowerCase()) ||
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.project_name?.toLowerCase().includes(search.toLowerCase());
    const matchAwaiting =
      !showAwaitingMe ||
      (r.status === "pending" && r.current_approver_role === currentUser.role);
    return matchSearch && matchAwaiting;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            รายการคำขอ
          </h1>
          <p className="text-sm text-slate-500 font-bold mt-1">
            พบ {filtered.length} จาก {requests.length} รายการ
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาเลขที่, หัวข้อ, ชื่อโครงการ..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold cursor-pointer outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
        >
          <option value="all">ทุกสถานะ</option>
          <option value="pending">รอดำเนินการ</option>
          <option value="approved">อนุมัติเเล้ว</option>
          <option value="rejected">ปฏิเสธ</option>
          <option value="cancelled">ยกเลิก</option>
        </select>

        <button
          onClick={() => setShowAwaitingMe(!showAwaitingMe)}
          className={`px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
            showAwaitingMe
              ? "bg-red-600 text-white"
              : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-red-300"
          }`}
        >
          <Filter size={14} />
          รอฉันอนุมัติ
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading && (
          <div className="p-10 text-center text-slate-400 font-bold text-sm">
            กำลังโหลด...
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="p-16 text-center">
            <FileText className="mx-auto mb-3 text-slate-300" size={40} />
            <p className="text-slate-400 font-bold text-sm">ไม่พบคำขอ</p>
          </div>
        )}
        <div className="divide-y divide-slate-100">
          {filtered.map((req) => (
            <button
              key={req.id}
              onClick={() => {
                setSelectedRequestId(req.id);
                setCurrentPage("detail");
              }}
              className="w-full p-5 hover:bg-slate-50 transition-all text-left"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-100 rounded-xl">
                  <FileText size={18} className="text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-black text-sm text-slate-900">
                      {req.doc_number}
                    </p>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${STATUS_COLORS[req.status]}`}
                    >
                      {STATUS_LABELS[req.status]}
                    </span>
                    {req.status === "pending" && req.current_approver_role && (
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${ROLE_COLORS[req.current_approver_role]}`}
                      >
                        รอ: {req.current_approver_role}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 font-bold truncate">
                    {req.title}
                  </p>
                  <p className="text-xs text-slate-500 font-bold mt-1">
                    โดย {req.creator?.name} •{" "}
                    {new Date(req.created_at).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-base font-black text-slate-900">
                    ฿{Number(req.total_amount).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold">
                    {req.items?.length || 0} รายการ
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
