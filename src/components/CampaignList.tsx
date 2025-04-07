import { useStore } from '../store/useStore';
import { Play, Pause, Trash2 } from 'lucide-react';
import { CampaignProgress } from './CampaignProgress';
import { formatDistanceToNow } from 'date-fns';

export function CampaignList() {
  const campaigns = useStore((state) => state.campaigns);
  const updateCampaign = useStore((state) => state.updateCampaign);
  const deleteCampaign = useStore((state) => state.deleteCampaign);

  const toggleStatus = (id: string, currentStatus: 'active' | 'paused' | 'completed') => {
    updateCampaign(id, {
      status: currentStatus === 'active' ? 'paused' : 'active',
    });
  };

  if (campaigns.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
        No campaigns yet. Create one to get started!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <div
          key={campaign.id}
          className="bg-white shadow rounded-lg p-6 space-y-4"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">{campaign.name}</h3>
              <p className="text-sm text-gray-500">
                Created {formatDistanceToNow(new Date(campaign.createdAt))} ago
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => toggleStatus(campaign.id, campaign.status)}
                className={`p-2 rounded-full ${
                  campaign.status === 'active'
                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                    : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                }`}
              >
                {campaign.status === 'active' ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={() => deleteCampaign(campaign.id)}
                className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
            <div>
              <p>Target: @{campaign.targetUsername}</p>
              <p>Type: {campaign.targetType}</p>
            </div>
            <div>
              <p>{campaign.messages.length} messages in sequence</p>
              <p>Rate: {campaign.rateLimit.messagesPerHour}/hour</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Message Sequence</h4>
            {campaign.messages.map((message, index) => (
              <div key={message.id} className="text-sm text-gray-600">
                {index + 1}. {message.content}{' '}
                <span className="text-gray-400">(after {message.delay}s)</span>
              </div>
            ))}
          </div>

          <CampaignProgress campaign={campaign} />
        </div>
      ))}
    </div>
  );
}
