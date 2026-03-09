"use client";

import React, { useState, useEffect } from 'react';
import {
  Target, Plus, TrendingUp, TrendingDown, DollarSign, Users,
  ShoppingBag, Star, BarChart3, Clock, CheckCircle, XCircle,
  AlertTriangle, Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { useThemeComponents } from '@/src/admin/hooks/useThemeComponents';

// ===== TYPES =====
type GoalStatus = 'on_track' | 'at_risk' | 'behind' | 'completed' | 'failed';
type GoalPeriod = 'monthly' | 'quarterly' | 'annual';
type GoalsTab = 'active' | 'create' | 'history' | 'ranking';

interface Goal {
  id: string;
  title: string;
  type: string;
  icon: React.ElementType;
  target: number;
  current: number;
  unit: string;
  prefix: string;
  period: GoalPeriod;
  periodLabel: string;
  deadline: string;
  status: GoalStatus;
  assignee: string | null;
  trend: number; // percentage trend vs last period
}

const statusConfig: Record<GoalStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  on_track: { label: 'En camino', color: 'text-green-600', bg: 'bg-green-50', icon: TrendingUp },
  at_risk: { label: 'En riesgo', color: 'text-amber-600', bg: 'bg-amber-50', icon: AlertTriangle },
  behind: { label: 'Atrasada', color: 'text-red-500', bg: 'bg-red-50', icon: TrendingDown },
  completed: { label: 'Completada', color: 'text-green-700', bg: 'bg-green-100', icon: CheckCircle },
  failed: { label: 'No cumplida', color: 'text-red-600', bg: 'bg-red-100', icon: XCircle },
};


const historicalGoals = [
  { period: 'Febrero 2026', goals: [
    { title: 'Ingresos', target: '$120,000', actual: '$132,400', met: true },
    { title: 'Pedidos', target: '45', actual: '48', met: true },
    { title: 'Clientes nuevos', target: '25', actual: '22', met: false },
    { title: 'Rating', target: '4.8', actual: '4.7', met: false },
  ]},
  { period: 'Enero 2026', goals: [
    { title: 'Ingresos', target: '$100,000', actual: '$115,200', met: true },
    { title: 'Pedidos', target: '40', actual: '42', met: true },
    { title: 'Clientes nuevos', target: '20', actual: '24', met: true },
    { title: 'Rating', target: '4.7', actual: '4.7', met: true },
  ]},
];

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={'bg-[var(--admin-surface)] rounded-xl border border-[var(--admin-border)] shadow-sm ' + className}>{children}</div>;
}

function ProgressRing({ pct, size = 48, strokeWidth = 4, color }: { pct: number; size?: number; strokeWidth?: number; color: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(pct, 100) / 100) * circumference;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" className="text-[var(--admin-muted)]" />
      <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="none"
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700" />
    </svg>
  );
}

// ===== GOAL CARD =====
function GoalCard({ goal }: { goal: Goal }) {
  const st = statusConfig[goal.status];
  const StIcon = st.icon;
  const pct = Math.min(Math.round((goal.current / goal.target) * 100), 100);
  const progressColor = pct >= 80 ? '#16A34A' : pct >= 50 ? '#F59E0B' : '#DC2626';

  // Calculate days remaining (mock)
  const daysLeft = Math.max(1, 30 - new Date().getDate());
  const pctTime = Math.round(((30 - daysLeft) / 30) * 100);

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--admin-accent)]/10 flex items-center justify-center">
            <goal.icon size={14} className="text-[var(--admin-accent)]" />
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--admin-text)]">{goal.title}</p>
            <p className="text-[10px] text-[var(--admin-muted)]">{goal.periodLabel}</p>
          </div>
        </div>
        <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${st.bg} ${st.color} flex items-center gap-0.5`}>
          <StIcon size={8} />{st.label}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div className="relative">
          <ProgressRing pct={pct} color={progressColor} />
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[var(--admin-text)]">{pct}%</span>
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-serif text-[var(--admin-text)]">{goal.prefix}{goal.current.toLocaleString()}</span>
            <span className="text-xs text-[var(--admin-muted)]">/ {goal.prefix}{goal.target.toLocaleString()}{goal.unit}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={'text-[10px] font-medium flex items-center gap-0.5 ' + (goal.trend >= 0 ? 'text-green-600' : 'text-red-500')}>
              {goal.trend >= 0 ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
              {goal.trend > 0 ? '+' : ''}{goal.trend}% vs periodo anterior
            </span>
          </div>
        </div>
      </div>

      {/* Time progress */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] text-[var(--admin-muted)]">Tiempo transcurrido</span>
          <span className="text-[9px] text-[var(--admin-muted)]">{daysLeft} dias restantes</span>
        </div>
        <div className="h-1 bg-[var(--admin-surface2)] rounded-full overflow-hidden">
          <div className="h-full bg-wood-300 rounded-full" style={{ width: pctTime + '%' }} />
        </div>
      </div>

      {/* Alert */}
      {pct < pctTime && goal.status !== 'completed' && (
        <div className="mt-3 p-2 bg-amber-50 rounded-lg flex items-start gap-2">
          <AlertTriangle size={10} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-[9px] text-amber-700">Estas al {pct}% de la meta con {pctTime}% del tiempo transcurrido</p>
        </div>
      )}

      {goal.assignee && (
        <p className="text-[9px] text-[var(--admin-muted)] mt-2 flex items-center gap-1">
          <Users size={8} /> Asignada a: <span className="text-[var(--admin-text-secondary)]">{goal.assignee}</span>
        </p>
      )}
    </Card>
  );
}

// ===== CREATE GOAL =====
function CreateGoalTab() {
  const goalTypes = [
    { value: 'revenue', label: 'Ingresos', unit: 'MXN', prefix: '$' },
    { value: 'orders', label: 'Pedidos', unit: 'pedidos', prefix: '' },
    { value: 'new_customers', label: 'Clientes nuevos', unit: 'clientes', prefix: '' },
    { value: 'rating', label: 'Rating promedio', unit: '/5', prefix: '' },
    { value: 'repeat_rate', label: 'Tasa de recompra', unit: '%', prefix: '' },
    { value: 'quotes_closed', label: 'Cotizaciones cerradas', unit: 'cotizaciones', prefix: '' },
    { value: 'margin', label: 'Margen de ganancia', unit: '%', prefix: '' },
    { value: 'conversion', label: 'Tasa de conversion', unit: '%', prefix: '' },
    { value: 'clv', label: 'CLV promedio', unit: 'MXN', prefix: '$' },
    { value: 'inventory', label: 'Valor de inventario', unit: 'MXN', prefix: '$' },
  ];

  return (
    <Card className="p-5">
      <h4 className="text-xs font-medium text-[var(--admin-text)] uppercase tracking-wider border-b border-[var(--admin-border)] pb-2 mb-4">Nueva meta</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider block mb-1">Tipo de meta</label>
          <select className="w-full border border-[var(--admin-border)] rounded-lg px-3 py-2 text-xs bg-[var(--admin-surface)]">
            {goalTypes.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider block mb-1">Titulo personalizado</label>
          <input placeholder="ej: Ingresos Marzo" className="w-full border border-[var(--admin-border)] rounded-lg px-3 py-2 text-xs outline-none" />
        </div>
        <div>
          <label className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider block mb-1">Target</label>
          <input type="number" placeholder="150000" className="w-full border border-[var(--admin-border)] rounded-lg px-3 py-2 text-xs outline-none" />
        </div>
        <div>
          <label className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider block mb-1">Periodo</label>
          <select className="w-full border border-[var(--admin-border)] rounded-lg px-3 py-2 text-xs bg-[var(--admin-surface)]">
            <option value="monthly">Mensual</option>
            <option value="quarterly">Trimestral</option>
            <option value="annual">Anual</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider block mb-1">Fecha limite</label>
          <input type="date" defaultValue="2026-03-31" className="w-full border border-[var(--admin-border)] rounded-lg px-3 py-2 text-xs bg-[var(--admin-surface)]" />
        </div>
        <div>
          <label className="text-[10px] text-[var(--admin-muted)] uppercase tracking-wider block mb-1">Asignar a (opcional)</label>
          <select className="w-full border border-[var(--admin-border)] rounded-lg px-3 py-2 text-xs bg-[var(--admin-surface)]">
            <option value="">— Todo el equipo —</option>
            <option>David (Admin)</option>
            <option>Carlos (Ventas)</option>
            <option>Sofia (Soporte)</option>
          </select>
        </div>
      </div>
      <button onClick={() => toast.success('Meta creada exitosamente')} className="mt-4 px-4 py-2 text-xs bg-[var(--admin-accent)] text-white rounded-lg hover:bg-[var(--admin-accent)]/90 flex items-center gap-1.5">
        <Plus size={12} /> Crear meta
      </button>
    </Card>
  );
}

// ===== HISTORY TAB =====
function HistoryTab() {
  return (
    <div className="space-y-4">
      {historicalGoals.map(h => (
        <Card key={h.period} className="p-5">
          <h4 className="text-xs font-medium text-[var(--admin-text)] mb-3 flex items-center gap-2">
            <Calendar size={12} className="text-[var(--admin-accent)]" /> {h.period}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {h.goals.map(g => (
              <div key={g.title} className={'p-3 rounded-lg border ' + (g.met ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50')}>
                <div className="flex items-center gap-1.5 mb-1">
                  {g.met ? <CheckCircle size={10} className="text-green-600" /> : <XCircle size={10} className="text-red-500" />}
                  <span className="text-[10px] font-medium text-[var(--admin-text)]">{g.title}</span>
                </div>
                <p className="text-xs text-[var(--admin-text)]">Meta: {g.target}</p>
                <p className={'text-xs font-medium ' + (g.met ? 'text-green-600' : 'text-red-500')}>Real: {g.actual}</p>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ===== RANKING TAB =====
function RankingTab() {
  const sellers = [
    { name: 'David (Admin)', goals: 4, completed: 4, pct: 100, revenue: '$115,200', avatar: 'DA' },
    { name: 'Carlos (Ventas)', goals: 3, completed: 2, pct: 67, revenue: '$68,400', avatar: 'CV' },
    { name: 'Sofia (Soporte)', goals: 2, completed: 1, pct: 50, revenue: '$24,800', avatar: 'SS' },
  ];

  return (
    <Card className="p-5">
      <h4 className="text-xs font-medium text-[var(--admin-text)] uppercase tracking-wider border-b border-[var(--admin-border)] pb-2 mb-4">Ranking de equipo — Marzo 2026</h4>
      <div className="space-y-4">
        {sellers.map((s, i) => (
          <div key={s.name} className="flex items-center gap-4">
            <span className={'text-sm font-bold w-6 text-center ' + (i === 0 ? 'text-[var(--admin-accent)]' : i === 1 ? 'text-[var(--admin-muted)]' : 'text-[var(--admin-muted)]')}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
            </span>
            <div className="w-9 h-9 rounded-full bg-[var(--admin-accent)]/20 flex items-center justify-center text-xs font-bold text-[var(--admin-accent)]">{s.avatar}</div>
            <div className="flex-1">
              <p className="text-xs font-medium text-[var(--admin-text)]">{s.name}</p>
              <p className="text-[10px] text-[var(--admin-muted)]">{s.completed}/{s.goals} metas cumplidas · {s.revenue} atribuidos</p>
            </div>
            <div className="w-20">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] font-medium text-[var(--admin-text)]">{s.pct}%</span>
              </div>
              <div className="h-1.5 bg-[var(--admin-surface2)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--admin-accent)] rounded-full" style={{ width: s.pct + '%' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ===== MAIN =====
export const GoalsOkrsPage: React.FC = () => {

  const { Card: TCard, Badge: TBadge, Button: TButton, Table: TTable, StatCard: TStatCard } = useThemeComponents();
  // ── Live data from API ──
  const [liveGoals, setLiveGoals] = useState<any>(null);
  const [goalsLoading, setGoalsLoading] = useState(true);
  useEffect(() => {
    fetch('/api/admin/goals').then(r => r.ok ? r.json() : null).then(d => { if (d) setLiveGoals(d); }).catch(() => {}).finally(() => setGoalsLoading(false));
  }, []);

  const [tab, setTab] = useState<GoalsTab>('active');

  const tabs: Array<{ id: GoalsTab; label: string; icon: React.ElementType }> = [
    { id: 'active', label: 'Metas activas', icon: Target },
    { id: 'history', label: 'Historial', icon: Clock },
  ];

  // Map API goals to Goal interface for cards
  const apiGoals: Goal[] = (liveGoals?.goals || []).map((g: any) => {
    const iconMap: Record<string, React.ElementType> = { 'rev-month': DollarSign, 'orders-month': ShoppingBag, 'avg-ticket': BarChart3, 'customers': Users, 'reviews': Star };
    const pct = g.progress || 0;
    const status: GoalStatus = pct >= 100 ? 'completed' : pct >= 70 ? 'on_track' : pct >= 40 ? 'at_risk' : 'behind';
    return {
      id: g.id,
      title: g.name,
      type: g.category,
      icon: iconMap[g.id] || Target,
      target: g.target,
      current: Math.round(g.actual * 100) / 100,
      unit: g.unit === 'MXN' ? '' : ` ${g.unit}`,
      prefix: g.unit === 'MXN' ? '$' : '',
      period: 'monthly' as GoalPeriod,
      periodLabel: new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }),
      deadline: `${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()} ${new Date().toLocaleDateString('es-MX', { month: 'short' })}`,
      status,
      assignee: null,
      trend: 0,
    };
  });

  const goals = apiGoals;

  // Summary stats
  const total = goals.length;
  const onTrack = goals.filter(g => g.status === 'on_track' || g.status === 'completed').length;
  const atRisk = goals.filter(g => g.status === 'at_risk').length;
  const behind = goals.filter(g => g.status === 'behind').length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-serif text-[var(--admin-text)] flex items-center gap-2">
            <Target size={20} className="text-[var(--admin-accent)]" /> Metas y OKRs
          </h1>
          <p className="text-xs text-[var(--admin-muted)] mt-0.5">Define objetivos, mide progreso y gestiona el desempeno del equipo</p>
        </div>
        <button onClick={() => setTab('create')} className="px-3 py-2 text-xs bg-[var(--admin-accent)] text-white rounded-lg hover:bg-[var(--admin-accent)]/90 transition-colors flex items-center gap-1.5">
          <Plus size={12} /> Nueva meta
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--admin-accent)]/10 flex items-center justify-center"><Target size={14} className="text-[var(--admin-accent)]" /></div>
          <div>
            <p className="text-lg font-serif text-[var(--admin-text)]">{total}</p>
            <p className="text-[10px] text-[var(--admin-muted)]">Total activas</p>
          </div>
        </Card>
        <Card className="p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center"><TrendingUp size={14} className="text-green-600" /></div>
          <div>
            <p className="text-lg font-serif text-green-600">{onTrack}</p>
            <p className="text-[10px] text-[var(--admin-muted)]">En camino</p>
          </div>
        </Card>
        <Card className="p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center"><AlertTriangle size={14} className="text-amber-600" /></div>
          <div>
            <p className="text-lg font-serif text-amber-600">{atRisk}</p>
            <p className="text-[10px] text-[var(--admin-muted)]">En riesgo</p>
          </div>
        </Card>
        <Card className="p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center"><TrendingDown size={14} className="text-red-500" /></div>
          <div>
            <p className="text-lg font-serif text-red-500">{behind}</p>
            <p className="text-[10px] text-[var(--admin-muted)]">Atrasadas</p>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--admin-border)]">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={'flex items-center gap-1.5 px-3 py-2.5 text-xs transition-colors border-b-2 ' + (tab === t.id ? 'border-[var(--admin-accent)] text-[var(--admin-accent)] font-medium' : 'border-transparent text-[var(--admin-text-secondary)] hover:text-[var(--admin-text)]')}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {tab === 'active' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map(g => <GoalCard key={g.id} goal={g} />)}
        </div>
      )}

      {tab === 'create' && <CreateGoalTab />}
      {tab === 'history' && <HistoryTab />}
      {tab === 'ranking' && <RankingTab />}
    </div>
  );
};