import { useState, useEffect, type CSSProperties, type ReactNode } from "react";


// Peticiones
import { PopularCourses } from "./action/PopularCourse";
import { PeriodEnrollments } from "./action/PeriodEnrollments";
import { ModuleAttempts } from "./action/ModuleAttempts";
import { CourseCompletionRate } from "./action/CourseCompletionRate";
import { ActiveInactiveCourses } from "./action/ActiveInactiveCourses";
import { Certificate } from "./action/Certificate";

// Tipados de cada gráfica
import { PopularCourseResponse } from "./types/BarChart";
import { PeriodEnrollmentResponse, Grouping } from "./types/LineChart";
import { ModuleAttemptResponse } from "./types/HorizontalBarChart";
import { CourseCompletionRateResponse } from "./types/ProgressChart";
import { ActiveVsInactiveCourses } from "./types/DonutChart";
import { Certificates } from "./types/BarChart";

// Modificación de colores
import { useInstitution } from "../../../context/InstitutionContext";
import SimulateEvents from "./modules/gtm/SimulateEvents";
import GraphsLooker from "./modules/lookerStudio/GraphsLooker";
import HeaderTagManager from "./modules/TagManager/header/HeaderTagManager";
import EventCardsGTM from "./modules/TagManager/eventCards/EventCardsGTM";
import EventListGTM from "./modules/TagManager/EventList/EventListGTM";

import ActiveCoursesDonut from "./modules/graphics/ActiveCoursesDonut";
import CertificatesBarChart from "./modules/graphics/CertificatesBarChart";
import CompletionRateChart from "./modules/graphics/CompletionRateChart";
import EnrollmentLineChart from "./modules/graphics/EnrollmentLineChart";
import ModuleAttemptsBar from "./modules/graphics/ModuleAttemptsBar";
import PopularCoursesBar from "./modules/graphics/PopularCoursesBar";

const Reports = () => {
  // Permite que todos los estilos y gráficas cambien automáticamente al momento de modificar la configuración
  const { colors } = useInstitution();

  // Estados para almacenar los datos de cada gráfica
  const [popularCourses, setPopularCourses] = useState<PopularCourseResponse>([],);
  const [periodEnrollments, setPeriodEnrollments] = useState<PeriodEnrollmentResponse>([]);
  const [moduleAttempts, setModuleAttempts] = useState<ModuleAttemptResponse>([],);
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

        // Actualiza cada estado con la data recibida
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

  // Recarga solo las inscripciones cuando el usuario cambia el filtro de agrupación (mensual, trimestral, etc)
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

  
  return (
    <div
      className="min-h-full w-full font-['Plus_Jakarta_Sans'] select-none"
      style={{ background: colors.background }}
    >
      <div className="w-full max-w-none px-10 py-8">
        {/* Header */}
        <div>
          <h1
            className="text-[32px] font-bold"
            style={{ color: colors.primary }}
          >
            Reportes y Analítica Avanzada
          </h1>
          <p
            className="text-[16.5px] mt-2 font-medium"
            style={{ color: colors.textSecondary }}
          >
            Visualiza el rendimiento y compromisos en la plataforma.
          </p>
        </div>

        <div className="flex flex-col gap-4 mt-6">
          {/* Gráficas backend */}
          <section className="flex flex-col gap-4">
            {/* Fila 1: Inscripciones | Cursos | Intentos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap 4">
              <EnrollmentLineChart
                periodEnrollments={periodEnrollments}
                agrupacion={agrupacion}
                onAgrupacionChange={setAgrupacion}
                loading={loadingEnrollments}
                colors={colors}
              />
              <ActiveCoursesDonut
                activeVsInactive={activeVsInactive}
                colors={colors}
              />
              <ModuleAttemptsBar
                moduleAttempts={moduleAttempts}
                colors={colors}
              />
            </div>
            {/* Fila 2: Certificados | Inscritos por cursos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap 4">
              <CertificatesBarChart 
                certificates={certificates}
                colors={colors}
              />
              <PopularCoursesBar 
                popularCourses={popularCourses}
                colors={colors}
              />            
            </div>
            {/* Fila 3: Tasa completado por curso */}
              <CompletionRateChart 
                completionRate={completionRate}
                colors={colors}
              />
          </section>

          {/* Sección Tag Manager */}
          <section className="mt-4 flex flex-col gap-5">

            <HeaderTagManager/>


            <EventCardsGTM/>
           

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
             
              <EventListGTM/>


              <div
                className="rounded-lg border p-5 shadow-sm"
                style={{ background: colors.input, borderColor: colors.border }}
              >
                <div className="mb-4">
                  <p
                    className="text-base font-semibold"
                    style={{ color: colors.textBase }}
                  >
                    Simulación de eventos
                  </p>
                  <p
                    className="mt-1 text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    Prueba rápida para validar el envío hacia Google Tag
                    Manager.
                  </p>
                </div>
                <SimulateEvents />
              </div>
            </div>

            <GraphsLooker />
          </section>
        </div>
      </div>
    </div>
  );
};

export default Reports;
