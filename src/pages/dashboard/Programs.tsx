import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Edit, Trash2, Check, X, Star } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useBusiness } from '../../hooks/useBusiness';
import { LoyaltyProgram } from '../../contexts/BusinessContext';

const programSchema = z.object({
  name: z.string().min(1, 'Program name is required'),
  type: z.enum(['points', 'punchcard', 'tiered']),
  description: z.string().min(1, 'Description is required'),
  pointsPerDollar: z.string().optional().transform(val => val ? parseFloat(val) : 0),
  punchesNeeded: z.string().optional().transform(val => val ? parseInt(val) : 0),
});

type ProgramFormValues = z.infer<typeof programSchema>;

const Programs: React.FC = () => {
  const { business, addProgram, updateProgram, deleteProgram } = useBusiness();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<LoyaltyProgram | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      name: '',
      type: 'points',
      description: '',
      pointsPerDollar: '5',
      punchesNeeded: '10',
    }
  });
  
  const programType = watch('type');
  
  const handleEditClick = (program: LoyaltyProgram) => {
    setSelectedProgram(program);
    setIsEditMode(true);
    
    // Set form values for editing
    setValue('name', program.name);
    setValue('type', program.type);
    setValue('description', program.description);
    
    if (program.type === 'points' && program.rules.pointsPerDollar) {
      setValue('pointsPerDollar', program.rules.pointsPerDollar.toString());
    }
    
    if (program.type === 'punchcard' && program.rules.punchesNeeded) {
      setValue('punchesNeeded', program.rules.punchesNeeded.toString());
    }
    
    setIsModalOpen(true);
  };
  
  const handleDeleteClick = (programId: string) => {
    setShowDeleteConfirm(programId);
  };
  
  const confirmDelete = (programId: string) => {
    deleteProgram(programId);
    setShowDeleteConfirm(null);
  };
  
  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedProgram(null);
    reset();
  };
  
  const onSubmit = (data: ProgramFormValues) => {
    if (isEditMode && selectedProgram) {
      // Update existing program
      const updatedProgram: LoyaltyProgram = {
        ...selectedProgram,
        name: data.name,
        type: data.type,
        description: data.description,
        rules: {
          pointsPerDollar: data.type === 'points' ? data.pointsPerDollar : undefined,
          punchesNeeded: data.type === 'punchcard' ? data.punchesNeeded : undefined,
          tiers: data.type === 'tiered' ? 
            (selectedProgram.rules.tiers || [
              { name: 'Bronze', threshold: 0, benefits: ['Basic rewards'] },
              { name: 'Silver', threshold: 500, benefits: ['Basic rewards', '10% bonus points'] },
              { name: 'Gold', threshold: 1000, benefits: ['All Silver benefits', 'Priority service', 'Exclusive offers'] },
            ]) : undefined,
        },
      };
      
      updateProgram(updatedProgram);
    } else {
      // Create new program
      const newProgram: LoyaltyProgram = {
        id: uuidv4(),
        name: data.name,
        type: data.type,
        description: data.description,
        rules: {
          pointsPerDollar: data.type === 'points' ? data.pointsPerDollar : undefined,
          punchesNeeded: data.type === 'punchcard' ? data.punchesNeeded : undefined,
          tiers: data.type === 'tiered' ? [
            { name: 'Bronze', threshold: 0, benefits: ['Basic rewards'] },
            { name: 'Silver', threshold: 500, benefits: ['Basic rewards', '10% bonus points'] },
            { name: 'Gold', threshold: 1000, benefits: ['All Silver benefits', 'Priority service', 'Exclusive offers'] },
          ] : undefined,
        },
        active: true,
      };
      
      addProgram(newProgram);
    }
    
    closeModal();
  };
  
  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loyalty Programs</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage your loyalty programs</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button 
            variant="primary"
            leftIcon={<PlusCircle className="h-5 w-5" />}
            onClick={() => setIsModalOpen(true)}
          >
            Create Program
          </Button>
        </div>
      </div>
      
      {business?.programs && business.programs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {business.programs.map((program) => (
            <Card key={program.id} className="relative">
              <div className="absolute top-4 right-4 flex space-x-2">
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => handleEditClick(program)}
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button 
                  className="text-gray-400 hover:text-red-600"
                  onClick={() => handleDeleteClick(program.id)}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              
              {showDeleteConfirm === program.id && (
                <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center p-4 rounded-lg z-10">
                  <p className="text-gray-900 font-medium mb-4 text-center">
                    Are you sure you want to delete "{program.name}"?
                  </p>
                  <div className="flex space-x-3">
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<Trash2 className="h-4 w-4" />}
                      onClick={() => confirmDelete(program.id)}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelDelete}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-full mr-3 ${
                  program.type === 'points' 
                    ? 'bg-blue-100 text-blue-600' 
                    : program.type === 'punchcard' 
                    ? 'bg-amber-100 text-amber-600' 
                    : 'bg-purple-100 text-purple-600'
                }`}>
                  <Star className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{program.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{program.type} Program</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">{program.description}</p>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Program Rules:</h4>
                {program.type === 'points' && (
                  <p className="text-sm text-gray-600">
                    {program.rules.pointsPerDollar} points per dollar spent
                  </p>
                )}
                {program.type === 'punchcard' && (
                  <p className="text-sm text-gray-600">
                    Buy {program.rules.punchesNeeded} get 1 free
                  </p>
                )}
                {program.type === 'tiered' && (
                  <ul className="text-sm text-gray-600 space-y-1">
                    {program.rules.tiers?.map((tier) => (
                      <li key={tier.name}>{tier.name}: {tier.threshold} points</li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="flex items-center space-x-2 mt-4">
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  program.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {program.active ? 'Active' : 'Inactive'}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/dashboard/programs/${program.id}/codes`)}
                >
                  Manage Codes
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-16">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Star className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No programs yet</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            Create your first loyalty program to start rewarding your customers and driving repeat business.
          </p>
          <div className="mt-6">
            <Button 
              variant="primary"
              onClick={() => setIsModalOpen(true)}
            >
              Create Your First Program
            </Button>
          </div>
        </Card>
      )}
      
      {/* Create/Edit Program Modal */}
      <Dialog 
        open={isModalOpen} 
        onClose={closeModal}
        className="fixed z-10 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          
          <div className="relative bg-white rounded-lg max-w-md w-full mx-auto p-6 shadow-xl">
            <Dialog.Title as="h3" className="text-lg font-medium text-gray-900 mb-4">
              {isEditMode ? 'Edit Loyalty Program' : 'Create New Loyalty Program'}
            </Dialog.Title>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <Input
                  label="Program Name"
                  id="name"
                  placeholder="e.g., Coffee Rewards"
                  fullWidth
                  error={errors.name?.message}
                  {...register('name')}
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Program Type
                  </label>
                  <div className="mt-1">
                    <select
                      id="type"
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      {...register('type')}
                      disabled={isEditMode} /* Can't change program type when editing */
                    >
                      <option value="points">Points Program</option>
                      <option value="punchcard">Punch Card</option>
                      <option value="tiered">Tiered VIP Program</option>
                    </select>
                  </div>
                  {errors.type?.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                  )}
                </div>
                
                <Input
                  label="Description"
                  id="description"
                  placeholder="Describe your loyalty program"
                  fullWidth
                  error={errors.description?.message}
                  {...register('description')}
                />
                
                {programType === 'points' && (
                  <Input
                    label="Points per Dollar"
                    id="pointsPerDollar"
                    type="number"
                    min="1"
                    step="0.1"
                    fullWidth
                    error={errors.pointsPerDollar?.message}
                    {...register('pointsPerDollar')}
                  />
                )}
                
                {programType === 'punchcard' && (
                  <Input
                    label="Punches Needed for Reward"
                    id="punchesNeeded"
                    type="number"
                    min="1"
                    fullWidth
                    error={errors.punchesNeeded?.message}
                    {...register('punchesNeeded')}
                  />
                )}
                
                {programType === 'tiered' && (
                  <div className="border border-gray-200 rounded-md p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">VIP Tiers (Default)</h4>
                    <ul className="space-y-2">
                      <li className="text-sm">Bronze: Entry level (0 points)</li>
                      <li className="text-sm">Silver: Mid-tier (500 points)</li>
                      <li className="text-sm">Gold: Top-tier (1000 points)</li>
                    </ul>
                    <p className="text-xs text-gray-500 mt-2">
                      Tiers can be customized after creation
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                >
                  {isEditMode ? 'Save Changes' : 'Create Program'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Programs;