import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '../store/useStore';
import { Message } from '../types';
import { Plus, Trash2, Users, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export function CampaignForm() {
  const addCampaign = useStore((state) => state.addCampaign);
  const [name, setName] = useState('');
  const [targetUsername, setTargetUsername] = useState('');
  const [targetType, setTargetType] = useState<'followers' | 'following'>('followers');
  const [messages, setMessages] = useState<Message[]>([
    { id: uuidv4(), content: '', delay: 0 },
  ]);
  const [rateLimit, setRateLimit] = useState({
    messagesPerHour: 20,
    maxMessages: 100,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (messages.some(msg => !msg.content)) {
      toast.error('All messages must have content');
      return;
    }

    const campaign = {
      id: uuidv4(),
      name,
      messages,
      status: 'paused' as const,
      targetUsername,
      targetType,
      messagesSent: 0,
      totalMessages: rateLimit.maxMessages,
      rateLimit,
      errors: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addCampaign(campaign);
    toast.success('Campaign created successfully');
    
    // Reset form
    setName('');
    setTargetUsername('');
    setMessages([{ id: uuidv4(), content: '', delay: 0 }]);
    setRateLimit({
      messagesPerHour: 20,
      maxMessages: 100,
    });
  };

  const addMessage = () => {
    setMessages([...messages, { id: uuidv4(), content: '', delay: 0 }]);
  };

  const removeMessage = (id: string) => {
    if (messages.length > 1) {
      setMessages(messages.filter((msg) => msg.id !== id));
    }
  };

  const updateMessage = (id: string, field: keyof Message, value: string | number) => {
    setMessages(
      messages.map((msg) =>
        msg.id === id ? { ...msg, [field]: value } : msg
      )
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Campaign Name
        </label>
        <input
          type="text"
          id="name"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="targetUsername" className="block text-sm font-medium text-gray-700">
          Target Account Username
        </label>
        <input
          type="text"
          id="targetUsername"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={targetUsername}
          onChange={(e) => setTargetUsername(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Target Type</label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTargetType('followers')}
            className={`flex items-center justify-center px-4 py-2 border rounded-md ${
              targetType === 'followers'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-300 bg-white text-gray-700'
            }`}
          >
            <Users className="h-5 w-5 mr-2" />
            Followers
          </button>
          <button
            type="button"
            onClick={() => setTargetType('following')}
            className={`flex items-center justify-center px-4 py-2 border rounded-md ${
              targetType === 'following'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-300 bg-white text-gray-700'
            }`}
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Following
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">Messages</label>
        {messages.map((message, index) => (
          <div key={message.id} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Message content"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={message.content}
                onChange={(e) => updateMessage(message.id, 'content', e.target.value)}
              />
            </div>
            <div className="w-32">
              <input
                type="number"
                placeholder="Delay (s)"
                min="0"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={message.delay}
                onChange={(e) => updateMessage(message.id, 'delay', parseInt(e.target.value) || 0)}
              />
            </div>
            {index > 0 && (
              <button
                type="button"
                onClick={() => removeMessage(message.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addMessage}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Message
        </button>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">Rate Limiting</label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="messagesPerHour" className="block text-sm text-gray-500">
              Messages per Hour
            </label>
            <input
              type="number"
              id="messagesPerHour"
              min="1"
              max="60"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={rateLimit.messagesPerHour}
              onChange={(e) => setRateLimit({ ...rateLimit, messagesPerHour: parseInt(e.target.value) || 20 })}
            />
          </div>
          <div>
            <label htmlFor="maxMessages" className="block text-sm text-gray-500">
              Maximum Messages
            </label>
            <input
              type="number"
              id="maxMessages"
              min="1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={rateLimit.maxMessages}
              onChange={(e) => setRateLimit({ ...rateLimit, maxMessages: parseInt(e.target.value) || 100 })}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Create Campaign
      </button>
    </form>
  );
}
