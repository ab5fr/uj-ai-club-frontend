/**
 * API utility functions for making HTTP requests
 */

// Always use the production API URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.uj-aiclub.com";

/**
 * Helper function to get full image URL
 * If the image path is relative, prepend the API base URL
 * @param {string} imagePath - Image path or URL
 * @returns {string} - Full image URL
 */
export function getImageUrl(imagePath) {
  if (!imagePath) return null;
  // If already a full URL (starts with http:// or https://), return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  // Otherwise, prepend API base URL
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${API_BASE_URL}${cleanPath}`;
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

/**
 * Make an API request
 * @param {string} endpoint - API endpoint (e.g., '/auth/login')
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - Response data
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    ...options,
    mode: "cors",
  };

  // Set default headers only if not FormData
  const isFormData = options.body instanceof FormData;
  if (!isFormData) {
    config.headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };
  } else {
    config.headers = {
      ...options.headers,
    };
  }

  // Add auth token if available
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, config);

    // Handle different status codes
    if (response.status === 401) {
      // Unauthorized - clear token and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      throw new ApiError("Unauthorized", 401, null);
    }

    if (response.status === 404) {
      throw new ApiError("Not Found", 404, null);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new ApiError(
        errorData?.message || `Request failed with status ${response.status}`,
        response.status,
        errorData,
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or other errors
    throw new ApiError(error.message || "Network error occurred", 0, null);
  }
}

// Auth API
export const authApi = {
  login: async (email, password) => {
    return apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  signup: async (fullName, phoneNum, email, password) => {
    return apiRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ fullName, phoneNum, email, password }),
    });
  },

  getGoogleAuthUrl: async () => {
    // Return the Google OAuth init URL - browser will redirect
    return { url: `${API_BASE_URL}/auth/google` };
  },

  completeProfile: async (university, major, password) => {
    return apiRequest("/auth/complete-profile", {
      method: "POST",
      body: JSON.stringify({ university, major, password }),
    });
  },
};

// Leaderboard API
export const leaderboardApi = {
  getAll: async () => {
    return apiRequest("/leaderboards");
  },
};

// Resources API
export const resourcesApi = {
  getAll: async () => {
    return apiRequest("/resources");
  },

  getById: async (id) => {
    return apiRequest(`/resources/${id}`);
  },
};

// Certificates API
export const certificatesApi = {
  getAll: async () => {
    return apiRequest("/certificates");
  },

  getById: async (id) => {
    return apiRequest(`/certificates/${id}`);
  },
};

// Challenges API (requires auth)
export const challengesApi = {
  getCurrent: async () => {
    return apiRequest("/challenges/current");
  },

  getLeaderboard: async () => {
    return apiRequest("/challenges/leaderboard");
  },

  // Get all challenges with notebook information
  getAll: async () => {
    return apiRequest("/challenges");
  },

  // Get user's submission for a specific challenge
  getSubmission: async (challengeId) => {
    return apiRequest(`/challenges/${challengeId}/submission`);
  },

  // Start a challenge - returns JupyterHub URL for SSO
  startChallenge: async (challengeId) => {
    return apiRequest(`/challenges/${challengeId}/start`, {
      method: "POST",
    });
  },

  // Submit a challenge for grading
  submitChallenge: async (challengeId) => {
    return apiRequest(`/challenges/${challengeId}/submit`, {
      method: "POST",
    });
  },

  // Get leaderboard for a specific challenge
  getChallengeLeaderboard: async (challengeId) => {
    return apiRequest(`/challenges/${challengeId}/leaderboard`);
  },
};

// User API (requires auth)
export const userApi = {
  getProfile: async () => {
    return apiRequest("/users/profile");
  },

  updateProfile: async (data) => {
    return apiRequest("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);

    // Override Content-Type for multipart/form-data
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const response = await fetch(`${API_BASE_URL}/users/avatar`, {
      method: "POST",
      mode: "cors",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new ApiError(
        errorData?.message || "Failed to upload avatar",
        response.status,
        errorData,
      );
    }

    return await response.json();
  },

  changePassword: async (currentPassword, newPassword) => {
    return apiRequest("/users/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// Contact API
export const contactApi = {
  send: async (name, email, message) => {
    return apiRequest("/contact", {
      method: "POST",
      body: JSON.stringify({ name, email, message }),
    });
  },
};

// Admin: Resources management
export const adminResourcesApi = {
  list: async (includeHidden = true) => {
    const q = includeHidden ? "?includeHidden=true" : "";
    return apiRequest(`/admin/resources${q}`);
  },
  create: async (payload) => {
    // Handle both FormData and JSON payloads
    const isFormData = payload instanceof FormData;
    return apiRequest("/admin/resources", {
      method: "POST",
      body: isFormData ? payload : JSON.stringify(payload),
      headers: isFormData ? {} : undefined, // Let browser set Content-Type for FormData
    });
  },
  update: async (id, payload) => {
    // Handle both FormData and JSON payloads
    const isFormData = payload instanceof FormData;
    return apiRequest(`/admin/resources/${id}`, {
      method: "PUT",
      body: isFormData ? payload : JSON.stringify(payload),
      headers: isFormData ? {} : undefined, // Let browser set Content-Type for FormData
    });
  },
  remove: async (id) => {
    return apiRequest(`/admin/resources/${id}`, { method: "DELETE" });
  },
  setVisibility: async (id, visible) => {
    return apiRequest(`/admin/resources/${id}/visibility`, {
      method: "PATCH",
      body: JSON.stringify({ visible }),
    });
  },
};

// Admin: Certificates management
export const adminCertificatesApi = {
  list: async (includeHidden = true) => {
    const q = includeHidden ? "?includeHidden=true" : "";
    return apiRequest(`/admin/certificates${q}`);
  },
  create: async (payload) => {
    const isFormData = payload instanceof FormData;
    return apiRequest("/admin/certificates", {
      method: "POST",
      body: isFormData ? payload : JSON.stringify(payload),
      headers: isFormData ? {} : undefined,
    });
  },
  update: async (id, payload) => {
    const isFormData = payload instanceof FormData;
    return apiRequest(`/admin/certificates/${id}`, {
      method: "PUT",
      body: isFormData ? payload : JSON.stringify(payload),
      headers: isFormData ? {} : undefined,
    });
  },
  remove: async (id) => {
    return apiRequest(`/admin/certificates/${id}`, { method: "DELETE" });
  },
  setVisibility: async (id, visible) => {
    return apiRequest(`/admin/certificates/${id}/visibility`, {
      method: "PATCH",
      body: JSON.stringify({ visible }),
    });
  },
};

// Admin: Challenges management
export const adminChallengesApi = {
  list: async (includeHidden = true) => {
    const q = includeHidden ? "?includeHidden=true" : "";
    return apiRequest(`/admin/challenges${q}`);
  },
  create: async (payload) => {
    return apiRequest("/admin/challenges", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  update: async (id, payload) => {
    return apiRequest(`/admin/challenges/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  remove: async (id) => {
    return apiRequest(`/admin/challenges/${id}`, { method: "DELETE" });
  },
  setVisibility: async (id, visible) => {
    return apiRequest(`/admin/challenges/${id}/visibility`, {
      method: "PATCH",
      body: JSON.stringify({ visible }),
    });
  },
};

// Admin: Notebook management for challenges
export const adminNotebooksApi = {
  // List all notebooks
  list: async () => {
    return apiRequest("/admin/notebooks");
  },

  // Get notebook for a specific challenge
  getByChallenge: async (challengeId) => {
    return apiRequest(`/admin/challenges/${challengeId}/notebook`);
  },

  // Create/upload a notebook for a challenge
  create: async (formData) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const response = await fetch(`${API_BASE_URL}/admin/notebooks`, {
      method: "POST",
      mode: "cors",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new ApiError(
        errorData?.message || "Failed to upload notebook",
        response.status,
        errorData,
      );
    }

    return await response.json();
  },

  // Update notebook settings
  update: async (notebookId, payload) => {
    return apiRequest(`/admin/notebooks/${notebookId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  // Delete a notebook
  remove: async (notebookId) => {
    return apiRequest(`/admin/notebooks/${notebookId}`, { method: "DELETE" });
  },

  // Get JupyterHub URL to edit notebook (for setting up grading cells)
  getEditUrl: async (notebookId) => {
    return apiRequest(`/admin/notebooks/${notebookId}/edit`);
  },

  // Sync notebook to nbgrader source directory
  syncToNbgrader: async (notebookId) => {
    return apiRequest(`/admin/notebooks/${notebookId}/sync`, {
      method: "POST",
    });
  },
};

// Admin: Submissions management
export const adminSubmissionsApi = {
  // List all submissions
  list: async () => {
    return apiRequest("/admin/submissions");
  },

  // Get JupyterHub access URLs to view/download submission notebook
  getAccess: async (submissionId) => {
    return apiRequest(`/admin/submissions/${submissionId}/access`);
  },

  // Fetch submitted notebook file as Blob (view or download)
  getFileBlob: async (submissionId, download = false) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const url = `${API_BASE_URL}/admin/submissions/${submissionId}/file${download ? "?download=1" : ""}`;

    const response = await fetch(url, {
      method: "GET",
      mode: "cors",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      throw new ApiError("Unauthorized", 401, null);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new ApiError(
        errorData?.message || "Failed to fetch submission file",
        response.status,
        errorData,
      );
    }

    return {
      blob: await response.blob(),
      contentDisposition: response.headers.get("content-disposition") || "",
    };
  },

  // Manually grade a submission (score 0-100)
  grade: async (submissionId, score) => {
    return apiRequest(`/admin/submissions/${submissionId}/grade`, {
      method: "POST",
      body: JSON.stringify({ score }),
    });
  },
};
