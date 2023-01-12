import { AuthConfig, AuthObject, AuthTokenResponse } from "./types";
declare class PassportAuth {
    private codeVerifier;
    private config;
    private state;
    constructor(config: AuthConfig);
    private getState;
    private validateAuthResponse;
    private parseAuthResponseUrl;
    private getStore;
    private randomStringFromStorage;
    private getCodeVerifier;
    private pkceChallengeFromVerifier;
    getAuthorizeUrl(additionalParams?: AuthObject): string;
    exchangeForAccessToken(url: string, additionalHeaders?: AuthObject, additionalParams?: AuthObject): Promise<AuthTokenResponse>;
}
export default PassportAuth;
//# sourceMappingURL=pkce.d.ts.map