import * as util from 'util'
import { exec } from 'child_process'

const execProm = util.promisify(exec)

export default (rootPath: string, command:string) => execProm(command, {
  cwd: rootPath
})
