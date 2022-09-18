import {remove} from 'fs-extra';
import { resolve } from 'path';

const root = process.cwd();

const demoDist = resolve(root, './create-template/dist');
const demoNodeModules = resolve(root, './create-template/node_modules');

remove(demoDist);
remove(demoNodeModules);