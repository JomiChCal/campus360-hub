import { spawn } from 'node:child_process';

function runStep(
  name: string,
  command: string,
  args: string[],
  env?: Record<string, string>,
): Promise<void> {
  console.log(`\n==> ${name}`);

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: { ...process.env, ...env },
    });

    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${name} failed with exit code ${code}`));
    });
    child.on('error', reject);
  });
}

async function main() {
  await runStep('Fetch portal payload', 'pnpm', ['import:servicios:fetch']);
  await runStep('Transform payload', 'pnpm', ['import:servicios:transform']);
  await runStep('Seed Neon', 'pnpm', ['db:seed:servicios'], {
    ACADEMIC_SERVICES_DATA_PROVIDER: 'neon',
  });
  await runStep('Validate seeded catalog', 'pnpm', ['validate:servicios:seed'], {
    ACADEMIC_SERVICES_DATA_PROVIDER: 'neon',
  });
  console.log('\nUTPL manual ETL completed successfully.');
}

main().catch((error) => {
  console.error('UTPL manual ETL failed:', error);
  process.exit(1);
});
