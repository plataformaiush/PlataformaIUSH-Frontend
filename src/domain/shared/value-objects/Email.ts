export class Email {
  private constructor(private readonly value: string) {}

  static create(email: string): Email {
    if (!Email.isValid(email)) {
      throw new Error('Invalid email format')
    }
    return new Email(email)
  }

  getValue(): string {
    return this.value
  }

  isValid(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value)
  }

  static isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }
}
