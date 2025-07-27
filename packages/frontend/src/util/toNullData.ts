export function toNullable<T extends object>(input?: Partial<T>): { [K in keyof T]: T[K] | null } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const output = {} as any;
  for (const key in input) {
    output[key] = input?.[key] ?? null;
  }
  return output;
}