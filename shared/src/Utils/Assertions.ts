export class ValidationError extends Error {
  constructor(public message: string, public props: any = {}) {
    super(message);
  }
}

export interface AdditionalErrorProps {
  propertyName?: string;
}

export function assert(value: boolean, errorMessage: string, additionalErrorProps: AdditionalErrorProps = {}): void {
  if (!value) {
    throw new ValidationError(errorMessage, additionalErrorProps);
  }
}

export function assertPresent(value?: string, additionalErrorProps: AdditionalErrorProps = {}) {
  assert(!!value?.trim().length, "IS_MISSING", additionalErrorProps);
}

export function assertMinLength(minLength: number, value?: string, additionalErrorProps: AdditionalErrorProps = {}) {
  assert(!!value && value.trim().length >= minLength, "TOO_SHORT", additionalErrorProps);
}

export function makeAssertMinLength(minLength: number) {
  return assertMinLength.bind(null, minLength);
}

export function assertMaxLength(maxLength: number, value?: string, additionalErrorProps: AdditionalErrorProps = {}) {
  assert(!!value && value.trim().length <= maxLength, "TOO_LONG", additionalErrorProps);
}

export function makeAssertMaxLength(minLength: number) {
  return assertMaxLength.bind(null, minLength);
}

export function assertLengthBetween(
  minLength: number,
  maxLength: number,
  value?: string,
  additionalErrorProps: AdditionalErrorProps = {}
) {
  assertMinLength(minLength, value, additionalErrorProps);
  assertMaxLength(maxLength, value, additionalErrorProps);
}

export function makeAssertLengthBetween(minLength: number, maxLength: number) {
  return assertLengthBetween.bind(null, minLength, maxLength);
}

type Assertion = (value?: any, additionalErrorProps?: AdditionalErrorProps) => void;

export function ensureValid<T>(value: any, propertyName: string, assertions: Assertion[]): T {
  assertions.forEach(a => a(value, {propertyName}));

  return value as T;
}
