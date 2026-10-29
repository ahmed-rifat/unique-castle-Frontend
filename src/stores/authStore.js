import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

function getInitialUser() {
  try {
    const raw = localStorage.getItem('unique_castle_user')
    if (!raw) return null
    return JSON.parse(raw)
  } catch (err) {
    console.error('Failed to parse unique_castle_user from localStorage:', err)
    localStorage.removeItem('unique_castle_user')
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('unique_castle_token') || null)
  const user = ref(getInitialUser())

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // Roles: SUPER_ADMIN or OWNER
  const role = computed(() => {
    if (!user.value) return null
    return String(user.value.role || '').toUpperCase()
  })

  const isSuperAdmin = computed(() => role.value === 'SUPER_ADMIN' || role.value === 'ADMIN')
  const isOwner = computed(() => role.value === 'OWNER' || role.value === 'USER')
  const flatNumber = computed(() => user.value?.flatNumber || null)
  const flatId = computed(() => user.value?.flatId || null)
  const ownerFlats = computed(() => user.value?.flats || [])

  function setAuth(authData) {
    token.value = authData.token
    user.value = authData.user
    if (authData.token) {
      localStorage.setItem('unique_castle_token', authData.token)
    }
    if (authData.user) {
      try {
        localStorage.setItem('unique_castle_user', JSON.stringify(authData.user))
      } catch (e) {
        console.error('Failed to serialize user for localStorage:', e)
      }
    }
  }

  function updateUser(updatedFields) {
    if (user.value) {
      user.value = { ...user.value, ...updatedFields }
      try {
        localStorage.setItem('unique_castle_user', JSON.stringify(user.value))
      } catch (e) {
        console.error('Failed to serialize user for localStorage:', e)
      }
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('unique_castle_token')
    localStorage.removeItem('unique_castle_user')
  }

  return {
    token,
    user,
    role,
    isAuthenticated,
    isSuperAdmin,
    isOwner,
    flatNumber,
    flatId,
    ownerFlats,
    setAuth,
    updateUser,
    logout
  }
})

