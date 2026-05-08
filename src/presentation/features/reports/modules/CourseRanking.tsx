export interface Course {
  name: string;
  visits: number;
  max: number;
}

interface CourseRankingProps {
  courses: Course[];
}

function CourseBar({
  course,
}: {
  course: Course;
}) {

  const pct = Math.round(
    (course.visits / course.max) * 100
  );

  return (
    <div className="flex flex-col gap-2">

      <div className="flex items-center justify-between">

        <span
          className="
            text-[13px]
            font-semibold
            text-[#223740]
            font-['Plus_Jakarta_Sans']
          "
        >
          {course.name}
        </span>

        <span
          className="
            text-[12px]
            font-medium
            text-[#7A8D91]
            font-['Plus_Jakarta_Sans']
          "
        >
          {(course.visits / 1000).toFixed(1)}k
        </span>
      </div>

      <div className="h-2 rounded-full bg-[#EEF3F4] overflow-hidden">

        <div
          className="h-2 rounded-full bg-[#5A878C]"
          style={{
            width: `${pct}%`,
          }}
        />
      </div>
    </div>
  );
}

export default function CourseRanking({
  courses,
}: CourseRankingProps) {

  return (
    <div className="bg-white border border-[#E7EEF0] rounded-2xl p-5 shadow-sm">

      <h2
        className="
          text-[16px]
          font-semibold
          text-[#223740]
          mb-5
          font-['Plus_Jakarta_Sans']
        "
      >
        Cursos más Visitados
      </h2>

      <div className="flex flex-col gap-5">

        {courses.map((course) => (
          <CourseBar
            key={course.name}
            course={course}
          />
        ))}
      </div>

      <a
        href="#"
        className="
          inline-flex
          items-center
          mt-6
          text-[12px]
          font-semibold
          text-[#5A878C]
          transition-colors
          hover:text-[#223740]
          font-['Plus_Jakarta_Sans']
        "
      >
        Ver todo el reporte →
      </a>
    </div>
  );
}