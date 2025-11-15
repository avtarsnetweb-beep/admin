const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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


// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// /**
//  * Custom error class for API errors
//  */
// class APIError extends Error {
//   constructor(message, status, data) {
//     super(message);
//     this.name = "APIError";
//     this.status = status;
//     this.data = data;
//   }
// }

// /**
//  * Get auth token from storage
//  */
// function getAuthToken() {
//   return localStorage.getItem("access_token");
// }

// /**
//  * Handle API response and errors
//  */
// async function handleResponse(response) {
//   let data;
//   const contentType = response.headers.get("content-type");
  
//   // Parse response based on content type
//   if (contentType?.includes("application/json")) {
//     data = await response.json();
//   } else {
//     data = await response.text();
//   }

//   // Handle non-OK responses
//   if (!response.ok) {
//     // Handle 401 Unauthorized - token expired or invalid
//     if (response.status === 401) {
//       localStorage.removeItem("access_token");
//       window.location.href = "/auth/login";
//       throw new APIError("Session expired. Please log in again.", 401, data);
//     }

//     // Extract error message
//     const errorMessage =
//       data?.error ||
//       data?.message ||
//       (typeof data === "string" ? data : null) ||
//       `Request failed with status ${response.status}`;

//     throw new APIError(errorMessage, response.status, data);
//   }

//   return data;
// }

// /**
//  * Make an authenticated API request
//  * @param {string} endpoint - API endpoint (e.g., "/api/documents")
//  * @param {object} options - Fetch options
//  * @returns {Promise<any>} Response data
//  */
// export async function apiRequest(endpoint, options = {}) {
//   const token = getAuthToken();

//   const headers = {
//     "Content-Type": "application/json",
//     ...(token && { Authorization: `Bearer ${token}` }),
//     ...options.headers,
//   };

//   try {
//     const response = await fetch(`${API_URL}${endpoint}`, {
//       ...options,
//       headers,
//     });

//     return await handleResponse(response);
//   } catch (error) {
//     // Re-throw APIError as-is
//     if (error instanceof APIError) {
//       throw error;
//     }

//     // Handle network errors
//     if (error instanceof TypeError) {
//       throw new Error(
//         "Network error. Please check your internet connection and try again."
//       );
//     }

//     // Handle other errors
//     throw new Error(error.message || "An unexpected error occurred");
//   }
// }

// /**
//  * Upload a file with authentication
//  * @param {string} endpoint - API endpoint
//  * @param {File} file - File to upload
//  * @param {string} fieldName - Form field name (default: "document")
//  * @returns {Promise<any>} Response data
//  */
// export async function uploadFile(endpoint, file, fieldName = "document") {
//   const token = getAuthToken();

//   if (!file) {
//     throw new Error("No file provided");
//   }

//   const formData = new FormData();
//   formData.append(fieldName, file);

//   try {
//     const response = await fetch(`${API_URL}${endpoint}`, {
//       method: "POST",
//       headers: {
//         ...(token && { Authorization: `Bearer ${token}` }),
//         // Don't set Content-Type for FormData - browser sets it with boundary
//       },
//       body: formData,
//     });

//     return await handleResponse(response);
//   } catch (error) {
//     // Re-throw APIError as-is
//     if (error instanceof APIError) {
//       throw error;
//     }

//     // Handle network errors
//     if (error instanceof TypeError) {
//       throw new Error(
//         "Network error. Please check your internet connection and try again."
//       );
//     }

//     // Handle other errors
//     throw new Error(error.message || "File upload failed");
//   }
// }

// /**
//  * Download a file from the API
//  * @param {string} url - File URL
//  * @param {string} filename - Filename for download
//  */
// export async function downloadFile(url, filename) {
//   try {
//     const response = await fetch(url);
//     if (!response.ok) {
//       throw new Error("Failed to download file");
//     }

//     const blob = await response.blob();
//     const blobUrl = window.URL.createObjectURL(blob);
    
//     const link = document.createElement("a");
//     link.href = blobUrl;
//     link.download = filename || "download";
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
    
//     // Clean up the blob URL
//     window.URL.revokeObjectURL(blobUrl);
//   } catch (error) {
//     throw new Error(error.message || "Failed to download file");
//   }
// }