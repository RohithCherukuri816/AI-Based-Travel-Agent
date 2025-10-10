/**
 * API Service - Centralized API communication
 * Handles all backend API calls with proper error handling and type safety
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ChatRequest {
  user_id: string;
  message: string;
  session_id?: string;
  current_location?: {
    latitude: number;
    longitude: number;
  };
}

export interface ChatResponse {
  success: boolean;
  response: {
    content?: string;
    message?: string;
    type?: string;
    suggestions?: string[];
  };
  context?: any;
  error?: string;
}

export interface TravelRequest {
  destination: string;
  start_date: string;
  duration: number;
  budget: number;
  preferences: string[];
  travelers?: number;
  travel_style?: string;
}

export interface TravelResponse {
  itinerary: any[];
  total_cost: number;
  summary: string;
  recommendations: string[];
}

export interface SessionResponse {
  session_id: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Chat API methods
  async startChatSession(userId: string, tripId?: string): Promise<ApiResponse<SessionResponse>> {
    const params = new URLSearchParams({ user_id: userId });
    if (tripId) {
      params.append('trip_id', tripId);
    }

    return this.request<SessionResponse>(`/start_session?${params.toString()}`, {
      method: 'POST',
    });
  }

  async sendChatMessage(request: ChatRequest): Promise<ApiResponse<ChatResponse>> {
    return this.request<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getChatHistory(userId: string, sessionId?: string): Promise<ApiResponse<any>> {
    const params = sessionId ? `?session_id=${sessionId}` : '';
    return this.request(`/history/${userId}${params}`);
  }

  async deleteChatSession(sessionId: string): Promise<ApiResponse<any>> {
    return this.request(`/delete_session?session_id=${sessionId}`, {
      method: 'DELETE',
    });
  }

  // Travel Planning API methods
  async planTravel(request: TravelRequest): Promise<ApiResponse<TravelResponse>> {
    return this.request<TravelResponse>('/api/plan', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async searchPlaces(query: string): Promise<ApiResponse<any>> {
    return this.request(`/api/places/search?q=${encodeURIComponent(query)}`);
  }

  async getDestinations(): Promise<ApiResponse<any>> {
    return this.request('/api/destinations');
  }

  // Analytics API methods
  async getAnalyticsDashboard(timeRange: string = 'month'): Promise<ApiResponse<any>> {
    return this.request(`/api/analytics/dashboard?time_range=${timeRange}`);
  }

  async getRealTimeAnalytics(): Promise<ApiResponse<any>> {
    return this.request('/api/analytics/realtime');
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.request('/');
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;
