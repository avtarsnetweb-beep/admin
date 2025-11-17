const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
console.log("api",API_URL);

/**
 * Make an authenticated API request
 */
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("access_token");
  
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "API request failed");
  }

  return data;
}

// export async function apiRequest(url, options = {}) {
//   const token = localStorage.getItem("access_token");

//   const res = await fetch(url, {
//     ...options,
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: token ? `Bearer ${token}` : "",
//       ...(options.headers || {})
//     }
//   });

//   // If backend returns 401 → force logout
//   if (res.status === 401) {
//     console.warn("Backend returned 401 → forcing logout");
//     localStorage.removeItem("access_token");
//     window.location.href = "/auth/login";
//     return;
//   }

//   return res.json();
// }


/**
 * Upload a file with authentication
 */
export async function uploadFile(endpoint, file) {
  const token = localStorage.getItem("access_token");
  console.log("file", endpoint, file);
  const formData = new FormData();
  formData.append("document", file);

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  const data = await response.json();

  console.log("data", data);

  if (!response.ok) {
    throw new Error(data.error || "File upload failed");
  }

  return data;
}

