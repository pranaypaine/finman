import type {Config} from 'drizzle-kit';

export default {
  schema: './src/database/schema/index.ts',
  out: './src/database/migrations',
  driver: 'better-sqlite',
  dbCredentials: {
    url: 'file:./fintrack.db',
  },
} satisfies Config;
