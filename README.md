# Nuxt v3 Laravel Passport PKCE Authentication

Minimal Nuxt 3 module allowing you to authenticate users via Laravel Passport
and the most recommended OAuth flow - PKCE. Very useful for mobile applications
where passwords can be compromised.

## How to install and run?

It's a fresh package, still WIP (work in progress) so it's not released on NPM. You have to reference it directly before we go fully live with it.

Edit your `package.json` file and refernce this package in `devDependencies` as:

```
"@onesmartspace/nuxt3-laravel-passport-pkce": "github:onesmartspace/nuxt3-laravel-passport-pkce#main",
```

Then install it and run test file to make sure it's working fine:

```
npm install
ts-node ./node_modules/@onesmartspace/nuxt3-laravel-passport-pkce/test.ts
```

## How to use?

In your code import authentication class and pass few configuration params to constructor:

```
import { PassportAuth } from "@onesmartspace/nuxt3-laravel-passport-pkce";

const pkce = new PassportAuth({
  client_id: "CLIENT-ID",
  redirect_uri: "http://redirect.to/some-url",
  authorization_endpoint: "http://auth-endpoint.to/authorize",
  token_endpoint: "http://auth-endpoint.to/get-token",
  requested_scopes: "*",
});
```

First of all we need to tell `PassportAuth` the `client_id` returned
by Laravel Passport, then 3 URIs and a scope.

There are 2 methods exposed: `getAuthorizeUrl()` and `exchangeForAccessToken(url)`.

You can use `getAuthorizeUrl()` as an action to Login button, for example in VueJS or AlpineJS:

```
<button @click="getAuthorizeUrl()">CLICK TO LOGIN</button>
```
