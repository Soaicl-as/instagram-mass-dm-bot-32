import { useStore } from './store/useStore';
import { LoginForm } from './components/LoginForm';
import { CampaignForm } from './components/CampaignForm';
import { CampaignList } from './components/CampaignList';
import { useCampaignExecution } from './hooks/useCampaignExecution';
import { Toaster } from 'react-hot-toast';

function App() {
  const credentials = useStore((state) => state.credentials);
  useCampaignExecution();

  if (!credentials) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Instagram DM Automation
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <LoginForm />
          </div>
        </div>
      </div>
    
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold mb-6">Create Campaign</h2>
            <div className="bg-white shadow rounded-lg p-6">
              <CampaignForm />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-6">Your Campaigns</h2>
            <CampaignList />
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
