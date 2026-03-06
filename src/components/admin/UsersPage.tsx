"use client";

// ═══════════════════════════════════════════════════════════════
// UsersPage — Admin Team Management (production-ready)
//
// Tabs: Equipo, Roles, Actividad
// Features: CRUD users with employee data, roles with module
// permissions, audit log, Supabase tables
// Zero mock data
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Users, Shield, ScrollText, Plus, Search, ChevronDown, ChevronRight,
  Edit3, X, Mail, Trash2, Clock, Filter, Download,
  UserPlus, Lock, AlertTriangle, Loader2, Check, Eye, EyeOff,
  Building, Phone, Calendar, CreditCard, FileText, Save,
} from "lucide-react";
import { toast } from "sonner";
import {
  AdminUser, AdminRole, AuditEntry, UserFormData, UserStatus,
  AccessLevel, USER_STATUS_CONFIG, ACCESS_LEVELS, DEPARTMENTS,
  ADMIN_MODULES, DEFAULT_USER_FORM, fmtDate, fmtDateTime,
} from "./users/types";

type TabId = "team" | "roles" | "audit";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "team", label: "Equipo", icon: Users },
  { id: "roles", label: "Roles", icon: Shield },
  { id: "audit", label: "Actividad", icon: ScrollText },
];

export const UsersPage: React.FC = () => {
  const [tab, setTab] = useState<TabId>("team");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [uRes, rRes, aRes] = await Promise.all([
        fetch("/api/admin/users").then(r => r.ok ? r.json() : null),
        fetch("/api/admin/users?action=roles").then(r => r.ok ? r.json() : null),
        fetch("/api/admin/users?action=audit&limit=50").then(r => r.ok ? r.json() : null),
      ]);
      if (uRes) setUsers(uRes.users || []);
      if (rRes) setRoles(rRes.roles || []);
      if (aRes) setAudit(aRes.audit || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => {
    let list = users;
    if (statusFilter !== "all") list = list.filter(u => u.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q) ||
        u.position.toLowerCase().includes(q)
      );
    }
    return list;
  }, [users, statusFilter, search]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.status === "active").length,
    invited: users.filter(u => u.status === "invited").length,
    departments: [...new Set(users.map(u => u.department).filter(Boolean))].length,
  }), [users]);

  const handleStatusChange = async (userId: string, status: UserStatus) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_status", user_id: userId, status }),
      });
      if ((await res.json()).success) { toast.success("Estado actualizado"); fetchData(); }
    } catch { toast.error("Error"); }
  };

  const handleDelete = async (userId: string, name: string) => {
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, { method: "DELETE" });
      if ((await res.json()).success) { toast.success(`${name} eliminado`); fetchData(); }
    } catch { toast.error("Error"); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg text-wood-900 flex items-center gap-2">
          <Users size={20} className="text-accent-gold" /> Gestión de Equipo
        </h3>
        <button onClick={() => { setEditingUser(null); setShowForm(true); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-wood-900 text-sand-100 text-xs rounded-lg hover:bg-wood-800">
          <UserPlus size={14} /> Agregar Usuario
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={<Users size={14} />} iconCls="text-accent-gold bg-accent-gold/10" value={String(stats.total)} label="Total usuarios" />
        <KpiCard icon={<Check size={14} />} iconCls="text-green-600 bg-green-50" value={String(stats.active)} label="Activos" />
        <KpiCard icon={<Mail size={14} />} iconCls="text-blue-600 bg-blue-50" value={String(stats.invited)} label="Invitados" />
        <KpiCard icon={<Building size={14} />} iconCls="text-purple-600 bg-purple-50" value={String(stats.departments)} label="Departamentos" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg transition-colors ${
                tab === t.id ? "bg-wood-900 text-sand-100" : "bg-white text-wood-600 hover:bg-sand-50 border border-wood-100"
              }`}>
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading && users.length === 0 ? (
        <div className="bg-white rounded-xl border border-wood-100 p-12 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-wood-300" />
        </div>
      ) : (
        <>
          {tab === "team" && (
            <TeamTab users={filtered} roles={roles} search={search} onSearch={setSearch}
              statusFilter={statusFilter} onStatusFilter={setStatusFilter}
              onEdit={u => { setEditingUser(u); setShowForm(true); }}
              onStatusChange={handleStatusChange} onDelete={handleDelete} />
          )}
          {tab === "roles" && <RolesTab roles={roles} onRefresh={fetchData} />}
          {tab === "audit" && <AuditTab entries={audit} />}
        </>
      )}

      {/* User Form Modal */}
      <AnimatePresence>
        {showForm && (
          <UserFormModal
            user={editingUser}
            roles={roles}
            onClose={() => { setShowForm(false); setEditingUser(null); }}
            onSaved={() => { setShowForm(false); setEditingUser(null); fetchData(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ═══════ KPI CARD ═══════
const KpiCard: React.FC<{ icon: React.ReactNode; iconCls: string; value: string; label: string }> = ({ icon, iconCls, value, label }) => (
  <div className="bg-white rounded-xl border border-wood-100 shadow-sm p-4">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconCls} mb-2`}>{icon}</div>
    <p className="text-lg text-wood-900">{value}</p>
    <p className="text-[10px] text-wood-400 uppercase tracking-wider">{label}</p>
  </div>
);

// ═══════ TEAM TAB ═══════
const TeamTab: React.FC<{
  users: AdminUser[]; roles: AdminRole[]; search: string; onSearch: (s: string) => void;
  statusFilter: UserStatus | "all"; onStatusFilter: (s: UserStatus | "all") => void;
  onEdit: (u: AdminUser) => void;
  onStatusChange: (id: string, status: UserStatus) => void;
  onDelete: (id: string, name: string) => void;
}> = ({ users, search, onSearch, statusFilter, onStatusFilter, onEdit, onStatusChange, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-wood-400" />
          <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Buscar por nombre, email, departamento..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-wood-200 rounded-lg text-xs outline-none focus:border-wood-400" />
        </div>
        <div className="flex gap-1.5">
          {(["all", "active", "invited", "inactive", "suspended"] as const).map(s => (
            <button key={s} onClick={() => onStatusFilter(s)}
              className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${
                statusFilter === s ? "bg-wood-900 text-sand-100 border-wood-900" : "bg-white text-wood-500 border-wood-100 hover:border-wood-300"
              }`}>
              {s === "all" ? "Todos" : USER_STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-xl border border-wood-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="text-[10px] text-wood-400 uppercase tracking-wider border-b border-wood-100 bg-sand-50/50">
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Departamento</th>
                <th className="px-4 py-3">Puesto</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Último acceso</th>
                <th className="px-4 py-3">Desde</th>
                <th className="px-4 py-3 w-20">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-50">
              {users.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-xs text-wood-400">Sin usuarios</td></tr>
              ) : users.map(u => {
                const statusCfg = USER_STATUS_CONFIG[u.status];
                return (
                  <tr key={u.id} className="hover:bg-sand-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-accent-gold/10 flex items-center justify-center text-xs font-bold text-accent-gold">
                          {u.full_name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-wood-900">{u.full_name}</p>
                          <p className="text-[10px] text-wood-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${u.role_color}15`, color: u.role_color }}>
                        {u.role_name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-wood-500">{u.department}</td>
                    <td className="px-4 py-3 text-xs text-wood-500">{u.position || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-fit ${statusCfg.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} /> {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-wood-400">
                      {u.last_access ? fmtDateTime(u.last_access) : "Nunca"}
                    </td>
                    <td className="px-4 py-3 text-[10px] text-wood-400">{fmtDate(u.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => onEdit(u)} className="p-1.5 rounded-md hover:bg-sand-50 text-wood-400 hover:text-accent-gold" title="Editar">
                          <Edit3 size={12} />
                        </button>
                        {u.status === "active" ? (
                          <button onClick={() => onStatusChange(u.id, "suspended")} className="p-1.5 rounded-md hover:bg-red-50 text-wood-400 hover:text-red-500" title="Suspender">
                            <Lock size={12} />
                          </button>
                        ) : u.status === "suspended" ? (
                          <button onClick={() => onStatusChange(u.id, "active")} className="p-1.5 rounded-md hover:bg-green-50 text-wood-400 hover:text-green-600" title="Reactivar">
                            <Check size={12} />
                          </button>
                        ) : null}
                        {confirmDelete === u.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => { onDelete(u.id, u.full_name); setConfirmDelete(null); }}
                              className="p-1 rounded bg-red-500 text-white"><Check size={10} /></button>
                            <button onClick={() => setConfirmDelete(null)}
                              className="p-1 rounded bg-wood-200 text-wood-600"><X size={10} /></button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDelete(u.id)} className="p-1.5 rounded-md hover:bg-red-50 text-wood-400 hover:text-red-500" title="Eliminar">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ═══════ ROLES TAB ═══════
const RolesTab: React.FC<{ roles: AdminRole[]; onRefresh: () => void }> = ({ roles, onRefresh }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map(role => {
          const isExpanded = expandedId === role.id;
          const perms = (role.permissions || {}) as Record<string, string>;
          return (
            <div key={role.id} className="bg-white rounded-xl border border-wood-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-sand-50/50"
                onClick={() => setExpandedId(isExpanded ? null : role.id)}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${role.color}15` }}>
                  <Shield size={14} style={{ color: role.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-wood-900">{role.name}</p>
                  <p className="text-[10px] text-wood-400">{role.description} · {role.user_count} usuario{role.user_count !== 1 ? "s" : ""}</p>
                </div>
                {isExpanded ? <ChevronDown size={14} className="text-wood-400" /> : <ChevronRight size={14} className="text-wood-400" />}
              </div>
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-wood-50 pt-3">
                  <p className="text-[10px] font-bold text-wood-400 uppercase tracking-wider mb-2">Permisos por módulo</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ADMIN_MODULES.map(mod => {
                      const level = (perms[mod.id] || "none") as AccessLevel;
                      const cfg = ACCESS_LEVELS.find(a => a.value === level);
                      return (
                        <div key={mod.id} className="flex items-center justify-between px-2 py-1.5 bg-sand-50 rounded text-[10px]">
                          <span className="text-wood-600">{mod.label}</span>
                          <span className={`font-bold ${cfg?.cls || "text-gray-400"}`}>{cfg?.label || "—"}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-wood-100">
                    <span className="text-[10px] text-wood-400">Alcance: <span className="text-wood-600 font-bold">{role.scope === "all" ? "Global" : role.scope === "own" ? "Propio" : "Equipo"}</span></span>
                    {role.is_default && <span className="text-[9px] px-1.5 py-0.5 bg-accent-gold/10 text-accent-gold rounded-full font-bold">Default</span>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ═══════ AUDIT TAB ═══════
const AuditTab: React.FC<{ entries: AuditEntry[] }> = ({ entries }) => {
  const [auditSearch, setAuditSearch] = useState("");
  const filtered = useMemo(() => {
    if (!auditSearch) return entries;
    const q = auditSearch.toLowerCase();
    return entries.filter(e => e.user_name.toLowerCase().includes(q) || e.action.toLowerCase().includes(q) || e.module.toLowerCase().includes(q) || e.detail.toLowerCase().includes(q));
  }, [entries, auditSearch]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-wood-400" />
        <input value={auditSearch} onChange={e => setAuditSearch(e.target.value)} placeholder="Buscar en actividad..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-wood-200 rounded-lg text-xs outline-none focus:border-wood-400" />
      </div>
      <div className="bg-white rounded-xl border border-wood-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="text-[10px] text-wood-400 uppercase tracking-wider border-b border-wood-100 bg-sand-50/50">
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Acción</th>
                <th className="px-4 py-3">Módulo</th>
                <th className="px-4 py-3">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-xs text-wood-400">Sin actividad registrada</td></tr>
              ) : filtered.map(e => (
                <tr key={e.id} className="hover:bg-sand-50/50">
                  <td className="px-4 py-3 text-[10px] text-wood-400 whitespace-nowrap">{fmtDateTime(e.created_at)}</td>
                  <td className="px-4 py-3 text-xs text-wood-900">{e.user_name || e.user_email}</td>
                  <td className="px-4 py-3 text-xs text-wood-600">{e.action.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-xs text-wood-500">{e.module}</td>
                  <td className="px-4 py-3 text-[11px] text-wood-500 max-w-[300px] truncate">{e.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ═══════ USER FORM MODAL ═══════
const UserFormModal: React.FC<{
  user: AdminUser | null;
  roles: AdminRole[];
  onClose: () => void;
  onSaved: () => void;
}> = ({ user, roles, onClose, onSaved }) => {
  const isEdit = !!user;
  const [form, setForm] = useState<UserFormData>(() => {
    if (!user) return DEFAULT_USER_FORM;
    return {
      email: user.email, full_name: user.full_name, phone: user.phone,
      role_id: user.role_id, department: user.department, position: user.position,
      hire_date: user.hire_date || "", birth_date: user.birth_date || "",
      emergency_contact: user.emergency_contact, emergency_phone: user.emergency_phone,
      address: user.address, rfc: user.rfc, curp: user.curp, nss: user.nss,
      bank_name: user.bank_name, bank_clabe: user.bank_clabe, notes: user.notes,
    };
  });
  const [saving, setSaving] = useState(false);
  const [section, setSection] = useState<"general" | "personal" | "fiscal">("general");

  const update = (key: keyof UserFormData, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (!form.email || !form.full_name) { toast.error("Email y nombre son requeridos"); return; }
    if (!form.email.includes("@")) { toast.error("Email inválido"); return; }
    setSaving(true);
    try {
      if (isEdit) {
        const res = await fetch("/api/admin/users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update_user", user_id: user.id, ...form }),
        });
        if ((await res.json()).success) { toast.success("Usuario actualizado"); onSaved(); }
        else toast.error("Error al actualizar");
      } else {
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create_user", ...form }),
        });
        const data = await res.json();
        if (data.success) { toast.success("Usuario creado"); onSaved(); }
        else toast.error(data.error || "Error al crear");
      }
    } catch { toast.error("Error de conexión"); }
    finally { setSaving(false); }
  };

  const sectionTabs = [
    { id: "general" as const, label: "General", icon: Users },
    { id: "personal" as const, label: "Datos personales", icon: FileText },
    { id: "fiscal" as const, label: "Fiscal / Bancario", icon: CreditCard },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4 overflow-y-auto pt-12" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-wood-100">
          <h4 className="text-sm font-bold text-wood-900 flex items-center gap-2">
            <UserPlus size={16} className="text-accent-gold" />
            {isEdit ? `Editar: ${user.full_name}` : "Nuevo Usuario"}
          </h4>
          <button onClick={onClose} className="text-wood-400 hover:text-wood-700"><X size={18} /></button>
        </div>

        {/* Section tabs */}
        <div className="flex items-center gap-1 px-6 pt-4">
          {sectionTabs.map(s => {
            const Icon = s.icon;
            return (
              <button key={s.id} onClick={() => setSection(s.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-lg transition-colors ${
                  section === s.id ? "bg-wood-900 text-sand-100" : "text-wood-500 hover:bg-sand-50"
                }`}>
                <Icon size={12} /> {s.label}
              </button>
            );
          })}
        </div>

        {/* Form */}
        <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {section === "general" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nombre completo *" value={form.full_name} onChange={v => update("full_name", v)} />
                <Field label="Email *" value={form.email} onChange={v => update("email", v)} disabled={isEdit} type="email" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Teléfono" value={form.phone} onChange={v => update("phone", v)} />
                <div>
                  <label className="text-[10px] font-bold text-wood-400 uppercase block mb-1">Rol</label>
                  <select value={form.role_id} onChange={e => update("role_id", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-sand-50 border border-wood-200 rounded-lg outline-none">
                    <option value="">Sin rol</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-wood-400 uppercase block mb-1">Departamento</label>
                  <select value={form.department} onChange={e => update("department", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-sand-50 border border-wood-200 rounded-lg outline-none">
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <Field label="Puesto" value={form.position} onChange={v => update("position", v)} />
              </div>
              <Field label="Notas internas" value={form.notes} onChange={v => update("notes", v)} multiline />
            </>
          )}

          {section === "personal" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Fecha de contratación" value={form.hire_date} onChange={v => update("hire_date", v)} type="date" />
                <Field label="Fecha de nacimiento" value={form.birth_date} onChange={v => update("birth_date", v)} type="date" />
              </div>
              <Field label="Dirección" value={form.address} onChange={v => update("address", v)} multiline />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Contacto de emergencia" value={form.emergency_contact} onChange={v => update("emergency_contact", v)} />
                <Field label="Tel. emergencia" value={form.emergency_phone} onChange={v => update("emergency_phone", v)} />
              </div>
            </>
          )}

          {section === "fiscal" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="RFC" value={form.rfc} onChange={v => update("rfc", v)} placeholder="XAXX010101000" />
                <Field label="CURP" value={form.curp} onChange={v => update("curp", v)} placeholder="XAXX010101HXXXXX00" />
              </div>
              <Field label="NSS (IMSS)" value={form.nss} onChange={v => update("nss", v)} placeholder="00000000000" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Banco" value={form.bank_name} onChange={v => update("bank_name", v)} placeholder="BBVA, Banorte..." />
                <Field label="CLABE interbancaria" value={form.bank_clabe} onChange={v => update("bank_clabe", v)} placeholder="18 dígitos" />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-wood-100">
          <button onClick={onClose} className="px-4 py-2 text-xs text-wood-500">Cancelar</button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-accent-gold text-wood-900 text-xs font-bold rounded-lg hover:shadow-lg disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Guardando..." : isEdit ? "Guardar Cambios" : "Crear Usuario"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ═══════ FIELD HELPER ═══════
const Field: React.FC<{
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; disabled?: boolean; multiline?: boolean;
}> = ({ label, value, onChange, type = "text", placeholder, disabled, multiline }) => (
  <div>
    <label className="text-[10px] font-bold text-wood-400 uppercase block mb-1">{label}</label>
    {multiline ? (
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 text-sm bg-sand-50 border border-wood-200 rounded-lg outline-none focus:border-accent-gold resize-none h-20" />
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
        className="w-full px-3 py-2.5 text-sm bg-sand-50 border border-wood-200 rounded-lg outline-none focus:border-accent-gold disabled:opacity-50" />
    )}
  </div>
);

export default UsersPage;
