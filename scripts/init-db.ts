import pg from 'pg';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = resolve(__dirname, '..', 'prisma', 'migrations');

async function main() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Test connection
    await pool.query('SELECT 1');
    console.log('✓ Conexión a BD exitosa');
  } catch (error) {
    console.error('✗ Error conectando a BD:', error instanceof Error ? error.message : error);
    process.exit(1);
  }

  // Check if tables already exist
  try {
    const { rows } = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'ServiceCategory'
      )`
    );
    const alreadyInitialized = rows[0]?.exists === true;

    if (alreadyInitialized) {
      console.log('✓ Base de datos ya inicializada');
      await pool.end();
      return;
    }
  } catch (error) {
    console.error('✗ Error verificando tablas:', error instanceof Error ? error.message : error);
    process.exit(1);
  }

  console.log('Inicializando base de datos...');

  // Run migrations in order
  const migrations = [
    '20260518015539_init',
    '20260518015600_add_schedule_config',
  ];

  for (const migration of migrations) {
    const filePath = resolve(MIGRATIONS_DIR, migration, 'migration.sql');
    const sql = readFileSync(filePath, 'utf-8');
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      try {
        await pool.query(statement);
      } catch (runError) {
        const message = runError instanceof Error ? runError.message : String(runError);
        // Ignore "already exists" errors for idempotency
        if (
          message.includes('already exists') ||
          message.includes('duplicate') ||
          message.includes('already been applied')
        ) {
          continue;
        }
        console.error(`✗ Error en migración ${migration}:`, message);
        throw runError;
      }
    }
    console.log(`  ✓ Migración ${migration} aplicada`);
  }

  await pool.end();
  console.log('✓ Base de datos lista');
}

main().catch((error) => {
  console.error('Error inicializando BD:', error instanceof Error ? error.message : error);
  process.exit(1);
});
