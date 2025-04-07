import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { instagramService } from '../services/instagram';
import toast from 'react-hot-toast';

export function useCampaignExecution() {
  const campaigns = useStore((state) => state.campaigns);
  const updateCampaign = useStore((state) => state.updateCampaign);
  const updateProgress = useStore((state) => state.updateProgress);
  const updateRateLimit = useStore((state) => state.updateRateLimit);
  const credentials = useStore((state) => state.credentials);

  useEffect(() => {
    if (!credentials) return;

    const initializeService = async () => {
      try {
        await instagramService.login(credentials);
      } catch (error) {
        toast.error('Failed to login to Instagram');
      }
    };

    initializeService();
  }, [credentials]);

  useEffect(() => {
    const activeCampaigns = campaigns.filter(
      (campaign) => campaign.status === 'active'
    );

    activeCampaigns.forEach((campaign) => {
      instagramService.startCampaign(
        campaign,
        (progress) => {
          updateProgress(campaign.id, progress);
          updateRateLimit(instagramService.getRateLimitInfo());
        },
        (error) => {
          updateCampaign(campaign.id, {
            errors: [...campaign.errors, error],
          });
          toast.error(`Campaign error: ${error.message}`);
        }
      );
    });

    return () => {
      activeCampaigns.forEach((campaign) => {
        instagramService.stopCampaign(campaign.id);
      });
    };
  }, [campaigns, updateCampaign, updateProgress, updateRateLimit]);
}
