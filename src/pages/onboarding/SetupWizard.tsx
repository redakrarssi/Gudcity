import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleUser, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { useBusiness } from '../../hooks/useBusiness';

const businessSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  industry: z.string().min(1, 'Industry is required'),
});

type BusinessFormValues = z.infer<typeof businessSchema>;

enum SetupStep {
  Welcome = 0,
  BusinessInfo = 1,
  LoyaltyProgram = 2,
  Complete = 3,
}

const SetupWizard: React.FC = () => {
  const { user } = useAuth();
  const { saveBusiness } = useBusiness();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<SetupStep>(SetupStep.Welcome);
  const [selectedProgram, setSelectedProgram] = useState<string>('points');
  
  const { register, handleSubmit, formState: { errors } } = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: '',
      industry: '',
    }
  });
  
  const onSubmitBusinessInfo = (data: BusinessFormValues) => {
    saveBusiness({
      name: data.name,
      industry: data.industry,
    });
    setCurrentStep(SetupStep.LoyaltyProgram);
  };
  
  const completeSetup = () => {
    // In a real app, you would save all the settings to the database
    localStorage.setItem('setupComplete', 'true');
    setCurrentStep(SetupStep.Complete);
  };
  
  const goToDashboard = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <div className="py-12">
        <div className="max-w-lg mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="border-b border-gray-200 py-6 px-8">
            <div className="flex justify-center">
              <CircleUser className="h-10 w-10 text-blue-600" />
              <span className="ml-2 text-3xl font-bold text-gray-900">LoyaltyLoop</span>
            </div>
          </div>
          
          <div className="py-8 px-8">
            {/* Progress indicator */}
            {currentStep < SetupStep.Complete && (
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  {Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        i < currentStep
                          ? 'bg-blue-600 text-white'
                          : i === currentStep
                          ? 'bg-blue-100 text-blue-600 border-2 border-blue-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {i < currentStep ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <span>{i + 1}</span>
                        )}
                      </div>
                      <span className="mt-2 text-xs text-gray-500">
                        {i === 0 ? 'Welcome' : i === 1 ? 'Business Info' : 'Loyalty Program'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-gray-200"></div>
                  </div>
                  <div className="relative flex justify-between">
                    {Array.from({ length: 3 }, (_, i) => (
                      <div key={i} className={`w-8 ${i < currentStep ? 'bg-blue-600' : 'bg-gray-200'} h-0.5`}></div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Welcome step */}
            {currentStep === SetupStep.Welcome && (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to LoyaltyLoop!</h2>
                <p className="text-gray-600 mb-8">
                  Let's set up your business loyalty program in just a few steps.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setCurrentStep(SetupStep.BusinessInfo)}
                >
                  Get Started
                </Button>
              </div>
            )}
            
            {/* Business info step */}
            {currentStep === SetupStep.BusinessInfo && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Tell us about your business</h2>
                <p className="text-gray-600 mb-6">
                  This information will be used to customize your loyalty program.
                </p>
                
                <form onSubmit={handleSubmit(onSubmitBusinessInfo)}>
                  <div className="space-y-4">
                    <Input
                      label="Business Name"
                      id="name"
                      placeholder="e.g., Coffee Haven"
                      fullWidth
                      error={errors.name?.message}
                      {...register('name')}
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Industry
                      </label>
                      <select
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        {...register('industry')}
                      >
                        <option value="">Select an industry</option>
                        <option value="Food & Beverage">Food & Beverage</option>
                        <option value="Retail">Retail</option>
                        <option value="Beauty & Wellness">Beauty & Wellness</option>
                        <option value="Health & Fitness">Health & Fitness</option>
                        <option value="Professional Services">Professional Services</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.industry?.message && (
                        <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                    >
                      Continue
                    </Button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Loyalty program step */}
            {currentStep === SetupStep.LoyaltyProgram && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Choose your loyalty program</h2>
                <p className="text-gray-600 mb-6">
                  Select the type of loyalty program that best fits your business.
                </p>
                
                <div className="space-y-4">
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition ${
                      selectedProgram === 'points' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedProgram('points')}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">Points Program</h3>
                      <div className={`w-5 h-5 rounded-full ${
                        selectedProgram === 'points' 
                          ? 'bg-blue-500' 
                          : 'border border-gray-300'
                      }`}>
                        {selectedProgram === 'points' && (
                          <Check className="h-5 w-5 text-white" />
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Customers earn points for every purchase. They can redeem these points for rewards.
                    </p>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition ${
                      selectedProgram === 'punchcard' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedProgram('punchcard')}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">Digital Punch Card</h3>
                      <div className={`w-5 h-5 rounded-full ${
                        selectedProgram === 'punchcard' 
                          ? 'bg-blue-500' 
                          : 'border border-gray-300'
                      }`}>
                        {selectedProgram === 'punchcard' && (
                          <Check className="h-5 w-5 text-white" />
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Buy a certain number of items, get one free. Simple and effective for frequent purchases.
                    </p>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition ${
                      selectedProgram === 'tiered' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedProgram('tiered')}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">Tiered VIP Program</h3>
                      <div className={`w-5 h-5 rounded-full ${
                        selectedProgram === 'tiered' 
                          ? 'bg-blue-500' 
                          : 'border border-gray-300'
                      }`}>
                        {selectedProgram === 'tiered' && (
                          <Check className="h-5 w-5 text-white" />
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Customers progress through different tiers with increasing benefits based on spending or visit frequency.
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(SetupStep.BusinessInfo)}
                  >
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    onClick={completeSetup}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}
            
            {/* Setup complete step */}
            {currentStep === SetupStep.Complete && (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="mt-4 text-2xl font-bold text-gray-900">Setup Complete!</h2>
                <p className="mt-2 text-gray-600 mb-8">
                  Your loyalty program is ready to go. You can now start adding customers and tracking their loyalty points.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={goToDashboard}
                >
                  Go to Dashboard
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;