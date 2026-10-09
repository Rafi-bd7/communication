const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');
const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adda_token') || localStorage.getItem('antichat_token');
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('adda_token', token);
    localStorage.setItem('antichat_token', token);
  }
}

export function clearAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('adda_token');
    localStorage.removeItem('adda_user');
    localStorage.removeItem('antichat_token');
    localStorage.removeItem('antichat_user');
  }
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorData.detail || 'Request failed');
  }

  return res.json();
}

// Auth API
export const api = {
  // Auth
  register: (data: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  resetPassword: (data: { username_or_email: string; new_password: string; phone?: string }) =>
    request('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),
  seedDemo: () => request('/auth/seed-demo', { method: 'POST' }),

  // Users
  listUsers: () => request('/users'),
  searchUsers: (q: string) => request(`/users/search?q=${encodeURIComponent(q)}`),
  getUserProfile: (userId: string) => request(`/users/${userId}`),
  updateProfile: (data: any) => request('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  deleteMyAccount: () => request('/users/me', { method: 'DELETE' }),

  // Conversations
  getConversations: () => request('/conversations'),
  createDirectChat: (target_user_id: string) => 
    request('/conversations/direct', { method: 'POST', body: JSON.stringify({ target_user_id }) }),
  createGroupChat: (data: { name: string; description?: string; member_ids: string[] }) =>
    request('/conversations/group', { method: 'POST', body: JSON.stringify(data) }),

  // Messages
  getMessages: (conversationId: string) => request(`/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: string, data: {
    content: string;
    message_type?: string;
    reply_to_id?: string;
    file_url?: string;
    file_name?: string;
    file_size?: number;
  }) => request(`/conversations/${conversationId}/messages`, { method: 'POST', body: JSON.stringify({ ...data, conversation_id: conversationId }) }),
  editMessage: (messageId: string, content: string) => 
    request(`/messages/${messageId}`, { method: 'PATCH', body: JSON.stringify({ content }) }),
  deleteMessage: (messageId: string) => request(`/messages/${messageId}`, { method: 'DELETE' }),
  reactMessage: (messageId: string, emoji: string) => 
    request(`/messages/${messageId}/reaction`, { method: 'POST', body: JSON.stringify({ emoji }) }),

  // Media
  uploadFile: async (file: File) => {
    // Mobile / iPhone Image Optimizer: Converts HEIC/large images to standard web JPEG
    let fileToUpload: File = file;
    if (typeof window !== 'undefined' && (file.type.startsWith('image/') || file.name.match(/\.(jpe?g|png|webp|heic|heif|jfif|bmp)$/i))) {
      try {
        fileToUpload = await new Promise<File>((resolve) => {
          const img = new Image();
          const objectUrl = URL.createObjectURL(file);
          img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            const maxDim = 1920;
            let { width, height } = img;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve(file);
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
                  resolve(new File([blob], cleanName, { type: 'image/jpeg' }));
                } else {
                  resolve(file);
                }
              },
              'image/jpeg',
              0.88
            );
          };
          img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(file);
          };
          img.src = objectUrl;
        });
      } catch {
        fileToUpload = file;
      }
    }

    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', fileToUpload);

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/media/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Upload failed');
    }
    const data = await res.json();
    let fileUrl = data.file_url || data.url;
    if (fileUrl && fileUrl.startsWith('/') && BACKEND_URL) {
      fileUrl = `${BACKEND_URL}${fileUrl}`;
    }
    return { ...data, file_url: fileUrl, url: fileUrl };
  },
  uploadMedia: async (file: File) => {
    return api.uploadFile(file);
  },

  // Status / Stories
  getStatuses: () => request('/statuses'),
  createStatus: (data: { media_url?: string; media_type: string; caption?: string; background_color?: string }) =>
    request('/statuses', { method: 'POST', body: JSON.stringify(data) }),
  viewStatus: (statusId: string) => request(`/statuses/${statusId}/view`, { method: 'POST' }),

  // Calls
  getCallHistory: () => request('/calls/history'),
  initiateCall: (data: { receiver_id: string; conversation_id?: string; call_type: string } | string, call_type?: string) => {
    if (typeof data === 'string') {
      return request('/calls/initiate', {
        method: 'POST',
        body: JSON.stringify({ receiver_id: data, call_type: call_type || 'voice' })
      });
    }
    return request('/calls/initiate', { method: 'POST', body: JSON.stringify(data) });
  },
  updateCallStatus: (callId: string, status: string) =>
    request(`/calls/${callId}/end?duration=0&status_reason=${status}`, { method: 'POST' }),
  endCall: (callId: string, duration: number, reason: string = 'ended') =>
    request(`/calls/${callId}/end?duration=${duration}&status_reason=${reason}`, { method: 'POST' }),

  // AI
  getSmartReplies: (conversation_id: string, last_message?: string) =>
    request('/ai/smart-replies', { method: 'POST', body: JSON.stringify({ conversation_id, last_message }) }),
  summarizeChat: (conversation_id: string) =>
    request('/ai/summarize', { method: 'POST', body: JSON.stringify({ conversation_id }) }),
  translateText: (text: string, target_language: string) =>
    request('/ai/translate', { method: 'POST', body: JSON.stringify({ text, target_language }) }),
  askAssistant: (prompt: string) =>
    request(`/ai/assistant?prompt=${encodeURIComponent(prompt)}`, { method: 'POST' }),

  // Admin
  getAdminMetrics: () => request('/admin/metrics'),
  getAdminUsers: () => request('/admin/users'),
  toggleBanUser: (userId: string) => request(`/admin/users/${userId}/toggle-ban`, { method: 'POST' }),
  getAdminReports: () => request('/admin/reports'),
  resolveReport: (reportId: string, action: string) =>
    request(`/admin/reports/${reportId}/resolve?action=${action}`, { method: 'POST' }),

  // Reports
  submitReport: (data: { reported_user_id?: string; message_id?: string; reason: string }) =>
    request('/reports', { method: 'POST', body: JSON.stringify(data) }),

  // System
  getNetworkInfo: () => request('/system/network-info'),

  // Friends & Social Community (Facebook Features)
  getFriendSuggestions: () => request('/friends/suggestions'),
  sendFriendRequest: (userId: string) => request(`/friends/request/${userId}`, { method: 'POST' }),
  cancelFriendRequest: (userId: string) => request(`/friends/cancel/${userId}`, { method: 'POST' }),
  acceptFriendRequest: (friendshipId: string) => request(`/friends/accept/${friendshipId}`, { method: 'POST' }),
  declineFriendRequest: (friendshipId: string) => request(`/friends/decline/${friendshipId}`, { method: 'POST' }),
  getMyFriends: () => request('/friends/my-friends'),
  getPendingRequests: () => request('/friends/requests'),
  getFriendshipStatus: (userId: string) => request(`/friends/status/${userId}`),
  unfriendUser: (userId: string) => request(`/friends/unfriend/${userId}`, { method: 'POST' }),

  // Timeline Posts (Facebook Features)
  getTimelineFeed: () => request('/posts/feed'),
  createPost: (data: { content: string; media_url?: string; privacy?: string }) =>
    request('/posts', { method: 'POST', body: JSON.stringify(data) }),
  likePost: (postId: string) => request(`/posts/${postId}/like`, { method: 'POST' }),
  getUserPosts: (userId: string) => request(`/posts/user/${userId}`),
};
