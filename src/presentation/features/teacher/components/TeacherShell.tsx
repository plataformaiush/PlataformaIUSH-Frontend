import {
  Bell,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  UsersRound,
} from "lucide-react";
import { ReactNode } from "react";
import { teacherProfile } from "../../../../domain/teacher/teacherMock";
import { TeacherView } from "../../../../domain/teacher/teacherTypes";

interface TeacherShellProps {
  activeView: TeacherView;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

const navigation = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/teacher/dashboard",
  },
  {
    id: "courses",
    label: "Cursos",
    icon: BookOpen,
    href: "/teacher/courses",
  },
  {
    id: "grades",
    label: "Calificaciones",
    icon: GraduationCap,
    href: "/teacher/grades",
  },
  {
    id: "students",
    label: "Estudiantes",
    icon: UsersRound,
    href: "/teacher/students",
  },
] as const;

export function TeacherShell({
  activeView,
  title,
  subtitle,
  children,
}: TeacherShellProps) {
  return (
    <div className="min-h-screen bg-[#eef9fb] text-[#18313a]">
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[286px] border-r border-[#d7e8eb] bg-white/95 px-5 py-6 shadow-[14px_0_35px_rgba(22,55,68,0.07)] lg:block">
        <div className="mb-9 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#153744] to-[#2e8290] text-xl font-black text-white shadow-lg shadow-[#163744]/20">
            P
          </div>

          <div>
            <h1 className="text-lg font-black tracking-tight text-[#153744]">
              Profunsoft
            </h1>
            <p className="text-xs font-medium text-[#7d9198]">
              Vista Docente
            </p>
          </div>
        </div>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <a
                key={item.id}
                href={item.href}
                className={[
                  "group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-[#153744] to-[#33a995] text-white shadow-[0_16px_30px_rgba(21,55,68,0.22)]"
                    : "text-[#6d8188] hover:bg-[#eef9fb] hover:text-[#153744]",
                ].join(" ")}
              >
                <Icon
                  size={20}
                  strokeWidth={2.4}
                  className={isActive ? "text-white" : "text-[#6d8188] group-hover:text-[#153744]"}
                />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-5 right-5">
          <div className="mb-4 rounded-3xl border border-[#d7e8eb] bg-[#f4fbfc] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7d9198]">
              Sesión
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#153744] text-sm font-black text-white">
                {teacherProfile.initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-[#153744]">
                  {teacherProfile.name}
                </p>
                <p className="truncate text-xs text-[#7d9198]">
                  {teacherProfile.role}
                </p>
              </div>
            </div>
          </div>

          <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#d7e8eb] bg-white px-4 py-3 text-sm font-bold text-[#6d8188] transition hover:border-[#ef6b7a]/30 hover:bg-[#fff4f5] hover:text-[#ef6b7a]">
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="lg:ml-[286px]">
        <header className="sticky top-0 z-20 border-b border-[#d7e8eb]/80 bg-[#eef9fb]/90 px-5 py-5 backdrop-blur-xl lg:px-8">
          <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-[#55a99b]">
                Plataforma IUSH
              </p>
              <h2 className="text-2xl font-black tracking-tight text-[#153744] md:text-3xl">
                {title}
              </h2>
              {subtitle ? (
                <p className="mt-1 text-sm font-medium text-[#789098]">
                  {subtitle}
                </p>
              ) : null}
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <div className="flex h-12 w-[270px] items-center gap-3 rounded-2xl border border-[#d7e8eb] bg-white px-4 shadow-[0_12px_28px_rgba(22,55,68,0.06)]">
                <Search size={18} className="text-[#7d9198]" />
                <input
                  className="w-full bg-transparent text-sm font-medium text-[#153744] outline-none placeholder:text-[#9aacb2]"
                  placeholder="Buscar en docente..."
                />
              </div>

              <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d7e8eb] bg-white text-[#6d8188] shadow-[0_12px_28px_rgba(22,55,68,0.06)] transition hover:text-[#153744]">
                <Bell size={19} />
              </button>

              <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d7e8eb] bg-white text-[#6d8188] shadow-[0_12px_28px_rgba(22,55,68,0.06)] transition hover:text-[#153744]">
                <Settings size={19} />
              </button>

              <div className="flex h-12 items-center gap-3 rounded-2xl bg-[#153744] px-3 pr-4 text-white shadow-[0_16px_30px_rgba(21,55,68,0.18)]">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-xs font-black">
                  {teacherProfile.initials}
                </div>
                <div className="leading-tight">
                  <p className="text-xs font-black">{teacherProfile.name}</p>
                  <p className="text-[10px] font-semibold text-white/65">
                    Docente
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-[1240px] px-5 py-7 lg:px-8">
          {children}
        </section>
      </main>
    </div>
  );
}