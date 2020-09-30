import hooker from 'hooker'
import * as path from 'path'

const credentials = {
  'accessKeyId': 'XX',
  'secretAccessKey': 'XX',
  'region': 'eu-west-1',
  'bucket': 'XX'
}

const slackWebHookUrl = 'https://hooks.slack.com/services/XX'

hooker.init({
  name: 'Webhook name',
  webhookSecret: 'XX',
  slackWebHookUrl,
  steps: [
    hooker.job.slackMessage('Starting deployment...', slackWebHookUrl),
    {
      name: 'Run API release script',
      action: hooker.job.executeFile(path.resolve(__dirname, '../../../another-project/api/release.sh'))
    },
    hooker.job.slackMessage('API released. Building Web App...', slackWebHookUrl),
    {
      name: 'Build React Web App',
      action: hooker.job.buildReact(path.resolve(__dirname, '../../../another-project/webapp'))
    },
    hooker.job.slackMessage('Web App built successfully. Uploading Web App to S3...', slackWebHookUrl),
    {
      name: 'Upload Web App to S3',
      action: hooker.job.uploadDirToS3(path.resolve(__dirname, '../../../another-project/webapp/build'), credentials)
    },
    hooker.job.slackMessage('Deployment completed successfully', slackWebHookUrl)
  ]
})

