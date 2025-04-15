# Rollbar MCP Server
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

MCP server implementation for Rollbar API integration, enabling LLMs to interact with Rollbar error tracking data.

## Features

- List and filter error items
- Get detailed error information
- View error occurrences
- Access project and environment details
- Track deployments
- List users and teams

## Configuration

### Environment Variables

- `ROLLBAR_PROJECT_TOKEN`: Rollbar Project Access Token - プロジェクト内のエラー・デプロイ情報を取得するAPIに必要
- `ROLLBAR_ACCOUNT_TOKEN`: Rollbar Account Access Token - アカウント全体のプロジェクト・ユーザー情報を取得するAPIに必要
- `ROLLBAR_PROJECT_ID`: デフォルトのプロジェクトID（リクエストで指定されていない場合に使用）- オプション
- `ROLLBAR_PROJECT_NAME`: 参照用のデフォルトプロジェクト名 - オプション

> **注意**: 使用する機能に応じて、`ROLLBAR_PROJECT_TOKEN`または`ROLLBAR_ACCOUNT_TOKEN`のいずれか、あるいは両方が必要になります。
> 全機能を使用するには両方の設定を推奨しますが、特定のAPIのみを使用する場合は該当するトークンのみで動作します。

#### 必要なトークンとAPI対応表

| API | 必要なトークン |
|-----|-------------|
| `rollbar_list_items` | ROLLBAR_PROJECT_TOKEN |
| `rollbar_get_item` | ROLLBAR_PROJECT_TOKEN |
| `rollbar_list_occurrences` | ROLLBAR_PROJECT_TOKEN |
| `rollbar_get_occurrence` | ROLLBAR_PROJECT_TOKEN |
| `rollbar_list_environments` | ROLLBAR_PROJECT_TOKEN |
| `rollbar_list_deploys` | ROLLBAR_PROJECT_TOKEN |
| `rollbar_get_deploy` | ROLLBAR_PROJECT_TOKEN |
| `rollbar_list_projects` | ROLLBAR_ACCOUNT_TOKEN |
| `rollbar_get_project` | ROLLBAR_ACCOUNT_TOKEN |
| `rollbar_list_users` | ROLLBAR_ACCOUNT_TOKEN |
| `rollbar_get_user` | ROLLBAR_ACCOUNT_TOKEN |

Rollbarアクセストークンは以下の方法で取得できます：
1. Rollbarアカウントにログイン（https://rollbar.com/）
2. プロジェクトトークンの場合: Settings -> Project Access Tokens （プロジェクトレベルのアクセス用）
3. アカウントトークンの場合: Settings -> Account Access Tokens （アカウントレベルのアクセス用）
4. "read"スコープを持つ新しいトークンを作成

## How to use

After you clone this repository, below do and setup mcp client.

```bash
$ cd mcp-rollbar-server
$ npm install
$ npm run build
```

## Cursor Integration

Add to your `~/.cursor/mcp.json`:

```json
{
    "mcpServers": {
      "rollbar-mcp": {
        "command": "YOUR_NODE_PATH",
        "args": ["YOUR_PROJECT_PATH/mcp-rollbar-server/dist/src/index.js"],
        "env": {
          "ROLLBAR_PROJECT_TOKEN": "YOUR_PROJECT_ACCESS_TOKEN",
          "ROLLBAR_ACCOUNT_TOKEN": "YOUR_ACCOUNT_ACCESS_TOKEN",
          "ROLLBAR_PROJECT_ID": "YOUR_PROJECT_ID",
          "ROLLBAR_PROJECT_NAME": "YOUR_PROJECT_NAME"
        }
      }
    }
}
```

For set "YOUR_NODE_PATH", please do `which node`.

## Usage Examples

### List Recent Errors

```
List the most recent errors in my production environment.
```

### View Error Details

```
Get detailed information for error item with ID 12345, including stack trace and recent occurrences.
```

### Track Deployments

```
Show me the recent deployments for project 67890.
```

### Filter Errors by Level

```
List all critical errors that occurred in the last week.
```

## Tools

### rollbar_list_items
List items (errors) from Rollbar
- Input:
  - `status` (string, optional): Filter by status (active, resolved, muted, etc.)
  - `level` (string, optional): Filter by level (critical, error, warning, info, debug)
  - `environment` (string, optional): Filter by environment (production, staging, etc.)
  - `limit` (number, optional): Maximum number of items to return (default: 20)
  - `page` (number, optional): Page number for pagination (default: 1)
- Returns: List of error items with details such as counter, level, total occurrences, etc.

### rollbar_get_item
Get a specific item (error) from Rollbar
- Input:
  - `id` (number): Item ID
- Returns: Detailed information about a specific error item

### rollbar_list_occurrences
List occurrences of errors from Rollbar
- Input:
  - `itemId` (number, optional): Item ID to filter occurrences
  - `limit` (number, optional): Maximum number of occurrences to return (default: 20)
  - `page` (number, optional): Page number for pagination (default: 1)
- Returns: List of error occurrences with detailed information

### rollbar_get_occurrence
Get a specific occurrence of an error from Rollbar
- Input:
  - `id` (string): Occurrence ID
- Returns: Detailed information about a specific error occurrence

### rollbar_list_projects
List projects from Rollbar
- Input: None
- Returns: List of projects with their IDs, names, and statuses

### rollbar_get_project
Get a specific project from Rollbar
- Input:
  - `id` (number): Project ID
- Returns: Detailed information about a specific project

### rollbar_list_environments
List environments from Rollbar
- Input:
  - `projectId` (number): Project ID
- Returns: List of environments for the specified project

### rollbar_list_users
List users from Rollbar
- Input: None
- Returns: List of users with their IDs, usernames, emails, and access levels

### rollbar_get_user
Get a specific user from Rollbar
- Input:
  - `id` (number): User ID
- Returns: Detailed information about a specific user

### rollbar_list_deploys
List deploys from Rollbar
- Input:
  - `projectId` (number): Project ID
  - `environment` (string, optional): Environment name
  - `limit` (number, optional): Maximum number of deploys to return (default: 20)
  - `page` (number, optional): Page number for pagination (default: 1)
- Returns: List of deploys for the specified project and environment

### rollbar_get_deploy
Get a specific deploy from Rollbar
- Input:
  - `deployId` (number): Deploy ID
- Returns: Detailed information about a specific deployment

