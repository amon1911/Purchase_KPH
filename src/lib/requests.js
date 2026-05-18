import { supabase } from "../lib/supabase";
import { APPROVAL_FLOW, getNextApprover } from "../config/roles";

// ============================================================
// USERS
// ============================================================
export async function getUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("id, name, role, is_active, created_at")
    .eq("is_active", true)
    .order("name");
  if (error) throw error;
  return data || [];
}

// ============================================================
// PURCHASE REQUESTS
// ============================================================
export async function listRequests({ search = "", status = null } = {}) {
  let query = supabase
    .from("purchase_requests")
    .select(
      `
      *,
      creator:created_by ( id, name, role ),
      items:request_items ( id, item_name, quantity, unit, unit_price, total_price ),
      approvals ( id, action, approver_role, created_at )
    `
    )
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (search) {
    query = query.or(
      `doc_number.ilike.%${search}%,title.ilike.%${search}%,project_name.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getRequestById(id) {
  const { data, error } = await supabase
    .from("purchase_requests")
    .select(
      `
      *,
      creator:created_by ( id, name, role ),
      items:request_items ( * ),
      approvals ( *, approver:approver_id ( name, role ) ),
      attachments ( * )
    `
    )
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createRequest({ request, items, createdBy }) {
  // สร้างคำขอ (doc_number generate อัตโนมัติจาก trigger)
  const { data: newRequest, error: e1 } = await supabase
    .from("purchase_requests")
    .insert({
      title: request.title,
      project_name: request.project_name,
      project_location: request.project_location,
      description: request.description,
      required_date: request.required_date || null,
      created_by: createdBy.id,
      // เริ่มที่ Supervisor (ข้าม Engineer เพราะ Engineer = คนสร้าง)
      current_approver_role: APPROVAL_FLOW[1],
      current_step: 2,
      status: "pending",
    })
    .select()
    .single();

  if (e1) throw e1;

  // เพิ่ม items
  if (items && items.length > 0) {
    const itemsToInsert = items.map((item, idx) => ({
      request_id: newRequest.id,
      item_name: item.item_name,
      description: item.description || null,
      quantity: parseFloat(item.quantity) || 1,
      unit: item.unit || "pcs",
      unit_price: parseFloat(item.unit_price) || 0,
      remarks: item.remarks || null,
      sort_order: idx,
    }));

    const { error: e2 } = await supabase
      .from("request_items")
      .insert(itemsToInsert);
    if (e2) throw e2;
  }

  // บันทึก action ของ Engineer (submission)
  await supabase.from("approvals").insert({
    request_id: newRequest.id,
    approver_id: createdBy.id,
    approver_role: createdBy.role,
    step: 1,
    action: "approved",
    comment: "สร้างคำขอ",
  });

  return newRequest;
}

export async function approveRequest({ requestId, approver, comment = "" }) {
  // ดึงข้อมูลคำขอปัจจุบัน
  const { data: req, error: e1 } = await supabase
    .from("purchase_requests")
    .select("*")
    .eq("id", requestId)
    .single();
  if (e1) throw e1;

  // เช็คว่า approver ตรงกับ current_approver_role
  if (req.current_approver_role !== approver.role) {
    throw new Error("คุณไม่มีสิทธิ์อนุมัติคำขอนี้ในขั้นนี้");
  }

  // บันทึก approval
  await supabase.from("approvals").insert({
    request_id: requestId,
    approver_id: approver.id,
    approver_role: approver.role,
    step: req.current_step,
    action: "approved",
    comment,
  });

  // หา role ถัดไป
  const nextRole = getNextApprover(approver.role);

  if (nextRole) {
    // ยังมีคิวต่อไป
    await supabase
      .from("purchase_requests")
      .update({
        current_approver_role: nextRole,
        current_step: req.current_step + 1,
      })
      .eq("id", requestId);
  } else {
    // เสร็จเเล้ว
    await supabase
      .from("purchase_requests")
      .update({
        status: "approved",
        current_approver_role: null,
        completed_at: new Date().toISOString(),
      })
      .eq("id", requestId);
  }

  return { success: true };
}

export async function rejectRequest({ requestId, approver, comment }) {
  if (!comment || !comment.trim()) {
    throw new Error("กรุณาระบุเหตุผลในการปฏิเสธ");
  }

  const { data: req, error: e1 } = await supabase
    .from("purchase_requests")
    .select("*")
    .eq("id", requestId)
    .single();
  if (e1) throw e1;

  if (req.current_approver_role !== approver.role) {
    throw new Error("คุณไม่มีสิทธิ์ปฏิเสธคำขอนี้");
  }

  await supabase.from("approvals").insert({
    request_id: requestId,
    approver_id: approver.id,
    approver_role: approver.role,
    step: req.current_step,
    action: "rejected",
    comment,
  });

  await supabase
    .from("purchase_requests")
    .update({
      status: "rejected",
      current_approver_role: null,
      completed_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  return { success: true };
}

export async function cancelRequest({ requestId, user }) {
  await supabase
    .from("purchase_requests")
    .update({
      status: "cancelled",
      current_approver_role: null,
      completed_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .eq("created_by", user.id); // เฉพาะคนสร้างเท่านั้น
}

// ============================================================
// ATTACHMENTS
// ============================================================
export async function uploadAttachment({ requestId, file, user }) {
  const ext = file.name.split(".").pop();
  const path = `${requestId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("attachments")
    .upload(path, file);
  if (uploadError) throw uploadError;

  const { data: publicUrl } = supabase.storage
    .from("attachments")
    .getPublicUrl(path);

  await supabase.from("attachments").insert({
    request_id: requestId,
    file_name: file.name,
    file_path: path,
    file_size: file.size,
    file_type: file.type,
    uploaded_by: user.id,
  });

  return publicUrl;
}

// ============================================================
// STATS / DASHBOARD
// ============================================================
export async function getStats(currentUser) {
  // นับคำขอเเต่ละสถานะ
  const { data: all } = await supabase
    .from("purchase_requests")
    .select("status, current_approver_role, created_by");

  if (!all) return { pending: 0, approved: 0, rejected: 0, myPending: 0, awaitingMe: 0 };

  return {
    pending: all.filter((r) => r.status === "pending").length,
    approved: all.filter((r) => r.status === "approved").length,
    rejected: all.filter((r) => r.status === "rejected").length,
    myPending: all.filter(
      (r) => r.created_by === currentUser.id && r.status === "pending"
    ).length,
    awaitingMe: all.filter(
      (r) =>
        r.status === "pending" && r.current_approver_role === currentUser.role
    ).length,
  };
}
