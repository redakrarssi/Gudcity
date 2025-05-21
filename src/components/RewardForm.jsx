import { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { apiPost } from '../utils/apiUtils';

const RewardForm = ({ businessId, onRewardCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    points_required: 10,
    image_url: '',
    is_active: true,
    redemption_limit: null,
    valid_from: '',
    valid_until: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useNotification();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name) {
      showError('Reward name is required');
      document.getElementById('name').className = 'border-red-500 p-2 w-full rounded';
      return;
    }

    if (!formData.points_required || formData.points_required <= 0) {
      showError('Points required must be a positive number');
      document.getElementById('points_required').className = 'border-red-500 p-2 w-full rounded';
      return;
    }

    // Prepare data for submission
    const rewardData = {
      ...formData,
      business_id: businessId,
      points_required: parseInt(formData.points_required, 10),
      redemption_limit: formData.redemption_limit ? parseInt(formData.redemption_limit, 10) : null
    };

    setIsSubmitting(true);

    try {
      // Submit the reward to the API
      const result = await apiPost(
        'rewards',
        rewardData,
        (message) => {
          showSuccess(message || 'Reward created successfully');
          // Apply green UI feedback
          document.getElementById('reward-form').className = 'mt-4 p-6 bg-green-50 border border-green-200 rounded';
          setTimeout(() => {
            document.getElementById('reward-form').className = 'mt-4 p-6 bg-white border border-gray-200 rounded';
          }, 2000);
        },
        (message) => {
          showError(message || 'Failed to create reward');
          // Apply red UI feedback
          document.getElementById('reward-form').className = 'mt-4 p-6 bg-red-50 border border-red-200 rounded';
        }
      );

      if (result && result.success) {
        // Reset form if successful
        setFormData({
          name: '',
          description: '',
          points_required: 10,
          image_url: '',
          is_active: true,
          redemption_limit: null,
          valid_from: '',
          valid_until: ''
        });

        // Call onRewardCreated if provided
        if (onRewardCreated) {
          onRewardCreated(result.reward);
        }
      }
    } catch (error) {
      console.error('Error creating reward:', error);
      showError('An unexpected error occurred');
      // Apply red UI feedback
      document.getElementById('reward-form').className = 'mt-4 p-6 bg-red-50 border border-red-200 rounded';
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="reward-form" className="mt-4 p-6 bg-white border border-gray-200 rounded">
      <h2 className="text-xl font-semibold mb-4">Create New Reward</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block mb-1 font-medium">
            Reward Name*
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="p-2 w-full border border-gray-300 rounded"
            placeholder="e.g., Free Coffee"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block mb-1 font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="p-2 w-full border border-gray-300 rounded"
            placeholder="Describe the reward..."
            rows="3"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="points_required" className="block mb-1 font-medium">
            Points Required*
          </label>
          <input
            id="points_required"
            name="points_required"
            type="number"
            value={formData.points_required}
            onChange={handleChange}
            className="p-2 w-full border border-gray-300 rounded"
            min="1"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="image_url" className="block mb-1 font-medium">
            Image URL
          </label>
          <input
            id="image_url"
            name="image_url"
            type="text"
            value={formData.image_url}
            onChange={handleChange}
            className="p-2 w-full border border-gray-300 rounded"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="mb-4 flex items-center">
          <input
            id="is_active"
            name="is_active"
            type="checkbox"
            checked={formData.is_active}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="is_active" className="font-medium">
            Active
          </label>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 ${
              isSubmitting ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
            } text-white rounded`}
          >
            {isSubmitting ? 'Creating...' : 'Create Reward'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RewardForm; 