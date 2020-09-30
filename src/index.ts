// @ts-ignore
import s3FolderUpload from 's3-folder-upload'
import * as http from 'http'
import { Webhooks } from '@octokit/webhooks'

import slack from './helpers/slack'
import buildReact from './helpers/buildReact'
import executeFile from './helpers/executeFile'
import executeCommand from './helpers/executeCommand'

type HookerAction = () => Promise<any>

interface HookerStep {
  name?: string
  action: HookerAction
}

interface HookerOptions {
  name: string
  webhookSecret: string
  slackWebHookUrl: string
  gitRef?: string
  port?: number
  steps: Array<HookerStep | HookerAction>
}

interface s3Credentials {
  accessKeyId: string
  secretAccessKey: string
  region: string
  bucket: string
}

interface HookBody {
  id: string;
  name: string;
  payload: {
    ref: string
  }
}

const job = {
  slackMessage: (message: string, slackWebHookUrl: string) => () => slack.sendMessage(message, slackWebHookUrl),
  buildReact: (reactAppRootPath: string, envVarString: string = '') => () => buildReact(reactAppRootPath, envVarString),
  uploadDirToS3: (dirPath: string, credentials: s3Credentials) => () => s3FolderUpload(dirPath, credentials, { useFoldersForFileTypes: false }),
  executeFile: (filePath: string) => () => executeFile(filePath),
  executeCommand: (rootPath: string, command: string) => () => executeCommand(rootPath, command)
}

const runHookerConfig = async (hookerOptions: HookerOptions) => {
  try {
    for (const [index, step] of hookerOptions.steps.entries()) {
      const stepNumber = index + 1

      if ('action' in step) {
        console.log(`Running step ${stepNumber}. ${step.name}...`)
        await step.action()
        console.log(`Completed step ${stepNumber}. ${step.name}`)
      } else {
        console.log(`Running step ${stepNumber}...`)
        await step()
        console.log(`Completed step ${stepNumber}`)
      }
    }

    console.log('Completed all steps')
  } catch (e) {
    const message = `Hooker job ${hookerOptions.name} failed with message ${e.message}`

    console.error(message)

    slack.sendMessage(message, hookerOptions.slackWebHookUrl)
  }
}

const init = (hookerOptions: HookerOptions) => {
  hookerOptions.gitRef = hookerOptions.gitRef || 'refs/heads/master'
  hookerOptions.port = hookerOptions.port || 3100

  const webhooks = new Webhooks({
    secret: hookerOptions.webhookSecret,
  })

  webhooks.on('push', async (hook: HookBody) => {
    console.log('Push event received')

    if (hook.payload.ref === hookerOptions.gitRef) {
      console.log(`Hook ref matches gitRef ${hookerOptions.gitRef}`)

      await runHookerConfig(hookerOptions)
    }
  })

  console.log(`Hooker listening on port ${hookerOptions.port} for ${hookerOptions.name}`)

  http.createServer(webhooks.middleware).listen(hookerOptions.port)
}

export { job, init, runHookerConfig }
export default { job, init, runHookerConfig }
