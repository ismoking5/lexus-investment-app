export const authStorage = {
  setToken: (token) => localStorage.setItem('lexus_token', token),
  getToken: () => localStorage.getItem('lexus_token'),
  removeToken: () => localStorage.removeItem('lexus_token'),
  setUser: (user) => localStorage.setItem('lexus_user', JSON.stringify(user)),
  getUser: () => {
    const user = localStorage.getItem('lexus_user');
    return user ? JSON.parse(user) : null;
  },
  removeUser: () => localStorage.removeItem('lexus_user'),
  logout: () => {
    localStorage.removeItem('lexus_token');
    localStorage.removeItem('lexus_user');
  }
};

export const isAuthenticated = () => {
  return !!authStorage.getToken();
};

export const isAdmin = () => {
  const user = authStorage.getUser();
  return user?.role === 'admin';
};
