import { spawn } from 'child_process';

const rawArgs = process.argv.slice(2);
const webOnly = rawArgs.includes('--web') || rawArgs.includes('--on');
const viteArgs = rawArgs.filter((arg) => !['--web', '--on', '--on_electron'].includes(arg));

// Windows requires shell: true to resolve .cmd scripts in node_modules/.bin
const isWindows = process.platform === 'win32';

/**
 * Spawn a child process and forward exit code.
 * Uses shell mode on Windows to correctly resolve npm/pnpm binaries.
 */
const spawnWithExit = (cmd, args, extraEnv = {}) => {
  const child = spawn(cmd, args, {
    stdio: 'inherit',
    shell: isWindows,
    env: { ...process.env, ...extraEnv },
  });
  child.on('error', (err) => {
    console.error(`Failed to execute command: ${cmd}`, err);
    process.exit(1);
  });
  child.on('exit', (code) => process.exit(code ?? 0));
};

if (webOnly) {
  // Web-only mode: disable Electron plugin, run pure Vite dev server
  console.log('Starting in Web-only mode...');
  spawnWithExit('vite', viteArgs, { DISABLE_ELECTRON: '1' });
} else {
  // Electron mode: vite-plugin-electron handles Electron startup automatically
  console.log('Starting in Electron mode...');
  spawnWithExit('vite', viteArgs, {});
}
