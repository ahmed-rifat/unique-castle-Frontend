import apiClient from './api.js'
import { memberService } from './memberService.js'

/**
 * Decode JWT token to extract claims (username, role, etc.)
 */
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    return null
  }
}

export const authService = {
  /**
   * Login user with phoneNumber & password
   * Calls Spring Boot /login endpoint (UserController)
   */
  async login(credentials) {
    const phoneNumber = (credentials.phoneNumber || credentials.username || '').trim()
    const password = credentials.password

    // Backend expects UserRequest { phoneNumber, password }
    const response = await apiClient.post('/login', {
      phoneNumber,
      password
    })

    const resData = response.data

    // Backend returns ApiGetResponseData: { status: "true"|"false", message, data: { role, token } }
    if (resData.status === 'false' || resData.status === false) {
      throw new Error(resData.message || 'Invalid credentials. Please verify your phone number and password.')
    }

    const loginData = resData.data || {}
    const token = loginData.token || loginData.jwt || loginData.accessToken || resData.token
    const role = (loginData.role || resData.role || 'OWNER').toUpperCase()

    // Prevent deactivated accounts from logging in
    if (role !== 'SUPER_ADMIN') {
      try {
        const allMembers = await memberService.getAllMembers()
        const matched = allMembers.find(m =>
          (phoneNumber && m.phoneNumber === phoneNumber) ||
          (credentials.username && m.username?.toLowerCase() === credentials.username.toLowerCase())
        )
        if (matched && matched.accountStatus === 'Inactive') {
          throw new Error('Your account has been deactivated by the building administration. Please contact the management office.')
        }
      } catch (checkErr) {
        if (checkErr.message.includes('deactivated')) throw checkErr
      }
    }

    const jwtInfo = token ? parseJwt(token) : null
    const username = jwtInfo?.sub || credentials.username || phoneNumber
    const userFromResp = resData.user || loginData.user || {}

    let flatNumber = userFromResp.flatNumber || loginData.flatNumber || loginData.flat || null
    let flatId = userFromResp.flatId || loginData.flatId || null
    let ownerName = userFromResp.name || null
    let flatsList = []

    // For resident owners, query /get-flats with the token to retrieve their exact assigned flat(s)
    if (token && (role === 'OWNER' || role === 'USER')) {
      try {
        const flatsRes = await apiClient.get('/get-flats', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = Array.isArray(flatsRes.data?.data)
          ? flatsRes.data.data
          : (Array.isArray(flatsRes.data) ? flatsRes.data : [])

        if (data.length > 0) {
          flatsList = data.map(f => ({
            flatId: f.flatId,
            flatNumber: f.flatNumber,
            serviceFeeId: f.serviceFeeId,
            ownerName: f.ownerName,
            phoneNumber: f.contact || f.phoneNumber
          }))
          flatNumber = data[0].flatNumber || flatNumber
          flatId = data[0].flatId || flatId
          ownerName = data[0].ownerName || ownerName
        }
      } catch (flatErr) {
        console.warn('Could not auto-fetch owner flat details on login:', flatErr)
      }
    }

    return {
      token,
      role,
      user: {
        id: userFromResp.id || userFromResp.userId,
        userId: userFromResp.id || userFromResp.userId,
        username: userFromResp.username || username,
        phoneNumber: userFromResp.phoneNumber || phoneNumber,
        flatNumber,
        flatId,
        name: ownerName || userFromResp.name || username,
        flats: flatsList,
        role
      }
    }
  },

  /**
   * Register or update user (/register-update)
   */
  async register(userData) {
    const response = await apiClient.post('/register-update', userData)
    const resData = response.data
    if (resData.status === 'false' || resData.status === false) {
      const err = new Error(resData.message || 'Registration failed')
      err.response = { data: resData }
      throw err
    }
    return resData
  },

  /**
   * Logout user
   */
  async logout() {
    localStorage.removeItem('unique_castle_token')
    localStorage.removeItem('unique_castle_user')
  }
}

export default authService

