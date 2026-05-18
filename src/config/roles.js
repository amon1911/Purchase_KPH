export const LOGO_URL =
  "https://kasetphandgroup.com/wp-content/uploads/2024/08/kasetphand-group.png";

export const ROLES = {
  ENGINEER: "Engineer Onsite (Philippines)",
  SUPERVISOR: "Supervisor",
  PROJECT_ANALYSIS: "Project Analysis",
  PROJECT_MANAGER: "Project Manager",
  PURCHASING: "Purchasing",
};

export const APPROVAL_FLOW = [
  ROLES.ENGINEER,
  ROLES.SUPERVISOR,
  ROLES.PROJECT_ANALYSIS,
  ROLES.PROJECT_MANAGER,
  ROLES.PURCHASING,
];

// หา role ถัดไปใน approval flow
export function getNextApprover(currentRole) {
  const idx = APPROVAL_FLOW.indexOf(currentRole);
  if (idx === -1 || idx >= APPROVAL_FLOW.length - 1) return null;
  return APPROVAL_FLOW[idx + 1];
}

// หา step number ของ role
export function getRoleStep(role) {
  return APPROVAL_FLOW.indexOf(role) + 1;
}

// สีประจำเเต่ละ role
export const ROLE_COLORS = {
  [ROLES.ENGINEER]: "bg-blue-100 text-blue-700 border-blue-200",
  [ROLES.SUPERVISOR]: "bg-purple-100 text-purple-700 border-purple-200",
  [ROLES.PROJECT_ANALYSIS]: "bg-amber-100 text-amber-700 border-amber-200",
  [ROLES.PROJECT_MANAGER]: "bg-orange-100 text-orange-700 border-orange-200",
  [ROLES.PURCHASING]: "bg-green-100 text-green-700 border-green-200",
};

// สี status
export const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700 border-amber-300",
  approved: "bg-green-100 text-green-700 border-green-300",
  rejected: "bg-red-100 text-red-700 border-red-300",
  cancelled: "bg-slate-100 text-slate-700 border-slate-300",
};

export const STATUS_LABELS = {
  pending: "รอดำเนินการ",
  approved: "อนุมัติเเล้ว",
  rejected: "ปฏิเสธ",
  cancelled: "ยกเลิก",
};
