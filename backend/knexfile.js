import { env } from './src/config/env.js';

export default {
  development: {
    client: 'mysql2',
    connection: {
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
      database: env.db.database,
      multipleStatements: true,
    },
    migrations: {
      directory: './src/database/migrations',
      extension: 'js',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './src/database/seeds',
      extension: 'js',
    },
  },
  production: {
    client: 'mysql2',
    connection: {
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
      database: env.db.database,
      multipleStatements: true,
    },
    migrations: {
      directory: './src/database/migrations',
      extension: 'js',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './src/database/seeds',
      extension: 'js',
    },
  },
};
