import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from "@modelcontextprotocol/sdk/types.js";
import axios, { AxiosError } from "axios";
import {
  DeployResponse,
  ItemResponse,
  ListDeploysResponse,
  ListEnvironmentsResponse,
  ListItemsResponse,
  ListOccurrencesResponse,
  ListProjectsResponse,
  ListUsersResponse,
  OccurrenceResponse,
  ProjectResponse,
  RollbarProject,
  UserResponse,
} from "./types.js";

// Check for project access token and account access token
// Project Access Token is used for project-specific APIs (items, deploys, etc. within a project)
// Account Access Token is used for account-wide APIs (project list, user list, etc.)
const ROLLBAR_PROJECT_TOKEN = process.env.ROLLBAR_PROJECT_TOKEN;
const ROLLBAR_ACCOUNT_TOKEN = process.env.ROLLBAR_ACCOUNT_TOKEN;

// Verify the required tokens based on the APIs this project will use
// For current functionality, at least one of these tokens is required
if (!ROLLBAR_PROJECT_TOKEN && !ROLLBAR_ACCOUNT_TOKEN) {
  console.error("At least one of ROLLBAR_PROJECT_TOKEN or ROLLBAR_ACCOUNT_TOKEN is required");
  process.exit(1);
}

// List of supported APIs
const SUPPORTED_APIS = {
  // APIs that use Project Token
  projectApis: [
    "rollbar_list_items",
    "rollbar_get_item",
    "rollbar_get_item_by_counter",
    "rollbar_list_occurrences",
    "rollbar_get_occurrence",
    "rollbar_list_environments",
    "rollbar_list_deploys",
    "rollbar_get_deploy",
  ],
  // APIs that use Account Token
  accountApis: ["rollbar_list_projects", "rollbar_get_project", "rollbar_list_users", "rollbar_get_user"],
};

// Warning if using Project APIs but Project Token is not set
if (!ROLLBAR_PROJECT_TOKEN) {
  console.warn("ROLLBAR_PROJECT_TOKEN is not set, the following APIs will not be available:");
  console.warn(SUPPORTED_APIS.projectApis.join(", "));
}

// Warning if using Account APIs but Account Token is not set
if (!ROLLBAR_ACCOUNT_TOKEN) {
  console.warn("ROLLBAR_ACCOUNT_TOKEN is not set, the following APIs will not be available:");
  console.warn(SUPPORTED_APIS.accountApis.join(", "));
}

// Project name and ID environment variables (optional)
const ROLLBAR_PROJECT_NAME = process.env.ROLLBAR_PROJECT_NAME;
const ROLLBAR_PROJECT_ID = process.env.ROLLBAR_PROJECT_ID ? parseInt(process.env.ROLLBAR_PROJECT_ID, 10) : undefined;

// Function to find project ID by name
const findProjectIdByName = async (projectName: string): Promise<number | undefined> => {
  // Cannot execute if Account Token is not set
  if (!ROLLBAR_ACCOUNT_TOKEN || !accountClient) {
    console.error("ROLLBAR_ACCOUNT_TOKEN is not set, cannot search for project by name");
    return undefined;
  }

  try {
    const response = await accountClient.get<ListProjectsResponse>("/projects");
    const projects = response.data.result;

    const project = projects.find((p: RollbarProject) => p.name === projectName);
    return project?.id;
  } catch (error) {
    console.error("Error finding project by name:", error);
    return undefined;
  }
};

// Function to get project ID from environment variables or project name
const getEffectiveProjectId = async (providedId?: number): Promise<number | undefined> => {
  // Use provided ID if available
  if (providedId) return providedId;

  // Use project ID from environment variable if available
  if (ROLLBAR_PROJECT_ID) return ROLLBAR_PROJECT_ID;

  // Search by project name
  if (ROLLBAR_PROJECT_NAME) {
    const idFromName = await findProjectIdByName(ROLLBAR_PROJECT_NAME);
    if (idFromName) return idFromName;
  }

  return undefined;
};

const API_BASE_URL = "https://api.rollbar.com/api/1";

// Client for project-specific APIs (only if set)
const projectClient = ROLLBAR_PROJECT_TOKEN
  ? axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "X-Rollbar-Access-Token": ROLLBAR_PROJECT_TOKEN,
        "Content-Type": "application/json",
      },
    })
  : null;

// Client for account-wide APIs (only if set)
const accountClient = ROLLBAR_ACCOUNT_TOKEN
  ? axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "X-Rollbar-Access-Token": ROLLBAR_ACCOUNT_TOKEN,
        "Content-Type": "application/json",
      },
    })
  : null;

const LIST_ITEMS_TOOL: Tool = {
  name: "rollbar_list_items",
  description: "List items (errors) from Rollbar",
  inputSchema: {
    type: "object",
    properties: {
      status: { type: "string", description: "Filter by status (active, resolved, muted, etc.)" },
      level: { type: "string", description: "Filter by level (critical, error, warning, info, debug)" },
      environment: { type: "string", description: "Filter by environment (production, staging, etc.)" },
      limit: { type: "number", description: "Maximum number of items to return (default: 20)" },
      page: { type: "number", description: "Page number for pagination (default: 1)" },
    },
  },
};

const GET_ITEM_TOOL: Tool = {
  name: "rollbar_get_item",
  description: "Get a specific item (error) from Rollbar",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "number", description: "Item ID" },
    },
    required: ["id"],
  },
};

const GET_ITEM_BY_COUNTER_TOOL: Tool = {
  name: "rollbar_get_item_by_counter",
  description: "Get a specific item by project counter from Rollbar.",
  inputSchema: {
    type: "object",
    properties: {
      counter: { type: "number", description: "Project counter for the item" },
    },
    required: ["counter"],
  },
};

const LIST_OCCURRENCES_TOOL: Tool = {
  name: "rollbar_list_occurrences",
  description: "List occurrences of errors from Rollbar",
  inputSchema: {
    type: "object",
    properties: {
      itemId: { type: "number", description: "Item ID to filter occurrences" },
      limit: { type: "number", description: "Maximum number of occurrences to return (default: 20)" },
      page: { type: "number", description: "Page number for pagination (default: 1)" },
    },
  },
};

const GET_OCCURRENCE_TOOL: Tool = {
  name: "rollbar_get_occurrence",
  description: "Get a specific occurrence of an error from Rollbar",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string", description: "Occurrence ID" },
    },
    required: ["id"],
  },
};

const LIST_PROJECTS_TOOL: Tool = {
  name: "rollbar_list_projects",
  description: "List projects from Rollbar",
  inputSchema: {
    type: "object",
    properties: {},
  },
};

const GET_PROJECT_TOOL: Tool = {
  name: "rollbar_get_project",
  description: "Get a specific project from Rollbar",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "number", description: "Project ID" },
    },
    required: ["id"],
  },
};

const LIST_ENVIRONMENTS_TOOL: Tool = {
  name: "rollbar_list_environments",
  description: "List environments from Rollbar",
  inputSchema: {
    type: "object",
    properties: {
      projectId: { type: "number", description: "Project ID" },
    },
    required: ["projectId"],
  },
};

const LIST_USERS_TOOL: Tool = {
  name: "rollbar_list_users",
  description: "List users from Rollbar",
  inputSchema: {
    type: "object",
    properties: {},
  },
};

const GET_USER_TOOL: Tool = {
  name: "rollbar_get_user",
  description: "Get a specific user from Rollbar",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "number", description: "User ID" },
    },
    required: ["id"],
  },
};

const LIST_DEPLOYS_TOOL: Tool = {
  name: "rollbar_list_deploys",
  description: "List deploys from Rollbar",
  inputSchema: {
    type: "object",
    properties: {
      projectId: { type: "number", description: "Project ID" },
      environment: { type: "string", description: "Environment name" },
      limit: { type: "number", description: "Maximum number of deploys to return (default: 20)" },
      page: { type: "number", description: "Page number for pagination (default: 1)" },
    },
    required: ["projectId"],
  },
};

const GET_DEPLOY_TOOL: Tool = {
  name: "rollbar_get_deploy",
  description: "Get a specific deploy from Rollbar",
  inputSchema: {
    type: "object",
    properties: {
      deployId: { type: "number", description: "Deploy ID" },
    },
    required: ["deployId"],
  },
};

export const createServer = () => {
  const server = new Server(
    {
      name: "rollbar-mcp-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      LIST_ITEMS_TOOL,
      GET_ITEM_TOOL,
      GET_ITEM_BY_COUNTER_TOOL,
      LIST_OCCURRENCES_TOOL,
      GET_OCCURRENCE_TOOL,
      LIST_PROJECTS_TOOL,
      GET_PROJECT_TOOL,
      LIST_ENVIRONMENTS_TOOL,
      LIST_USERS_TOOL,
      GET_USER_TOOL,
      LIST_DEPLOYS_TOOL,
      GET_DEPLOY_TOOL,
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const { name, arguments: args = {} } = request.params;

      switch (name) {
        case "rollbar_list_items": {
          // Project Token is required
          if (!projectClient) {
            throw new Error("ROLLBAR_PROJECT_TOKEN is not set, cannot use this API");
          }

          const {
            status,
            level,
            environment,
            limit = 20,
            page = 1,
          } = args as {
            status?: string;
            level?: string;
            environment?: string;
            limit?: number;
            page?: number;
          };

          const params: Record<string, string | number> = { page, limit };
          if (status) params.status = status;
          if (level) params.level = level;
          if (environment) params.environment = environment;

          const response = await projectClient.get<ListItemsResponse>("/items", { params });
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(response.data, null, 2),
              },
            ],
          };
        }

        case "rollbar_get_item": {
          // Project Token is required
          if (!projectClient) {
            throw new Error("ROLLBAR_PROJECT_TOKEN is not set, cannot use this API");
          }

          const { id } = args as { id: number };
          const response = await projectClient.get<ItemResponse>(`/item/${id}`);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(response.data, null, 2),
              },
            ],
          };
        }

        case "rollbar_get_item_by_counter": {
          // Project Tokenが必要
          if (!projectClient) {
            throw new Error("ROLLBAR_PROJECT_TOKEN が設定されていないため、このAPIは使用できません");
          }

          const { counter } = args as { counter: number };
          const response = await projectClient.get<ItemResponse>(`/item_by_counter/${counter}`);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(response.data, null, 2),
              },
            ],
          };
        }

        case "rollbar_list_occurrences": {
          // Project Token is required
          if (!projectClient) {
            throw new Error("ROLLBAR_PROJECT_TOKEN is not set, cannot use this API");
          }

          const {
            itemId,
            limit = 20,
            page = 1,
          } = args as {
            itemId?: number;
            limit?: number;
            page?: number;
          };

          const params: Record<string, string | number> = { page, limit };
          let endpoint = "/occurrences";

          if (itemId) {
            endpoint = `/instances?item_id=${itemId}`;
          }

          const response = await projectClient.get<ListOccurrencesResponse>(endpoint, { params });
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(response.data, null, 2),
              },
            ],
          };
        }

        case "rollbar_get_occurrence": {
          // Project Token is required
          if (!projectClient) {
            throw new Error("ROLLBAR_PROJECT_TOKEN is not set, cannot use this API");
          }

          const { id } = args as { id: string };
          const response = await projectClient.get<OccurrenceResponse>(`/instance/${id}`);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(response.data, null, 2),
              },
            ],
          };
        }

        case "rollbar_list_projects": {
          // Account Token is required
          if (!accountClient) {
            throw new Error("ROLLBAR_ACCOUNT_TOKEN is not set, cannot use this API");
          }

          const response = await accountClient.get<ListProjectsResponse>("/projects");
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(response.data, null, 2),
              },
            ],
          };
        }

        case "rollbar_get_project": {
          // Account Token is required
          if (!accountClient) {
            throw new Error("ROLLBAR_ACCOUNT_TOKEN is not set, cannot use this API");
          }

          const { id } = args as { id: number };

          // Use environment variable project ID as default value, or search by project name
          const effectiveProjectId = await getEffectiveProjectId(id);

          if (!effectiveProjectId) {
            throw new Error("Project ID is required but not provided in request or environment variables");
          }

          const response = await accountClient.get<ProjectResponse>(`/project/${effectiveProjectId}`);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(response.data, null, 2),
              },
            ],
          };
        }

        case "rollbar_list_environments": {
          // Project Token is required
          if (!projectClient) {
            throw new Error("ROLLBAR_PROJECT_TOKEN is not set, cannot use this API");
          }

          const { projectId } = args as { projectId: number };

          // Use environment variable project ID as default value, or search by project name
          const effectiveProjectId = await getEffectiveProjectId(projectId);

          if (!effectiveProjectId) {
            throw new Error("Project ID is required but not provided in request or environment variables");
          }

          const response = await projectClient.get<ListEnvironmentsResponse>(
            `/project/${effectiveProjectId}/environments`,
          );
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(response.data, null, 2),
              },
            ],
          };
        }

        case "rollbar_list_users": {
          // Account Token is required
          if (!accountClient) {
            throw new Error("ROLLBAR_ACCOUNT_TOKEN is not set, cannot use this API");
          }

          const response = await accountClient.get<ListUsersResponse>("/users");
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(response.data, null, 2),
              },
            ],
          };
        }

        case "rollbar_get_user": {
          // Account Token is required
          if (!accountClient) {
            throw new Error("ROLLBAR_ACCOUNT_TOKEN is not set, cannot use this API");
          }

          const { id } = args as { id: number };
          const response = await accountClient.get<UserResponse>(`/user/${id}`);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(response.data, null, 2),
              },
            ],
          };
        }

        case "rollbar_list_deploys": {
          // Project Token is required
          if (!projectClient) {
            throw new Error("ROLLBAR_PROJECT_TOKEN is not set, cannot use this API");
          }

          const {
            projectId,
            environment,
            limit = 20,
            page = 1,
          } = args as {
            projectId: number;
            environment?: string;
            limit?: number;
            page?: number;
          };

          // Use environment variable project ID as default value, or search by project name
          const effectiveProjectId = await getEffectiveProjectId(projectId);

          if (!effectiveProjectId) {
            throw new Error("Project ID is required but not provided in request or environment variables");
          }

          const params: Record<string, string | number> = { page, limit };
          if (environment) params.environment = environment;

          const response = await projectClient.get<ListDeploysResponse>(`/project/${effectiveProjectId}/deploys`, {
            params,
          });
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(response.data, null, 2),
              },
            ],
          };
        }

        case "rollbar_get_deploy": {
          // Project Token is required
          if (!projectClient) {
            throw new Error("ROLLBAR_PROJECT_TOKEN is not set, cannot use this API");
          }

          const { deployId } = args as { deployId: number };
          const response = await projectClient.get<DeployResponse>(`/deploy/${deployId}`);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(response.data, null, 2),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  error: "API Error",
                  message: axiosError.message,
                  status: axiosError.response?.status,
                  data: axiosError.response?.data,
                },
                null,
                2,
              ),
            },
          ],
        };
      }
      // Return error to client (not throw as regular response)
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                error: "Server Error",
                message: error instanceof Error ? error.message : String(error),
              },
              null,
              2,
            ),
          },
        ],
      };
    }
  });

  return { server };
};
