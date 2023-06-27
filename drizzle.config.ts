import type { Config } from 'drizzle-kit';

export default {
  schema: './src/**/tables/*.ts',
  out: './migrations',
} satisfies Config;
