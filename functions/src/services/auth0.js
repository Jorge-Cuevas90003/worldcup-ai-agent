const axios = require('axios');
const { AUTH0, CONNECTIONS_MAP, GOOGLE_SCOPES, SLACK_SCOPES } = require('../config');

class TokenVault {
  constructor() {
    this._managementToken = null;
    this._tokenExpiry = 0;
  }

  async getManagementToken() {
    if (this._managementToken && Date.now() < this._tokenExpiry) {
      return this._managementToken;
    }

    const { data } = await axios.post(`https://${AUTH0.DOMAIN}/oauth/token`, {
      grant_type: 'client_credentials',
      client_id: AUTH0.CLIENT_ID,
      client_secret: AUTH0.CLIENT_SECRET,
      audience: AUTH0.AUDIENCE,
    });

    this._managementToken = data.access_token;
    this._tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return this._managementToken;
  }

  async getUserToken(userId, connection) {
    const mgmtToken = await this.getManagementToken();

    const { data } = await axios.get(
      `https://${AUTH0.DOMAIN}/api/v2/users/${encodeURIComponent(userId)}/federated-tokens/${connection}`,
      {
        headers: { Authorization: `Bearer ${mgmtToken}` },
      }
    );

    return data.access_token;
  }

  async getGoogleToken(userId) {
    return this.getUserToken(userId, 'google-oauth2');
  }

  async getSlackToken(userId) {
    return this.getUserToken(userId, 'slack');
  }

  getAuthorizationUrl(connection, redirectUri, state) {
    const scope = connection === 'google-oauth2' ? GOOGLE_SCOPES : SLACK_SCOPES;

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: AUTH0.CLIENT_ID,
      redirect_uri: redirectUri,
      scope,
      connection,
      state: state || '',
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://${AUTH0.DOMAIN}/authorize?${params.toString()}`;
  }
}

module.exports = new TokenVault();
