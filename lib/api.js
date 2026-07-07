"use client";

/**
 * API utility functions for making HTTP requests
 */

import { signOut } from "firebase/auth";
import { getFirebaseAuth, getIdToken } from "@/lib/firebase";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.uj-aiclub.com";

/**
 * Helper function to get full image URL
 * @param {string} imagePath - Image path or URL
 * @returns {string|null} - Full image URL
 */
export function getImageUrl(imagePath) {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
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

async function handleUnauthorized() {
  const auth = getFirebaseAuth();
  if (typeof window !== "undefined" && auth) {
    try {
      await signOut(auth);
    } catch {
      // ignore sign-out errors during forced logout
    }
    window.location.href = "/login";
  }
}

function forbiddenMessage(endpoint) {
  if (endpoint.startsWith("/admin/")) {
    return "You do not have permission to access this admin resource.";
  }
  return "You do not have permission to perform this action.";
}

/**
 * Make an API request with Firebase ID token auth
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    ...options,
    mode: "cors",
  };

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

  if (typeof window !== "undefined") {
    const token = await getIdToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      await handleUnauthorized();
      throw new ApiError("Unauthorized", 401, null);
    }

    if (response.status === 403) {
      const errorData = await response.json().catch(() => null);
      throw new ApiError(
        errorData?.message || forbiddenMessage(endpoint),
        403,
        errorData,
      );
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

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error.message || "Network error occurred", 0, null);
  }
}

export const authApi = {
  session: async () => {
    return apiRequest("/auth/session", { method: "POST" });
  },

  completeProfile: async (fullName, university, major) => {
    return apiRequest("/auth/complete-profile", {
      method: "POST",
      body: JSON.stringify({
        full_name: fullName,
        university,
        major,
      }),
    });
  },
};

export const leaderboardApi = {
  getAll: async () => {
    return apiRequest("/leaderboards");
  },
};

export const resourcesApi = {
  getAll: async () => {
    return apiRequest("/resources");
  },

  getById: async (id) => {
    return apiRequest(`/resources/${id}`);
  },
};

export const certificatesApi = {
  getAll: async () => {
    return apiRequest("/certificates");
  },

  getById: async (id) => {
    return apiRequest(`/certificates/${id}`);
  },
};

export const challengesApi = {
  getCurrent: async () => {
    return apiRequest("/challenges/current");
  },

  getLeaderboard: async () => {
    return apiRequest("/challenges/leaderboard");
  },

  getAll: async () => {
    return apiRequest("/challenges");
  },

  getSubmission: async (challengeId) => {
    return apiRequest(`/challenges/${challengeId}/submission`);
  },

  startChallenge: async (challengeId) => {
    return apiRequest(`/challenges/${challengeId}/start`, {
      method: "POST",
    });
  },

  submitChallenge: async (challengeId) => {
    return apiRequest(`/challenges/${challengeId}/submit`, {
      method: "POST",
    });
  },

  getChallengeLeaderboard: async (challengeId) => {
    return apiRequest(`/challenges/${challengeId}/leaderboard`);
  },
};

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

    const token = await getIdToken();
    const response = await fetch(`${API_BASE_URL}/users/avatar`, {
      method: "POST",
      mode: "cors",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    });

    if (response.status === 401) {
      await handleUnauthorized();
      throw new ApiError("Unauthorized", 401, null);
    }

    if (response.status === 403) {
      const errorData = await response.json().catch(() => null);
      throw new ApiError(
        errorData?.message || "You do not have permission to upload an avatar.",
        403,
        errorData,
      );
    }

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
};

export const contactApi = {
  send: async (name, email, message) => {
    return apiRequest("/contact", {
      method: "POST",
      body: JSON.stringify({ name, email, message }),
    });
  },
};

export const adminResourcesApi = {
  list: async (includeHidden = true) => {
    const q = includeHidden ? "?includeHidden=true" : "";
    return apiRequest(`/admin/resources${q}`);
  },
  create: async (formData) => {
    return apiRequest("/admin/resources", {
      method: "POST",
      body: formData,
      headers: {},
    });
  },
  update: async (id, formData) => {
    return apiRequest(`/admin/resources/${id}`, {
      method: "PUT",
      body: formData,
      headers: {},
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

export const adminCertificatesApi = {
  list: async (includeHidden = true) => {
    const q = includeHidden ? "?includeHidden=true" : "";
    return apiRequest(`/admin/certificates${q}`);
  },
  create: async (formData) => {
    return apiRequest("/admin/certificates", {
      method: "POST",
      body: formData,
      headers: {},
    });
  },
  update: async (id, formData) => {
    return apiRequest(`/admin/certificates/${id}`, {
      method: "PUT",
      body: formData,
      headers: {},
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

export const adminNotebooksApi = {
  list: async () => {
    return apiRequest("/admin/notebooks");
  },

  getByChallenge: async (challengeId) => {
    return apiRequest(`/admin/challenges/${challengeId}/notebook`);
  },

  create: async (formData) => {
    const token = await getIdToken();
    const response = await fetch(`${API_BASE_URL}/admin/notebooks`, {
      method: "POST",
      mode: "cors",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    });

    if (response.status === 401) {
      await handleUnauthorized();
      throw new ApiError("Unauthorized", 401, null);
    }

    if (response.status === 403) {
      const errorData = await response.json().catch(() => null);
      throw new ApiError(
        errorData?.message ||
          "You do not have permission to access this admin resource.",
        403,
        errorData,
      );
    }

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

  update: async (notebookId, payload) => {
    return apiRequest(`/admin/notebooks/${notebookId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  remove: async (notebookId) => {
    return apiRequest(`/admin/notebooks/${notebookId}`, { method: "DELETE" });
  },

  getEditUrl: async (notebookId) => {
    return apiRequest(`/admin/notebooks/${notebookId}/edit`);
  },

  syncToNbgrader: async (notebookId) => {
    return apiRequest(`/admin/notebooks/${notebookId}/sync`, {
      method: "POST",
    });
  },
};

export const adminSubmissionsApi = {
  list: async () => {
    return apiRequest("/admin/submissions");
  },

  getAccess: async (submissionId) => {
    return apiRequest(`/admin/submissions/${submissionId}/access`);
  },

  getFileBlob: async (submissionId, download = false) => {
    const token = await getIdToken();
    const url = `${API_BASE_URL}/admin/submissions/${submissionId}/file${download ? "?download=1" : ""}`;

    const response = await fetch(url, {
      method: "GET",
      mode: "cors",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (response.status === 401) {
      await handleUnauthorized();
      throw new ApiError("Unauthorized", 401, null);
    }

    if (response.status === 403) {
      const errorData = await response.json().catch(() => null);
      throw new ApiError(
        errorData?.message ||
          "You do not have permission to access this admin resource.",
        403,
        errorData,
      );
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

  grade: async (submissionId, score) => {
    return apiRequest(`/admin/submissions/${submissionId}/grade`, {
      method: "POST",
      body: JSON.stringify({ score }),
    });
  },
};

export const adminContactMessagesApi = {
  list: async () => {
    return apiRequest("/admin/contact-messages");
  },
};
