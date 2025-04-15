export interface RollbarUser {
  id: number;
  username: string;
  email: string;
  access_level: number;
}

export interface RollbarProject {
  id: number;
  name: string;
  status: string;
  account_id: number;
}

export interface RollbarEnvironment {
  id: number;
  name: string;
}

export interface RollbarItem {
  id: number;
  counter: number;
  environment: string;
  framework: string;
  level: string;
  timestamp: number;
  title: string;
  total_occurrences: number;
  last_occurrence_timestamp: number;
  first_occurrence_timestamp: number;
  status: string;
  assigned_user_id?: number;
}

export interface RollbarOccurrence {
  id: string;
  timestamp: number;
  item_id: number;
  language: string;
  level: string;
  framework: string;
  body: {
    trace?: {
      frames: Array<{
        filename: string;
        lineno: number;
        colno?: number;
        method: string;
        code?: string;
      }>;
      exception: {
        class: string;
        message: string;
      };
    };
    message?: {
      body: string;
    };
  };
  request?: {
    url: string;
    method: string;
    headers: Record<string, string>;
    params: Record<string, string>;
    GET: Record<string, string>;
    POST: Record<string, string>;
  };
  person?: {
    id: string;
    username?: string;
    email?: string;
  };
}

export interface RollbarDeploy {
  id: number;
  environment: string;
  revision: string;
  comment: string;
  timestamp: number;
  local_username: string;
  project_id: number;
}

export interface ListItemsResponse {
  items: RollbarItem[];
  page: number;
  total: number;
}

export interface ItemResponse {
  item: RollbarItem;
}

export interface ListOccurrencesResponse {
  occurrences: RollbarOccurrence[];
  page: number;
  total: number;
}

export interface OccurrenceResponse {
  occurrence: RollbarOccurrence;
}

export interface ListProjectsResponse {
  projects: RollbarProject[];
}

export interface ProjectResponse {
  project: RollbarProject;
}

export interface ListEnvironmentsResponse {
  environments: RollbarEnvironment[];
}

export interface ListUsersResponse {
  users: RollbarUser[];
}

export interface UserResponse {
  user: RollbarUser;
}

export interface ListDeploysResponse {
  deploys: RollbarDeploy[];
  page: number;
  total: number;
}

export interface DeployResponse {
  deploy: RollbarDeploy;
}

export interface RollbarToolRequest {
  params: {
    name: string;
    arguments?: Record<string, unknown>;
    _meta?: {
      progressToken?: string | number;
    };
  };
  method: "tools/call";
}
