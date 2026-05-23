import { useInstitution } from "../../../../../../context/InstitutionContext";

const HeaderTagManager = () => {
  const { colors } = useInstitution();

  return (
    <div
      className="rounded-lg border p-5 shadow-sm"
      style={{ background: colors.input, borderColor: colors.border }}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: colors.textBase }}>
            Analítica de comportamiento y eventos
          </h2>
          <p
            className="mt-2 max-w-3xl text-sm leading-6"
            style={{ color: colors.textSecondary }}
          >
            Seguimiento de interacciones clave de estudiantes, cursos y
            certificados con visualización en Looker Studio.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeaderTagManager;
