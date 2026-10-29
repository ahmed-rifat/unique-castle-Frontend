import apiClient from './api.js'

export const paymentService = {
  /**
   * Submit bKash payment for verification
   * Calls Spring Boot /service-fee-payment (ServiceFeePaymentRequest)
   */
  async submitPayment(paymentData) {
    let { flatId, serviceFeeId, flatNumber, phoneNumber, transactionId, paymentMethod = 'BKASH' } = paymentData

    // If flatId or serviceFeeId missing, try to resolve from /get-flats or /get-all-serviceFees
    if (!flatId || !serviceFeeId) {
      try {
        const flatsRes = await apiClient.get('/get-flats')
        const flatsList = Array.isArray(flatsRes.data?.data)
          ? flatsRes.data.data
          : (Array.isArray(flatsRes.data) ? flatsRes.data : [])

        let matched = null
        if (flatNumber) {
          matched = flatsList.find(f => f.flatNumber?.toUpperCase() === String(flatNumber).trim().toUpperCase())
        }

        // If no direct flatNumber match, but owner has flats returned by /get-flats, use owner's primary flat
        if (!matched && flatsList.length > 0) {
          matched = flatsList[0]
        }

        if (matched) {
          flatId = flatId || matched.flatId
          serviceFeeId = serviceFeeId || matched.serviceFeeId
          flatNumber = flatNumber || matched.flatNumber
        }

        if (!serviceFeeId) {
          const feesRes = await apiClient.get('/get-all-serviceFees')
          const feeList = Array.isArray(feesRes.data?.data) ? feesRes.data.data : (Array.isArray(feesRes.data) ? feesRes.data : [])
          if (feeList.length > 0) {
            serviceFeeId = feeList[feeList.length - 1].serviceFeeId
          }
        }
      } catch (resolveErr) {
        console.warn('Could not auto-resolve flatId or serviceFeeId:', resolveErr)
      }
    }

    if (!flatId) {
      throw new Error(`Unable to resolve apartment flat ID for flat "${flatNumber || 'Unknown'}". Please verify your apartment assignment.`)
    }

    if (!serviceFeeId) {
      throw new Error('Unable to resolve active service fee billing period.')
    }

    // Format payload according to ServiceFeePaymentRequest.java
    const payload = {
      serviceFeePaymentId: null,
      flatId: Number(flatId),
      serviceFeeId: Number(serviceFeeId),
      paymentMethod: paymentMethod.toUpperCase(),
      transactionId: transactionId.trim().toUpperCase(),
      phoneNumber: phoneNumber.trim(),
      paid: 'P'
    }

    const response = await apiClient.post('/service-fee-payment', payload)
    const resData = response.data

    if (resData.status === 'error' || resData.status === 'false') {
      throw new Error(resData.message || 'Payment submission failed')
    }

    return {
      success: true,
      message: resData.message || 'Payment details submitted successfully! Awaiting Super Admin verification.',
      data: resData
    }
  },

  /**
   * Super Admin: Verify pending payment
   * Calls Spring Boot /payment-verification (PhoneNumber, TransactionId)
   */
  async verifyPayment(flatNumber, payload = {}) {
    const phoneNumber = String(payload.phoneNumber || '').trim()
    const transactionId = String(payload.transactionId || '').trim()

    if (!transactionId && !phoneNumber) {
      throw new Error('Transaction ID or Phone Number is required for verification.')
    }

    let resData = null
    let lastError = null

    // 1. Send standard verification parameters (support both CamelCase and lowercase)
    try {
      const response = await apiClient.post('/payment-verification', null, {
        params: {
          PhoneNumber: phoneNumber,
          phoneNumber: phoneNumber,
          TransactionId: transactionId,
          transactionId: transactionId
        }
      })
      resData = response.data
    } catch (err) {
      lastError = err
      resData = err.response?.data
    }

    // 2. Fallback: If backend returns "No Service Fee Payment found",
    // check if positional parameter swap occurs in legacy running instances
    if (
      (!resData || resData.status === 'error' || resData.status === 'false') &&
      transactionId &&
      phoneNumber
    ) {
      try {
        const retryResponse = await apiClient.post('/payment-verification', null, {
          params: {
            PhoneNumber: transactionId,
            phoneNumber: transactionId,
            TransactionId: phoneNumber,
            transactionId: phoneNumber
          }
        })
        if (retryResponse.data && (retryResponse.data.status === 'success' || retryResponse.data.status === 'true')) {
          resData = retryResponse.data
        }
      } catch (retryErr) {
        // preserve original error
      }
    }

    if (!resData || resData.status === 'error' || resData.status === 'false') {
      const msg = resData?.message || lastError?.response?.data?.message || lastError?.message || 'No Service Fee Payment found for the given details'
      throw new Error(msg)
    }

    return {
      success: true,
      message: resData.message || `Payment for Flat ${flatNumber} has been verified successfully.`,
      data: resData
    }
  },

  /**
   * Super Admin: Reject payment
   * Calls Spring Boot POST /payments/reject/{flatNumber}
   */
  async rejectPayment(flatNumber, reason = '', payload = {}) {
    const cleanNum = String(flatNumber || '').replace(/^flat\s*/i, '').trim()
    const reasonText = reason || 'Payment rejected by administrator'

    let resData = null
    let lastError = null

    // 1. Call backend endpoint: POST /payments/reject/{flatNumber}
    try {
      const response = await apiClient.post(`/payments/reject/${cleanNum}`, {
        reason: reasonText,
        transactionId: payload.transactionId || null,
        serviceFeePaymentId: payload.serviceFeePaymentId || null
      })
      resData = response.data
    } catch (err) {
      lastError = err
      resData = err.response?.data
    }

    // 2. Fallback: try query parameters if body-based call failed
    if (!resData || (resData.success === false && resData.status === 'error')) {
      try {
        const retryRes = await apiClient.post(`/payments/reject/${cleanNum}`, null, {
          params: { reason: reasonText }
        })
        if (retryRes.data?.success || retryRes.data?.status === 'success') {
          resData = retryRes.data
        }
      } catch (retryErr) {
        // preserve last error
      }
    }

    if (!resData || resData.success === false) {
      throw new Error(resData?.message || lastError?.response?.data?.message || lastError?.message || `Failed to reject payment for Flat ${flatNumber}`)
    }

    return {
      success: true,
      message: resData.message || `Payment for Flat ${flatNumber} has been rejected.`,
      data: resData
    }
  },

  /**
   * Fetch payment history for a flat
   * Calls Spring Boot /get-service-fee-payments-by-flatId
   */
  async getPaymentByFlat(flatIdOrNumber) {
    const isNumeric = !isNaN(Number(flatIdOrNumber))
    let flatId = isNumeric ? Number(flatIdOrNumber) : null

    if (!flatId) {
      const flatsRes = await apiClient.get('/get-flats')
      const flatsList = flatsRes.data?.data || []
      const matched = flatsList.find(f => f.flatNumber?.toUpperCase() === String(flatIdOrNumber || '').toUpperCase())
      if (matched) flatId = matched.flatId
    }

    if (flatId) {
      const response = await apiClient.get('/get-service-fee-payments-by-flatId', {
        params: { flatId }
      })
      return response.data?.data || response.data || []
    }

    return []
  }
}

export default paymentService

