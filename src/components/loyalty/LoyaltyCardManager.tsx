import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tables } from '../../models/database.types';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';
import { sql } from '../../services/neonService';
import { nanoid } from 'nanoid';

interface LoyaltyCardManagerProps {
  customerId: string;
  businessId: string;
}

type LoyaltyCard = Tables['loyalty_cards'] & {
  program_name?: string;
  program_type?: string;
};

type LoyaltyProgram = Tables['loyalty_programs'];

const LoyaltyCardManager: React.FC<LoyaltyCardManagerProps> = ({ customerId, businessId }) => {
  const [cards, setCards] = useState<LoyaltyCard[]>([]);
  const [availablePrograms, setAvailablePrograms] = useState<LoyaltyProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const navigate = useNavigate();

  // Fetch customer's loyalty cards and available programs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch customer's loyalty cards
        const customerCards = await sql`
          SELECT lc.*, lp.name as program_name, lp.type as program_type
          FROM loyalty_cards lc
          JOIN loyalty_programs lp ON lc.program_id = lp.id
          WHERE lc.customer_id = ${customerId}
          AND lc.business_id = ${businessId}
        `;
        
        // Fetch all active programs for this business
        const programs = await sql`
          SELECT * FROM loyalty_programs
          WHERE business_id = ${businessId}
          AND active = true
        `;
        
        // Filter out programs the customer is already enrolled in
        const enrolledProgramIds = customerCards.map((card: LoyaltyCard) => card.program_id);
        const availablePrograms = programs.filter(
          (program: LoyaltyProgram) => !enrolledProgramIds.includes(program.id)
        );
        
        setCards(customerCards);
        setAvailablePrograms(availablePrograms);
        
        if (availablePrograms.length > 0) {
          setSelectedProgramId(availablePrograms[0].id);
        }
      } catch (err) {
        console.error('Error fetching loyalty cards:', err);
        setError('Failed to load loyalty cards. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [customerId, businessId]);

  // Enroll customer in a new loyalty program
  const enrollInProgram = async () => {
    if (!selectedProgramId) {
      setError('Please select a loyalty program');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Get program details
      const selectedProgram = availablePrograms.find(p => p.id === selectedProgramId);
      if (!selectedProgram) {
        throw new Error('Selected program not found');
      }
      
      const now = new Date().toISOString();
      
      // Create new loyalty card
      const newCard = await sql`
        INSERT INTO loyalty_cards (
          id, business_id, customer_id, program_id,
          points_balance, punch_count, tier, issue_date,
          active, created_at, updated_at
        ) VALUES (
          ${nanoid()}, ${businessId}, ${customerId}, ${selectedProgramId},
          0, 
          ${selectedProgram.type === 'punchcard' ? 0 : null},
          ${selectedProgram.type === 'tiered' ? 'Bronze' : null},
          ${now}, true, ${now}, ${now}
        ) RETURNING *
      `;
      
      // Add program name and type to the new card
      const cardWithProgramInfo = {
        ...newCard[0],
        program_name: selectedProgram.name,
        program_type: selectedProgram.type
      };
      
      // Update state
      setCards([...cards, cardWithProgramInfo]);
      setAvailablePrograms(availablePrograms.filter(p => p.id !== selectedProgramId));
      
      if (availablePrograms.length > 1) {
        setSelectedProgramId(availablePrograms.find(p => p.id !== selectedProgramId)?.id || '');
      } else {
        setSelectedProgramId('');
      }
    } catch (err) {
      console.error('Error enrolling in program:', err);
      setError('Failed to enroll in loyalty program. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // View card details
  const viewCardDetails = (cardId: string) => {
    navigate(`/loyalty-cards/${cardId}`);
  };

  // Deactivate a loyalty card
  const deactivateCard = async (cardId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Update card status
      await sql`
        UPDATE loyalty_cards
        SET active = false, updated_at = ${new Date().toISOString()}
        WHERE id = ${cardId}
      `;
      
      // Update state
      setCards(cards.map(card => 
        card.id === cardId ? { ...card, active: false } : card
      ));
    } catch (err) {
      console.error('Error deactivating card:', err);
      setError('Failed to deactivate loyalty card. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && cards.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Loyalty Cards</h2>
      
      {error && <ErrorAlert message={error} />}
      
      {/* Loyalty Cards List */}
      {cards.length > 0 ? (
        <div className="space-y-4">
          {cards.map(card => (
            <div 
              key={card.id}
              className={`p-4 border rounded-lg shadow-sm ${card.active ? 'bg-white' : 'bg-gray-100'}`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{card.program_name}</h3>
                  <p className="text-sm text-gray-600">
                    {card.program_type === 'points' && `Points: ${card.points_balance}`}
                    {card.program_type === 'punchcard' && `Punches: ${card.punch_count}`}
                    {card.program_type === 'tiered' && `Tier: ${card.tier} (${card.points_balance} points)`}
                  </p>
                  <p className="text-xs text-gray-500">
                    Issued: {new Date(card.issue_date).toLocaleDateString()}
                    {card.expiry_date && ` • Expires: ${new Date(card.expiry_date).toLocaleDateString()}`}
                  </p>
                  <p className="text-xs mt-1">
                    <span className={`px-2 py-0.5 rounded-full ${card.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {card.active ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
                
                <div className="space-x-2">
                  <button
                    onClick={() => viewCardDetails(card.id)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    View
                  </button>
                  
                  {card.active && (
                    <button
                      onClick={() => deactivateCard(card.id)}
                      className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                    >
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">No loyalty cards found for this customer.</p>
      )}
      
      {/* Enroll in New Program */}
      {availablePrograms.length > 0 && (
        <div className="mt-8 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-medium mb-3">Enroll in New Program</h3>
          
          <div className="flex items-end gap-4">
            <div className="flex-grow">
              <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-1">
                Select Program
              </label>
              <select
                id="program"
                value={selectedProgramId}
                onChange={(e) => setSelectedProgramId(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {availablePrograms.map(program => (
                  <option key={program.id} value={program.id}>
                    {program.name} ({program.type})
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={enrollInProgram}
              disabled={loading || !selectedProgramId}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Enrolling...' : 'Enroll'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyCardManager; 