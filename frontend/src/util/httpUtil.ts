import type { SetStoreFunction } from 'solid-js/store'
import userState, { type User } from '../state/userState'

const BASE_URL = 'http://localhost:4322'

const refreshAccessToken = async (
  user: User,
  setUser: SetStoreFunction<User>,
) => {
  const { accessToken, refreshToken } = user
  const userAuthData = await fetch(`${BASE_URL}/api/users/refresh-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accessToken, refreshToken }),
  }).then(async (response) => {
    if (!response.ok) {
      setUser({ username: null, accessToken: null, refreshToken: null })
      location.assign('/login')
      throw new Error('Failed to refresh token')
    }
    return response.json()
  })
  setUser(userAuthData)
  return userAuthData
}

const fetchWithTimeout = async (
  url: string | URL | Request,
  options: RequestInit,
  timeoutMilliseconds: number = 7000,
) => {
  const [user, setUser] = userState
  const headers = {
    ...options.headers,
    Authorization: user.accessToken ? `Bearer ${user.accessToken}` : '',
  }
  console.log('fetching:', `${BASE_URL}${url}`)
  return fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
    signal: AbortSignal.timeout(timeoutMilliseconds),
  }).then(async (response) => {
    let responseJson = await response.json() // json can be consumed only once

    // If the access token has expired, refresh it and retry the request
    if (
      response.status === 401 &&
      responseJson.detail === 'Token has expired'
    ) {
      // Refresh the access token
      const userAuthData = await refreshAccessToken(user, setUser)
      const refreshedHeaders = {
        ...headers,
        Authorization: `Bearer ${userAuthData.accessToken}`,
      }

      // Retry the request with the new access token
      response = await fetch(`${BASE_URL}${url}`, {
        ...options,
        headers: refreshedHeaders,
        signal: AbortSignal.timeout(timeoutMilliseconds),
      })
      responseJson = await response.json()
    }

    // If the response is not ok, even after token refresh, throw an error
    if (!response.ok) {
      throw new Error(responseJson.detail)
    }
    return responseJson
  })
}

const get = async (url: string | URL, options: RequestInit = {}) => {
  return fetchWithTimeout(url, { ...options, method: 'GET' })
}

const post = async (
  url: string,
  data: Record<string, any> = {},
  options: RequestInit = {},
) => {
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
  }
  return fetchWithTimeout(url, {
    ...options,
    headers,
    method: 'POST',
    body: JSON.stringify(data),
  })
}

const put = async (
  url: string,
  data: Record<string, any>,
  options: RequestInit = {},
) => {
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
  }
  return fetchWithTimeout(url, {
    ...options,
    headers,
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

const del = async (url: string, options: RequestInit = {}) => {
  return fetchWithTimeout(url, { ...options, method: 'DELETE' })
}

export default { get, post, put, del }
