import { omitBy } from "lodash";

export function toNullable<T extends object>(input?: Partial<T>): Partial<T> {
  if (!input) return {};

  return omitBy(input, (v) =>
    v === null || v === undefined || v === '' || v === 0 || v === false
  ) as Partial<T>;
}