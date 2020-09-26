/// <reference types="node" />
declare const _default: (rootPath: string, command: string) => import("child_process").PromiseWithChild<{
    stdout: string;
    stderr: string;
}>;
export default _default;
