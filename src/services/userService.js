import apiClient from './api.js'

export const userService = {
  /**
   * Get all users (Super Admin)
   * Calls Spring Boot /all-users
   */
  async getAllUsers() {
    const response = await apiClient.get('/all-users')
    return response.data?.data || []
  },

  /**
   * Update a user's role (Super Admin)
   * Calls Spring Boot /update-role?userId=...&newRole=...
   */
  async updateUserRole(userId, newRole) {
    const response = await apiClient.post('/update-role', null, {
      params: {
        userId,
        newRole
      }
    })
    return response.data
  },

  /**
   * Get current authenticated user details & role
   */
  async getCurrentUser() {
    const stored = localStorage.getItem('unique_castle_user')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {
        // ignore parse error
      }
    }
    return null
  },

  /**
   * Fetch latest user profile from backend
   * Calls Spring Boot GET /user/profile
   */
  async getProfile() {
    const response = await apiClient.get('/user/profile')
    return response.data
  },

  /**
   * Update user contact info / registration
   * Calls Spring Boot PUT /user/profile
   */
  async updateProfile(profileData) {
    let resData
    try {
      const response = await apiClient.put('/user/profile', profileData)
      resData = response.data
    } catch (err) {
      // Fallback to /register-update if needed
      const response = await apiClient.post('/register-update', profileData)
      resData = response.data
    }

    if (resData.status === 'false' || resData.status === false) {
      const err = new Error(resData.message || 'Update failed')
      err.response = { data: resData }
      throw err
    }

    // Update local storage without saving raw password
    let stored = {}
    try {
      const raw = localStorage.getItem('unique_castle_user')
      if (raw) stored = JSON.parse(raw)
    } catch (e) {
      localStorage.removeItem('unique_castle_user')
    }

    const { password, confirmPassword, ...safeProfileData } = profileData
    const updated = { ...stored, ...safeProfileData }
    try {
      localStorage.setItem('unique_castle_user', JSON.stringify(updated))
    } catch (e) {
      console.error('Failed to serialize user for localStorage:', e)
    }
    return updated
  },

  /**
   * Securely change user password verifying current password
   * Calls Spring Boot POST /user/change-password
   */
  async changePassword({ currentPassword, newPassword, confirmPassword }) {
    const response = await apiClient.post('/user/change-password', {
      currentPassword,
      newPassword,
      confirmPassword
    })
    return response.data
  }
}

export default userService
