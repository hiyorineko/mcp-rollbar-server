# Rollbar MCP Server
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A dynamic MCP server implementation for Rollbar API integration, enabling LLMs to interact with Rollbar error tracking data.

<a href="https://glama.ai/mcp/servers/@hiyorineko/mcp-rollbar-server">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@hiyorineko/mcp-rollbar-server/badge" alt="Rollbar Server MCP server" />
</a>

## Features

- List and filter error items
- Get detailed error information
- View error occurrences
- Access project and environment details
- Track deployments
- List users and teams

## Configuration

### Environment Variables

- `ROLLBAR_PROJECT_TOKEN`: Rollbar Project Access Token - Required for APIs to retrieve project error and deployment information
- `ROLLBAR_ACCOUNT_TOKEN`: Rollbar Account Access Token - Required for APIs to access account-wide project and user information
- `ROLLBAR_PROJECT_ID`: Default project ID (used when not specified in requests) - Optional
- `ROLLBAR_PROJECT_NAME`: Default project name for reference - Optional

> **Note**: Depending on the features you use, you'll need either `ROLLBAR_PROJECT_TOKEN`, `ROLLBAR_ACCOUNT_TOKEN`, or both.
> For full functionality, it's recommended to configure both tokens, but the service will work with only the relevant token for specific APIs.

#### Required Tokens and API Correspondence Table

| API | Required Token |
|-----|-------------|
| `rollbar_list_items` | ROLLBAR_PROJECT_TOKEN |
| `rollbar_get_item` | ROLLBAR_PROJECT_TOKEN |
| `rollbar_get_item_by_counter` | ROLLBAR_PROJECT_TOKEN |
| `rollbar_list_occurrences` | ROLLBAR_PROJECT_TOKEN |
| `rollbar_get_occurrence` | ROLLBAR_PROJECT_TOKEN |
| `rollbar_list_environments` | ROLLBAR_PROJECT_TOKEN |
| `rollbar_list_deploys` | ROLLBAR_PROJECT_TOKEN |
| `rollbar_get_deploy` | ROLLBAR_PROJECT_TOKEN |
| `rollbar_list_projects` | ROLLBAR_ACCOUNT_TOKEN |
| `rollbar_get_project` | ROLLBAR_ACCOUNT_TOKEN |
| `rollbar_list_users` | ROLLBAR_ACCOUNT_TOKEN |
| `rollbar_get_user` | ROLLBAR_ACCOUNT_TOKEN |

You can obtain Rollbar access tokens as follows:
1. Log in to your Rollbar account (https://rollbar.com/)
2. For project tokens: Settings -> Project Access Tokens (for project-level access)
3. For account tokens: Settings -> Account Access Tokens (for account-level access)
4. Create a new token with "read" scope

## How to use

### Cursor Integration

Add to your `~/.cursor/mcp.json`:

```json
{
    "mcpServers": {
      "rollbar-mcp": {
        "command": "npx",
        "args": ["-y", "@hiyorineko/mcp-rollbar-server"],
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

### Locally

After cloning this repository, follow these steps to set up the MCP client:

```bash
$ cd mcp-rollbar-server
$ npm install
$ npm run build
```

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

To find the value for "YOUR_NODE_PATH", run which node in your terminal.

## Usage Examples

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
Get a specific item (error) from Rollbar using the internal item ID maintained by Rollbar's system.
- Input:
  - `id` (number): Item ID
- Returns: Detailed information about a specific error item

### rollbar_get_item_by_counter
Get a specific item by project counter from Rollbar. The counter is the visible ID that appears in the Rollbar UI.
- Input:
  - `counter` (number): Project counter for the item
- Returns: Detailed information about a specific error item identified by its project counter

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