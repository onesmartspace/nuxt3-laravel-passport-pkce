import sha256 from "crypto-js/sha256";
import Base64 from "crypto-js/enc-base64";
import WordArray from "crypto-js/lib-typedarrays";
import MemoryDriver from "./MemoryDriver";

import {
  AuthConfig,
  AuthObject,
  AuthResponse,
  AuthStorage,
  AuthTokenResponse,
} from "./types";

class PassportAuth {
  private codeVerifier: string = "";
  private config: AuthConfig;
  private storage: AuthStorage;
  private state: string = "";

  constructor(config: AuthConfig) {
    this.config = config;
    if (this.config?.hasOwnProperty("storage")) {
      this.storage = this.config.storage;
      delete this.config.storage;
    } else {
      this.storage =
        typeof window === "undefined" ? new MemoryDriver() : localStorage;
    }
  }

  private getState(explicit: string | null = null): string {
    const stateKey = "pkce_state";

    if (explicit) {
      this.getStore()?.setItem(stateKey, explicit);
    }

    if (!this.state) {
      this.state = this.randomStringFromStorage(stateKey);
    }

    return this.state;
  }

  private validateAuthResponse(
    queryParams: AuthResponse
  ): Promise<AuthResponse> {
    return new Promise<AuthResponse>((resolve, reject) => {
      if (queryParams.error) {
        return reject({ error: queryParams.error });
      }

      if (queryParams.state !== this.getState()) {
        return reject({ error: "Invalid State" });
      }

      return resolve(queryParams);
    });
  }

  private parseAuthResponseUrl(url: string): Promise<AuthResponse> {
    const params = new URL(url).searchParams;

    return this.validateAuthResponse({
      error: params.get("error"),
      query: params.get("query"),
      state: params.get("state"),
      code: params.get("code"),
    });
  }

  private getStore(): AuthStorage {
    return this.storage;
  }

  private randomStringFromStorage(key: string): string {
    const fromStorage = this.getStore()?.getItem(key);

    if (!fromStorage) {
      this.getStore()?.setItem(key, WordArray.random(64).toString());
    }

    return this.getStore()?.getItem(key) || "";
  }

  private getCodeVerifier(): string {
    if (!this.codeVerifier) {
      this.codeVerifier = this.randomStringFromStorage("pkce_code_verifier");
    }

    return this.codeVerifier;
  }

  private pkceChallengeFromVerifier(): string {
    const hashed = sha256(this.getCodeVerifier());
    return Base64.stringify(hashed)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  public getAuthorizeUrl(additionalParams: AuthObject = {}): string {
    const codeChallenge = this.pkceChallengeFromVerifier();

    const queryString = new URLSearchParams(
      Object.assign(
        {
          response_type: "code",
          client_id: this.config.client_id,
          state: this.getState(additionalParams.state || null),
          scope: this.config.requested_scopes,
          redirect_uri: this.config.redirect_uri,
          code_challenge: codeChallenge,
          code_challenge_method: "S256",
        },
        additionalParams
      )
    ).toString();

    return `${this.config.authorization_endpoint}?${queryString}`;
  }

  public async exchangeForAccessToken(
    url: string,
    additionalHeaders: AuthObject = {},
    additionalParams: AuthObject = {}
  ): Promise<AuthTokenResponse> {
    const q = await this.parseAuthResponseUrl(url);

    const response = await fetch(this.config.token_endpoint, {
      method: "POST",
      body: new URLSearchParams(
        Object.assign(
          {
            grant_type: "authorization_code",
            code: q.code,
            client_id: this.config.client_id,
            redirect_uri: this.config.redirect_uri,
            code_verifier: this.getCodeVerifier(),
          },
          additionalParams
        )
      ),
      headers: Object.assign(
        {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        additionalHeaders
      ),
    });

    return await response.json();
  }
}

export default PassportAuth;
