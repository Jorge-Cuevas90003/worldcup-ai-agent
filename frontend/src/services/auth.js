import { Auth0Client } from '@auth0/auth0-spa-js';

let auth0 = null;

export async function getAuth0Client() {
  if (auth0) return auth0;

  auth0 = new Auth0Client({
    domain: import.meta.env.VITE_AUTH0_DOMAIN || 'your-tenant.us.auth0.com',
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || 'your-client-id',
    authorizationParams: {
      redirect_uri: window.location.origin + '/callback',
    },
  });

  return auth0;
}

export async function login() {
  const client = await getAuth0Client();
  await client.loginWithRedirect();
}

export async function handleCallback() {
  const client = await getAuth0Client();
  await client.handleRedirectCallback();
  return client.getUser();
}

export async function getUser() {
  const client = await getAuth0Client();
  return client.getUser();
}

export async function logout() {
  const client = await getAuth0Client();
  client.logout({ logoutParams: { returnTo: window.location.origin } });
}
