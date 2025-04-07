import { IgApiClient } from 'instagram-private-api';
import { Campaign, InstagramCredentials, RateLimitInfo } from '../types';

export class InstagramService {
  private ig: IgApiClient;
  private rateLimitInfo: RateLimitInfo;
  private messageQueue: Map<string, NodeJS.Timeout>;

  constructor() {
    this.ig = new IgApiClient();
    this.messageQueue = new Map();
    this.rateLimitInfo = {
      remaining: 50,
      resetTime: new Date(Date.now() + 3600000), // 1 hour from now
    };
  }

  async login(credentials: InstagramCredentials) {
    try {
      this.ig.state.generateDevice(credentials.username);
      await this.ig.account.login(credentials.username, credentials.password);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Failed to login to Instagram');
    }
  }

  async getTargetUsers(username: string, type: 'followers' | 'following') {
    try {
      const user = await this.ig.user.searchExact(username);
      const feed = type === 'followers' 
        ? this.ig.feed.accountFollowers(user.pk)
        : this.ig.feed.accountFollowing(user.pk);
      
      const users = await feed.items();
      return users.map(user => ({
        id: user.pk.toString(),
        username: user.username,
      }));
    } catch (error) {
      console.error('Error fetching target users:', error);
      throw new Error(`Failed to fetch ${type} for ${username}`);
    }
  }

  private async sendMessage(userId: string, message: string) {
    if (this.rateLimitInfo.remaining <= 0) {
      throw new Error('Rate limit exceeded');
    }

    try {
      const thread = await this.ig.direct.createThreadWithUsers([userId]);
      await thread.broadcastText(message);
      
      this.rateLimitInfo.remaining--;
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async startCampaign(
    campaign: Campaign,
    onProgress: (progress: any) => void,
    onError: (error: any) => void
  ) {
    if (this.messageQueue.has(campaign.id)) {
      return;
    }

    try {
      const users = await this.getTargetUsers(campaign.targetUsername, campaign.targetType);
      let messagesSent = 0;
      let currentUserIndex = 0;

      const processNextUser = async () => {
        if (
          currentUserIndex >= users.length ||
          messagesSent >= campaign.rateLimit.maxMessages ||
          campaign.status === 'paused'
        ) {
          this.messageQueue.delete(campaign.id);
          return;
        }

        const user = users[currentUserIndex];
        
        try {
          for (const message of campaign.messages) {
            await this.sleep(message.delay * 1000);
            await this.sendMessage(user.id, message.content);
          }

          messagesSent++;
          onProgress({
            processedUsers: currentUserIndex + 1,
            successfulMessages: messagesSent,
            failedMessages: currentUserIndex + 1 - messagesSent,
            remainingMessages: campaign.totalMessages - messagesSent,
          });

          // Respect rate limits
          await this.sleep((3600 / campaign.rateLimit.messagesPerHour) * 1000);
          
          currentUserIndex++;
          processNextUser();
        } catch (error) {
          onError({
            id: Date.now().toString(),
            message: `Failed to send message to @${user.username}: ${error.message}`,
            timestamp: new Date(),
            userId: user.id,
          });

          currentUserIndex++;
          processNextUser();
        }
      };

      processNextUser();
    } catch (error) {
      onError({
        id: Date.now().toString(),
        message: `Campaign error: ${error.message}`,
        timestamp: new Date(),
      });
    }
  }

  stopCampaign(campaignId: string) {
    const timeout = this.messageQueue.get(campaignId);
    if (timeout) {
      clearTimeout(timeout);
      this.messageQueue.delete(campaignId);
    }
  }

  getRateLimitInfo(): RateLimitInfo {
    return this.rateLimitInfo;
  }
}

export const instagramService = new InstagramService();
