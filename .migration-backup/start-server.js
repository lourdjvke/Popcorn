import { spawn } from 'node:child_process';
import process from 'node:process';

console.log('[AI Studio] Starting MovieBox Backend (Python FastAPI) on port 8888...');
const pythonProcess = spawn('python3', ['moviebox_api_server.py'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PORT_BACKEND: '8888',
  },
});

pythonProcess.on('error', (err) => {
  console.error('[AI Studio] Failed to start Python backend:', err);
});

pythonProcess.on('exit', (code, signal) => {
  console.log(`[AI Studio] Python backend exited with code ${code} / signal ${signal}`);
});

console.log('[AI Studio] Starting Next.js Frontend on port 3000...');
const nextProcess = spawn('npx', ['next', 'dev', '-p', '3000', '-H', '0.0.0.0'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    PORT: '3000',
    BACKEND_URL: 'http://127.0.0.1:8888',
  },
});

nextProcess.on('error', (err) => {
  console.error('[AI Studio] Failed to start Next.js frontend:', err);
});

nextProcess.on('exit', (code, signal) => {
  console.log(`[AI Studio] Next.js frontend exited with code ${code} / signal ${signal}`);
  try {
    pythonProcess.kill();
  } catch {}
  process.exit(code ?? 0);
});

function cleanup() {
  console.log('[AI Studio] Shutting down servers...');
  try {
    pythonProcess.kill();
  } catch {}
  try {
    nextProcess.kill();
  } catch {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
