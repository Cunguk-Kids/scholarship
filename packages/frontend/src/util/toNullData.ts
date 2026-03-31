export function toNullable<T extends object>(input?: Partial<T>): Partial<T> {
  if (!input) return {};

  const result = {} as Partial<T>;

  for (const key in input) {
    const value = input[key];
    if (value) result[key] = value;
  }

  return result;
}