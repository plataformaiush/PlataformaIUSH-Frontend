import { useState, useEffect } from 'react';

// Librería utilizada para renderizar gráfica
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
  PieChart, Pie,
} from "recharts";

// Peticiones
import { PopularCourses } from './action/PopularCourse';
import { PeriodEnrollments } from "./action/PeriodEnrollments";
import { ModuleAttempts } from "./action/ModuleAttempts";
import { CourseCompletionRate } from "./action/CourseCompletionRate";
import { ActiveInactiveCourses } from "./action/ActiveInactiveCourses";
import { Certificate } from "./action/Certificate";

// Tipados
import { PopularCourseResponse } from "./types/BarChart";
import { PeriodEnrollmentResponse, Grouping } from "./types/LineChart";
import { ModuleAttemptResponse } from "./types/HorizontalBarChart";
import { CourseCompletionRateResponse } from "./types/ProgressChart";
import { ActiveVsInactiveCourses } from "./types/DonutChart";
import { Certificates } from "./types/BarChart";

// Modificación de colores
import { useInstitution } from '../../../context/InstitutionContext';
import { ImSpinner2 } from "react-icons/im";
import SimulateEvents from './modules/gtm/simulateEvents';
import GraphsLooker from './modules/lookerStudio/GraphsLooker';

const Reports = () => {

  // Permite que todos los estilos y gráficas cambien automáticamente al momento de modificar la configuración
  const { colors } = useInstitution();


  // Estados para almacenar los datos de cada gráfica
  const [popularCourses, setPopularCourses] = useState<PopularCourseResponse>([]);
  const [periodEnrollments, setPeriodEnrollments] = useState<PeriodEnrollmentResponse>([]);
  const [moduleAttempts, setModuleAttempts] = useState<ModuleAttemptResponse>([]);
  const [completionRate, setCompletionRate] = useState<CourseCompletionRateResponse>([]);
  const [activeVsInactive, setActiveVsInactive] = useState<ActiveVsInactiveCourses | null>(null);
  const [certificates, setCertificates] = useState<Certificates | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [agrupacion, setAgrupacion] = useState<Grouping>("mensual");
  const [loadingEnrollments, setLoadingEnrollments] = useState<boolean>(false);


  // Ejecuta todas las peticiones necesarias al cargar el componente
  useEffect(() => {
    // Consume todos los endpoints
    const fetchAllData = async () => {
      try {
        const [
          popularCoursesData,
          periodEnrollmentsData,
          moduleAttemptsData,
          completionRateData,
          activeVsInactiveData,
          certificatesData,
        ] = await Promise.all([
          PopularCourses(),
          PeriodEnrollments(agrupacion),
          ModuleAttempts(),
          CourseCompletionRate(),
          ActiveInactiveCourses(),
          Certificate(),
        ]);

        // Actualización de estados según la información recibida
        setPopularCourses(popularCoursesData.data);
        setPeriodEnrollments(periodEnrollmentsData.data);
        setModuleAttempts(moduleAttemptsData.data);
        setCompletionRate(completionRateData.data);
        setActiveVsInactive(activeVsInactiveData.data);
        setCertificates(certificatesData.data);
      } catch (error) {
        console.error("Error fetching reports data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);


  // Recarga solo los datos de inscripciones cuando el usuario cambia el filtro de agrupación (mensual, trimestral, etc)
  useEffect(() => {
    if (loading) return;
    const fetchEnrollments = async () => {
      setLoadingEnrollments(true);
      try {
        const data = await PeriodEnrollments(agrupacion); // Consulta según el filtrado
        setPeriodEnrollments(data.data);
      } catch (error) {
        console.error("Error fetching enrollments:", error);
      } finally {
        setLoadingEnrollments(false);
      }
    };
    fetchEnrollments();
  }, [agrupacion]);

  // Suma todas las inscripciones de todos los periodos.
  const totalEnrollments = Array.isArray(periodEnrollments)
    ? periodEnrollments.reduce(
      (acc, item) => acc + parseInt(item.total_inscripciones),
      0
    )
    : 0;


  // Calcula el pocentaje de cursos activos
  const activePercentage = activeVsInactive
    ? Math.round(
      (parseInt(activeVsInactive.activos) / parseInt(activeVsInactive.total_cursos)) * 100
    )
    : 0;

  // Datos formateados para la gráfica donut
  const donutData = activeVsInactive
    ? [
      { name: "Activos", value: parseInt(activeVsInactive.activos) },
      { name: "Inactivos", value: parseInt(activeVsInactive.inactivos) },
    ]
    : [];


  // Curso con más inscritos
  const maxInscritos = popularCourses.length > 0
    ? Math.max(...popularCourses.map((c) => parseInt(c.total_inscritos)))
    : 0;


  // Módulos que tienen al menos un intento registrado
  const attemptsWithData = moduleAttempts.filter((m) => m.promedio_intentos !== null);

  // Promedio global de intentos entre todos los módulos con datos
  const globalAverage = attemptsWithData.length > 0
    ? (
      attemptsWithData.reduce((acc, m) => acc + parseFloat(m.promedio_intentos!), 0) /
      attemptsWithData.length
    ).toFixed(1)
    : "—";

  // Máximo de intentos
  const maxAttempt = attemptsWithData.length > 0
    ? Math.max(...attemptsWithData.map((m) => parseFloat(m.promedio_intentos!)))
    : 1;


  return (
    <div
      className="min-h-full w-full font-['Plus_Jakarta_Sans'] select-none"
      style={{ background: colors.background }}
    >
      <div className="w-full max-w-none px-10 py-8">

        {/* Header */}
        <div>
          <h1 className="text-[32px] font-bold" style={{ color: colors.primary }}>
            Reportes y Analítica Avanzada
          </h1>
          <p className="text-[16.5px] mt-2 font-medium" style={{ color: colors.textSecondary }}>
            Visualiza el rendimiento y compromisos en la plataforma.
          </p>
        </div>

        <div className="flex flex-col gap-4 mt-6">

          {/*
            Sección principal de reportes:
            - Fila 1: Inscripciones (línea), Cursos activos (donut), Intentos (barras horizontales)
            - Fila 2: Certificados (barras dobles), Inscritos por curso (barras)
            - Fila 3: Tasa de completado (barras de progreso)
          */}
          <section className="flex flex-col gap-4">

            {/* Fila 1: Línea | Donut | Barras horizontales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div
                className="rounded-2xl p-5 shadow-sm"
                style={{ background: colors.input }}
              >
                <p className="text-xs mb-1" style={{ color: colors.textSecondary }}>
                  Inscripciones por Periodo
                </p>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold" style={{ color: colors.primary }}>
                    {totalEnrollments.toLocaleString()} Students
                  </h2>
                  {/* Dropdown para cambiar la agrupación */}
                  <select
                    value={agrupacion}
                    onChange={(e) => setAgrupacion(e.target.value as Grouping)}
                    className="text-xs px-3 py-1 rounded-full font-medium border-none outline-none cursor-pointer"
                    style={{ background: colors.tertiary, color: colors.primary }}
                  >
                    <option value="mensual">Mensual</option>
                    <option value="trimestral">Trimestral</option>
                    <option value="semestral">Semestral</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>
                {/* Muestra spinner mientras recarga la agrupación seleccionada */}
                {loadingEnrollments ? (
                  <div className="flex items-center justify-center h-[110px]">
                    <ImSpinner2
                      className="animate-spin"
                      style={{ color: colors.primary }}
                      size={24}
                    />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={110}>
                    <LineChart data={periodEnrollments}>
                      <XAxis
                        dataKey="periodo"
                        tick={{ fontSize: 10, fill: colors.textSecondary }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => v.slice(0, 3)}
                      />
                      <YAxis hide />
                      <Tooltip
                        formatter={(value) => [Number(value).toLocaleString(), "Inscritos"]}
                        contentStyle={{ background: colors.input, borderColor: colors.border, color: colors.textBase }}
                      />
                      <Line
                        type="monotone"
                        dataKey="total_inscripciones"
                        stroke={colors.primary}
                        strokeWidth={2}
                        dot={{ r: 3, fill: colors.primary }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Gráfica donut */}
              <div
                className="rounded-2xl p-5 shadow-sm"
                style={{ background: colors.input }}
              >
                <p className="text-xs mb-2" style={{ color: colors.textSecondary }}>
                  Cursos Activos o Inactivos
                </p>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: colors.primary }} />
                    <span className="text-xs" style={{ color: colors.textBase }}>Cursos Activos</span>
                    <span className="text-sm font-bold" style={{ color: colors.textBase }}>
                      {activeVsInactive ? parseInt(activeVsInactive.activos) : 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: colors.tertiary }} />
                    <span className="text-xs" style={{ color: colors.textSecondary }}>Cursos Inactivos</span>
                    <span className="text-sm font-bold" style={{ color: colors.textSecondary }}>
                      {activeVsInactive ? parseInt(activeVsInactive.inactivos) : 0}
                    </span>
                  </div>
                </div>
                <div className="relative flex items-center justify-center">
                  <PieChart width={140} height={140}>
                    <Pie
                      data={donutData}
                      cx={65}
                      cy={65}
                      innerRadius={45}
                      outerRadius={65}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      <Cell fill={colors.primary} />
                      <Cell fill={colors.tertiary} />
                    </Pie>
                  </PieChart>
                  <span className="absolute text-lg font-bold" style={{ color: colors.primary }}>
                    {activePercentage}%
                  </span>
                </div>
              </div>

              {/* Barras horizontales */}
              <div
                className="rounded-2xl p-5 shadow-sm"
                style={{ background: colors.primary }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="rounded-md p-1.5" style={{ background: colors.tertiary }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect x="0" y="9" width="3" height="5" rx="1" fill={colors.textOnDark} />
                      <rect x="4" y="6" width="3" height="8" rx="1" fill={colors.textOnDark} />
                      <rect x="8" y="3" width="3" height="11" rx="1" fill={colors.textOnDark} />
                      <rect x="12" y="0" width="2" height="14" rx="1" fill={colors.textOnDark} />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textOnDark }}>
                    Promedio Intentos Por Curso
                  </p>
                </div>
                {/* Muestra los 3 módulos con más intentos */}
                <div className="flex flex-col gap-3">
                  {attemptsWithData.slice(0, 3).map((module) => {
                    const pct = Math.round(
                      (parseFloat(module.promedio_intentos!) / maxAttempt) * 100
                    );
                    return (
                      <div key={module.id_modulo}>
                        <div className="flex justify-between text-xs mb-1" style={{ color: colors.textOnDark }}>
                          <span>{module.modulo_titulo}</span>
                          <span>{parseFloat(module.promedio_intentos!).toFixed(1)}</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: colors.tertiary }}>
                          <div
                            className="h-1.5 rounded-full"
                            style={{ width: `${pct}%`, background: colors.secondary }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs mt-4" style={{ color: colors.textOnDark, opacity: 0.6 }}>
                  Promedio global: {globalAverage}
                </p>
              </div>
            </div>

            {/* Fila 2: Barras dobles | Barras inscritos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Barras dobles */}
              <div
                className="rounded-2xl p-5 shadow-sm"
                style={{ background: colors.input }}
              >
                <p className="text-xs mb-1" style={{ color: colors.textSecondary }}>
                  Certificado Emitido vs Certificado Descargado
                </p>
                <h2 className="text-2xl font-bold mb-2" style={{ color: colors.primary }}>
                  {certificates ? parseInt(certificates.total_emitidos).toLocaleString() : "—"}
                </h2>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: colors.primary }} />
                    <span className="text-xs" style={{ color: colors.textSecondary }}>Emitido</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: colors.tertiary }} />
                    <span className="text-xs" style={{ color: colors.textSecondary }}>Descargado</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={110}>
                  <BarChart
                    data={[
                      {
                        name: "Certificados",
                        Emitido: certificates ? parseInt(certificates.total_emitidos) : 0,
                        Descargado: certificates ? parseInt(certificates.total_descargados) : 0,
                      },
                    ]}
                    barCategoryGap="30%"
                  >
                    <XAxis hide />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ background: colors.input, borderColor: colors.border, color: colors.textBase }}
                    />
                    <Bar dataKey="Emitido" fill={colors.primary} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Descargado" fill={colors.tertiary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Barras verticales */}
              <div
                className="rounded-2xl p-5 shadow-sm"
                style={{ background: colors.input }}
              >
                <p className="text-xs mb-1" style={{ color: colors.textSecondary }}>
                  Inscritos por curso
                </p>
                <h2 className="text-2xl font-bold mb-3" style={{ color: colors.textBase }}>
                  {maxInscritos.toLocaleString()} inscritos
                </h2>
                <ResponsiveContainer width="100%" height={110}>
                  <BarChart data={popularCourses} barCategoryGap="20%">
                    <XAxis
                      dataKey="curso_titulo"
                      tick={{ fontSize: 9, fill: colors.textSecondary }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => v.slice(0, 6)}
                    />
                    <YAxis hide />
                    <Tooltip
                      formatter={(value) => [Number(value).toLocaleString(), "Inscritos"]}
                      contentStyle={{ background: colors.input, borderColor: colors.border, color: colors.textBase }}
                    />
                    <Bar dataKey="total_inscritos" radius={[4, 4, 0, 0]}>
                      {popularCourses.map((course) => (
                        <Cell
                          key={course.curso_id}
                          fill={
                            parseInt(course.total_inscritos) === maxInscritos
                              ? colors.primary
                              : colors.secondary
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Fila 3: Tasa de completado */}
            <div
              className="rounded-2xl p-5 shadow-sm"
              style={{ background: colors.input }}
            >
              <p className="text-xs mb-4" style={{ color: colors.textSecondary }}>
                Tasa de completado por curso
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {completionRate.map((course) => {
                  const pct = course.porcentaje_completados
                    ? parseFloat(course.porcentaje_completados)
                    : 0;
                  const isHigh = pct >= 80;
                  return (
                    <div key={course.curso_id}>
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs font-medium" style={{ color: colors.textBase }}>
                          {course.curso_titulo}
                        </span>
                        <span
                          className="text-xs font-bold ml-2"
                          style={{ color: isHigh ? colors.primary : colors.tertiary }}
                        >
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-1 rounded-full" style={{ background: colors.border }}>
                        <div
                          className="h-1 rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: isHigh ? colors.primary : colors.tertiary,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </section>

          {/* ── Sección Johan ── */}
          <section className='bg-blue-300'>
            <h1 className='text-center'>Espacio dónde trabajará Johan</h1>
            <div>
              - Acá debe ir la lógica de gráficas sacadas con TAG-MANAGER.
            </div>

            <div className="mb-8">
              <SimulateEvents/>
            </div>

            <div className="mt-8 mb-8">
              <GraphsLooker />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Reports;