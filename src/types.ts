export interface Message {
  id: string;
  content: string;
  delay: number;
}

export interface Campaign {
  id: string;
  name: string;
  messages: Message[];
  status: 'active' | 'paused' | 'completed';
  targetUsername: string;
  targetType: 'followers' | 'following';
  messagesSent: number;
  totalMessages: number;
  rateLimit: {
    messagesPerHour: number;
    maxMessages: number;
  };
  errors: CampaignError[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignError {
  id: string;
  message: string;
  timestamp: Date;
  userId?: string;
}

export interface InstagramCredentials {
  username: string;
  password: string;
}

export interface CampaignProgress {
  processedUsers: number;
  successfulMessages: number;
  failedMessages: number;
  remainingMessages: number;
}

export interface RateLimitInfo {
  remaining: number;
  resetTime: Date;
}
