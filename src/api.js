const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = {
  // Auth
  register: async (data) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  login: async (email, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  getMe: async (token) => {
    const res = await fetch(`${API_URL}/api/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  // Products
  getProducts: async () => {
    const res = await fetch(`${API_URL}/api/products`);
    return res.json();
  },

  // Deposits
  createDeposit: async (token, data) => {
    const res = await fetch(`${API_URL}/api/deposits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getDeposits: async (token) => {
    const res = await fetch(`${API_URL}/api/deposits`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  approveDeposit: async (token, id) => {
    const res = await fetch(`${API_URL}/api/deposits/${id}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  rejectDeposit: async (token, id) => {
    const res = await fetch(`${API_URL}/api/deposits/${id}/reject`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  // Withdrawals
  createWithdrawal: async (token, data) => {
    const res = await fetch(`${API_URL}/api/withdrawals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  getWithdrawals: async (token) => {
    const res = await fetch(`${API_URL}/api/withdrawals`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  approveWithdrawal: async (token, id) => {
    const res = await fetch(`${API_URL}/api/withdrawals/${id}/approve`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  rejectWithdrawal: async (token, id) => {
    const res = await fetch(`${API_URL}/api/withdrawals/${id}/reject`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  // Admin
  getAdminStats: async (token) => {
    const res = await fetch(`${API_URL}/api/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  getAdminDepositsPending: async (token) => {
    const res = await fetch(`${API_URL}/api/admin/deposits-pending`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  getAdminWithdrawalsPending: async (token) => {
    const res = await fetch(`${API_URL}/api/admin/withdrawals-pending`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  }
};
