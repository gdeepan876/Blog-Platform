const API_BASE = 'http://localhost:8000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  // Support token header fallback
  const savedToken = localStorage.getItem('blog_auth_token');
  if (savedToken) {
    headers['Authorization'] = `Bearer ${savedToken}`;
  }

  const config = {
    ...options,
    headers,
    credentials: 'include' // Sends HttpOnly cookie
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    // If backend server is down or unreachable
    if (!err.status) {
      err.message = 'Unable to connect to the server. Please check your internet connection or verify the backend is running.';
      err.isNetworkError = true;
    }
    throw err;
  }
}

export const api = {
  // Health
  checkHealth: () => request('/health'),

  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me'),

  // Posts
  getPosts: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page);
    if (params.limit) searchParams.append('limit', params.limit);
    if (params.search) searchParams.append('search', params.search);
    if (params.status) searchParams.append('status', params.status);
    if (params.authorId) searchParams.append('authorId', params.authorId);
    
    const query = searchParams.toString();
    return request(`/posts${query ? `?${query}` : ''}`);
  },
  getPost: (id) => request(`/posts/${id}`),
  createPost: (postData) => request('/posts', { method: 'POST', body: postData }),
  updatePost: (id, postData) => request(`/posts/${id}`, { method: 'PUT', body: postData }),
  deletePost: (id) => request(`/posts/${id}`, { method: 'DELETE' }),

  // Comments
  addComment: (postId, content) => request(`/posts/${postId}/comments`, { method: 'POST', body: { content } }),
  editComment: (commentId, content) => request(`/comments/${commentId}`, { method: 'PUT', body: { content } }),
  deleteComment: (commentId) => request(`/comments/${commentId}`, { method: 'DELETE' }),

  // User posts
  getUserPosts: (userId) => request(`/users/${userId}/posts`),

  // Admin moderation
  getAdminModeration: () => request('/admin/moderation')
};

