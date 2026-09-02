export async function up(knex) {
  // 1. Collections table
  if (!(await knex.schema.hasTable('collections'))) {
    await knex.schema.createTable('collections', (table) => {
      table.bigIncrements('id').primary();
      table.string('name', 150).notNullable();
      table.string('slug', 180).notNullable().unique();
      table.text('description').nullable();
      table.string('image', 500).nullable();
      table.dateTime('start_date').nullable();
      table.dateTime('end_date').nullable();
      table.boolean('status').notNullable().defaultTo(true);
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

      table.index(['start_date', 'end_date'], 'idx_collections_dates');
      table.index(['status'], 'idx_collections_status');
    });
  }

  // 2. Product Collections table
  if (!(await knex.schema.hasTable('product_collections'))) {
    await knex.schema.createTable('product_collections', (table) => {
      table.bigInteger('product_id').unsigned().notNullable();
      table.bigInteger('collection_id').unsigned().notNullable();
      table.primary(['product_id', 'collection_id']);

      table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE');
      table.foreign('collection_id').references('id').inTable('collections').onDelete('CASCADE');
    });
  }

  // 3. Settings table
  if (!(await knex.schema.hasTable('settings'))) {
    await knex.schema.createTable('settings', (table) => {
      table.bigIncrements('id').primary();
      table.string('key_name', 100).notNullable().unique();
      table.text('value').nullable();
      table.string('type', 20).notNullable().defaultTo('string');
      table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    });
  }

  // 4. Banners table
  if (!(await knex.schema.hasTable('banners'))) {
    await knex.schema.createTable('banners', (table) => {
      table.bigIncrements('id').primary();
      table.string('title', 150).notNullable();
      table.string('subtitle', 255).nullable();
      table.string('image_url', 500).notNullable();
      table.string('mobile_image_url', 500).nullable();
      table.string('link_url', 500).nullable();
      table.integer('sort_order').notNullable().defaultTo(0);
      table.boolean('status').notNullable().defaultTo(true);
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    });
  }

  // 5. Carts table
  if (!(await knex.schema.hasTable('carts'))) {
    await knex.schema.createTable('carts', (table) => {
      table.bigIncrements('id').primary();
      table.bigInteger('user_id').unsigned().nullable();
      table.string('session_id', 100).nullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.index(['user_id'], 'idx_carts_user');
      table.index(['session_id'], 'idx_carts_session');
    });
  }

  // 6. Cart Items table
  if (!(await knex.schema.hasTable('cart_items'))) {
    await knex.schema.createTable('cart_items', (table) => {
      table.bigIncrements('id').primary();
      table.bigInteger('cart_id').unsigned().notNullable();
      table.bigInteger('variant_id').unsigned().notNullable();
      table.integer('quantity').unsigned().notNullable().defaultTo(1);
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

      table.foreign('cart_id').references('id').inTable('carts').onDelete('CASCADE');
      table.foreign('variant_id').references('id').inTable('product_variants').onDelete('CASCADE');
      table.unique(['cart_id', 'variant_id'], { indexName: 'unique_cart_variant' });
    });
  }

  // 7. Wishlists table
  if (!(await knex.schema.hasTable('wishlists'))) {
    await knex.schema.createTable('wishlists', (table) => {
      table.bigIncrements('id').primary();
      table.bigInteger('user_id').unsigned().notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    });
  }

  // 8. Wishlist Items table
  if (!(await knex.schema.hasTable('wishlist_items'))) {
    await knex.schema.createTable('wishlist_items', (table) => {
      table.bigIncrements('id').primary();
      table.bigInteger('wishlist_id').unsigned().notNullable();
      table.bigInteger('product_id').unsigned().notNullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

      table.foreign('wishlist_id').references('id').inTable('wishlists').onDelete('CASCADE');
      table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE');
      table.unique(['wishlist_id', 'product_id'], { indexName: 'unique_wishlist_product' });
    });
  }

  // 9. Coupons table
  if (!(await knex.schema.hasTable('coupons'))) {
    await knex.schema.createTable('coupons', (table) => {
      table.bigIncrements('id').primary();
      table.string('code', 50).notNullable().unique();
      table.string('description', 255).nullable();
      table.enum('discount_type', ['percentage', 'fixed']).notNullable();
      table.decimal('discount_value', 10, 2).notNullable();
      table.decimal('min_order_amount', 10, 2).nullable();
      table.decimal('max_discount_amount', 10, 2).nullable();
      table.integer('usage_limit_total').unsigned().nullable();
      table.integer('usage_limit_per_user').unsigned().nullable();
      table.integer('times_used').unsigned().notNullable().defaultTo(0);
      table.dateTime('starts_at').nullable();
      table.dateTime('expires_at').nullable();
      table.boolean('status').notNullable().defaultTo(true);
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    });
  }

  // 10. Orders table
  if (!(await knex.schema.hasTable('orders'))) {
    await knex.schema.createTable('orders', (table) => {
      table.bigIncrements('id').primary();
      table.string('order_number', 50).notNullable().unique();
      table.bigInteger('user_id').unsigned().nullable();
      table.enum('status', ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']).notNullable().defaultTo('pending');
      table.decimal('subtotal_amount', 10, 2).notNullable();
      table.decimal('discount_amount', 10, 2).notNullable().defaultTo(0.00);
      table.decimal('shipping_fee', 10, 2).notNullable().defaultTo(0.00);
      table.decimal('tax_amount', 10, 2).notNullable().defaultTo(0.00);
      table.decimal('total_amount', 10, 2).notNullable();
      table.string('coupon_code', 50).nullable();
      table.enum('payment_status', ['pending', 'paid', 'failed', 'refunded']).notNullable().defaultTo('pending');
      table.enum('payment_method', ['cod', 'razorpay', 'stripe', 'card', 'upi']).notNullable().defaultTo('cod');
      table.text('customer_notes').nullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

      table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL');
      table.index(['order_number'], 'idx_orders_number');
      table.index(['user_id'], 'idx_orders_user');
      table.index(['status'], 'idx_orders_status');
      table.index(['created_at'], 'idx_orders_created');
    });
  }

  // 11. Order Items table
  if (!(await knex.schema.hasTable('order_items'))) {
    await knex.schema.createTable('order_items', (table) => {
      table.bigIncrements('id').primary();
      table.bigInteger('order_id').unsigned().notNullable();
      table.bigInteger('product_id').unsigned().nullable();
      table.bigInteger('variant_id').unsigned().nullable();
      table.string('product_name', 255).notNullable();
      table.string('variant_sku', 100).nullable();
      table.string('size_name', 20).nullable();
      table.string('color_name', 50).nullable();
      table.decimal('unit_price', 10, 2).notNullable();
      table.integer('quantity').unsigned().notNullable();
      table.decimal('total_price', 10, 2).notNullable();

      table.foreign('order_id').references('id').inTable('orders').onDelete('CASCADE');
      table.foreign('product_id').references('id').inTable('products').onDelete('SET NULL');
      table.foreign('variant_id').references('id').inTable('product_variants').onDelete('SET NULL');
    });
  }

  // 12. Order Addresses table
  if (!(await knex.schema.hasTable('order_addresses'))) {
    await knex.schema.createTable('order_addresses', (table) => {
      table.bigIncrements('id').primary();
      table.bigInteger('order_id').unsigned().notNullable();
      table.enum('type', ['shipping', 'billing']).notNullable().defaultTo('shipping');
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

      table.foreign('order_id').references('id').inTable('orders').onDelete('CASCADE');
    });
  }

  // 13. Payments table
  if (!(await knex.schema.hasTable('payments'))) {
    await knex.schema.createTable('payments', (table) => {
      table.bigIncrements('id').primary();
      table.bigInteger('order_id').unsigned().notNullable();
      table.string('transaction_id', 150).nullable();
      table.string('gateway_name', 50).notNullable().defaultTo('razorpay');
      table.decimal('amount', 10, 2).notNullable();
      table.enum('status', ['pending', 'success', 'failed', 'refunded']).notNullable().defaultTo('pending');
      table.json('gateway_response').nullable();
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

      table.foreign('order_id').references('id').inTable('orders').onDelete('CASCADE');
    });
  }

  // 14. Reviews table
  if (!(await knex.schema.hasTable('reviews'))) {
    await knex.schema.createTable('reviews', (table) => {
      table.bigIncrements('id').primary();
      table.bigInteger('product_id').unsigned().notNullable();
      table.bigInteger('user_id').unsigned().notNullable();
      table.integer('rating').unsigned().notNullable();
      table.string('title', 150).nullable();
      table.text('comment').nullable();
      table.boolean('is_verified_purchase').notNullable().defaultTo(false);
      table.boolean('status').notNullable().defaultTo(true);
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

      table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE');
      table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    });
  }
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('reviews');
  await knex.schema.dropTableIfExists('payments');
  await knex.schema.dropTableIfExists('order_addresses');
  await knex.schema.dropTableIfExists('order_items');
  await knex.schema.dropTableIfExists('orders');
  await knex.schema.dropTableIfExists('coupons');
  await knex.schema.dropTableIfExists('wishlist_items');
  await knex.schema.dropTableIfExists('wishlists');
  await knex.schema.dropTableIfExists('cart_items');
  await knex.schema.dropTableIfExists('carts');
  await knex.schema.dropTableIfExists('banners');
  await knex.schema.dropTableIfExists('settings');
  await knex.schema.dropTableIfExists('product_collections');
  await knex.schema.dropTableIfExists('collections');
}
