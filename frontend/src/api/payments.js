import client from './client';

/** Payments API - /api/payments/* */
export const paymentsApi = {
  /** POST /api/payments - Khởi tạo thanh toán */
  initiate: (data) => client.post('/payments', data),

  /** POST /api/payments/confirm - Xác nhận chuyển khoản */
  confirmTransfer: (data) => client.post('/payments/confirm', data),
};
