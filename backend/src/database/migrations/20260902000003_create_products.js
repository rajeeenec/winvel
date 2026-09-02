export async function up(knex) {
  // 1. Products table
  if (!(await knex.schema.hasTable('products'))) {
    await knex.schema.createTable('products', (table) => {
      table.bigIncrements('id').primary();
      table.string('name', 255).notNullable();
      table.string('slug', 280).notNullable().unique();
      table.string('short_description', 500).nullable();
      table.text('description', 'longtext').nullable();
      table.string('brand', 100).notNullable().defaultTo('WINVEL');
      table.decimal('base_price', 10, 2).notNullable();
      table.enum('status', ['draft', 'active', 'inactive', 'archived']).notNullable().defaultTo('draft');
      table.boolean('featured').notNullable().defaultTo(false);
      table.boolean('is_bestseller').notNullable().defaultTo(false);
      table.boolean('is_new').notNullable().defaultTo(false);
      table.decimal('rating', 3, 2).notNullable().defaultTo(0.00);
      table.integer('review_count').unsigned().notNullable().defaultTo(0);
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
      table.dateTime('deleted_at').nullable();

      table.index(['name'], 'idx_products_name');
      table.index(['base_price'], 'idx_products_price');
      table.index(['status'], 'idx_products_status');
      table.index(['featured', 'is_bestseller', 'is_new'], 'idx_products_flags');
      table.index(['created_at'], 'idx_products_created');
      table.index(['deleted_at'], 'idx_products_deleted');
    });
  }

  // 2. Sizes table
  if (!(await knex.schema.hasTable('sizes'))) {
    await knex.schema.createTable('sizes', (table) => {
      table.bigIncrements('id').primary();
      table.string('name', 20).notNullable().unique();
      table.integer('sort_order').notNullable().defaultTo(0);
      table.boolean('status').notNullable().defaultTo(true);

      table.index(['sort_order'], 'idx_sizes_sort');
      table.index(['status'], 'idx_sizes_status');
    });
  }

  // 3. Colors table
  if (!(await knex.schema.hasTable('colors'))) {
    await knex.schema.createTable('colors', (table) => {
      table.bigIncrements('id').primary();
      table.string('name', 50).notNullable().unique();
      table.string('hex_code', 7).notNullable();
      table.integer('sort_order').notNullable().defaultTo(0);
      table.boolean('status').notNullable().defaultTo(true);

      table.index(['sort_order'], 'idx_colors_sort');
      table.index(['status'], 'idx_colors_status');
    });
  }

  // 4. Product Variants table
  if (!(await knex.schema.hasTable('product_variants'))) {
    await knex.schema.createTable('product_variants', (table) => {
      table.bigIncrements('id').primary();
      table.bigInteger('product_id').unsigned().notNullable();
      table.bigInteger('size_id').unsigned().nullable();
      table.bigInteger('color_id').unsigned().nullable();
      table.string('sku', 100).notNullable().unique();
      table.decimal('price', 10, 2).notNullable();
      table.decimal('compare_at_price', 10, 2).nullable();
      table.integer('stock_quantity').notNullable().defaultTo(0);
      table.integer('low_stock_threshold').unsigned().notNullable().defaultTo(5);
      table.integer('weight_grams').unsigned().nullable();
      table.boolean('status').notNullable().defaultTo(true);
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

      table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE');
      table.foreign('size_id').references('id').inTable('sizes').onDelete('SET NULL');
      table.foreign('color_id').references('id').inTable('colors').onDelete('SET NULL');
      table.unique(['product_id', 'size_id', 'color_id'], { indexName: 'unique_variant_combo' });

      table.index(['product_id'], 'idx_variants_product');
      table.index(['size_id'], 'idx_variants_size');
      table.index(['color_id'], 'idx_variants_color');
      table.index(['sku'], 'idx_variants_sku');
    });
  }

  // 5. Product Images table
  if (!(await knex.schema.hasTable('product_images'))) {
    await knex.schema.createTable('product_images', (table) => {
      table.bigIncrements('id').primary();
      table.bigInteger('product_id').unsigned().notNullable();
      table.bigInteger('variant_id').unsigned().nullable();
      table.string('image_url', 500).notNullable();
      table.string('alt_text', 255).nullable();
      table.integer('sort_order').notNullable().defaultTo(0);
      table.boolean('is_primary').notNullable().defaultTo(false);
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

      table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE');
      table.foreign('variant_id').references('id').inTable('product_variants').onDelete('SET NULL');
      table.index(['product_id'], 'idx_pimages_product');
      table.index(['variant_id'], 'idx_pimages_variant');
    });
  }

  // 6. Product Categories junction table
  if (!(await knex.schema.hasTable('product_categories'))) {
    await knex.schema.createTable('product_categories', (table) => {
      table.bigInteger('product_id').unsigned().notNullable();
      table.bigInteger('category_id').unsigned().notNullable();
      table.primary(['product_id', 'category_id']);

      table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE');
      table.foreign('category_id').references('id').inTable('categories').onDelete('CASCADE');
    });
  }
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('product_categories');
  await knex.schema.dropTableIfExists('product_images');
  await knex.schema.dropTableIfExists('product_variants');
  await knex.schema.dropTableIfExists('colors');
  await knex.schema.dropTableIfExists('sizes');
  await knex.schema.dropTableIfExists('products');
}
