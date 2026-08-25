import { db } from '../config/database.js';

async function main() {
  try {
    const hasTable = await db.schema.hasTable('files');
    if (!hasTable) {
      await db.schema.createTable('files', (table) => {
        table.increments('id').primary();
        table.string('filename', 255).notNullable();
        table.string('original_name', 255).notNullable();
        table.string('mime_type', 100).notNullable();
        table.integer('size').notNullable();
        table.timestamp('created_at').defaultTo(db.fn.now());
      });
      console.log('Files table created successfully!');
    } else {
      console.log('Files table already exists.');
    }
  } catch (err) {
    console.error('Failed to create files table:', err);
  } finally {
    process.exit(0);
  }
}

main();
