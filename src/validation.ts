export interface ValidationObj {
  valid: boolean;
  message?: ErrorMessage;
  stop?: boolean;
  data?: any;
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

export const next = (data?: any): ValidationObj => ({ valid: true, data });

export const error = (message: ErrorMessage, data?: any): ValidationObj => ({
  valid: false,
  message,
  data,
});

export const stop = (data?: any): ValidationObj => ({
  stop: true,
  valid: true,
  data,
});

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
