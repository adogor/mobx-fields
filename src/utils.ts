export function toNumber(newValue: string) {
  try {
    const int = parseInt(newValue, 10);
    return isNaN(int) ? 0 : int;
  } catch (e) {
    return 0;
  }
}

export const numberParser = (val: string) => {
  return toNumber(val);
};

export const numberFormater = (val: Nullable<number>) => {
  return val ? val.toString() : "";
};

export type Nullable<T> = T | null;

export function isPromise<T>(obj: T | Promise<T>): obj is Promise<T> {
  return typeof (obj as any).then !== "undefined";
}
