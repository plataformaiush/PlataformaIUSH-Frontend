export const colors = {
  neutral:   '#060A0D',
  primary:   '#223740',
  secondary: '#58838C',
  mid:       '#84B9BF',
  tertiary:  '#AEEBF2',
  surface:   '#ffffff',
  surfaceMuted: '#f1f5f9',
} as const

export type ColorKey = keyof typeof colors
