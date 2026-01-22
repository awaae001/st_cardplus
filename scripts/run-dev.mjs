import { spawn } from 'child_process';

const rawArgs = process.argv.slice(2);
const disableElectron = rawArgs.includes('--on') || rawArgs.includes('--on_electron');
const viteArgs = rawArgs.filter((arg) => arg !== '--on' && arg !== '--on_electron');

const spawnWithExit = (cmd, args, extraEnv = {}) => {
  const child = spawn(cmd, args, {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, ...extraEnv },
  });
  child.on('exit', (code) => process.exit(code ?? 0));
};

if (disableElectron) {
  spawnWithExit('vite', viteArgs, { DISABLE_ELECTRON: '1' });
} else {
  const viteCmd = ['vite', ...viteArgs].join(' ');
  const electronCmd = 'wait-on http://localhost:5173 && electron .';
  spawnWithExit('concurrently', ['-k', viteCmd, electronCmd]);
}
