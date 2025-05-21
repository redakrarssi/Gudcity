import { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { apiGet } from '../utils/apiUtils';
import StatusIndicator from './StatusIndicator';

const LoyaltyCardDisplay = ({ customerId, businessId }) => {
  const [loyaltyCard, setLoyaltyCard] = useState(null);
  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('Loading card details...');
  const [pointsHistory, setPointsHistory] = useState([]);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    if (customerId && businessId) {
      loadLoyaltyCard();
    }
  }, [customerId, businessId]);

  const loadLoyaltyCard = async () => {
    setStatus('pending');
    setStatusMessage('Loading your loyalty card...');
    
    try {
      // Fetch the loyalty card for this customer and business
      const response = await apiGet(
        `loyalty_cards?customer_id=${customerId}&business_id=${businessId}`,
        null, // Don't show success toast
        (message) => {
          showError(message || 'Failed to load loyalty card');
          setStatus('error');
          setStatusMessage('Could not load your loyalty card. Please try again later.');
        }
      );

      if (response && response.cards && response.cards.length > 0) {
        setLoyaltyCard(response.cards[0]);
        setStatus('success');
        setStatusMessage('Loyalty card loaded successfully');
        
        // Simulate loading card history
        loadCardHistory(response.cards[0].id);
      } else {
        setStatus('error');
        setStatusMessage('No loyalty card found for this business');
      }
    } catch (error) {
      console.error('Error loading loyalty card:', error);
      setStatus('error');
      setStatusMessage('An error occurred while loading your loyalty card');
    }
  };

  const loadCardHistory = async (cardId) => {
    try {
      // Simulated points history data - in a real app, you'd fetch this from the API
      const mockHistory = [
        { id: 1, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), points: 5, type: 'earned', description: 'Purchase' },
        { id: 2, date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), points: 10, type: 'earned', description: 'Welcome bonus' },
        { id: 3, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), points: -25, type: 'redeemed', description: 'Free coffee' },
      ];
      
      setPointsHistory(mockHistory);
    } catch (error) {
      console.error('Error loading points history:', error);
      showError('Could not load points history');
    }
  };

  // Render different UI based on the status
  const renderCardContent = () => {
    switch (status) {
      case 'pending':
        return <StatusIndicator status="pending" message="Loading your loyalty card..." />;
        
      case 'error':
        return (
          <div className="text-center">
            <StatusIndicator status="error" message={statusMessage} />
            <button 
              onClick={loadLoyaltyCard}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        );
        
      case 'success':
        return (
          <div className="border rounded-lg overflow-hidden">
            <div className="p-4 bg-blue-500 text-white">
              <h3 className="text-xl font-bold">{loyaltyCard.business_name || 'Business'} Loyalty Card</h3>
              <p>Card ID: {loyaltyCard.card_number}</p>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <h4 className="text-lg font-semibold">Points Balance</h4>
                <div className="text-3xl font-bold">
                  {loyaltyCard.points_balance}
                  <span className="text-sm font-normal text-gray-500 ml-2">points</span>
                </div>
                <p className="text-sm text-gray-500">
                  Tier: {loyaltyCard.tier || 'Standard'}
                </p>
              </div>
              
              {pointsHistory.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-2">Recent Activity</h4>
                  <ul className="divide-y">
                    {pointsHistory.map((item) => (
                      <li key={item.id} className="py-2">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{item.description}</p>
                            <p className="text-sm text-gray-500">
                              {item.date.toLocaleDateString()}
                            </p>
                          </div>
                          <div className={item.type === 'earned' ? 'text-green-600' : 'text-red-600'}>
                            {item.type === 'earned' ? '+' : ''}{item.points}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <StatusIndicator 
                status="success" 
                message="Card is active and ready to use" 
                className="mt-4"
              />
            </div>
          </div>
        );
        
      case 'idle':
      default:
        return <StatusIndicator status="idle" message="Waiting to load card details..." />;
    }
  };

  return (
    <div className="loyalty-card-container">
      {renderCardContent()}
    </div>
  );
};

export default LoyaltyCardDisplay; 