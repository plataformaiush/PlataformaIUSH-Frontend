import { useState } from 'react'
import { CheckCircle2, XCircle, Lightbulb, Check, X } from 'lucide-react'
import type { QuizTFContentData } from '../../../../../../../PlataformaIUSH-Frontend/src/domain/shared/interfaces/ICourseContent'

interface QuizTFContentProps {
  data: QuizTFContentData
  /** El modal lo cablea a onClose; no se usa aquí para no cerrar al verificar. */
  onComplete?: () => void
}

const OPTIONS: { value: boolean; label: string; icon: typeof Check }[] = [
  { value: true, label: 'Verdadero', icon: Check },
  { value: false, label: 'Falso', icon: X },
]

export function QuizTFContent({ data }: QuizTFContentProps) {
  const [chosen, setChosen] = useState<boolean | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const isCorrect = submitted && chosen === data.correctAnswer

  const handleSelect = (value: boolean) => {
    if (submitted) return
    setChosen(value)
  }

  const handleSubmit = () => {
    setSubmitted(true)
  }

  return (
    <div className="space-y-6">
      {/* Resultado global */}
      {submitted && (
        <div
          className={[
            'rounded-2xl border p-4 text-center',
            isCorrect
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200',
          ].join(' ')}
        >
          <p
            className={[
              'text-lg font-bold',
              isCorrect ? 'text-green-700' : 'text-red-600',
            ].join(' ')}
          >
            {isCorrect ? '¡Correcto!' : 'Respuesta incorrecta'}
          </p>
          <p className="text-sm text-secondary mt-0.5">
            {isCorrect
              ? '¡Bien hecho!'
              : 'Revisa la respuesta correcta marcada en verde'}
          </p>
        </div>
      )}

      <div className="space-y-3">
        <p className="text-xs font-bold text-secondary uppercase tracking-widest">
          Pregunta
        </p>

        <p className="text-lg font-extrabold text-primary leading-snug">
          {data.question}
        </p>
        <p className="text-sm text-secondary">
          Indica si la afirmación es verdadera o falsa.
        </p>

        {/* Opciones V/F */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {OPTIONS.map(({ value, label, icon: Icon }) => {
            const isChosen = chosen === value
            const showCorrect = submitted && value === data.correctAnswer
            const showWrong = submitted && isChosen && !showCorrect

            let optionClass =
              'flex items-center justify-center gap-2 p-4 rounded-2xl cursor-pointer border-2 transition-all duration-150 active:scale-[0.98]'

            if (submitted) {
              if (showCorrect) optionClass += ' bg-green-50 border-green-500'
              else if (showWrong) optionClass += ' bg-red-50 border-red-400'
              else optionClass += ' bg-surface-muted border-transparent opacity-50'
            } else if (isChosen) {
              optionClass += ' bg-secondary/10 border-secondary'
            } else {
              optionClass +=
                ' bg-surface-muted border-transparent hover:border-secondary/40 hover:bg-secondary/5'
            }

            return (
              <button
                key={label}
                onClick={() => handleSelect(value)}
                disabled={submitted}
                className={optionClass}
                aria-pressed={isChosen}
              >
                <Icon
                  size={18}
                  className={[
                    'shrink-0',
                    showCorrect
                      ? 'text-green-500'
                      : showWrong
                        ? 'text-red-400'
                        : isChosen
                          ? 'text-secondary'
                          : 'text-secondary',
                  ].join(' ')}
                />
                <span className="text-sm font-semibold text-primary">
                  {label}
                </span>

                {showCorrect && (
                  <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                )}
                {showWrong && (
                  <XCircle size={18} className="text-red-400 shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Explicación — solo tras responder */}
      {submitted && data.explanation && (
        <div className="rounded-2xl bg-primary/5 border border-primary/15 p-4 flex gap-3">
          <Lightbulb size={18} className="text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">
              Explicación
            </p>
            <p className="text-sm text-neutral leading-relaxed">
              {data.explanation}
            </p>
          </div>
        </div>
      )}

      {/* Botón enviar — solo antes de responder */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={chosen === null}
          className="w-full min-h-[48px] rounded-2xl font-semibold text-sm
                     bg-primary text-white
                     disabled:opacity-40 disabled:cursor-not-allowed
                     hover:bg-secondary active:scale-95 transition-all duration-200"
        >
          Verificar respuesta
        </button>
      )}
    </div>
  )
}
