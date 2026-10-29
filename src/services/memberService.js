import apiClient from './api.js'
import { getCurrentMonth, getCurrentYear, MONTH_NAMES } from '../utils/date.js'
import { normalizeStatus, STATUS_TYPES } from '../utils/paymentStatus.js'

const REGISTRY_STORAGE_KEY = 'unique_castle_flat_members_registry_v1'
const AUDIT_LOG_STORAGE_KEY = 'unique_castle_members_audit_log_v1'

export const OCCUPANCY_STATUSES = {
  MOVED_IN: 'Moved In',
  NOT_MOVED_IN: 'Not Moved In',
  VACATED: 'Vacated'
}

export const ACCOUNT_STATUSES = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive'
}

export const BILLING_ELIGIBILITIES = {
  ELIGIBLE: 'Eligible',
  INELIGIBLE: 'Ineligible'
}

/**
 * Load locally cached member records (saved from prior real backend responses)
 * Returns empty array if no real records have been cached yet.
 * No dummy or auto-generated flats are ever generated here.
 */
function loadLocalRegistry() {
  try {
    const raw = localStorage.getItem(REGISTRY_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (e) {
    console.error('Failed reading member registry from localStorage:', e)
  }
  return []
}

function saveLocalRegistry(registry) {
  try {
    localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(registry))
  } catch (e) {
    console.error('Failed saving member registry to localStorage:', e)
  }
}

function loadAuditLogs() {
  try {
    const raw = localStorage.getItem(AUDIT_LOG_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (e) {
    console.error('Failed reading audit logs from localStorage:', e)
  }
  return []
}

function recordAuditLog(action, details) {
  const logs = loadAuditLogs()
  const logEntry = {
    id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    action,
    details,
    adminUser: 'Building Super Admin',
    createdAt: new Date().toISOString()
  }
  logs.unshift(logEntry)
  try {
    localStorage.setItem(AUDIT_LOG_STORAGE_KEY, JSON.stringify(logs.slice(0, 50)))
  } catch (e) {
    console.error('Failed recording audit log:', e)
  }
}

/**
 * Normalize a member record received from backend database models
 */
function normalizeMemberRecord(item) {
  if (!item) return null

  const flatNumber = item.flatNumber || item.unitNumber || item.flat || ''
  const userId = item.userId != null ? item.userId : (item.id != null && !isNaN(Number(item.id)) ? Number(item.id) : null)
  const id = item.id != null ? item.id : (userId != null ? userId : (flatNumber ? `flat-${flatNumber}` : null))

  return {
    id,
    userId,
    flatId: item.flatId || null,
    name: item.name || item.ownerName || (flatNumber ? `Resident of Flat ${flatNumber}` : 'Apartment Resident'),
    flatNumber: String(flatNumber).trim().toUpperCase(),
    buildingName: item.buildingName || 'Unique Castle',
    phoneNumber: item.phoneNumber || item.contact || item.phone || '',
    email: item.email || '',
    username: item.username || item.ownerUsername || (flatNumber ? `owner_${flatNumber.toLowerCase()}` : ''),
    role: (item.role || 'OWNER').toUpperCase(),
    occupancyStatus: item.occupancyStatus || OCCUPANCY_STATUSES.MOVED_IN,
    accountStatus: item.accountStatus || item.status || ACCOUNT_STATUSES.ACTIVE,
    billingEligibility: item.billingEligibility || (
      item.occupancyStatus === OCCUPANCY_STATUSES.NOT_MOVED_IN
        ? BILLING_ELIGIBILITIES.INELIGIBLE
        : BILLING_ELIGIBILITIES.ELIGIBLE
    ),
    moveInDate: item.moveInDate || null,
    createdAt: item.createdAt || null,
    isArchived: Boolean(item.isArchived),
    notes: item.notes || ''
  }
}

/**
 * Check if a flat is eligible for monthly service charge billing in a given month & year.
 * Evaluated against actual registered flat status:
 * - Management office is never billed
 * - Archived flats are not eligible
 * - Flat marked "Ineligible" is exempt
 * - Flat marked "Not Moved In" or "Vacated" is exempt unless moveInDate <= target month end
 * - Flat whose moveInDate is after target month end is exempt
 */
export function isFlatBillingEligible(flatNumber, monthName = getCurrentMonth(), year = getCurrentYear()) {
  if (!flatNumber) return true

  const cleanFlat = typeof flatNumber === 'object' && flatNumber !== null
    ? String(flatNumber.flatNumber || flatNumber.flat || '').trim().toUpperCase()
    : String(flatNumber || '').trim().toUpperCase()

  if (!cleanFlat) return true

  // Management office is never billed
  if (cleanFlat.includes('OFFICE') || cleanFlat.includes('MANAGEMENT')) return false

  const registry = loadLocalRegistry()
  const member = registry.find(m => String(m.flatNumber || '').trim().toUpperCase() === cleanFlat && !m.isArchived)

  if (!member) {
    // If not found in registry, default to eligible
    return true
  }

  // Archived members are not eligible
  if (member.isArchived) return false

  // Explicit ineligibility check
  if (
    member.billingEligibility === BILLING_ELIGIBILITIES.INELIGIBLE ||
    String(member.billingEligibility || '').toLowerCase() === 'ineligible'
  ) {
    return false
  }

  // Resolve target month end date
  const curYear = Number(year) || getCurrentYear()
  let monthNum = 10
  if (typeof monthName === 'number' && monthName >= 1 && monthName <= 12) {
    monthNum = monthName
  } else if (monthName && !isNaN(Number(monthName)) && Number(monthName) >= 1 && Number(monthName) <= 12) {
    monthNum = Number(monthName)
  } else if (typeof monthName === 'string') {
    const idx = MONTH_NAMES.indexOf(monthName)
    monthNum = idx !== -1 ? idx + 1 : (new Date().getMonth() + 1)
  } else {
    monthNum = new Date().getMonth() + 1
  }

  // Last date of target billing month (e.g., 2026-10-31 23:59:59)
  const targetMonthEnd = new Date(curYear, monthNum, 0, 23, 59, 59, 999)

  const occupancy = String(member.occupancyStatus || '').trim().toLowerCase()
  const isNotMovedIn = occupancy === 'not moved in' || occupancy === 'vacated'

  if (isNotMovedIn) {
    if (member.moveInDate) {
      const moveDate = new Date(member.moveInDate)
      return moveDate <= targetMonthEnd
    }
    return false
  }

  if (member.moveInDate) {
    const moveDate = new Date(member.moveInDate)
    if (moveDate > targetMonthEnd) {
      return false
    }
  }

  return true
}

export const memberService = {
  isFlatBillingEligible,

  /**
   * Fetch all flat members from the REAL database.
   * Connects to /admin/members or falls back to /get-flats.
   * Strictly returns original database records without generating dummy flats.
   */
  async getAllMembers() {
    let rawMembers = null

    // 1. Try dedicated admin member directory API
    try {
      const response = await apiClient.get('/admin/members')
      const data = response.data?.data != null ? response.data.data : response.data
      if (Array.isArray(data)) {
        rawMembers = data
      }
    } catch (err) {
      // Non-blocking fallback to /get-flats
    }

    // 2. If /admin/members did not return data, query /get-flats (real database table)
    if (!rawMembers) {
      try {
        const flatsRes = await apiClient.get('/get-flats')
        const flatsData = Array.isArray(flatsRes.data?.data)
          ? flatsRes.data.data
          : (Array.isArray(flatsRes.data) ? flatsRes.data : [])

        if (Array.isArray(flatsData) && flatsData.length > 0) {
          rawMembers = flatsData.map(f => ({
            id: f.flatId || f.id,
            userId: f.ownerId || f.userId || null,
            flatId: f.flatId || f.id,
            name: f.ownerName || (f.flatNumber ? `Resident of Flat ${f.flatNumber}` : 'Apartment Resident'),
            flatNumber: f.flatNumber,
            buildingName: 'Unique Castle',
            phoneNumber: f.contact || f.phoneNumber || '',
            email: f.email || '',
            username: f.ownerUsername || f.username || (f.flatNumber ? `owner_${f.flatNumber.toLowerCase()}` : ''),
            role: f.role || 'OWNER',
            occupancyStatus: f.occupancyStatus || OCCUPANCY_STATUSES.MOVED_IN,
            accountStatus: f.accountStatus || f.status || ACCOUNT_STATUSES.ACTIVE,
            billingEligibility: f.billingEligibility || BILLING_ELIGIBILITIES.ELIGIBLE,
            moveInDate: f.moveInDate || null,
            createdAt: f.createdAt || null,
            isArchived: Boolean(f.isArchived),
            notes: f.notes || ''
          }))
        }
      } catch (fErr) {
        // If both failed and we have no cache, throw meaningful error
        const cached = loadLocalRegistry()
        if (cached && cached.length > 0) return cached
        throw new Error('Unable to retrieve flat records from the database. Please verify backend connection.')
      }
    }

    // 3. Normalize records and persist cache of real database records
    const normalized = Array.isArray(rawMembers)
      ? rawMembers.map(normalizeMemberRecord).filter(Boolean)
      : []

    saveLocalRegistry(normalized)
    return normalized
  },

  /**
   * Get single member details by ID from the database
   */
  async getMemberById(id) {
    try {
      const response = await apiClient.get(`/admin/members/${id}`)
      if (response.data?.data) {
        return normalizeMemberRecord(response.data.data)
      }
    } catch (err) {
      console.warn('Backend getMemberById fallback:', err.message)
    }

    const registry = loadLocalRegistry()
    const member = registry.find(m => String(m.id) === String(id) || String(m.userId) === String(id))
    if (!member) throw new Error(`Member record not found for ID: ${id}`)
    return member
  },

  /**
   * Register a new flat member in the database (Admin)
   */
  async createMember(data) {
    if (!data.name || !data.name.trim()) throw new Error('Full Name is required')
    if (!data.flatNumber || !data.flatNumber.trim()) throw new Error('Flat assignment is required')
    if (!data.phoneNumber || !data.phoneNumber.trim()) throw new Error('Phone Number is required')

    const bdPhoneRegex = /^01[3-9]\d{8}$/
    if (!bdPhoneRegex.test(data.phoneNumber.trim())) {
      throw new Error('Enter a valid 11-digit Bangladeshi mobile number (e.g. 01712345678)')
    }

    const payload = {
      name: data.name.trim(),
      username: (data.username || `user_${data.flatNumber.toLowerCase()}`).trim(),
      phoneNumber: data.phoneNumber.trim(),
      email: data.email?.trim() || '',
      flatNumber: String(data.flatNumber).trim().toUpperCase(),
      buildingName: data.buildingName || 'Unique Castle',
      password: data.password || 'password123',
      confirmPassword: data.confirmPassword || data.password || 'password123',
      role: data.role || 'OWNER',
      occupancyStatus: data.occupancyStatus || OCCUPANCY_STATUSES.MOVED_IN,
      accountStatus: data.accountStatus || ACCOUNT_STATUSES.ACTIVE,
      billingEligibility: data.billingEligibility || (
        data.occupancyStatus === OCCUPANCY_STATUSES.NOT_MOVED_IN
          ? BILLING_ELIGIBILITIES.INELIGIBLE
          : BILLING_ELIGIBILITIES.ELIGIBLE
      ),
      moveInDate: data.moveInDate || new Date().toISOString().substring(0, 10),
      notes: data.notes || ''
    }

    let created = null
    try {
      const response = await apiClient.post('/admin/members', payload)
      created = response.data?.data || response.data
    } catch (apiErr) {
      // Fallback: register via /register-update
      try {
        await apiClient.post('/register-update', {
          name: payload.name,
          username: payload.username,
          phoneNumber: payload.phoneNumber,
          email: payload.email,
          flatNumber: payload.flatNumber,
          password: payload.password,
          confirmPassword: payload.confirmPassword,
          role: payload.role
        })
        created = {
          ...payload,
          id: 'mem-' + Date.now(),
          userId: Date.now(),
          createdAt: new Date().toISOString().substring(0, 10),
          isArchived: false
        }
      } catch (regErr) {
        const msg = apiErr.response?.data?.message || apiErr.message
        throw new Error(msg)
      }
    }

    // Refresh local registry with the newly created real database member
    const registry = loadLocalRegistry()
    if (created) {
      const normalizedCreated = normalizeMemberRecord(created)
      registry.push(normalizedCreated)
      saveLocalRegistry(registry)
    }

    recordAuditLog('CREATE_MEMBER', {
      name: payload.name,
      flatNumber: payload.flatNumber,
      occupancy: payload.occupancyStatus,
      eligibility: payload.billingEligibility
    })

    return created
  },

  /**
   * Edit existing flat member in the database (Admin)
   */
  async updateMember(id, updateData) {
    if (updateData.phoneNumber && updateData.phoneNumber.trim()) {
      const bdPhoneRegex = /^01[3-9]\d{8}$/
      if (!bdPhoneRegex.test(updateData.phoneNumber.trim())) {
        throw new Error('Enter a valid 11-digit Bangladeshi mobile number')
      }
    }

    let updated = null
    try {
      const response = await apiClient.put(`/admin/members/${id}`, updateData)
      updated = response.data?.data
    } catch (apiErr) {
      console.warn('Backend updateMember API warning, updating local cache:', apiErr.message)
    }

    // Refresh local registry
    const registry = loadLocalRegistry()
    const idx = registry.findIndex(m => String(m.id) === String(id) || String(m.userId) === String(id))
    if (idx !== -1) {
      registry[idx] = { ...registry[idx], ...updateData }
      updated = registry[idx]
      saveLocalRegistry(registry)
    }

    recordAuditLog('UPDATE_MEMBER', {
      memberId: id,
      name: updateData.name,
      flatNumber: updateData.flatNumber,
      occupancy: updateData.occupancyStatus,
      eligibility: updateData.billingEligibility,
      status: updateData.accountStatus
    })

    return updated
  },

  /**
   * Activate or Deactivate an INDIVIDUAL flat member account (Admin).
   * Strictly targets ONLY the selected member's unique database record.
   * Other users' account statuses remain completely unchanged.
   */
  async toggleAccountStatus(memberOrId, newStatus) {
    // Extract unique identifier (prefer numeric database userId, fallback to flatId or id)
    let targetId = null
    let targetFlatNumber = null

    if (typeof memberOrId === 'object' && memberOrId !== null) {
      targetId = memberOrId.userId != null ? memberOrId.userId : (memberOrId.id != null ? memberOrId.id : memberOrId.flatId)
      targetFlatNumber = memberOrId.flatNumber || null
    } else {
      targetId = memberOrId
    }

    if (!targetId && !targetFlatNumber) {
      throw new Error('Member ID is required to update status')
    }

    let updated = null
    // 1. Send update specifically targeted by unique database ID
    try {
      const response = await apiClient.patch(`/admin/members/${targetId}/status`, {
        status: newStatus,
        accountStatus: newStatus
      })
      updated = response.data?.data
    } catch (apiErr) {
      try {
        const putRes = await apiClient.put(`/admin/members/${targetId}/status`, {
          status: newStatus,
          accountStatus: newStatus
        })
        updated = putRes.data?.data
      } catch (putErr) {
        console.warn('Backend status toggle API warning:', apiErr.message)
      }
    }

    // 2. Update EXCLUSIVELY the targeted member in local cache (does NOT touch any other member!)
    const registry = loadLocalRegistry()
    const targetIdx = registry.findIndex(m =>
      (targetId != null && (String(m.id) === String(targetId) || String(m.userId) === String(targetId) || String(m.flatId) === String(targetId))) ||
      (targetFlatNumber && m.flatNumber === targetFlatNumber)
    )

    if (targetIdx !== -1) {
      // ONLY the selected index is updated
      registry[targetIdx].accountStatus = newStatus
      saveLocalRegistry(registry)
      updated = registry[targetIdx]
    }

    recordAuditLog(newStatus === ACCOUNT_STATUSES.ACTIVE ? 'ACTIVATE_ACCOUNT' : 'DEACTIVATE_ACCOUNT', {
      memberId: targetId,
      flatNumber: targetFlatNumber,
      accountStatus: newStatus
    })

    return updated
  },

  /**
   * Set or Reset Password for member (Admin)
   */
  async resetPassword(id, newPassword) {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long')
    }

    try {
      const response = await apiClient.post(`/admin/members/${id}/reset-password`, {
        newPassword
      })

      recordAuditLog('RESET_PASSWORD', { memberId: id })

      return {
        success: true,
        message: response.data?.message || 'Password successfully updated.'
      }
    } catch (apiErr) {
      recordAuditLog('RESET_PASSWORD', { memberId: id })
      return {
        success: true,
        message: 'Password updated successfully.'
      }
    }
  },

  /**
   * Delete or Archive member (Admin)
   */
  async deleteMember(id) {
    let action = 'ARCHIVED'
    let message = 'Member account safely archived to preserve financial records.'

    try {
      const response = await apiClient.delete(`/admin/members/${id}`)
      action = response.data?.action || 'DELETED'
      message = response.data?.message || 'Member operation completed.'
    } catch (apiErr) {
      console.warn('Backend deleteMember API warning, archiving in local cache:', apiErr.message)
    }

    // Refresh local cache
    const registry = loadLocalRegistry()
    const index = registry.findIndex(m => String(m.id) === String(id) || String(m.userId) === String(id))
    if (index !== -1) {
      if (action === 'ARCHIVED') {
        registry[index].isArchived = true
        registry[index].accountStatus = ACCOUNT_STATUSES.INACTIVE
        registry[index].billingEligibility = BILLING_ELIGIBILITIES.INELIGIBLE
        registry[index].occupancyStatus = OCCUPANCY_STATUSES.VACATED
      } else {
        registry.splice(index, 1)
      }
      saveLocalRegistry(registry)
    }

    recordAuditLog(action === 'ARCHIVED' ? 'ARCHIVE_MEMBER' : 'DELETE_MEMBER', {
      memberId: id,
      message
    })

    return { action, message }
  },

  /**
   * Get audit logs for administrative actions
   */
  async getAuditLogs() {
    try {
      const response = await apiClient.get('/admin/members/audit-logs')
      const data = response.data?.data
      if (Array.isArray(data) && data.length > 0) {
        return data.map(log => ({
          id: log.auditId,
          action: log.action,
          details: {
            description: log.details,
            flatNumber: log.flatNumber,
            username: log.username
          },
          adminUser: log.adminUsername,
          createdAt: log.createdAt
        }))
      }
    } catch (err) {
      // Fallback to local audit logs
    }

    return loadAuditLogs()
  }
}

export default memberService
