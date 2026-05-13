import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { DeleteUserButton } from "./DeleteUserButton";
import { SubscriptionButton } from "./SubscriptionButton";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "tradinggex@gmail.com";

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  tradeCount: number;
  hasPassword: boolean;
  oauthProviders: string[];
  subscriptionStatus: string | null;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
}

function fmt(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function timeAgo(iso: string | null): string {
  if (!iso) return "Nunca";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "Ahora";
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `hace ${days}d`;
  const months = Math.floor(days / 30);
  return `hace ${months} mes${months > 1 ? "es" : ""}`;
}

function subStatusBadge(row: UserRow) {
  const now = Date.now();
  const { subscriptionStatus, trialEndsAt, currentPeriodEnd } = row;

  if (subscriptionStatus === "active") {
    const isManualPro =
      currentPeriodEnd && new Date(currentPeriodEnd).getFullYear() >= 2099;
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold">
        {isManualPro ? "PRO (manual)" : "PRO"}
      </span>
    );
  }

  if (subscriptionStatus === "trialing") {
    const active = trialEndsAt && new Date(trialEndsAt).getTime() > now;
    return active ? (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 font-semibold">
        Prueba
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 font-semibold">
        Prueba expirada
      </span>
    );
  }

  if (subscriptionStatus === "past_due") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 font-semibold">
        Pago vencido
      </span>
    );
  }

  if (subscriptionStatus === "canceled") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-surface2 border border-white/10 text-fg-subtle font-semibold">
        Cancelado
      </span>
    );
  }

  return (
    <span className="text-[10px] text-fg-subtle/40">—</span>
  );
}

function subExpiry(row: UserRow): string {
  const { subscriptionStatus, trialEndsAt, currentPeriodEnd } = row;
  if (subscriptionStatus === "active") {
    if (!currentPeriodEnd) return "—";
    if (new Date(currentPeriodEnd).getFullYear() >= 2099) return "∞";
    return fmtDate(currentPeriodEnd);
  }
  if (subscriptionStatus === "trialing") return fmtDate(trialEndsAt);
  if (subscriptionStatus === "canceled" && currentPeriodEnd) return fmtDate(currentPeriodEnd);
  return "—";
}

function isActivePro(row: UserRow): boolean {
  if (row.subscriptionStatus === "active") return true;
  if (
    row.subscriptionStatus === "canceled" &&
    row.currentPeriodEnd &&
    new Date(row.currentPeriodEnd).getTime() > Date.now()
  )
    return true;
  return false;
}

export default async function AdminPage() {
  const session = await requireUser();
  if (session.email !== ADMIN_EMAIL) redirect("/");

  // Fetch all users with subscription fields
  const { data: users, error: usersError } = await supabase
    .from("User")
    .select(
      "id, email, name, createdAt, lastLoginAt, passwordHash, subscriptionStatus, trialEndsAt, currentPeriodEnd"
    )
    .order("createdAt", { ascending: false });

  if (usersError || !users) {
    return (
      <p className="p-8 text-red-400">
        Error cargando usuarios: {usersError?.message}
      </p>
    );
  }

  // Fetch trade counts per user
  const { data: trades } = await supabase.from("Trade").select("userId");
  const tradeCounts: Record<string, number> = {};
  for (const t of trades ?? []) {
    tradeCounts[t.userId] = (tradeCounts[t.userId] ?? 0) + 1;
  }

  // Fetch OAuth providers per user
  const { data: oauthRows } = await supabase
    .from("OAuthAccount")
    .select("userId, provider");
  const oauthMap: Record<string, string[]> = {};
  for (const o of oauthRows ?? []) {
    if (!oauthMap[o.userId]) oauthMap[o.userId] = [];
    oauthMap[o.userId].push(o.provider);
  }

  const now = Date.now();

  const rows: UserRow[] = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
    tradeCount: tradeCounts[u.id] ?? 0,
    hasPassword: !!u.passwordHash,
    oauthProviders: oauthMap[u.id] ?? [],
    subscriptionStatus: u.subscriptionStatus ?? null,
    trialEndsAt: u.trialEndsAt ?? null,
    currentPeriodEnd: u.currentPeriodEnd ?? null,
  }));

  // Stats
  const totalTrades = rows.reduce((s, r) => s + r.tradeCount, 0);
  const activeToday = rows.filter(
    (r) => r.lastLoginAt && now - new Date(r.lastLoginAt).getTime() < 86400000
  ).length;
  const activeWeek = rows.filter(
    (r) =>
      r.lastLoginAt &&
      now - new Date(r.lastLoginAt).getTime() < 7 * 86400000
  ).length;

  const proCount = rows.filter((r) => r.subscriptionStatus === "active").length;
  const trialingCount = rows.filter(
    (r) =>
      r.subscriptionStatus === "trialing" &&
      r.trialEndsAt &&
      new Date(r.trialEndsAt).getTime() > now
  ).length;
  const expiredCount = rows.filter(
    (r) =>
      (r.subscriptionStatus === "trialing" &&
        r.trialEndsAt &&
        new Date(r.trialEndsAt).getTime() <= now) ||
      r.subscriptionStatus === "canceled" ||
      r.subscriptionStatus === "past_due"
  ).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="border-b border-white/8 bg-surface/60 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-foreground">TradingGex</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-400 font-semibold">
              ADMIN
            </span>
          </div>
          <a
            href="/"
            className="text-sm text-fg-subtle hover:text-foreground transition-colors"
          >
            ← Volver al app
          </a>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Panel de Administración
          </h1>
          <p className="text-sm text-fg-subtle mt-1">
            Gestión de usuarios registrados · Solo visible para {ADMIN_EMAIL}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Usuarios totales", value: rows.length, color: "text-foreground" },
            { label: "Trades totales", value: totalTrades, color: "text-emerald-400" },
            { label: "Activos hoy", value: activeToday, color: "text-blue-400" },
            { label: "Activos esta semana", value: activeWeek, color: "text-purple-400" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-surface border border-white/8 rounded-xl px-5 py-4"
            >
              <p className="text-xs text-fg-subtle">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 tabular-nums ${s.color}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Subscription stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Suscriptores Pro", value: proCount, color: "text-emerald-400", bg: "bg-emerald-500/5 border-emerald-500/20" },
            { label: "En prueba activa", value: trialingCount, color: "text-blue-400", bg: "bg-blue-500/5 border-blue-500/20" },
            { label: "Expirados / cancelados", value: expiredCount, color: "text-red-400", bg: "bg-red-500/5 border-red-500/20" },
          ].map((s) => (
            <div
              key={s.label}
              className={`border rounded-xl px-5 py-4 ${s.bg}`}
            >
              <p className="text-xs text-fg-subtle">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 tabular-nums ${s.color}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Users table */}
        <div className="bg-surface border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              Usuarios registrados
              <span className="ml-2 text-sm text-fg-subtle font-normal">
                ({rows.length})
              </span>
            </h2>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  {[
                    "Usuario",
                    "Registro",
                    "Último login",
                    "Actividad",
                    "Suscripción",
                    "Vence",
                    "Trades",
                    "Auth",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs text-fg-subtle uppercase tracking-wider font-medium whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map((row) => {
                  const isAdmin = row.email === ADMIN_EMAIL;
                  const pro = isActivePro(row);
                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-white/[0.025] transition-colors ${
                        isAdmin ? "bg-amber-400/[0.03]" : ""
                      }`}
                    >
                      {/* User */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-white/10 flex items-center justify-center text-xs font-bold text-foreground shrink-0">
                            {(row.name ?? row.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-foreground leading-tight">
                              {row.name ?? (
                                <span className="text-fg-subtle italic">
                                  Sin nombre
                                </span>
                              )}
                              {isAdmin && (
                                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-400 font-semibold">
                                  ADMIN
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-fg-subtle">{row.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Registration date */}
                      <td className="px-4 py-3.5 text-fg-subtle text-xs whitespace-nowrap">
                        {fmtDate(row.createdAt)}
                      </td>

                      {/* Last login */}
                      <td className="px-4 py-3.5 text-xs whitespace-nowrap">
                        {row.lastLoginAt ? (
                          <span title={fmt(row.lastLoginAt)} className="text-fg-subtle">
                            {fmt(row.lastLoginAt)}
                          </span>
                        ) : (
                          <span className="text-fg-subtle/50">—</span>
                        )}
                      </td>

                      {/* Activity */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`text-xs font-medium ${
                            !row.lastLoginAt
                              ? "text-fg-subtle/40"
                              : now - new Date(row.lastLoginAt).getTime() <
                                86400000
                              ? "text-emerald-400"
                              : now - new Date(row.lastLoginAt).getTime() <
                                7 * 86400000
                              ? "text-blue-400"
                              : "text-fg-subtle"
                          }`}
                        >
                          {timeAgo(row.lastLoginAt)}
                        </span>
                      </td>

                      {/* Subscription status badge */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {isAdmin ? (
                          <span className="text-[10px] text-amber-400 font-semibold">ADMIN</span>
                        ) : (
                          subStatusBadge(row)
                        )}
                      </td>

                      {/* Expiry date */}
                      <td className="px-4 py-3.5 text-xs text-fg-subtle whitespace-nowrap">
                        {isAdmin ? "—" : subExpiry(row)}
                      </td>

                      {/* Trade count */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`text-sm font-bold tabular-nums ${
                            row.tradeCount > 0
                              ? "text-foreground"
                              : "text-fg-subtle/40"
                          }`}
                        >
                          {row.tradeCount}
                        </span>
                      </td>

                      {/* Auth methods */}
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1 flex-wrap">
                          {row.hasPassword && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface2 border border-white/10 text-fg-subtle">
                              email
                            </span>
                          )}
                          {row.oauthProviders.map((p) => (
                            <span
                              key={p}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col items-end gap-1.5">
                          <SubscriptionButton
                            userId={row.id}
                            isAdmin={isAdmin}
                            isPro={pro}
                          />
                          <DeleteUserButton
                            userId={row.id}
                            userName={row.name ?? ""}
                            userEmail={row.email}
                            isAdmin={isAdmin}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-white/5">
            {rows.map((row) => {
              const isAdmin = row.email === ADMIN_EMAIL;
              const pro = isActivePro(row);
              return (
                <div key={row.id} className="px-4 py-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-white/10 flex items-center justify-center text-sm font-bold text-foreground shrink-0">
                        {(row.name ?? row.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">
                          {row.name ?? row.email}
                          {isAdmin && (
                            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-400 font-semibold">
                              ADMIN
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-fg-subtle truncate">
                          {row.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <SubscriptionButton
                        userId={row.id}
                        isAdmin={isAdmin}
                        isPro={pro}
                      />
                      <DeleteUserButton
                        userId={row.id}
                        userName={row.name ?? ""}
                        userEmail={row.email}
                        isAdmin={isAdmin}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {isAdmin ? (
                      <span className="text-[10px] text-amber-400 font-semibold">ADMIN</span>
                    ) : (
                      subStatusBadge(row)
                    )}
                    {!isAdmin && (
                      <span className="text-[10px] text-fg-subtle">
                        vence: {subExpiry(row)}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-fg-subtle/60 uppercase tracking-wider text-[10px] mb-0.5">
                        Registro
                      </p>
                      <p className="text-fg-subtle">{fmtDate(row.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-fg-subtle/60 uppercase tracking-wider text-[10px] mb-0.5">
                        Último login
                      </p>
                      <p
                        className={`font-medium ${
                          !row.lastLoginAt
                            ? "text-fg-subtle/40"
                            : now - new Date(row.lastLoginAt).getTime() <
                              86400000
                            ? "text-emerald-400"
                            : "text-fg-subtle"
                        }`}
                      >
                        {timeAgo(row.lastLoginAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-fg-subtle/60 uppercase tracking-wider text-[10px] mb-0.5">
                        Trades
                      </p>
                      <p
                        className={`font-bold ${
                          row.tradeCount > 0
                            ? "text-foreground"
                            : "text-fg-subtle/40"
                        }`}
                      >
                        {row.tradeCount}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-xs text-fg-subtle/50 text-center pb-4">
          Acceso restringido · Solo visible para {ADMIN_EMAIL}
        </p>
      </div>
    </div>
  );
}
