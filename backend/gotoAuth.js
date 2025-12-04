const axios = require("axios");

let cachedToken = null; // { accessToken, expiresAt }

function getEnv(name, fallback) {
  if (process.env[name]) return process.env[name];
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing env var: ${name}`);
}

async function fetchNewToken() {
  const clientId = getEnv("GOTO_CLIENT_ID");
  const clientSecret = getEnv("GOTO_CLIENT_SECRET");
  const authBase = getEnv("GOTO_AUTH_BASE_URL", "https://authentication.logmeininc.com");
  const audience = getEnv("GOTO_API_AUDIENCE", "https://api.getgo.com");

  const url = `${authBase}/oauth/token`;

  const body = new URLSearchParams();
  body.append("grant_type", "client_credentials");
  body.append("client_id", clientId);
  body.append("client_secret", clientSecret);
  body.append("audience", audience);

  const resp = await axios.post(url, body.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    timeout: 10_000
  });

  const data = resp.data;

  if (!data.access_token || !data.expires_in) {
    throw new Error("Unexpected token response from GoTo");
  }

  const now = Date.now();
  const expiresAt = now + (data.expires_in - 60) * 1000; // refresh 1min early

  cachedToken = {
    accessToken: data.access_token,
    expiresAt
  };

  return cachedToken.accessToken;
}

async function getGoToAccessToken() {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt && cachedToken.expiresAt > now) {
    return cachedToken.accessToken;
  }

  return fetchNewToken();
}

module.exports = {
  getGoToAccessToken
};
