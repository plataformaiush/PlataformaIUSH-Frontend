import { useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import type { QuizContentData } from '../../../../../../../PlataformaIUSH-Frontend/src/domain/shared/interfaces/ICourseContent'

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F']

interface QuizContentProps {
  data: QuizContentData
  onComplete: () => void
}

export function QuizContent({ data, onComplete }: QuizContentProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const allAnswered = data.questions.every(q => answers[q.id])

  const handleSelect = (questionId: string, optionId: string) => {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [questionId]: optionId }))
  }

  const handleSubmit = () => {
    setSubmitted(true)
    onComplete()
  }

  const correct = submitted
    ? data.questions.filter(q => q.correctOptionId && answers[q.id] === q.correctOptionId).length
    : 0

  return (
    <div className="space-y-8">

      {/* Resultado global */}
      {submitted && (
        <div className="rounded-2xl bg-primary/8 border border-primary/15 p-4 text-center">
          <p className="text-lg font-bold text-primary">
            {correct}/{data.questions.length} correctas
          </p>
          <p className="text-sm text-secondary mt-0.5">
            {correct === data.questions.length
              ? '¡Perfecto! Todas correctas'
              : 'Revisa las respuestas marcadas en rojo'}
          </p>
        </div>
      )}

      {data.questions.map((q, qi) => {
        const chosen = answers[q.id]

        return (
          <div key={q.id} className="space-y-3">
            {/* §8.2 — label pregunta */}
            <p className="text-xs font-bold text-secondary uppercase tracking-widest">
              Pregunta {qi + 1}
            </p>

            {/* §8.3 — texto pregunta */}
            <p className="text-lg font-extrabold text-primary leading-snug">
              {q.text}
            </p>
            <p className="text-sm text-secondary">
              Selecciona la mejor respuesta.
            </p>

            {/* §8.4 — grid 2×2 de opciones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {q.options.map((opt, oi) => {
                const isChosen      = chosen === opt.id
                const showCorrect   = submitted && opt.id === q.correctOptionId
                const showWrong     = submitted && isChosen && !showCorrect
                const label         = OPTION_LABELS[oi] ?? String(oi + 1)

                let optionClass = 'flex items-center gap-3 p-4 rounded-2xl cursor-pointer text-left border-2 transition-all duration-150 active:scale-[0.98]'

                if (submitted) {
                  if (showCorrect) optionClass += ' bg-green-50 border-green-500'
                  else if (showWrong) optionClass += ' bg-red-50 border-red-400'
                  else optionClass += ' bg-surface-muted border-transparent opacity-50'
                } else if (isChosen) {
                  optionClass += ' bg-secondary/10 border-secondary'
                } else {
                  optionClass += ' bg-surface-muted border-transparent hover:border-secondary/40 hover:bg-secondary/5'
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(q.id, opt.id)}
                    disabled={submitted}
                    className={optionClass}
                    aria-pressed={isChosen}
                  >
                    {/* Badge letra */}
                    <span
                      className={[
                        'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                        'text-xs font-bold border transition-colors',
                        showCorrect ? 'bg-green-500 border-green-500 text-white'
                        : showWrong ? 'bg-red-400 border-red-400 text-white'
                        : isChosen  ? 'bg-secondary border-secondary text-white'
                        : 'bg-white border-mid/30 text-secondary',
                      ].join(' ')}
                    >
                      {label}
                    </span>

                    <span className="text-sm font-medium text-primary flex-1 text-left">
                      {opt.text}
                    </span>

                    {showCorrect && <CheckCircle2 size={18} className="text-green-500 shrink-0" />}
                    {showWrong   && <XCircle      size={18} className="text-red-400  shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Botón enviar — solo antes de submit */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="w-full min-h-[48px] rounded-2xl font-semibold text-sm
                     bg-primary text-white
                     disabled:opacity-40 disabled:cursor-not-allowed
                     hover:bg-secondary active:scale-95 transition-all duration-200"
        >
          Verificar respuestas
        </button>
      )}
    </div>
  )
}
