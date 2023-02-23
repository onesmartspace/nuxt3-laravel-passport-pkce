export interface AuthConfig {
  client_id: string;
  redirect_uri: string;
  authorization_endpoint: string;
  token_endpoint: string;
  requested_scopes: string;
  storage?: AuthStorage;
}

export interface AuthObject {
  [key: string]: any;
}

export interface AuthResponse {
  error: string | null;
  query: string | null;
  state: string | null;
  code: string | null;
}

export interface AuthStorage {
  getItem(key: string): any;
  setItem(key: string, value: any): void;
}

export interface AuthTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
}
