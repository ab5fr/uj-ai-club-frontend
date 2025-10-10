/**
 * API utility functions for making HTTP requests
 */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://api.aiclub-uj:8000/api";

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
  const url = `${API_URL}${endpoint}`;

  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

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
        errorData
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

// Challenges API (requires auth)
export const challengesApi = {
  getCurrent: async () => {
    return apiRequest("/challenges/current");
  },

  getLeaderboard: async () => {
    return apiRequest("/challenges/leaderboard");
  },
};

// User API (requires auth)
export const userApi = {
  getProfile: async () => {
    return apiRequest("/users/profile");
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
