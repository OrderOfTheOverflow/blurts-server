/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ClientOAuth2 from 'client-oauth2'
import crypto from 'crypto'
import { URL } from 'url'

import AppConstants from '../app-constants.js'

// This object exists instead of inlining the env vars to make it easy
// to abstract fetching API endpoints from the OAuth server (instead
// of specifying them in the environment) in the future.
const FxAOAuthUtils = {
  get authorizationUri () { return AppConstants.OAUTH_AUTHORIZATION_URI },
  get tokenUri () { return AppConstants.OAUTH_TOKEN_URI },
  get profileUri () { return AppConstants.OAUTH_PROFILE_URI }
}

const FxAOAuthClient = new ClientOAuth2({
  clientId: AppConstants.OAUTH_CLIENT_ID,
  clientSecret: AppConstants.OAUTH_CLIENT_SECRET,
  accessTokenUri: FxAOAuthUtils.tokenUri,
  authorizationUri: FxAOAuthUtils.authorizationUri,
  redirectUri: AppConstants.SERVER_URL + '/oauth/confirmed',
  scopes: ['profile']
})

async function postTokenRequest (path, token) {
  const fxaTokenOrigin = new URL(AppConstants.OAUTH_TOKEN_URI).origin
  const tokenUrl = `${fxaTokenOrigin}${path}`
  const tokenBody = (typeof token === 'object') ? token : { token }
  const tokenOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(tokenBody)
  }

  try {
    const response = await fetch(tokenUrl, tokenOptions)
    if (!response.ok) throw new Error(`bad response: ${response.status}`)
    return await response.json()
  } catch (e) {
    console.error('postTokenRequest', { stack: e.stack })
    return e
  }
}

async function verifyOAuthToken (token) {
  try {
    const response = await postTokenRequest('/v1/verify', token)
    return response
  } catch (e) {
    console.error('verifyOAuthToken', { stack: e.stack })
  }
}

async function destroyOAuthToken (token) {
  try {
    const response = await postTokenRequest('/v1/destroy', token)
    return response
  } catch (e) {
    console.error('destroyOAuthToken', { stack: e.stack })
  }
}

async function revokeOAuthTokens (subscriber) {
  await destroyOAuthToken({ token: subscriber.fxa_access_token })
  await destroyOAuthToken({ refresh_token: subscriber.fxa_refresh_token })
}

async function getProfileData (accessToken) {
  try {
    const response = await fetch(FxAOAuthUtils.profileUri, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    if (!response.ok) throw new Error(`bad response: ${response.status}`)
    return await response.text()
  } catch (e) {
    console.warn('getProfileData', { stack: e.stack })
    return e
  }
}

async function sendMetricsFlowPing (path) {
  const fxaMetricsFlowUrl = new URL(path, AppConstants.FXA_SETTINGS_URL)
  try {
    const response = await fetch(fxaMetricsFlowUrl, {
      headers: { Origin: AppConstants.SERVER_URL }
    })
    if (!response.ok) throw new Error(`bad response: ${response.status}`)
    console.info('pinged FXA metrics flow.')
    return response
  } catch (e) {
    console.error('sendMetricsFlowPing', { stack: e.stack })
    return false
  }
}

function getSha1 (email) {
  return crypto.createHash('sha1').update(email).digest('hex')
}

export {
  FxAOAuthClient,
  verifyOAuthToken,
  destroyOAuthToken,
  revokeOAuthTokens,
  getProfileData,
  sendMetricsFlowPing,
  getSha1
}
