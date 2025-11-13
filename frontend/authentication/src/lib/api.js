const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Make an authenticated API request
 */
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('access_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

/**
 * Upload a file with authentication
 */
export async function uploadFile(endpoint, file) {
  const token = localStorage.getItem('access_token');
 console.log("file",endpoint,file);
  const formData = new FormData();
  formData.append('document', file);

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: formData
  });

  const data = await response.json();

  console.log("data",data);
  
  if (!response.ok) {
    throw new Error(data.error || 'File upload failed');
  }

  return data;
}
