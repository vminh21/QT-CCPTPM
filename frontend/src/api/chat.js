import client from './client';

/** Chat API - /api/chat */
export const chatApi = {
  /** POST /api/chat */
  send: (message, history = []) =>
    client.post('/chat', { message, history }),
};
