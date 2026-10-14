import { Config } from '@remotion/cli/config';
import { existsSync } from 'node:fs';

// Cloud sessions block Remotion's Chrome download, so reuse the preinstalled one.
const localChrome = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
if (existsSync(localChrome)) {
  Config.setBrowserExecutable(localChrome);
}
Config.setOutputLocation('out/video.mp4');
