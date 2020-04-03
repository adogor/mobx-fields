import isEmailValidator from "validator/lib/isEmail";
import isMobilePhone from "validator/lib/isMobilePhone";
import isPostalCodeValidator from "validator/lib/isPostalCode";
import {
  ValidationContext,
  ValidationObj,
  next,
  error,
  stop,
} from "../validation";
import { Nullable } from "../utils";

export const isEmail = (code?: string) => (
  context: ValidationContext<Nullable<string>>
): ValidationObj => {
  const isValid = !context.value || isEmailValidator(context.value);
  return isValid
    ? next()
    : error(code || "validation.wrong-email", { label: context.label });
};

export const isRequired = (code?: string) => <T>(
  context: ValidationContext<T>
): ValidationObj => {
  const value = context.value as any;
  let isValid = !!value;
  if (isValid && value.push) {
    // If is array then length must be > 0
    isValid = !!value.length;
  }
  return isValid
    ? next()
    : error(code || "validation.required", { label: context.label });
};

export const maxLength = (maxLength: number, code?: string) => (
  context: ValidationContext<string | Array<any>>
): ValidationObj => {
  if (!context.value) {
    return stop();
  }
  const isValid = !context.value || context.value.length <= maxLength;
  return isValid
    ? next()
    : error(code || "validation.max-length", {
        label: context.label,
        maxLength,
      });
};

// export const isInt = (message: string, { max, min }: { max?: number; min?: number }) => (
//   context: ValidationContext<string | number>
// ): ValidationObj => {
//   if (!context.value) {
//     return stop();
//   }
//   let isValid = Number.isInteger(context.value);
//   if (isValid && max) {
//     isValid = context.value <= max;
//   }
//   if (isValid && min) {
//     isValid = context.value >= min;
//   }
//   return isValid ? next() : error(message);
// };

export const isPositiveNumber = (code?: string) => (
  context: ValidationContext<number>
): ValidationObj => {
  if (!context.value) {
    return stop();
  }
  const isValid = context.value > 0;
  return isValid
    ? next()
    : error(code || "validation.not-positive-number", {
        label: context.label,
        maxLength,
      });
};

export const isPostalCode = (code?: string) => (
  context: ValidationContext<string>
): ValidationObj => {
  if (!context.value) {
    return stop();
  }
  const isValid = isPostalCodeValidator(context.value, "FR");
  return isValid
    ? next()
    : error(code || "validation.not-postal-code", {
        label: context.label,
        maxLength,
      });
};

export const isPhoneNumber = (code?: string) => (
  context: ValidationContext<string>
): ValidationObj => {
  if (!context.value) {
    return stop();
  }
  const isValid = isMobilePhone(context.value, "fr-FR");
  return isValid
    ? next()
    : error(code || "validation.not-phone-number", {
        label: context.label,
        maxLength,
      });
};

// export function isDate(newValue, label) {
//   const isValid = !newValue || isValidDate(newValue);
//   return {
//     valid: isValid,
//     message: !isValid ? `${label} non valide` : ""
//   };
// }

// export function isAlphanumeric(newValue, label) {
//   const isValid = !newValue || !!newValue.match(/^[0-9A-Z-]+$/i);
//   return {
//     valid: isValid,
//     message: !isValid ? `${label || "Le champ"} doit être alphanumerique` : "",
//   };
// }

// export const forbiddenChar = (char, label, message) => newValue => {
//   let value = newValue;
//   let isValid = !value || !value.includes(char);
//   return {
//     valid: isValid,
//     message: !isValid
//       ? message || `${label || "Le champ"} ne doit pas contenir le caractère ${char}`
//       : "",
//   };
// };

// export const forbiddenChars = (chars = [], label, message) => value => {
//   let isValid =
//     !value ||
//     !chars.filter(char => {
//       return value.includes(char);
//     }).length > 0;
//   return {
//     valid: isValid,
//     message: !isValid
//       ? message || `${label || "Le champ"} ne doit pas contenir les caractères ${chars.join(" ")}`
//       : "",
//   };
// };
