import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Save, Store, Bell, Shield, Globe, Coffee, CreditCard, ChevronRight, Settings as SettingsIcon } from 'lucide-react';
import { useBusiness } from '../../hooks/useBusiness';

function Settings() {
  const { business } = useBusiness();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    // Business Profile
    businessName: business?.name || 'Cafe Example',
    address: '123 Main St, Anytown, USA',
    phone: '(555) 123-4567',
    email: 'contact@cafeexample.com',
    website: 'www.cafeexample.com',
    description: 'Artisanal coffee shop serving specialty brews and pastries.',
    
    // Account Settings
    username: 'admin',
    timeZone: 'America/New_York',
    currency: 'USD',
    language: 'en',
    
    // Notification Settings
    emailNotifications: true,
    newCustomerAlerts: true,
    redemptionAlerts: true,
    dailySummary: false,
    weeklySummary: true,
    
    // Payment Settings
    stripePK: 'pk_test_*****',
    enablePayments: false,
    
    // Privacy Settings
    dataRetention: '24',
    shareAnonymousData: true,
    allowCookies: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };
  
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Here we would normally update the business settings
    console.log('Settings saved:', formData);
    
    // Show a success message
    alert('Settings saved successfully!');
  };
  
  const renderProfileTab = () => (
    <div>
      <h2 className="text-lg font-semibold mb-4">Business Profile</h2>
      <div className="space-y-4">
        <Input
          label="Business Name"
          id="businessName"
          name="businessName"
          value={formData.businessName}
          onChange={handleChange}
          fullWidth
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Address"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            fullWidth
          />
          
          <Input
            label="Phone"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email"
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
          />
          
          <Input
            label="Website"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            fullWidth
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Business Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
  
  const renderAccountTab = () => (
    <div>
      <h2 className="text-lg font-semibold mb-4">Account Settings</h2>
      <div className="space-y-4">
        <Input
          label="Username"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          fullWidth
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="timeZone" className="block text-sm font-medium text-gray-700 mb-1">
              Time Zone
            </label>
            <select
              id="timeZone"
              name="timeZone"
              value={formData.timeZone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderNotificationsTab = () => (
    <div>
      <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
            <p className="text-sm text-gray-500">Receive notifications via email</p>
          </div>
          <div className="flex items-center">
            <input
              id="emailNotifications"
              name="emailNotifications"
              type="checkbox"
              checked={formData.emailNotifications}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between py-3 border-b">
          <div>
            <h3 className="text-sm font-medium text-gray-900">New Customer Alerts</h3>
            <p className="text-sm text-gray-500">Get notified when a new customer joins</p>
          </div>
          <div className="flex items-center">
            <input
              id="newCustomerAlerts"
              name="newCustomerAlerts"
              type="checkbox"
              checked={formData.newCustomerAlerts}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between py-3 border-b">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Redemption Alerts</h3>
            <p className="text-sm text-gray-500">Get notified when rewards are redeemed</p>
          </div>
          <div className="flex items-center">
            <input
              id="redemptionAlerts"
              name="redemptionAlerts"
              type="checkbox"
              checked={formData.redemptionAlerts}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between py-3 border-b">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Daily Summary</h3>
            <p className="text-sm text-gray-500">Receive a daily summary of activity</p>
          </div>
          <div className="flex items-center">
            <input
              id="dailySummary"
              name="dailySummary"
              type="checkbox"
              checked={formData.dailySummary}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between py-3 border-b">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Weekly Summary</h3>
            <p className="text-sm text-gray-500">Receive a weekly summary of activity</p>
          </div>
          <div className="flex items-center">
            <input
              id="weeklySummary"
              name="weeklySummary"
              type="checkbox"
              checked={formData.weeklySummary}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderPrivacyTab = () => (
    <div>
      <h2 className="text-lg font-semibold mb-4">Privacy Settings</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="dataRetention" className="block text-sm font-medium text-gray-700 mb-1">
            Data Retention Period (months)
          </label>
          <select
            id="dataRetention"
            name="dataRetention"
            value={formData.dataRetention}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="3">3 months</option>
            <option value="6">6 months</option>
            <option value="12">12 months</option>
            <option value="24">24 months</option>
            <option value="36">36 months</option>
          </select>
        </div>
        
        <div className="flex items-center justify-between py-3 border-b">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Share Anonymous Data</h3>
            <p className="text-sm text-gray-500">Help us improve by sharing anonymous usage data</p>
          </div>
          <div className="flex items-center">
            <input
              id="shareAnonymousData"
              name="shareAnonymousData"
              type="checkbox"
              checked={formData.shareAnonymousData}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between py-3 border-b">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Allow Cookies</h3>
            <p className="text-sm text-gray-500">Enable cookies for improved functionality</p>
          </div>
          <div className="flex items-center">
            <input
              id="allowCookies"
              name="allowCookies"
              type="checkbox"
              checked={formData.allowCookies}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderPaymentTab = () => (
    <div>
      <h2 className="text-lg font-semibold mb-4">Payment Settings</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Enable Online Payments</h3>
            <p className="text-sm text-gray-500">Allow customers to make purchases online</p>
          </div>
          <div className="flex items-center">
            <input
              id="enablePayments"
              name="enablePayments"
              type="checkbox"
              checked={formData.enablePayments}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <Input
          label="Stripe Public Key"
          id="stripePK"
          name="stripePK"
          value={formData.stripePK}
          onChange={handleChange}
          disabled={!formData.enablePayments}
          fullWidth
        />
      </div>
    </div>
  );
  
  const getTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'account':
        return renderAccountTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'privacy':
        return renderPrivacyTab();
      case 'payment':
        return renderPaymentTab();
      default:
        return renderProfileTab();
    }
  };

  // Define the tabs for settings
  const tabs = [
    { id: 'profile', name: 'Business Profile', icon: Store },
    { id: 'account', name: 'Account', icon: Globe },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy', icon: Shield },
    { id: 'payment', name: 'Payment', icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your business preferences and account settings</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5">
          {/* Sidebar navigation */}
          <div className="bg-gray-50 p-4 border-r border-gray-200">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium w-full text-left rounded-md
                    ${activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <tab.icon
                    className={`mr-3 h-5 w-5 ${
                      activeTab === tab.id ? 'text-blue-500' : 'text-gray-400'
                    }`}
                  />
                  <span className="truncate">{tab.name}</span>
                  {activeTab === tab.id && (
                    <ChevronRight className="ml-auto h-4 w-4 text-blue-400" />
                  )}
                </button>
              ))}
            </nav>
          </div>
          
          {/* Main content area */}
          <div className="col-span-1 md:col-span-3 lg:col-span-4 p-6">
            <form onSubmit={handleSave}>
              {getTabContent()}
              
              <div className="mt-6 pt-5 border-t border-gray-200 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  leftIcon={<Save className="h-4 w-4" />}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;