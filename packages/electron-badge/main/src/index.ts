import { BadgeUnix } from './badge-unix';
import { BadgeWin } from './badge-win';
export { Badge } from './badge';

export default process.platform === 'win32' ? BadgeWin : BadgeUnix;

export { BadgeUnix, BadgeWin };
