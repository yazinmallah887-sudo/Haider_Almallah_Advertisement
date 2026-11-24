import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
Config.setEntryPoint('./src/index.ts');
// Optional: point Remotion at an already-installed Chrome Headless Shell
// (e.g. REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell)
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
Config.setConcurrency(process.env.REMOTION_CONCURRENCY ? Number(process.env.REMOTION_CONCURRENCY) : null);
