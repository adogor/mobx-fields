export interface ValidationObj {
  valid: boolean;
  message?: ErrorMessage;
  stop?: boolean;
}

export interface ValidationContext<TValue> {
  value?: TValue;
  label?: string;
}

export type ValidationContextBuilder<TValue> = (
  value?: TValue,
  label?: string
) => ValidationContext<TValue>;

export type ValidationFunction<TValue> = (
  context: ValidationContext<TValue>
) => ValidationObj | Promise<ValidationObj>;

export function defaultValidationContext<TValue>(
  value?: TValue,
  label?: string
): ValidationContext<TValue> {
  return {
    value,
    label,
  };
}

export const next = (): ValidationObj => ({ valid: true });

export const error = (message: ErrorMessage): ValidationObj => ({
  valid: false,
  message,
});

export const stop = (): ValidationObj => ({ stop: true, valid: true });

export interface ErrorMessage {
  code: string;
  params?: {};
}

export function buildError(code: string, params?: {}): ErrorMessage {
  return {
    code,
    params,
  };
}
