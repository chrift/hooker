"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runHookerConfig = exports.init = exports.job = void 0;
// @ts-ignore
const s3_folder_upload_1 = __importDefault(require("s3-folder-upload"));
const http = __importStar(require("http"));
const webhooks_1 = require("@octokit/webhooks");
const slack_1 = __importDefault(require("./helpers/slack"));
const buildReact_1 = __importDefault(require("./helpers/buildReact"));
const executeFile_1 = __importDefault(require("./helpers/executeFile"));
const executeCommand_1 = __importDefault(require("./helpers/executeCommand"));
const job = {
    slackMessage: (message, slackWebHookUrl) => () => slack_1.default.sendMessage(message, slackWebHookUrl),
    buildReact: (reactAppRootPath, envVarString = '') => () => buildReact_1.default(reactAppRootPath, envVarString),
    uploadDirToS3: (dirPath, credentials) => () => s3_folder_upload_1.default(dirPath, credentials, { useFoldersForFileTypes: false }),
    executeFile: (filePath) => () => executeFile_1.default(filePath),
    executeCommand: (rootPath, command) => () => executeCommand_1.default(rootPath, command)
};
exports.job = job;
const runHookerConfig = async (hookerOptions) => {
    try {
        for (const [index, step] of hookerOptions.steps.entries()) {
            const stepNumber = index + 1;
            if ('action' in step) {
                console.log(`Running step ${stepNumber}. ${step.name}...`);
                await step.action();
                console.log(`Completed step ${stepNumber}. ${step.name}`);
            }
            else {
                console.log(`Running step ${stepNumber}...`);
                await step();
                console.log(`Completed step ${stepNumber}`);
            }
        }
        console.log('Completed all steps');
    }
    catch (e) {
        const message = `Hooker job ${hookerOptions.name} failed with message ${e.message}`;
        console.error(message);
        slack_1.default.sendMessage(message, hookerOptions.slackWebHookUrl);
    }
};
exports.runHookerConfig = runHookerConfig;
const init = (hookerOptions) => {
    hookerOptions.gitRef = hookerOptions.gitRef || 'refs/heads/master';
    hookerOptions.port = hookerOptions.port || 3100;
    const webhooks = new webhooks_1.Webhooks({
        secret: hookerOptions.webhookSecret,
    });
    webhooks.on('push', async (hook) => {
        console.log('Push event received');
        if (hook.payload.ref === hookerOptions.gitRef) {
            console.log(`Hook ref matches gitRef ${hookerOptions.gitRef}`);
            await runHookerConfig(hookerOptions);
        }
    });
    console.log(`Hooker listening on port ${hookerOptions.port} for ${hookerOptions.name}`);
    http.createServer(webhooks.middleware).listen(hookerOptions.port);
};
exports.init = init;
exports.default = { job, init, runHookerConfig };
