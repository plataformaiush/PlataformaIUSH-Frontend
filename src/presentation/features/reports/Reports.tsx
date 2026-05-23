import { useState, useEffect } from 'react';

// Componentes gráficos
import EnrollmentLineChart from './modules/graphics/EnrollmentLineChart';
import ActiveCoursesDonutChart from './modules/graphics/ActiveCoursesDonutChart';
import AttemptsHorizontalBarChart from './modules/graphics/AttemptsHorizontalBarChart';
import CertificatesDoubleBarChart from './modules/graphics/CertificatesDoubleBarChart';
import EnrolledBarChart from './modules/graphics/EnrolledBarChart';
import CompletionRateProgressChart from './modules/graphics/CompletionRateProgressChart';

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

const Reports = () => {
  const { colors } = useInstitution(); // Obtiene los colores definidos

  // Estados principales
  const [popularCourses, setPopularCourses] = useState<PopularCourseResponse>([]);
  const [periodEnrollments, setPeriodEnrollments] = useState<PeriodEnrollmentResponse>([]);
  const [moduleAttempts, setModuleAttempts] = useState<ModuleAttemptResponse>([]);
  const [completionRate, setCompletionRate] = useState<CourseCompletionRateResponse>([]);
  const [activeVsInactive, setActiveVsInactive] = useState<ActiveVsInactiveCourses | null>(null);
  const [certificates, setCertificates] = useState<Certificates | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [agrupacion, setAgrupacion] = useState<Grouping>("mensual");
  const [loadingEnrollments, setLoadingEnrollments] = useState<boolean>(false);

  // Carga inicial de todos los datos
  useEffect(() => {
    const fetchAllData = async () => { // Obtiene todos los datos
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

        // Guarda la información
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

  // Se ejecuta al cambiar la agrupación
  useEffect(() => {
    if (loading) return;
    const fetchEnrollments = async () => { // Recarga unicamente isncripciones
      setLoadingEnrollments(true);
      try {
        const data = await PeriodEnrollments(agrupacion); // Obtiene información de acuerdo a la agrupación
        setPeriodEnrollments(data.data);
      } catch (error) {
        console.error("Error fetching enrollments:", error);
      } finally {
        setLoadingEnrollments(false);
      }
    };
    fetchEnrollments();
  }, [agrupacion]);

  // Suma total de inscripciones por periodo
  const totalEnrollments = Array.isArray(periodEnrollments)
    ? periodEnrollments.reduce((acc, item) => acc + parseInt(item.total_inscripciones), 0)
    : 0;

  // Porcentaje de cursos activos
  const activePercentage = activeVsInactive
    ? Math.round((parseInt(activeVsInactive.activos) / parseInt(activeVsInactive.total_cursos)) * 100)
    : 0;

  // Datos para gráfica donut
  const donutData = activeVsInactive
    ? [
        { name: "Activos", value: parseInt(activeVsInactive.activos) },
        { name: "Inactivos", value: parseInt(activeVsInactive.inactivos) },
      ]
    : [];

  // Suma total de inscritos en todos los cursos
  const totalInscritos = popularCourses.reduce(
    (acc, c) => acc + parseInt(c.total_inscritos), 0
  );

  // Módulos con al menos un intento
  const attemptsWithData = moduleAttempts.filter((m) => m.promedio_intentos !== null);

  // Promedio global de intentos
  const globalAverage = attemptsWithData.length > 0
    ? (
        attemptsWithData.reduce((acc, m) => acc + parseFloat(m.promedio_intentos!), 0) /
        attemptsWithData.length
      ).toFixed(1)
    : "—";

  // Máximo de intentos entre módulos
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
          <section className="flex flex-col gap-4">

            {/* Fila 1: Línea | Donut | Barras horizontales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <EnrollmentLineChart
                data={periodEnrollments}
                total={totalEnrollments}
                agrupacion={agrupacion}
                setAgrupacion={setAgrupacion}
                loading={loadingEnrollments}
                colors={colors}
              />
              <ActiveCoursesDonutChart
                data={activeVsInactive}
                donutData={donutData}
                activePercentage={activePercentage}
                colors={colors}
              />
              <AttemptsHorizontalBarChart
                attemptsWithData={attemptsWithData}
                maxAttempt={maxAttempt}
                globalAverage={globalAverage}
                colors={colors}
              />
            </div>

            {/* Fila 2: Certificados | Inscritos por curso */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CertificatesDoubleBarChart
                certificates={certificates}
                colors={colors}
              />
              <EnrolledBarChart
                popularCourses={popularCourses}
                totalInscritos={totalInscritos}
                colors={colors}
              />
            </div>

            {/* Fila 3: Tasa de completado */}
            <CompletionRateProgressChart
              completionRate={completionRate.map(c => ({
                ...c,
                porcentaje_completados: c.porcentaje_completados ?? "0"
              }))}
              colors={colors}
            />

          </section>

          {/* ── Sección Johan ── */}
          <section className='bg-blue-300'>
            <h1 className='text-center'>Espacio dónde trabajará Johan</h1>
            <div>
              - Acá debe ir la lógica de gráficas sacadas con TAG-MANAGER.
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default Reports;