import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Printer,
  Copy,
  Building,
  MapPin,
  Calendar,
  FileText,
  User,
  Clock,
} from "lucide-react";
import {
  getRequestById,
  approveRequest,
  rejectRequest,
} from "../lib/requests";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  ROLE_COLORS,
  APPROVAL_FLOW,
} from "../config/roles";

export default function RequestDetail({
  requestId,
  currentUser,
  setCurrentPage,
}) {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    load();
  }, [requestId]);

  async function load() {
    try {
      setLoading(true);
      const data = await getRequestById(requestId);
      setRequest(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await approveRequest({
        requestId,
        approver: currentUser,
        comment,
      });
      setShowApprove(false);
      setComment("");
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!comment.trim()) {
      alert("กรุณาระบุเหตุผล");
      return;
    }
    setSubmitting(true);
    try {
      await rejectRequest({
        requestId,
        approver: currentUser,
        comment,
      });
      setShowReject(false);
      setComment("");
      await load();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const copyDocNumber = () => {
    navigator.clipboard.writeText(request.doc_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !request) {
    return (
      <div className="p-10 text-center text-slate-400 font-bold">
        กำลังโหลด...
      </div>
    );
  }

  const canApprove =
    request.status === "pending" &&
    request.current_approver_role === currentUser.role;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => setCurrentPage("list")}
        className="flex items-center gap-2 text-sm font-black text-slate-500 hover:text-slate-900 mb-6 uppercase tracking-widest transition-colors"
      >
        <ArrowLeft size={16} />
        กลับ
      </button>

      {/* Header card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-8 mb-6 shadow-xl">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                เลขที่เอกสาร
              </span>
              <button
                onClick={copyDocNumber}
                className="text-slate-400 hover:text-white transition-colors"
                title="คัดลอก"
              >
                <Copy size={12} />
              </button>
              {copied && (
                <span className="text-[10px] text-green-400 font-bold">
                  คัดลอกเเล้ว!
                </span>
              )}
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">
              {request.doc_number}
            </h1>
            <p className="text-slate-300 text-lg">{request.title}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={`text-xs font-black px-3 py-1.5 rounded-lg border-2 ${STATUS_COLORS[request.status]}`}
            >
              {STATUS_LABELS[request.status]}
            </span>
            <p className="text-4xl font-black">
              ฿{Number(request.total_amount).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Project info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-700">
          <div className="flex items-start gap-2">
            <Building size={16} className="text-slate-400 mt-0.5" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                โครงการ
              </p>
              <p className="text-sm font-bold">
                {request.project_name || "-"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin size={16} className="text-slate-400 mt-0.5" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                สถานที่
              </p>
              <p className="text-sm font-bold">
                {request.project_location || "-"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar size={16} className="text-slate-400 mt-0.5" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                วันที่ต้องการใช้
              </p>
              <p className="text-sm font-bold">
                {request.required_date
                  ? new Date(request.required_date).toLocaleDateString("th-TH")
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Approval action banner */}
      {canApprove && (
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl p-6 mb-6 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/80 mb-1">
                คำขอนี้รอคุณดำเนินการ
              </p>
              <p className="text-lg font-black">
                กรุณาพิจารณาเเละกดอนุมัติหรือปฏิเสธ
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowReject(true);
                  setComment("");
                }}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur text-white px-5 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all"
              >
                <XCircle size={16} /> ปฏิเสธ
              </button>
              <button
                onClick={() => {
                  setShowApprove(true);
                  setComment("");
                }}
                className="flex items-center gap-2 bg-white text-red-600 px-5 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-all shadow-lg"
              >
                <CheckCircle size={16} /> อนุมัติ
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Items + Attachments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">
                รายการสินค้า/บริการ
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {request.items?.map((item, idx) => (
                <div key={item.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          #{idx + 1}
                        </span>
                        <p className="font-black text-sm text-slate-900">
                          {item.item_name}
                        </p>
                      </div>
                      {item.description && (
                        <p className="text-xs text-slate-500 font-bold mt-1">
                          {item.description}
                        </p>
                      )}
                      <p className="text-xs text-slate-600 font-bold mt-1">
                        {item.quantity} {item.unit} × ฿
                        {Number(item.unit_price).toLocaleString()}
                      </p>
                      {item.remarks && (
                        <p className="text-[10px] text-amber-700 bg-amber-50 inline-block px-2 py-0.5 rounded mt-2 font-bold">
                          📝 {item.remarks}
                        </p>
                      )}
                    </div>
                    <p className="text-sm font-black text-slate-900">
                      ฿{Number(item.total_price).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
                ยอดรวม
              </span>
              <span className="text-2xl font-black">
                ฿{Number(request.total_amount).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Description */}
          {request.description && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-3">
                รายละเอียดเพิ่มเติม
              </h2>
              <p className="text-sm text-slate-700 font-bold whitespace-pre-wrap">
                {request.description}
              </p>
            </div>
          )}

          {/* Attachments */}
          {request.attachments && request.attachments.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-3">
                ไฟล์เเนบ
              </h2>
              <div className="space-y-2">
                {request.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/attachments/${att.file_path}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all"
                  >
                    <FileText size={18} className="text-slate-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">
                        {att.file_name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold">
                        {(att.file_size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Timeline + Print */}
        <div className="space-y-6">
          {/* Print button */}
          <button
            onClick={() => setCurrentPage("print")}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-700 transition-all"
          >
            <Printer size={16} /> พิมพ์เอกสาร
          </button>

          {/* Approval Flow Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">
              ลำดับการอนุมัติ
            </h2>
            <div className="space-y-3">
              {APPROVAL_FLOW.map((role, idx) => {
                const approval = request.approvals?.find(
                  (a) => a.approver_role === role
                );
                const isCurrent = request.current_approver_role === role;
                const isPending = !approval && !isCurrent;

                return (
                  <div key={role} className="flex items-start gap-3">
                    <div className="relative">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                          approval?.action === "approved"
                            ? "bg-green-500 text-white"
                            : approval?.action === "rejected"
                            ? "bg-red-500 text-white"
                            : isCurrent
                            ? "bg-amber-500 text-white animate-pulse"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {approval?.action === "approved" ? (
                          <CheckCircle size={14} />
                        ) : approval?.action === "rejected" ? (
                          <XCircle size={14} />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      {idx < APPROVAL_FLOW.length - 1 && (
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-slate-200" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          isCurrent ? "text-amber-600" : "text-slate-500"
                        }`}
                      >
                        {isCurrent && "⏳ "} {role}
                      </p>
                      {approval ? (
                        <>
                          <p className="text-sm font-bold text-slate-900 mt-0.5">
                            {approval.approver?.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold">
                            {new Date(approval.created_at).toLocaleString(
                              "th-TH"
                            )}
                          </p>
                          {approval.comment && (
                            <p className="text-xs text-slate-600 font-bold mt-1 bg-slate-50 p-2 rounded-lg">
                              💬 {approval.comment}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-xs text-slate-400 font-bold mt-0.5">
                          {isCurrent ? "รอดำเนินการ" : "ยังไม่ถึงคิว"}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Approve Modal */}
      {showApprove && (
        <Modal
          title="ยืนยันการอนุมัติ"
          color="green"
          icon={CheckCircle}
          comment={comment}
          setComment={setComment}
          commentLabel="ความคิดเห็น (ไม่บังคับ)"
          onCancel={() => setShowApprove(false)}
          onConfirm={handleApprove}
          confirmLabel="อนุมัติ"
          submitting={submitting}
        />
      )}

      {/* Reject Modal */}
      {showReject && (
        <Modal
          title="ปฏิเสธคำขอ"
          color="red"
          icon={XCircle}
          comment={comment}
          setComment={setComment}
          commentLabel="เหตุผล (จำเป็น) *"
          required
          onCancel={() => setShowReject(false)}
          onConfirm={handleReject}
          confirmLabel="ยืนยันการปฏิเสธ"
          submitting={submitting}
        />
      )}
    </div>
  );
}

function Modal({
  title,
  color,
  icon: Icon,
  comment,
  setComment,
  commentLabel,
  onCancel,
  onConfirm,
  confirmLabel,
  submitting,
  required,
}) {
  const colorMap = {
    green: "bg-green-600 hover:bg-green-700 shadow-green-200",
    red: "bg-red-600 hover:bg-red-700 shadow-red-200",
  };
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-slide-up">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            color === "green" ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <Icon
            size={28}
            className={color === "green" ? "text-green-600" : "text-red-600"}
          />
        </div>
        <h2 className="text-xl font-black text-center text-slate-900 mb-6">
          {title}
        </h2>
        <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-widest">
          {commentLabel}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder={required ? "ระบุเหตุผล..." : "ระบุความคิดเห็น..."}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none"
        />
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 bg-white border-2 border-slate-200 text-slate-600 font-black py-3 rounded-xl text-sm uppercase tracking-widest hover:border-slate-400"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting || (required && !comment.trim())}
            className={`flex-1 text-white font-black py-3 rounded-xl text-sm uppercase tracking-widest shadow-lg transition-all disabled:opacity-50 ${colorMap[color]}`}
          >
            {submitting ? "กำลังบันทึก..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
