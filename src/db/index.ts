import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {EnvService} from "../common/env.service";

const pool = new Pool({
  host: EnvService.getOrThrow({key: 'POSTGRES_HOST'}),
  port: EnvService.getOrThrow({key: 'POSTGRES_PORT', isNumber: true}),
  user: EnvService.getOrThrow({key: 'POSTGRES_USER'}),
  password: EnvService.getOrThrow({key: 'POSTGRES_PASSWORD'}),
  database: EnvService.getOrThrow({key: 'POSTGRES_DB'}),
});

export const db = drizzle(pool);
