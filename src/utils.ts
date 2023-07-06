export function assignDefined<
  T extends Record<PropertyKey, unknown>,
  S extends Record<PropertyKey, unknown>,
>(target: T, source: S): T & S {
  const keys = Object.keys(source);

  for (const key of keys) {
    if (source[key] !== undefined) {
      Reflect.set(target, key, source[key]); // https://github.com/microsoft/TypeScript/issues/47357#issuecomment-1364043084
    }
  }

  return target as T & S;
}
