import * as util from "util";
import { execFile } from "child_process";
// @ts-ignore
import s3FolderUpload from 's3-folder-upload'
import * as http from 'http'
import { Webhooks } from "@octokit/webhooks"

import slack from './helpers/slack'
import buildReact from "./helpers/buildReact";

const execFileProm = util.promisify(execFile)

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
    };
}

const job = {
    slackMessage: (message: string, slackWebHookUrl: string) => () => slack.sendMessage(message, slackWebHookUrl),
    buildReact: (reactAppRootPath: string) => () => buildReact(reactAppRootPath),
    uploadDirToS3: (dirPath: string, credentials: s3Credentials) => () => s3FolderUpload(dirPath, credentials),
    executeFile: (filePath: string) => () => execFileProm(filePath)
}

const init = (hookerOptions: HookerOptions) => {
    hookerOptions.gitRef = hookerOptions.gitRef || 'refs/heads/master'
    hookerOptions.port = hookerOptions.port || 3100

    const webhooks = new Webhooks({
        secret: hookerOptions.webhookSecret,
    });

    webhooks.on("push", async (hook: HookBody) => {
        console.log('Push event received')

        if (hook.payload.ref === hookerOptions.gitRef) {
            console.log(`Hook ref matches gitRef ${hookerOptions.gitRef}`)

            try {
                for (const [index, step] of hookerOptions.steps.entries()) {
                    const stepNumber = index + 1

                    if ('action' in step) {
                        console.log(`Running step ${stepNumber}. ${step.name}...`)
                        await step.action()
                        console.log(`Completed step ${stepNumber}. ${step.name}`)
                    } else {
                        console.log(`Running step ${stepNumber} ...`)
                        await step()
                        console.log(`Completed step ${stepNumber}`)
                    }
                }
            } catch (e) {
                slack.sendMessage(`Hooker job ${hookerOptions.name} failed with message ${e.message}`, hookerOptions.slackWebHookUrl)
            }
        }
    });

    console.log(`Hooker listening on port ${hookerOptions.port} for ${hookerOptions.name}`)

    http.createServer(webhooks.middleware).listen(hookerOptions.port);
}

export { job, init }
export default { job, init }

/*
{
  ref: 'refs/heads/master',
  before: 'deef23ef89bf080cacf0f7db5316ca1fecdea5eb',
  after: '28da11cd04b54e4f52227ec641ebd95cb9e531c0',
  repository: {
    id: 238488105,
    node_id: 'MDEwOlJlcG9zaXRvcnkyMzg0ODgxMDU=',
    name: 'brickpal',
    full_name: 'chrift/brickpal',
    private: true,
    owner: {
      name: 'chrift',
      email: '2837753+chrift@users.noreply.github.com',
      login: 'chrift',
      id: 2837753,
      node_id: 'MDQ6VXNlcjI4Mzc3NTM=',
      avatar_url: 'https://avatars3.githubusercontent.com/u/2837753?v=4',
      gravatar_id: '',
      url: 'https://api.github.com/users/chrift',
      html_url: 'https://github.com/chrift',
      followers_url: 'https://api.github.com/users/chrift/followers',
      following_url: 'https://api.github.com/users/chrift/following{/other_user}',
      gists_url: 'https://api.github.com/users/chrift/gists{/gist_id}',
      starred_url: 'https://api.github.com/users/chrift/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/chrift/subscriptions',
      organizations_url: 'https://api.github.com/users/chrift/orgs',
      repos_url: 'https://api.github.com/users/chrift/repos',
      events_url: 'https://api.github.com/users/chrift/events{/privacy}',
      received_events_url: 'https://api.github.com/users/chrift/received_events',
      type: 'User',
      site_admin: false
    },
    html_url: 'https://github.com/chrift/brickpal',
    description: null,
    fork: false,
    url: 'https://github.com/chrift/brickpal',
    forks_url: 'https://api.github.com/repos/chrift/brickpal/forks',
    keys_url: 'https://api.github.com/repos/chrift/brickpal/keys{/key_id}',
    collaborators_url: 'https://api.github.com/repos/chrift/brickpal/collaborators{/collaborator}',
    teams_url: 'https://api.github.com/repos/chrift/brickpal/teams',
    hooks_url: 'https://api.github.com/repos/chrift/brickpal/hooks',
    issue_events_url: 'https://api.github.com/repos/chrift/brickpal/issues/events{/number}',
    events_url: 'https://api.github.com/repos/chrift/brickpal/events',
    assignees_url: 'https://api.github.com/repos/chrift/brickpal/assignees{/user}',
    branches_url: 'https://api.github.com/repos/chrift/brickpal/branches{/branch}',
    tags_url: 'https://api.github.com/repos/chrift/brickpal/tags',
    blobs_url: 'https://api.github.com/repos/chrift/brickpal/git/blobs{/sha}',
    git_tags_url: 'https://api.github.com/repos/chrift/brickpal/git/tags{/sha}',
    git_refs_url: 'https://api.github.com/repos/chrift/brickpal/git/refs{/sha}',
    trees_url: 'https://api.github.com/repos/chrift/brickpal/git/trees{/sha}',
    statuses_url: 'https://api.github.com/repos/chrift/brickpal/statuses/{sha}',
    languages_url: 'https://api.github.com/repos/chrift/brickpal/languages',
    stargazers_url: 'https://api.github.com/repos/chrift/brickpal/stargazers',
    contributors_url: 'https://api.github.com/repos/chrift/brickpal/contributors',
    subscribers_url: 'https://api.github.com/repos/chrift/brickpal/subscribers',
    subscription_url: 'https://api.github.com/repos/chrift/brickpal/subscription',
    commits_url: 'https://api.github.com/repos/chrift/brickpal/commits{/sha}',
    git_commits_url: 'https://api.github.com/repos/chrift/brickpal/git/commits{/sha}',
    comments_url: 'https://api.github.com/repos/chrift/brickpal/comments{/number}',
    issue_comment_url: 'https://api.github.com/repos/chrift/brickpal/issues/comments{/number}',
    contents_url: 'https://api.github.com/repos/chrift/brickpal/contents/{+path}',
    compare_url: 'https://api.github.com/repos/chrift/brickpal/compare/{base}...{head}',
    merges_url: 'https://api.github.com/repos/chrift/brickpal/merges',
    archive_url: 'https://api.github.com/repos/chrift/brickpal/{archive_format}{/ref}',
    downloads_url: 'https://api.github.com/repos/chrift/brickpal/downloads',
    issues_url: 'https://api.github.com/repos/chrift/brickpal/issues{/number}',
    pulls_url: 'https://api.github.com/repos/chrift/brickpal/pulls{/number}',
    milestones_url: 'https://api.github.com/repos/chrift/brickpal/milestones{/number}',
    notifications_url: 'https://api.github.com/repos/chrift/brickpal/notifications{?since,all,participating}',
    labels_url: 'https://api.github.com/repos/chrift/brickpal/labels{/name}',
    releases_url: 'https://api.github.com/repos/chrift/brickpal/releases{/id}',
    deployments_url: 'https://api.github.com/repos/chrift/brickpal/deployments',
    created_at: 1580917818,
    updated_at: '2020-09-20T20:08:17Z',
    pushed_at: 1600643913,
    git_url: 'git://github.com/chrift/brickpal.git',
    ssh_url: 'git@github.com:chrift/brickpal.git',
    clone_url: 'https://github.com/chrift/brickpal.git',
    svn_url: 'https://github.com/chrift/brickpal',
    homepage: null,
    size: 23108,
    stargazers_count: 0,
    watchers_count: 0,
    language: 'JavaScript',
    has_issues: true,
    has_projects: true,
    has_downloads: true,
    has_wiki: true,
    has_pages: false,
    forks_count: 0,
    mirror_url: null,
    archived: false,
    disabled: false,
    open_issues_count: 0,
    license: null,
    forks: 0,
    open_issues: 0,
    watchers: 0,
    default_branch: 'master',
    stargazers: 0,
    master_branch: 'master'
  },
  pusher: { name: 'chrift', email: '2837753+chrift@users.noreply.github.com' },
  sender: {
    login: 'chrift',
    id: 2837753,
    node_id: 'MDQ6VXNlcjI4Mzc3NTM=',
    avatar_url: 'https://avatars3.githubusercontent.com/u/2837753?v=4',
    gravatar_id: '',
    url: 'https://api.github.com/users/chrift',
    html_url: 'https://github.com/chrift',
    followers_url: 'https://api.github.com/users/chrift/followers',
    following_url: 'https://api.github.com/users/chrift/following{/other_user}',
    gists_url: 'https://api.github.com/users/chrift/gists{/gist_id}',
    starred_url: 'https://api.github.com/users/chrift/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/chrift/subscriptions',
    organizations_url: 'https://api.github.com/users/chrift/orgs',
    repos_url: 'https://api.github.com/users/chrift/repos',
    events_url: 'https://api.github.com/users/chrift/events{/privacy}',
    received_events_url: 'https://api.github.com/users/chrift/received_events',
    type: 'User',
    site_admin: false
  },
  created: false,
  deleted: false,
  forced: false,
  base_ref: null,
  compare: 'https://github.com/chrift/brickpal/compare/deef23ef89bf...28da11cd04b5',
  commits: [
    {
      id: '28da11cd04b54e4f52227ec641ebd95cb9e531c0',
      tree_id: '82d3b770d37d2d6d5ebd77880f9181fc51e053fe',
      distinct: true,
      message: 'Api and crawler release script',
      timestamp: '2020-09-21T00:18:29+01:00',
      url: 'https://github.com/chrift/brickpal/commit/28da11cd04b54e4f52227ec641ebd95cb9e531c0',
      author: [Object],
      committer: [Object],
      added: [Array],
      removed: [],
      modified: []
    }
  ],
  head_commit: {
    id: '28da11cd04b54e4f52227ec641ebd95cb9e531c0',
    tree_id: '82d3b770d37d2d6d5ebd77880f9181fc51e053fe',
    distinct: true,
    message: 'Api and crawler release script',
    timestamp: '2020-09-21T00:18:29+01:00',
    url: 'https://github.com/chrift/brickpal/commit/28da11cd04b54e4f52227ec641ebd95cb9e531c0',
    author: {
      name: 'chrischeshire',
      email: '2837753+chrift@users.noreply.github.com',
      username: 'chrift'
    },
    committer: {
      name: 'chrischeshire',
      email: '2837753+chrift@users.noreply.github.com',
      username: 'chrift'
    },
    added: [ 'release-api-crawler.sh' ],
    removed: [],
    modified: []
  }
}

 */
