export async function up(knex) {
  if (!(await knex.schema.hasTable('categories'))) {
    await knex.schema.createTable('categories', (table) => {
      table.bigIncrements('id').primary();
      table.bigInteger('parent_id').unsigned().nullable();
      table.string('name', 100).notNullable();
      table.string('slug', 120).notNullable().unique();
      table.text('description').nullable();
      table.string('image', 500).nullable();
      table.integer('sort_order').notNullable().defaultTo(0);
      table.boolean('status').notNullable().defaultTo(true);
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

      table.foreign('parent_id').references('id').inTable('categories').onDelete('SET NULL');
      table.index(['parent_id'], 'idx_categories_parent');
      table.index(['sort_order'], 'idx_categories_sort');
      table.index(['status'], 'idx_categories_status');
    });
  }
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('categories');
}
