import { ValidationSchema } from 'fastest-validator';

type Primitive = {
  string: string;
  boolean: boolean;
  number: number;
};

type RemoveFlagsFromSchema<T extends ValidationSchema> = {
  [K in keyof T as K extends `$$${infer _}` ? never : K]: T[K];
};

type SchemaObjectProperty = { type: 'object'; props: ValidationSchema };
type SchemaArrayProperty = { type: 'array'; items: SchemaProperty };
type SchemaPrimitiveProperty = { type: keyof Primitive };

type SchemaProperty =
  | SchemaObjectProperty
  | SchemaArrayProperty
  | SchemaPrimitiveProperty;

type GetTypeFromSchemaProperty<T extends SchemaProperty> =
  T extends SchemaPrimitiveProperty
    ? Primitive[T['type']]
    : T extends SchemaObjectProperty
    ? GetTypeFromValidationSchema<T['props']>
    : T extends SchemaArrayProperty
    ? GetTypeFromSchemaProperty<T['items']>[]
    : string;

export type GetTypeFromValidationSchema<T extends ValidationSchema> = {
  -readonly [K in keyof RemoveFlagsFromSchema<T>]: T[K]['optional'] extends true
    ? GetTypeFromSchemaProperty<T[K]> | undefined
    : GetTypeFromSchemaProperty<T[K]>;
};

export type ValidationConfig = {
  bodySchema?: ValidationSchema;
  requestSchema?: ValidationSchema;
  querySchema?: ValidationSchema;
  paramSchema?: ValidationSchema;
};
