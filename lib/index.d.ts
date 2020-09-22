/// <reference types="node" />
declare type HookerAction = () => Promise<any>;
interface HookerStep {
    name?: string;
    action: HookerAction;
}
interface HookerOptions {
    name: string;
    webhookSecret: string;
    slackWebHookUrl: string;
    gitRef?: string;
    port?: number;
    steps: Array<HookerStep | HookerAction>;
}
interface s3Credentials {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucket: string;
}
declare const job: {
    slackMessage: (message: string, slackWebHookUrl: string) => () => any;
    buildReact: (reactAppRootPath: string) => () => import("child_process").PromiseWithChild<{
        stdout: string;
        stderr: string;
    }>;
    uploadDirToS3: (dirPath: string, credentials: s3Credentials) => () => any;
    executeFile: (filePath: string) => () => import("child_process").PromiseWithChild<{
        stdout: string;
        stderr: string;
    }>;
};
declare const init: (hookerOptions: HookerOptions) => void;
export { job, init };
declare const _default: {
    job: {
        slackMessage: (message: string, slackWebHookUrl: string) => () => any;
        buildReact: (reactAppRootPath: string) => () => import("child_process").PromiseWithChild<{
            stdout: string;
            stderr: string;
        }>;
        uploadDirToS3: (dirPath: string, credentials: s3Credentials) => () => any;
        executeFile: (filePath: string) => () => import("child_process").PromiseWithChild<{
            stdout: string;
            stderr: string;
        }>;
    };
    init: (hookerOptions: HookerOptions) => void;
};
export default _default;
