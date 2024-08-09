import { BadgeUnix } from './badge-unix.js';
import { BadgeWin } from './badge-win.js';

const badge = process.platform === 'win32' ? BadgeWin : BadgeUnix;

export default badge;
