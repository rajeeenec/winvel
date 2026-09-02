export async function up(knex) {
  // 1. Roles table
  if (!(await knex.schema.hasTable('roles'))) {
    await knex.schema.createTable('roles', (table) => {
      table.bigIncrements('id').primary();
      table.string('name', 50).notNullable().unique();
      table.string('description', 255).nullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    });
  }

  // 2. Permissions table
  if (!(await knex.schema.hasTable('permissions'))) {
    await knex.schema.createTable('permissions', (table) => {
      table.bigIncrements('id').primary();
      table.string('name', 100).notNullable().unique();
      table.string('module', 50).notNullable();
      table.string('action', 50).notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    });
  }

  // 3. Role Permissions junction table
  if (!(await knex.schema.hasTable('role_permissions'))) {
    await knex.schema.createTable('role_permissions', (table) => {
      table.bigInteger('role_id').unsigned().notNullable();
      table.bigInteger('permission_id').unsigned().notNullable();
      table.primary(['role_id', 'permission_id']);
      table.foreign('role_id').references('id').inTable('roles').onDelete('CASCADE');
      table.foreign('permission_id').references('id').inTable('permissions').onDelete('CASCADE');
    });
  }

  // 4. Users table
  if (!(await knex.schema.hasTable('users'))) {
    await knex.schema.createTable('users', (table) => {
      table.bigIncrements('id').primary();
      table.bigInteger('role_id').unsigned().notNullable();
      table.string('first_name', 100).notNullable();
      table.string('last_name', 100).nullable();
      table.string('email', 255).notNullable().unique();
      table.string('phone', 20).nullable().unique();
      table.string('password_hash', 255).notNullable();
      table.dateTime('email_verified_at').nullable();
      table.dateTime('phone_verified_at').nullable();
      table.enum('status', ['active', 'blocked', 'inactive']).notNullable().defaultTo('active');
      table.dateTime('last_login_at').nullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
      table.dateTime('deleted_at').nullable();

      table.foreign('role_id').references('id').inTable('roles');
      table.index(['role_id'], 'idx_users_role');
      table.index(['status'], 'idx_users_status');
      table.index(['created_at'], 'idx_users_created');
      table.index(['deleted_at'], 'idx_users_deleted');
    });
  }

  // 5. User Addresses table
  if (!(await knex.schema.hasTable('user_addresses'))) {
    await knex.schema.createTable('user_addresses', (table) => {
      table.bigIncrements('id').primary();
      table.bigInteger('user_id').unsigned().notNullable();
      table.enum('address_type', ['home', 'work', 'other']).notNullable().defaultTo('home');
      table.string('full_name', 150).notNullable();
      table.string('phone', 20).notNullable();
      table.string('address_line1', 255).notNullable();
      table.string('address_line2', 255).nullable();
      table.string('landmark', 150).nullable();
      table.string('city', 100).notNullable();
      table.string('district', 100).nullable();
      table.string('state', 100).notNullable();
      table.string('country', 100).notNullable().defaultTo('India');
      table.string('postal_code', 10).notNullable();
      table.boolean('is_default').notNullable().defaultTo(false);
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.index(['user_id'], 'idx_addresses_user');
      table.index(['postal_code'], 'idx_addresses_postal');
      table.index(['is_default'], 'idx_addresses_default');
    });
  }
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('user_addresses');
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('role_permissions');
  await knex.schema.dropTableIfExists('permissions');
  await knex.schema.dropTableIfExists('roles');
}
