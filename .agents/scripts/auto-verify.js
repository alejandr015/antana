import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

let input = {};
try {
  const rawStdin = fs.readFileSync(0, 'utf8');
  if (rawStdin.trim()) {
    input = JSON.parse(rawStdin);
  }
} catch {
  // Ignore stdin parse errors
}

// Evitar bucles infinitos si el Stop hook ya pidió continuar en este turno
if (input.continuationActive || input.terminationReason !== 'NO_TOOL_CALL') {
  process.stdout.write(JSON.stringify({ decision: 'allow' }));
  process.exit(0);
}

try {
  // Ejecutar la suite de pruebas unitarias y de integración del proyecto
  execSync('node --test tests/unit/orderUtils.test.js', {
    cwd: projectRoot,
    stdio: 'pipe',
    encoding: 'utf8',
    timeout: 20000
  });

  process.stdout.write(JSON.stringify({ decision: 'allow' }));
} catch (err) {
  const stdout = err.stdout ? String(err.stdout).slice(-1200) : '';
  const stderr = err.stderr ? String(err.stderr).slice(-800) : '';
  process.stdout.write(
    JSON.stringify({
      decision: 'continue',
      reason: `⚠️ [Regla Automática Antana] Las pruebas automáticas (npm test) fallaron después del último cambio. Debes corregir el error y verificar que npm test pase al 100% antes de terminar:\n${stdout}\n${stderr}`
    })
  );
}
