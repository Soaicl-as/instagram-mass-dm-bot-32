import { useStore } from '../store/useStore';
import { Campaign } from '../types';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CampaignProgressProps {
  campaign: Campaign;
}

export function CampaignProgress({ campaign }: CampaignProgressProps) {
  const progress = useStore((state) => state.campaignProgress[campaign.id]);
  const rateLimitInfo = useStore((state) => state.rateLimitInfo);

  if (!progress) {
    return null;
  }

  const progressPercentage = Math.round(
    (progress.successfulMessages / campaign.totalMessages) * 100
  );

  return (
    <div className="space-y-4">
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block text-indigo-600">
              Progress
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-indigo-600">
              {progressPercentage}%
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
          <div
            style={{ width: `${progressPercentage}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-green-50 p-3 rounded-md">
          <div className="flex items-center text-green-700">
            <CheckCircle className="h-4 w-4 mr-2" />
            Successful
          </div>
          <div className="mt-1 text-green-900 font-medium">
            {progress.successfulMessages}
          </div>
        </div>
        <div className="bg-red-50 p-3 rounded-md">
          <div className="flex items-center text-red-700">
            <AlertCircle className="h-4 w-4 mr-2" />
            Failed
          </div>
          <div className="mt-1 text-red-900 font-medium">
            {progress.failedMessages}
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 p-3 rounded-md">
        <div className="text-sm text-yellow-700">
          Rate Limit Status
        </div>
        <div className="mt-1 text-yellow-900">
          {rateLimitInfo.remaining} messages remaining
        </div>
        <div className="mt-1 text-xs text-yellow-700">
          Resets in {formatDistanceToNow(rateLimitInfo.resetTime)}
        </div>
      </div>

      {campaign.errors.length > 0 && (
        <div className="bg-red-50 p-3 rounded-md">
          <div className="text-sm font-medium text-red-700 mb-2">
            Recent Errors
          </div>
          <div className="space-y-2">
            {campaign.errors.slice(-3).map((error) => (
              <div key={error.id} className="text-xs text-red-600">
                {error.message}
                <span className="text-red-500 ml-2">
                  ({formatDistanceToNow(error.timestamp)} ago)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
