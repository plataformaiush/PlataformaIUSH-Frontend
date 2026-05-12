const MODULE_COLORS = [
  '#E53E6D',
  '#3D9BE9',
  '#2ECC71',
  '#F39C12',
  '#9B59B6',
  '#1ABC9C',
  '#E74C3C',
  '#F1C40F',
]

export function getModuleColor(moduleIndex: number): string {
  return MODULE_COLORS[moduleIndex % MODULE_COLORS.length]
}

export function useModuleColor(moduleIndex: number): string {
  return getModuleColor(moduleIndex)
}
