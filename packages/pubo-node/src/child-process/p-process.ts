import { PProcessLinux } from './linux';
import { PProcessWin32 } from './win32';

export const PProcess = (() => {
  if (process.platform === 'win32') {
    return new PProcessWin32();
  } else {
    return new PProcessLinux();
  }
})();
