/**
 * Deteksi aditif untuk Staff Checkin.
 * Alur lama (user_access -> Creator/Admin/Staff) TIDAK diubah.
 * Helper ini hanya membaca data.permissions[].role.name / role_id.
 */

export const STAFF_CHECKIN_LINK = "/dashboard/my-event/checkin";
export const STAFF_CHECKIN_ROLE_ID = 5;
export const STAFF_CHECKIN_ROLE_NAME = "staff checkin";

export function normalizeRoleName(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export function isStaffCheckinPermission(p: any): boolean {
  if (!p || typeof p !== "object") return false;
  const roleName: string =
    normalizeRoleName(p?.role?.name) || normalizeRoleName(p?.role_name);
  if (roleName === STAFF_CHECKIN_ROLE_NAME) return true;
  const roleId = Number(p?.role_id ?? p?.role?.id);
  if (Number.isFinite(roleId) && roleId === STAFF_CHECKIN_ROLE_ID) return true;
  return false;
}

export function getStaffRoleNames(permissions: any): string[] {
  if (!Array.isArray(permissions)) return [];
  const names = permissions
    .map((p: any) => p?.role?.name ?? p?.role_name)
    .filter((n: any) => typeof n === "string" && n.trim().length > 0)
    .map((n: string) => n.trim());
  return Array.from(new Set(names));
}

/**
 * Terima raw API array (res.data.permissions),
 * cookie baru (permissions: [{module_id, role_id, role_name}]),
 * cookie lama ([{module_id}]) -> false,
 * maupun object user ({permissions, isCheckinStaff}).
 */
export function isStaffCheckinUser(input: any): boolean {
  if (!input) return false;
  if (Array.isArray(input)) return input.some(isStaffCheckinPermission);
  if (typeof input === "object") {
    if (input.isCheckinStaff === true) return true;
    if (Array.isArray(input.permissions)) {
      return input.permissions.some(isStaffCheckinPermission);
    }
  }
  return false;
}
