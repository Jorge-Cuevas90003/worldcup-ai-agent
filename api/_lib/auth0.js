const { AUTH0, GOOGLE_SCOPES, SLACK_SCOPES } = require('./config');

class TokenVault {
  constructor() {
    this._managementToken = null;
    this._tokenExpiry = 0;
  }

  async getManagementToken() {
    if (this._managementToken && Date.now() < this._tokenExpiry) {
      return this._managementToken;
    }

    // Use M2M app credentials for Management API access
    const clientId = process.env.AUTH0_M2M_CLIENT_ID || AUTH0.CLIENT_ID;
    const clientSecret = process.env.AUTH0_M2M_CLIENT_SECRET || AUTH0.CLIENT_SECRET;

    const res = await fetch(`https://${AUTH0.DOMAIN}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        audience: AUTH0.AUDIENCE,
      }),
    });

    const data = await res.json();
    if (!data.access_token) {
      console.error('Failed to get management token:', data);
      throw new Error('Failed to get Auth0 management token');
    }
    this._managementToken = data.access_token;
    this._tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return this._managementToken;
  }

  async getUserToken(userId, connection) {
    const mgmtToken = await this.getManagementToken();

    // Get user profile which includes identity provider tokens
    const res = await fetch(
      `https://${AUTH0.DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`,
      { headers: { Authorization: `Bearer ${mgmtToken}` } }
    );

    const data = await res.json();
    if (data.statusCode) {
      console.error('Failed to get user:', data);
      return null;
    }

    // Find the matching identity and return its access_token
    const identity = (data.identities || []).find(i => i.provider === connection);
    if (!identity || !identity.access_token) {
      console.error(`No token found for connection ${connection}`);
      return null;
    }

    return identity.access_token;
  }

  async getGoogleToken(userId) {
    return this.getUserToken(userId, 'google-oauth2');
  }

  async getSlackToken(userId) {
    // Try the main user first
    const token = await this.getUserToken(userId, 'slack-oauth-2');
    if (token) return token;

    // If not found, search for a Slack-linked user by email
    const mgmtToken = await this.getManagementToken();
    const res = await fetch(
      `https://${AUTH0.DOMAIN}/api/v2/users?q=identities.connection:"slack-oauth-2"&search_engine=v3`,
      { headers: { Authorization: `Bearer ${mgmtToken}` } }
    );
    const users = await res.json();
    if (Array.isArray(users) && users.length > 0) {
      const slackIdentity = users[0].identities?.find(i => i.connection === 'slack-oauth-2');
      if (slackIdentity?.access_token) return slackIdentity.access_token;
    }
    return null;
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
