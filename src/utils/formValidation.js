/**
 * Form Validation Utilities and Backend Error Parser
 * Parses Spring Boot validation responses (e.g., MethodArgumentNotValidException or ApiGetResponseData)
 * and maps error messages to individual form fields.
 */

/**
 * Parses error messages from backend responses into field-specific error maps.
 * Handles comma-separated validation messages, Spring Boot FieldError arrays,
 * and standard error objects.
 *
 * Example input string:
 * "Password cannot be empty, Confirm password cannot be empty, Username cannot be empty"
 *
 * Example output:
 * {
 *   password: "Password cannot be empty",
 *   confirmPassword: "Confirm password cannot be empty",
 *   username: "Username cannot be empty"
 * }
 *
 * @param {Error|Object|string} errorOrResponse
 * @returns {Record<string, string>}
 */
export function parseBackendValidationErrors(errorOrResponse) {
  const fieldErrors = {}

  let message = ''

  if (typeof errorOrResponse === 'string') {
    message = errorOrResponse
  } else if (errorOrResponse?.response?.data) {
    const data = errorOrResponse.response.data
    message = data.message || data.error || ''

    // Spring Boot standard BindingResult / MethodArgumentNotValidException field errors
    if (Array.isArray(data.errors)) {
      data.errors.forEach((err) => {
        const fieldName = err.field || err.param
        const msg = err.defaultMessage || err.message
        if (fieldName && msg) {
          fieldErrors[mapBackendFieldName(fieldName)] = msg
        }
      })
      if (Object.keys(fieldErrors).length > 0) {
        return fieldErrors
      }
    }
  } else if (errorOrResponse?.message) {
    message = errorOrResponse.message
  }

  if (!message || typeof message !== 'string') {
    return fieldErrors
  }

  // Split comma-separated messages (e.g. "Password cannot be empty, Username cannot be empty")
  const parts = message.split(',').map((s) => s.trim()).filter(Boolean)

  for (const part of parts) {
    const lower = part.toLowerCase()

    if (lower.includes('confirm password')) {
      fieldErrors.confirmPassword = part
    } else if (lower.includes('password')) {
      if (lower.includes('match') || lower.includes('same')) {
        fieldErrors.confirmPassword = part
      } else {
        fieldErrors.password = part
      }
    } else if (lower.includes('username') || lower.includes('user name')) {
      fieldErrors.username = part
    } else if (lower.includes('phone') || lower.includes('mobile')) {
      fieldErrors.phoneNumber = part
    } else if (lower.includes('email')) {
      fieldErrors.email = part
    } else if (lower.includes('name') && !lower.includes('username')) {
      fieldErrors.name = part
    } else if (lower.includes('flat') || lower.includes('apartment')) {
      fieldErrors.flatNumber = part
    } else {
      if (!fieldErrors._general) {
        fieldErrors._general = part
      } else {
        fieldErrors._general += `, ${part}`
      }
    }
  }

  return fieldErrors
}

function mapBackendFieldName(field) {
  const normalized = field.toLowerCase().replace(/[-_]/g, '')
  if (normalized.includes('confirmpassword')) return 'confirmPassword'
  if (normalized.includes('password')) return 'password'
  if (normalized.includes('username')) return 'username'
  if (normalized.includes('phonenumber') || normalized === 'phone') return 'phoneNumber'
  if (normalized.includes('email')) return 'email'
  if (normalized.includes('name')) return 'name'
  if (normalized.includes('flat')) return 'flatNumber'
  return field
}
