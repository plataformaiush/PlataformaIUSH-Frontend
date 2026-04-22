export class HexColor {
  private constructor(private readonly value: string) {}

  static create(hex: string): HexColor {
    if (!HexColor.isValidHex(hex)) {
      throw new Error('Invalid hex color format')
    }
    return new HexColor(hex)
  }

  getValue(): string {
    return this.value
  }

  isValidHex(): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(this.value)
  }

  static isValidHex(hex: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)
  }

  toRgb(): string {
    if (!this.isValidHex()) {
      throw new Error('Invalid hex color')
    }

    const hex = this.value.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)

    return `${r}, ${g}, ${b}`
  }

  toRgba(alpha: number): string {
    const rgb = this.toRgb()
    return `${rgb}, ${alpha}`
  }
}
