"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.init = exports.job = void 0;
var util = require("util");
var child_process_1 = require("child_process");
// @ts-ignore
var s3_folder_upload_1 = require("s3-folder-upload");
var http = require("http");
var Webhooks = require("@octokit/webhooks").Webhooks;
var slack_1 = require("./helpers/slack");
var execProm = util.promisify(child_process_1.exec);
var execFileProm = util.promisify(child_process_1.execFile);
exports.job = {
    slackMessage: function (message) { return function () { return slack_1["default"].sendMessage(message); }; },
    buildReact: function (reactAppRootPath) { return function () { return execProm([
        "npm install",
        "npm run build"
    ].join(';'), {
        cwd: reactAppRootPath
    }); }; },
    uploadDirToS3: function (dirPath, credentials) { return function () { return s3_folder_upload_1["default"](dirPath, credentials); }; },
    executeFile: function (filePath) { return function () { return execFileProm(filePath); }; }
};
exports.init = function (hookerOptions) {
    console.log("Hooker listening on port " + hookerOptions.port + " for " + hookerOptions.name);
    hookerOptions.gitRef = hookerOptions.gitRef || 'refs/heads/master';
    hookerOptions.port = hookerOptions.port || 3100;
    var webhooks = new Webhooks({
        secret: hookerOptions.webhookSecret
    });
    webhooks.on("push", function (hook) { return __awaiter(void 0, void 0, void 0, function () {
        var _i, _a, step, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log(hook.name, "event received", hook.id, hook.payload);
                    if (!(hook.payload.ref === hookerOptions.gitRef)) return [3 /*break*/, 9];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 8, , 9]);
                    _i = 0, _a = hookerOptions.steps;
                    _b.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 7];
                    step = _a[_i];
                    if (!('action' in step)) return [3 /*break*/, 4];
                    return [4 /*yield*/, step.action()];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, step()];
                case 5:
                    _b.sent();
                    _b.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7: return [3 /*break*/, 9];
                case 8:
                    e_1 = _b.sent();
                    slack_1["default"].sendMessage("Hooker job " + hookerOptions.name + " failed with message " + e_1.message);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    }); });
    console.log("Hooker listening on port " + hookerOptions.port + " for " + hookerOptions.name);
    http.createServer(webhooks.middleware).listen(hookerOptions.port);
};
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
