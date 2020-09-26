import * as util from 'util'
import { exec } from 'child_process'

const execProm = util.promisify(exec)

export default (reactAppRootPath: string, envVarString: string = '') => execProm([
  `npm install`,
  `${envVarString} npm run build`
].join(';'), {
  cwd: reactAppRootPath
})
