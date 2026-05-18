import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Save,
  Building,
  MapPin,
  Calendar,
  Upload,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { createRequest, uploadAttachment } from "../lib/requests";

export default function CreateRequest({ currentUser, setCurrentPage }) {
  const [title, setTitle] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [requiredDate, setRequiredDate] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState([
    { item_name: "", description: "", quantity: 1, unit: "pcs", unit_price: 0, remarks: "" },
  ]);
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const total = items.reduce(
    (sum, item) =>
      sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0),
    0
  );

  const updateItem = (idx, field, value) => {
    const newItems = [...items];
    newItems[idx][field] = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      { item_name: "", description: "", quantity: 1, unit: "pcs", unit_price: 0, remarks: "" },
    ]);
  };

  const removeItem = (idx) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("กรุณาระบุหัวข้อคำขอ");
      return;
    }
    if (items.some((i) => !i.item_name.trim())) {
      setError("กรุณาระบุชื่อรายการสินค้าให้ครบทุกรายการ");
      return;
    }

    setSaving(true);
    try {
      const newReq = await createRequest({
        request: {
          title: title.trim(),
          project_name: projectName.trim() || null,
          project_location: projectLocation.trim() || null,
          description: description.trim() || null,
          required_date: requiredDate || null,
        },
        items,
        createdBy: currentUser,
      });

      // Upload files
      for (const file of files) {
        await uploadAttachment({
          requestId: newReq.id,
          file,
          user: currentUser,
        });
      }

      setSuccess(true);
      setTimeout(() => {
        setCurrentPage("list");
      }, 1500);
    } catch (err) {
      setError(err.message || "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="p-10 flex items-center justify-center min-h-[60vh]">
        <div className="bg-white border-2 border-green-200 rounded-3xl p-10 max-w-md text-center shadow-xl">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            บันทึกสำเร็จ!
          </h2>
          <p className="text-sm text-slate-500 font-bold">
            กำลังพาคุณไปดูรายการคำขอ...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          สร้างคำขอจัดซื้อ
        </h1>
        <p className="text-sm text-slate-500 font-bold mt-1">
          กรอกข้อมูลให้ครบ คำขอจะถูกส่งไปยัง Supervisor เพื่อพิจารณา
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 border-b border-slate-100 pb-3">
            ข้อมูลทั่วไป
          </h2>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-widest">
              หัวข้อคำขอ <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น จัดซื้อวัสดุงานติดตั้ง"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 mb-2 tracking-widest flex items-center gap-1.5">
                <Building size={12} /> ชื่อโครงการ
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="ชื่อโครงการ..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 mb-2 tracking-widest flex items-center gap-1.5">
                <MapPin size={12} /> สถานที่
              </label>
              <input
                type="text"
                value={projectLocation}
                onChange={(e) => setProjectLocation(e.target.value)}
                placeholder="สถานที่..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-500 mb-2 tracking-widest flex items-center gap-1.5">
              <Calendar size={12} /> วันที่ต้องการใช้
            </label>
            <input
              type="date"
              value={requiredDate}
              onChange={(e) => setRequiredDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-widest">
              รายละเอียดเพิ่มเติม
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="คำอธิบายเพิ่มเติม..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none"
            />
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">
              รายการสินค้า/บริการ
            </h2>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1.5 text-xs font-black text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all uppercase tracking-widest"
            >
              <Plus size={14} /> เพิ่มรายการ
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                    รายการที่ {idx + 1}
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={item.item_name}
                  onChange={(e) =>
                    updateItem(idx, "item_name", e.target.value)
                  }
                  placeholder="ชื่อสินค้า/บริการ"
                  className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 tracking-wider">
                      จำนวน
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(idx, "quantity", e.target.value)
                      }
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 tracking-wider">
                      หน่วย
                    </label>
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => updateItem(idx, "unit", e.target.value)}
                      placeholder="pcs, kg, m"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 tracking-wider">
                      ราคา/หน่วย
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) =>
                        updateItem(idx, "unit_price", e.target.value)
                      }
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-sm font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 tracking-wider">
                      รวม
                    </label>
                    <div className="w-full bg-slate-900 text-white border border-slate-900 rounded-lg p-2.5 text-sm font-black text-right">
                      ฿
                      {(
                        (parseFloat(item.quantity) || 0) *
                        (parseFloat(item.unit_price) || 0)
                      ).toLocaleString()}
                    </div>
                  </div>
                </div>

                <input
                  type="text"
                  value={item.remarks}
                  onChange={(e) => updateItem(idx, "remarks", e.target.value)}
                  placeholder="หมายเหตุ (ถ้ามี)"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-bold focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                />
              </div>
            ))}
          </div>

          <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
              ยอดรวมทั้งหมด
            </span>
            <span className="text-2xl font-black">
              ฿{total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Attachments */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 border-b border-slate-100 pb-3 mb-4">
            ไฟล์เเนบ (ใบเสนอราคา, รูปสินค้า)
          </h2>
          <label className="block">
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-red-300 transition-all">
              <Upload className="mx-auto mb-2 text-slate-400" size={28} />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                คลิกเพื่อเลือกไฟล์
              </p>
              <p className="text-[10px] text-slate-400 font-bold mt-1">
                PDF, JPG, PNG (สูงสุด 10MB)
              </p>
            </div>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="hidden"
            />
          </label>
          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-slate-50 rounded-lg p-2.5 text-xs font-bold"
                >
                  <span className="truncate">{f.name}</span>
                  <span className="text-slate-400 ml-2">
                    {(f.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2 text-red-700 text-sm font-bold">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setCurrentPage("dashboard")}
            disabled={saving}
            className="px-6 py-3.5 rounded-xl bg-white border-2 border-slate-200 text-slate-600 font-black text-sm uppercase tracking-widest hover:border-slate-400 transition-all"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white font-black py-3.5 rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all text-sm tracking-widest uppercase disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? "กำลังบันทึก..." : "บันทึกเเละส่งอนุมัติ"}
          </button>
        </div>
      </form>
    </div>
  );
}
