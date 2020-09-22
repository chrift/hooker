import * as util from "util";
import * as path from 'path'
import { execFile } from "child_process";

const execFileProm = util.promisify(execFile)

export default (filePath: string) => execFileProm(filePath, {
    cwd: path.dirname(filePath)
})
