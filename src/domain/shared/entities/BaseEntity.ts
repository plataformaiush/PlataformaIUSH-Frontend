// Base entity with common properties for all domain entities
export abstract class BaseEntity {
  protected constructor(
    public readonly id: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
