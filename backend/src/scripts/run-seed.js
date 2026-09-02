import knex from 'knex';
import knexConfig from '../../knexfile.js';

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];
const db = knex(config);

async function runSeed() {
  const arg = process.argv[2];

  try {
    if (arg) {
      // Normalize seed file name with .js extension if missing
      const seedFileName = arg.endsWith('.js') ? arg : `${arg}.js`;
      console.log(`Running specific seed file: ${seedFileName}...`);
      await db.seed.run({ specific: seedFileName });
      console.log(`Successfully executed seed: ${seedFileName}`);
    } else {
      console.log('Running all seed files...');
      await db.seed.run();
      console.log('Successfully executed all seeds.');
    }
  } catch (error) {
    console.error('Error running seeds:', error.message || error);
    process.exitCode = 1;
  } finally {
    await db.destroy();
  }
}

runSeed();
