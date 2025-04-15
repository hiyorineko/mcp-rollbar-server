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

- `ROLLBAR_ACCESS_TOKEN`: Your Rollbar access token (required)

You can obtain a Rollbar access token from your Rollbar account:
1. Log in to your Rollbar account at https://rollbar.com/
2. Go to Settings -> Account Access Tokens (for account-level access) or Settings -> Project Access Tokens (for project-level access)
3. Create a new token with "read" scope

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
          "ROLLBAR_ACCESS_TOKEN": "YOUR_ACCESS_TOKEN"
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

