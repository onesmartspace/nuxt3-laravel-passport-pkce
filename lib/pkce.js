import sha256 from "crypto-js/sha256";
import Base64 from "crypto-js/enc-base64";
import WordArray from "crypto-js/lib-typedarrays";
class PassportAuth {
    codeVerifier = "";
    config;
    state = "";
    constructor(config) {
        this.config = config;
    }
    getState(explicit = null) {
        const stateKey = "pkce_state";
        if (explicit) {
            this.getStore()?.setItem(stateKey, explicit);
        }
        if (!this.state) {
            this.state = this.randomStringFromStorage(stateKey);
        }
        return this.state;
    }
    validateAuthResponse(queryParams) {
        return new Promise((resolve, reject) => {
            if (queryParams.error) {
                return reject({ error: queryParams.error });
            }
            if (queryParams.state !== this.getState()) {
                return reject({ error: "Invalid State" });
            }
            return resolve(queryParams);
        });
    }
    parseAuthResponseUrl(url) {
        const params = new URL(url).searchParams;
        return this.validateAuthResponse({
            error: params.get("error"),
            query: params.get("query"),
            state: params.get("state"),
            code: params.get("code"),
        });
    }
    getStore() {
        return window ? localStorage : null;
    }
    randomStringFromStorage(key) {
        const fromStorage = this.getStore()?.getItem(key);
        if (!fromStorage) {
            this.getStore()?.setItem(key, WordArray.random(64).toString());
        }
        return this.getStore()?.getItem(key) || "";
    }
    getCodeVerifier() {
        if (!this.codeVerifier) {
            this.codeVerifier = this.randomStringFromStorage("pkce_code_verifier");
        }
        return this.codeVerifier;
    }
    pkceChallengeFromVerifier() {
        const hashed = sha256(this.getCodeVerifier());
        return Base64.stringify(hashed)
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");
    }
    getAuthorizeUrl(additionalParams = {}) {
        const codeChallenge = this.pkceChallengeFromVerifier();
        const queryString = new URLSearchParams(Object.assign({
            response_type: "code",
            client_id: this.config.client_id,
            state: this.getState(additionalParams.state || null),
            scope: this.config.requested_scopes,
            redirect_uri: this.config.redirect_uri,
            code_challenge: codeChallenge,
            code_challenge_method: "S256",
        }, additionalParams)).toString();
        return `${this.config.authorization_endpoint}?${queryString}`;
    }
    async exchangeForAccessToken(url, additionalHeaders = {}, additionalParams = {}) {
        const q = await this.parseAuthResponseUrl(url);
        const response = await fetch(this.config.token_endpoint, {
            method: "POST",
            body: new URLSearchParams(Object.assign({
                grant_type: "authorization_code",
                code: q.code,
                client_id: this.config.client_id,
                redirect_uri: this.config.redirect_uri,
                code_verifier: this.getCodeVerifier(),
            }, additionalParams)),
            headers: Object.assign({
                Accept: "application/json",
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            }, additionalHeaders),
        });
        return await response.json();
    }
}
export default PassportAuth;
//# sourceMappingURL=pkce.js.map