export class UUID {
  private constructor(private readonly value: string) {}

  static create(): UUID {
    return new UUID(UUID.generate())
  }

  static fromString(uuid: string): UUID {
    if (!UUID.isValid(uuid)) {
      throw new Error('Invalid UUID format')
    }
    return new UUID(uuid)
  }

  getValue(): string {
    return this.value
  }

  isValid(): boolean {
    return UUID.isValid(this.value)
  }

  static isValid(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  private static generate(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  equals(other: UUID): boolean {
    return this.value === other.getValue()
  }

  toString(): string {
    return this.value
  }
}
