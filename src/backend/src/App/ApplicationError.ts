export class ApplicationError extends Error {
  constructor(public message: string, public context?: any) {
    super(message);

    this.name = this.constructor.name;
    this.context = context;
  }
}
