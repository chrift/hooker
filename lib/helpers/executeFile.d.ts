/// <reference types="node" />
declare const _default: (filePath: string) => import("child_process").PromiseWithChild<{
    stdout: string;
    stderr: string;
}>;
export default _default;
