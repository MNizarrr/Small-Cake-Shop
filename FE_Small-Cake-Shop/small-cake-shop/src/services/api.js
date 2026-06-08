import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// otomatis sisipkan token di setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// AUTH
export const register = (data) => api.post('/auth/register', data);
export const login    = (data) => api.post('/auth/login', data);

// PRODUCTS
export const getProducts       = (page = 1, limit = 8) => api.get('/products', { params: { page, limit } });
export const getProductById    = (id)                  => api.get(`/products/${id}`);
export const createProduct     = (data)                => api.post('/products', data);
export const updateProduct     = (id, data)            => api.put(`/products/${id}`, data);
export const deleteProduct     = (id)                  => api.delete(`/products/${id}`);

// CART
export const getCart            = ()     => api.get('/cart');
export const addToCart          = (data) => api.post('/cart/add', data);
export const removeFromCart     = (id)   => api.delete(`/cart/${id}`);
// export const getCart            = ()     => api.get('/orders/cart');
// export const addToCart          = (data) => api.post('/orders/cart/add', data);
// export const removeFromCart     = (id)   => api.delete(`/orders/cart/delete/${id}`);

// ORDERS
export const checkout           = (data) => api.post('/orders', data);
export const getMyOrders        = (page = 1) => api.get('/orders/my', { params: { page } });
export const getOrderById       = (id)   => api.get(`/orders/my/${id}`);
export const getAllOrders        = (page = 1) => api.get('/orders', { params: { page } });
export const updateOrderStatus  = (id, data) => api.put(`/orders/${id}`, data);

// EXPORT
export const exportExcel = () => api.get('/export/orders/excel', { responseType: 'blob' });
export const exportPdf   = () => api.get('/export/orders/pdf',   { responseType: 'blob' });

export default api;