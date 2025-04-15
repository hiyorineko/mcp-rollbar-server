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

if (!process.env.ROLLBAR_ACCESS_TOKEN) {
  console.error("Required environment variable ROLLBAR_ACCESS_TOKEN is not set");
  process.exit(1);
}

// プロジェクト名とIDの環境変数（オプション）
const ROLLBAR_PROJECT_NAME = process.env.ROLLBAR_PROJECT_NAME;
const ROLLBAR_PROJECT_ID = process.env.ROLLBAR_PROJECT_ID ? parseInt(process.env.ROLLBAR_PROJECT_ID, 10) : undefined;

// プロジェクト名からプロジェクトIDを検索する関数
const findProjectIdByName = async (projectName: string): Promise<number | undefined> => {
  try {
    const response = await client.get<ListProjectsResponse>('/projects');
    const projects = response.data.result;
    
    const project = projects.find((p: RollbarProject) => p.name === projectName);
    return project?.id;
  } catch (error) {
    console.error('Error finding project by name:', error);
    return undefined;
  }
};

// 環境変数またはプロジェクト名からプロジェクトIDを取得する関数
const getEffectiveProjectId = async (providedId?: number): Promise<number | undefined> => {
  // 提供されたIDがある場合はそれを使用
  if (providedId) return providedId;
  
  // 環境変数にプロジェクトIDがある場合はそれを使用
  if (ROLLBAR_PROJECT_ID) return ROLLBAR_PROJECT_ID;
  
  // プロジェクト名から検索
  if (ROLLBAR_PROJECT_NAME) {
    const idFromName = await findProjectIdByName(ROLLBAR_PROJECT_NAME);
    if (idFromName) return idFromName;
  }
  
  return undefined;
};

const API_BASE_URL = "https://api.rollbar.com/api/1";
const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "X-Rollbar-Access-Token": process.env.ROLLBAR_ACCESS_TOKEN,
    "Content-Type": "application/json",
  },
});

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
          const { status, level, environment, limit = 20, page = 1 } = args as {
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

          const response = await client.get<ListItemsResponse>("/items", { params });
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
          const { id } = args as { id: number };
          const response = await client.get<ItemResponse>(`/item/${id}`);
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
          const { itemId, limit = 20, page = 1 } = args as {
            itemId?: number;
            limit?: number;
            page?: number;
          };

          const params: Record<string, string | number> = { page, limit };
          let endpoint = "/occurrences";
          
          if (itemId) {
            endpoint = `/item/${itemId}/occurrences`;
          }

          const response = await client.get<ListOccurrencesResponse>(endpoint, { params });
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
          const { id } = args as { id: string };
          const response = await client.get<OccurrenceResponse>(`/occurrence/${id}`);
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
          const response = await client.get<ListProjectsResponse>("/projects");
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
          const { id } = args as { id: number };
          
          // 環境変数のプロジェクトIDをデフォルト値として使用、またはプロジェクト名から検索
          const effectiveProjectId = await getEffectiveProjectId(id);
          
          if (!effectiveProjectId) {
            throw new Error("Project ID is required but not provided in request or environment variables");
          }
          
          const response = await client.get<ProjectResponse>(`/project/${effectiveProjectId}`);
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
          const { projectId } = args as { projectId: number };
          
          // 環境変数のプロジェクトIDをデフォルト値として使用、またはプロジェクト名から検索
          const effectiveProjectId = await getEffectiveProjectId(projectId);
          
          if (!effectiveProjectId) {
            throw new Error("Project ID is required but not provided in request or environment variables");
          }
          
          const response = await client.get<ListEnvironmentsResponse>(`/project/${effectiveProjectId}/environments`);
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
          const response = await client.get<ListUsersResponse>("/users");
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
          const { id } = args as { id: number };
          const response = await client.get<UserResponse>(`/user/${id}`);
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
          const { projectId, environment, limit = 20, page = 1 } = args as {
            projectId: number;
            environment?: string;
            limit?: number;
            page?: number;
          };

          // 環境変数のプロジェクトIDをデフォルト値として使用、またはプロジェクト名から検索
          const effectiveProjectId = await getEffectiveProjectId(projectId);
          
          if (!effectiveProjectId) {
            throw new Error("Project ID is required but not provided in request or environment variables");
          }

          const params: Record<string, string | number> = { page, limit };
          if (environment) params.environment = environment;

          const response = await client.get<ListDeploysResponse>(`/project/${effectiveProjectId}/deploys`, { params });
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
          const { deployId } = args as { deployId: number };
          const response = await client.get<DeployResponse>(`/deploy/${deployId}`);
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
              text: JSON.stringify({
                error: "API Error",
                message: axiosError.message,
                status: axiosError.response?.status,
                data: axiosError.response?.data,
              }, null, 2),
            },
          ],
        };
      }
      throw error;
    }
  });

  return { server };
};
