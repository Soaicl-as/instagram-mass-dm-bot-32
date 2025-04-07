import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Campaign, InstagramCredentials, CampaignProgress, RateLimitInfo } from '../types';

interface Store {
  campaigns: Campaign[];
  credentials: InstagramCredentials | null;
  rateLimitInfo: RateLimitInfo;
  campaignProgress: Record<string, CampaignProgress>;
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, campaign: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  setCredentials: (credentials: InstagramCredentials) => void;
  updateProgress: (campaignId: string, progress: Partial<CampaignProgress>) => void;
  updateRateLimit: (info: RateLimitInfo) => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      campaigns: [],
      credentials: null,
      rateLimitInfo: {
        remaining: 50,
        resetTime: new Date(),
      },
      campaignProgress: {},
      addCampaign: (campaign) =>
        set((state) => ({ campaigns: [...state.campaigns, campaign] })),
      updateCampaign: (id, updatedCampaign) =>
        set((state) => ({
          campaigns: state.campaigns.map((campaign) =>
            campaign.id === id ? { ...campaign, ...updatedCampaign } : campaign
          ),
        })),
      deleteCampaign: (id) =>
        set((state) => ({
          campaigns: state.campaigns.filter((campaign) => campaign.id !== id),
        })),
      setCredentials: (credentials) => set({ credentials }),
      updateProgress: (campaignId, progress) =>
        set((state) => ({
          campaignProgress: {
            ...state.campaignProgress,
            [campaignId]: {
              ...state.campaignProgress[campaignId],
              ...progress,
            },
          },
        })),
      updateRateLimit: (info) => set({ rateLimitInfo: info }),
    }),
    {
      name: 'instagram-bot-storage',
      partialize: (state) => ({
        campaigns: state.campaigns,
        credentials: state.credentials,
      }),
    }
  )
);
