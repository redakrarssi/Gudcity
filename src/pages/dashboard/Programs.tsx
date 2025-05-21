import React, { useState, useEffect } from 'react';
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
  businessId: z.string().nonempty('Business ID is required'),
});

type ProgramFormValues = z.infer<typeof programSchema>;

const Programs: React.FC = () => {
  const { business, addProgram, updateProgram, deleteProgram } = useBusiness();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<LoyaltyProgram | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ status: 'success' | 'error' | null; message: string }>({
    status: null,
    message: '',
  });
  
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue, formState } = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      name: '',
      type: 'points',
      description: '',
      pointsPerDollar: '5',
      punchesNeeded: '10',
      businessId: business?.id || '',
    }
  });
  
  const programType = watch('type');

  useEffect(() => {
    // Set business ID when business context loads
    if (business?.id) {
      console.log('Setting business ID from context:', business.id);
      setValue('businessId', business.id);
    } else {
      console.warn('No business ID available in context');
    }
  }, [business, setValue]);
  
  // Fetch programs from API
  const fetchPrograms = async () => {
    if (!business?.id) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/programs?businessId=${business.id}`);
      const data = await response.json();
      
      if (data.success) {
        setPrograms(data.programs || []);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPrograms();
  }, [business]);
  
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
    setSubmitStatus({ status: null, message: '' });
  };
  
  const onSubmit = async (data: ProgramFormValues) => {
    console.log("Submit button clicked. Starting form submission.");
    
    // Debug validation issues
    console.log("Form errors:", errors);
    console.log("Form validation state:", formState);
    
    try {
      setIsLoading(true);
      console.log('Form data to submit:', data);
      
      // Log if businessId is missing
      if (!data.businessId) {
        console.error('Business ID is missing or invalid:', data.businessId);
        setSubmitStatus({ 
          status: 'error', 
          message: 'Business ID is missing. Please try refreshing the page.' 
        });
        setIsLoading(false);
        return;
      }
      
      // Prepare rules object based on program type
      const rules: any = {};
      if (data.type === 'points') {
        rules.pointsPerDollar = data.pointsPerDollar;
      } else if (data.type === 'punchcard') {
        rules.punchesNeeded = data.punchesNeeded;
      } else if (data.type === 'tiered') {
        rules.tiers = [
          { name: 'Bronze', threshold: 0, benefits: ['Basic rewards'] },
          { name: 'Silver', threshold: 500, benefits: ['Basic rewards', '10% bonus points'] },
          { name: 'Gold', threshold: 1000, benefits: ['All Silver benefits', 'Priority service', 'Exclusive offers'] },
        ];
      }
      
      if (isEditMode && selectedProgram) {
        // Update existing program in the database
        const response = await fetch(`/api/programs/${selectedProgram.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name,
            description: data.description,
            rules,
          }),
        });
        
        const result = await response.json();
        
        if (result.success) {
          setSubmitStatus({ status: 'success', message: 'Program updated successfully!' });
          
          // Update UI via context as well
          const updatedProgram: LoyaltyProgram = {
            ...selectedProgram,
            name: data.name,
            type: data.type,
            description: data.description,
            rules: {
              pointsPerDollar: data.type === 'points' ? data.pointsPerDollar : undefined,
              punchesNeeded: data.type === 'punchcard' ? data.punchesNeeded : undefined,
              tiers: data.type === 'tiered' ? rules.tiers : undefined,
            },
          };
          
          updateProgram(updatedProgram);
          setTimeout(closeModal, 1500);
        } else {
          setSubmitStatus({ status: 'error', message: result.message || 'Failed to update program' });
        }
      } else {
        // Create new program in the database
        console.log('Sending request to API with data:', {
          businessId: data.businessId,
          name: data.name,
          type: data.type,
          description: data.description,
          rules,
          active: true,
        });
        
        // Check if we're running locally or in production
        const apiBaseUrl = process.env.NODE_ENV === 'production' 
          ? '' // Empty base URL for production (same domain)
          : 'http://localhost:3000'; // Local development server
        
        const response = await fetch(`${apiBaseUrl}/api/loyalty-programs/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name,
            description: data.description,
            business_id: data.businessId,
            type: data.type,
            rules,
            active: true,
          }),
        });
        
        console.log('API Response status:', response.status);
        
        if (!response.ok) {
          console.error('API response not OK:', response.status, response.statusText);
        }
        
        let result;
        try {
          result = await response.json();
        } catch (parseError) {
          console.error('Error parsing API response:', parseError);
          setSubmitStatus({ 
            status: 'error', 
            message: 'Could not parse server response. Check developer console for details.' 
          });
          setIsLoading(false);
          return;
        }
        
        console.log('API Response data:', result);
        
        if (result.success) {
          console.log('Program created successfully:', result);
          setSubmitStatus({ status: 'success', message: 'Program created successfully!' });
          
          // Create a local representation of the program for the UI
          const newProgram: LoyaltyProgram = {
            id: result.programId || uuidv4(),
            name: data.name,
            type: data.type,
            description: data.description,
            rules: {
              pointsPerDollar: data.type === 'points' ? data.pointsPerDollar : undefined,
              punchesNeeded: data.type === 'punchcard' ? data.punchesNeeded : undefined,
              tiers: data.type === 'tiered' ? rules.tiers : undefined,
            },
            active: true,
          };
          
          addProgram(newProgram);
          setTimeout(() => {
            closeModal();
            fetchPrograms(); // Refresh the programs list
          }, 1500);
        } else {
          console.error('API returned error:', result);
          setSubmitStatus({ status: 'error', message: result.message || 'Failed to create program' });
        }
      }
    } catch (error) {
      console.error('Error submitting program:', error);
      setSubmitStatus({ status: 'error', message: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
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
      
      {/* Display loading or programs */}
      {isLoading && <p className="text-gray-500">Loading programs...</p>}
      
      {!isLoading && programs.length === 0 && business?.programs?.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-600">No loyalty programs found. Create your first program!</p>
        </div>
      )}
      
      {(!isLoading && (programs.length > 0 || (business?.programs && business.programs.length > 0))) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Show programs from API if available */}
          {programs.map((program) => (
            <Card key={program.id} className="relative">
              <div className="absolute top-4 right-4 flex space-x-2">
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => handleEditClick({
                    id: program.id,
                    name: program.name,
                    type: program.type,
                    description: program.description,
                    rules: program.rules || {},
                    active: program.active
                  })}
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
                {program.type === 'points' && program.rules?.pointsPerDollar && (
                  <p className="text-sm text-gray-600">
                    {program.rules.pointsPerDollar} points per dollar spent
                  </p>
                )}
                {program.type === 'punchcard' && program.rules?.punchesNeeded && (
                  <p className="text-sm text-gray-600">
                    Buy {program.rules.punchesNeeded} get 1 free
                  </p>
                )}
                {program.type === 'tiered' && program.rules?.tiers && (
                  <ul className="text-sm text-gray-600 space-y-1">
                    {program.rules.tiers.map((tier: any) => (
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
              </div>
            </Card>
          ))}
          
          {/* Show programs from context if API doesn't return any */}
          {programs.length === 0 && business?.programs && business.programs.map((program) => (
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
      )}
      
      {/* Create/Edit Program Modal */}
      <Dialog
        open={isModalOpen}
        onClose={closeModal}
        className="fixed inset-0 z-30 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          
          <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6 shadow-xl">
            <div className="absolute top-4 right-4">
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
              {isEditMode ? 'Edit Loyalty Program' : 'Create Loyalty Program'}
            </Dialog.Title>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Program Name*
                  </label>
                  <Input
                    id="name"
                    placeholder="E.g., Points Rewards"
                    {...register("name")}
                    error={errors.name?.message}
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description*
                  </label>
                  <Input
                    id="description"
                    placeholder="Describe your program"
                    {...register("description")}
                    error={errors.description?.message}
                  />
                </div>
                
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Program Type*
                  </label>
                  <select
                    id="type"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    {...register("type")}
                  >
                    <option value="points">Points Program</option>
                    <option value="punchcard">Punch Card</option>
                    <option value="tiered">Tiered Program</option>
                  </select>
                </div>
                
                {programType === 'points' && (
                  <div>
                    <label htmlFor="pointsPerDollar" className="block text-sm font-medium text-gray-700 mb-1">
                      Points Per Dollar*
                    </label>
                    <Input
                      id="pointsPerDollar"
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="E.g., 10"
                      {...register("pointsPerDollar")}
                      error={errors.pointsPerDollar?.message}
                    />
                  </div>
                )}
                
                {programType === 'punchcard' && (
                  <div>
                    <label htmlFor="punchesNeeded" className="block text-sm font-medium text-gray-700 mb-1">
                      Punches Needed for Reward*
                    </label>
                    <Input
                      id="punchesNeeded"
                      type="number"
                      min="1"
                      placeholder="E.g., 10"
                      {...register("punchesNeeded")}
                      error={errors.punchesNeeded?.message}
                    />
                  </div>
                )}
                
                {programType === 'tiered' && (
                  <div className="border rounded-md p-3 bg-gray-50">
                    <p className="text-sm text-gray-600 mb-2">
                      Tiered program will have the following default tiers:
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1 list-disc pl-5">
                      <li>Bronze: 0 points (Basic rewards)</li>
                      <li>Silver: 500 points (Basic rewards + 10% bonus points)</li>
                      <li>Gold: 1000 points (All Silver benefits + Priority service + Exclusive offers)</li>
                    </ul>
                    <p className="text-xs text-gray-500 mt-2">
                      You can customize these tiers after creation
                    </p>
                  </div>
                )}
                
                {/* Hidden field for business ID */}
                <input type="hidden" {...register("businessId")} />
                
                {/* Status messages */}
                {submitStatus.status === 'success' && (
                  <div className="bg-green-50 border border-green-100 rounded-md p-3">
                    <div className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <p className="text-green-700 text-sm">{submitStatus.message}</p>
                    </div>
                  </div>
                )}
                
                {submitStatus.status === 'error' && (
                  <div className="bg-red-50 border border-red-100 rounded-md p-3">
                    <div className="flex items-center">
                      <X className="h-5 w-5 text-red-500 mr-2" />
                      <p className="text-red-700 text-sm">{submitStatus.message}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-4">
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
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : isEditMode ? 'Update Program' : 'Create Program'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Programs;