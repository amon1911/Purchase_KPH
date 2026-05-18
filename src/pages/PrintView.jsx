import React, { useState, useEffect } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { getRequestById } from "../lib/requests";
import { LOGO_URL, STATUS_LABELS, APPROVAL_FLOW } from "../config/roles";

export default function PrintView({ requestId, setCurrentPage }) {
  const [request, setRequest] = useState(null);

  useEffect(() => {
    getRequestById(requestId).then(setRequest);
  }, [requestId]);

  if (!request) {
    return (
      <div className="p-10 text-center text-slate-400 font-bold">
        กำลังโหลด...
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen">
      {/* Toolbar - hidden when printing */}
      <div className="no-print bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={() => setCurrentPage("detail")}
          className="flex items-center gap-2 text-sm font-black text-slate-500 hover:text-slate-900 uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> กลับ
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-red-700"
        >
          <Printer size={16} /> พิมพ์
        </button>
      </div>

      {/* Print area */}
      <div className="max-w-[210mm] mx-auto my-8 bg-white shadow-2xl p-12 print:shadow-none print:my-0 print:p-8">
        {/* Header */}
        <div className="border-b-4 border-slate-900 pb-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <img src={LOGO_URL} alt="Logo" className="h-16 object-contain" />
            <div className="text-right">
              <h1 className="text-2xl font-black text-slate-900">
                ใบขอจัดซื้อจัดจ้าง
              </h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Purchase Request
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs font-bold uppercase text-slate-500">
                เลขที่:
              </span>
              <span className="font-black ml-2">{request.doc_number}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold uppercase text-slate-500">
                วันที่:
              </span>
              <span className="font-black ml-2">
                {new Date(request.created_at).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* General Info */}
        <table className="w-full mb-6 text-sm">
          <tbody>
            <tr>
              <td className="font-bold text-slate-500 w-32 py-1.5">หัวข้อ:</td>
              <td className="font-bold">{request.title}</td>
            </tr>
            <tr>
              <td className="font-bold text-slate-500 py-1.5">โครงการ:</td>
              <td className="font-bold">{request.project_name || "-"}</td>
            </tr>
            <tr>
              <td className="font-bold text-slate-500 py-1.5">สถานที่:</td>
              <td className="font-bold">{request.project_location || "-"}</td>
            </tr>
            <tr>
              <td className="font-bold text-slate-500 py-1.5">
                ผู้ขอจัดซื้อ:
              </td>
              <td className="font-bold">
                {request.creator?.name} ({request.creator?.role})
              </td>
            </tr>
            <tr>
              <td className="font-bold text-slate-500 py-1.5">
                วันที่ต้องการใช้:
              </td>
              <td className="font-bold">
                {request.required_date
                  ? new Date(request.required_date).toLocaleDateString("th-TH")
                  : "-"}
              </td>
            </tr>
            <tr>
              <td className="font-bold text-slate-500 py-1.5">สถานะ:</td>
              <td className="font-black uppercase">
                {STATUS_LABELS[request.status]}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Items table */}
        <table className="w-full border-collapse mb-6 text-sm">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="border border-slate-900 p-2 text-left">#</th>
              <th className="border border-slate-900 p-2 text-left">รายการ</th>
              <th className="border border-slate-900 p-2 text-right w-20">
                จำนวน
              </th>
              <th className="border border-slate-900 p-2 text-left w-20">
                หน่วย
              </th>
              <th className="border border-slate-900 p-2 text-right w-28">
                ราคา/หน่วย
              </th>
              <th className="border border-slate-900 p-2 text-right w-32">
                รวม
              </th>
            </tr>
          </thead>
          <tbody>
            {request.items?.map((item, idx) => (
              <tr key={item.id}>
                <td className="border border-slate-300 p-2">{idx + 1}</td>
                <td className="border border-slate-300 p-2">
                  <p className="font-bold">{item.item_name}</p>
                  {item.description && (
                    <p className="text-xs text-slate-500">{item.description}</p>
                  )}
                  {item.remarks && (
                    <p className="text-xs text-amber-700 mt-1">
                      หมายเหตุ: {item.remarks}
                    </p>
                  )}
                </td>
                <td className="border border-slate-300 p-2 text-right">
                  {Number(item.quantity).toLocaleString()}
                </td>
                <td className="border border-slate-300 p-2">{item.unit}</td>
                <td className="border border-slate-300 p-2 text-right">
                  {Number(item.unit_price).toLocaleString()}
                </td>
                <td className="border border-slate-300 p-2 text-right font-bold">
                  {Number(item.total_price).toLocaleString()}
                </td>
              </tr>
            ))}
            <tr className="bg-slate-100 font-black">
              <td colSpan={5} className="border border-slate-300 p-2 text-right">
                ยอดรวมทั้งสิ้น
              </td>
              <td className="border border-slate-300 p-2 text-right text-lg">
                ฿{Number(request.total_amount).toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>

        {request.description && (
          <div className="mb-6 text-sm">
            <p className="font-bold text-slate-500 mb-1">รายละเอียดเพิ่มเติม:</p>
            <p className="font-bold">{request.description}</p>
          </div>
        )}

        {/* Signature box */}
        <div className="grid grid-cols-5 gap-3 mt-12 pt-6 border-t border-slate-300 text-xs">
          {APPROVAL_FLOW.map((role) => {
            const approval = request.approvals?.find(
              (a) => a.approver_role === role
            );
            return (
              <div key={role} className="text-center">
                <p className="font-bold text-slate-500 uppercase tracking-widest text-[10px] mb-12">
                  {role}
                </p>
                <div className="border-t border-slate-400 pt-2">
                  {approval ? (
                    <>
                      <p className="font-bold">{approval.approver?.name}</p>
                      <p className="text-[9px] text-slate-500">
                        {new Date(approval.created_at).toLocaleDateString(
                          "th-TH"
                        )}
                      </p>
                      <p
                        className={`text-[9px] font-black uppercase mt-1 ${
                          approval.action === "approved"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {approval.action === "approved" ? "✓ อนุมัติ" : "✗ ปฏิเสธ"}
                      </p>
                    </>
                  ) : (
                    <p className="text-slate-400 text-[10px]">รอดำเนินการ</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-4 border-t border-slate-200 text-[10px] text-slate-400 text-center font-bold">
          KPH Sourcing Management Portal • พิมพ์เมื่อ{" "}
          {new Date().toLocaleString("th-TH")}
        </div>
      </div>
    </div>
  );
}
