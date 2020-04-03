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

export const error = (code: string, params: {}): ValidationObj => ({
  valid: false,
  message: {
    code,
    params,
  },
});

export const stop = (): ValidationObj => ({ stop: true, valid: true });

export interface I18nMessage {
  code: string;
  params: {};
}

export type ErrorMessage = string | I18nMessage;

// export type ErrorTranslator = (error: ErrorMessage) => string;

// function defaultErrorTranslator(error: ErrorMessage) {
//   if (typeof error === "string") {
//     return error;
//   } else {
//     return error[0];
//   }
// }
