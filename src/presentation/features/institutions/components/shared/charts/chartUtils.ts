// Función para completar datos faltantes de la semana
export interface SesionDia {
  dia: string
  sesiones: number
}

export function completarDatosSemana(datos: SesionDia[]): SesionDia[] {
  if (datos.length === 0) return []

  // Obtener la fecha más reciente
  const fechas = datos.map(d => new Date(d.dia))
  const fechaMaxima = new Date(Math.max(...fechas.map(f => f.getTime())))

  // Generar últimos 7 días
  const ultimos7Dias: SesionDia[] = []
  for (let i = 6; i >= 0; i--) {
    const fecha = new Date(fechaMaxima)
    fecha.setDate(fecha.getDate() - i)
    const diaFormato = fecha.toISOString().split('T')[0]
    
    // Buscar si hay datos para ese día
    const datoDia = datos.find(d => d.dia === diaFormato)
    ultimos7Dias.push({
      dia: diaFormato,
      sesiones: datoDia ? datoDia.sesiones : 0
    })
  }

  return ultimos7Dias
}

export interface SesionPorDia {
  diaSemana: string
  total: number
}

// Función para completar sesiones por día de la semana
export function completarSesionesPorDia(datos: SesionPorDia[]): Array<{ dia: string; val: number }> {
  const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
  
  return diasSemana.map(dia => {
    const datoDia = datos.find(d => d.diaSemana === dia)
    return {
      dia,
      val: datoDia ? datoDia.total : 0
    }
  })
}
