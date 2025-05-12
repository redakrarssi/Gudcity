import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Shield, 
  Mail, 
  Server, 
  Bell, 
  Database,
  Globe,
  Cloud,
  Key
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

const SystemSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [securitySettings, setSecuritySettings] = useState({
    enableTwoFactor: true,
    requireStrongPasswords: true,
    maxLoginAttempts: 5,
    sessionTimeout: 30
  });
  
  const [emailSettings, setEmailSettings] = useState({
    smtpServer: 'smtp.example.com',
    smtpPort: 587,
    smtpUsername: 'notifications@example.com',
    senderName: 'GudCity Loyalty',
    enableEmailVerification: true
  });
  
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    debugMode: false,
    cacheLifetime: 60,
    maxUploadSize: 10
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    adminAlerts: true,
    businessApprovalAlerts: true,
    userRegistrationAlerts: false
  });
  
  const saveSettings = (settingType: string) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`${settingType} settings saved successfully!`);
    }, 1000);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">System Settings</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Configure system-wide settings and preferences
          </p>
        </div>
      </div>
      
      {/* Security Settings */}
      <Card className="overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-blue-500" />
            <h2 className="text-lg font-medium">Security Settings</h2>
          </div>
          <Button
            variant="primary"
            onClick={() => saveSettings('Security')}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Save Changes</span>
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="enableTwoFactor" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Two-Factor Authentication
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="enableTwoFactor"
                    checked={securitySettings.enableTwoFactor}
                    onChange={() => setSecuritySettings({
                      ...securitySettings,
                      enableTwoFactor: !securitySettings.enableTwoFactor
                    })}
                    className="checked:bg-blue-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="enableTwoFactor"
                    className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                      securitySettings.enableTwoFactor ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  ></label>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Require admins and staff to use two-factor authentication
              </p>
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="requireStrongPasswords" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Require Strong Passwords
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="requireStrongPasswords"
                    checked={securitySettings.requireStrongPasswords}
                    onChange={() => setSecuritySettings({
                      ...securitySettings,
                      requireStrongPasswords: !securitySettings.requireStrongPasswords
                    })}
                    className="checked:bg-blue-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="requireStrongPasswords"
                    className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                      securitySettings.requireStrongPasswords ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  ></label>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Enforce password complexity requirements
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="maxLoginAttempts" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Max Login Attempts
              </label>
              <select
                id="maxLoginAttempts"
                value={securitySettings.maxLoginAttempts}
                onChange={(e) => setSecuritySettings({
                  ...securitySettings,
                  maxLoginAttempts: parseInt(e.target.value)
                })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-700"
              >
                <option value={3}>3 attempts</option>
                <option value={5}>5 attempts</option>
                <option value={10}>10 attempts</option>
              </select>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Number of failed attempts before temporary lockout
              </p>
            </div>
            
            <div>
              <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                id="sessionTimeout"
                min={5}
                max={120}
                value={securitySettings.sessionTimeout}
                onChange={(e) => setSecuritySettings({
                  ...securitySettings,
                  sessionTimeout: parseInt(e.target.value)
                })}
                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-700"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Automatically log users out after inactivity
              </p>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Email Settings */}
      <Card className="overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
          <div className="flex items-center">
            <Mail className="h-5 w-5 mr-2 text-blue-500" />
            <h2 className="text-lg font-medium">Email Settings</h2>
          </div>
          <Button
            variant="primary"
            onClick={() => saveSettings('Email')}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Save Changes</span>
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="smtpServer" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                SMTP Server
              </label>
              <input
                type="text"
                id="smtpServer"
                value={emailSettings.smtpServer}
                onChange={(e) => setEmailSettings({
                  ...emailSettings,
                  smtpServer: e.target.value
                })}
                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            
            <div>
              <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                SMTP Port
              </label>
              <input
                type="number"
                id="smtpPort"
                value={emailSettings.smtpPort}
                onChange={(e) => setEmailSettings({
                  ...emailSettings,
                  smtpPort: parseInt(e.target.value)
                })}
                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="smtpUsername" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                SMTP Username
              </label>
              <input
                type="text"
                id="smtpUsername"
                value={emailSettings.smtpUsername}
                onChange={(e) => setEmailSettings({
                  ...emailSettings,
                  smtpUsername: e.target.value
                })}
                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            
            <div>
              <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                SMTP Password
              </label>
              <input
                type="password"
                id="smtpPassword"
                placeholder="••••••••"
                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="senderName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Sender Name
              </label>
              <input
                type="text"
                id="senderName"
                value={emailSettings.senderName}
                onChange={(e) => setEmailSettings({
                  ...emailSettings,
                  senderName: e.target.value
                })}
                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            
            <div>
              <div className="mt-8">
                <Button variant="outline" size="sm">
                  Send Test Email
                </Button>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center">
              <input
                id="enableEmailVerification"
                type="checkbox"
                checked={emailSettings.enableEmailVerification}
                onChange={() => setEmailSettings({
                  ...emailSettings,
                  enableEmailVerification: !emailSettings.enableEmailVerification
                })}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-700"
              />
              <label htmlFor="enableEmailVerification" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Require email verification for new accounts
              </label>
            </div>
          </div>
        </div>
      </Card>
      
      {/* System Settings */}
      <Card className="overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
          <div className="flex items-center">
            <Server className="h-5 w-5 mr-2 text-blue-500" />
            <h2 className="text-lg font-medium">System Settings</h2>
          </div>
          <Button
            variant="primary"
            onClick={() => saveSettings('System')}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Save Changes</span>
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="maintenanceMode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Maintenance Mode
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="maintenanceMode"
                    checked={systemSettings.maintenanceMode}
                    onChange={() => setSystemSettings({
                      ...systemSettings,
                      maintenanceMode: !systemSettings.maintenanceMode
                    })}
                    className="checked:bg-blue-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="maintenanceMode"
                    className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                      systemSettings.maintenanceMode ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  ></label>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Display maintenance page to non-admin users
              </p>
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="debugMode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Debug Mode
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="debugMode"
                    checked={systemSettings.debugMode}
                    onChange={() => setSystemSettings({
                      ...systemSettings,
                      debugMode: !systemSettings.debugMode
                    })}
                    className="checked:bg-blue-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <label
                    htmlFor="debugMode"
                    className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                      systemSettings.debugMode ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  ></label>
                </div>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Enable detailed error messages and logging
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="cacheLifetime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cache Lifetime (minutes)
              </label>
              <input
                type="number"
                id="cacheLifetime"
                min={0}
                max={1440}
                value={systemSettings.cacheLifetime}
                onChange={(e) => setSystemSettings({
                  ...systemSettings,
                  cacheLifetime: parseInt(e.target.value)
                })}
                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-700"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                How long to cache data (0 to disable caching)
              </p>
            </div>
            
            <div>
              <label htmlFor="maxUploadSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Max Upload Size (MB)
              </label>
              <input
                type="number"
                id="maxUploadSize"
                min={1}
                max={100}
                value={systemSettings.maxUploadSize}
                onChange={(e) => setSystemSettings({
                  ...systemSettings,
                  maxUploadSize: parseInt(e.target.value)
                })}
                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-700"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Maximum file size for uploads
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm">
              Clear Cache
            </Button>
            <Button variant="outline" size="sm">
              Rebuild Index
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Notification Settings */}
      <Card className="overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="h-5 w-5 mr-2 text-blue-500" />
            <h2 className="text-lg font-medium">Notification Settings</h2>
          </div>
          <Button
            variant="primary"
            onClick={() => saveSettings('Notification')}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Save Changes</span>
          </Button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Send notification emails to users
              </p>
            </div>
            <div className="relative inline-block w-10 mr-2 align-middle select-none">
              <input
                type="checkbox"
                id="emailNotifications"
                checked={notificationSettings.emailNotifications}
                onChange={() => setNotificationSettings({
                  ...notificationSettings,
                  emailNotifications: !notificationSettings.emailNotifications
                })}
                className="checked:bg-blue-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
              />
              <label
                htmlFor="emailNotifications"
                className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                  notificationSettings.emailNotifications ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              ></label>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin Alerts</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Receive system alert notifications
              </p>
            </div>
            <div className="relative inline-block w-10 mr-2 align-middle select-none">
              <input
                type="checkbox"
                id="adminAlerts"
                checked={notificationSettings.adminAlerts}
                onChange={() => setNotificationSettings({
                  ...notificationSettings,
                  adminAlerts: !notificationSettings.adminAlerts
                })}
                className="checked:bg-blue-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
              />
              <label
                htmlFor="adminAlerts"
                className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                  notificationSettings.adminAlerts ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              ></label>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Business Approval Alerts</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Notify when new businesses need approval
              </p>
            </div>
            <div className="relative inline-block w-10 mr-2 align-middle select-none">
              <input
                type="checkbox"
                id="businessApprovalAlerts"
                checked={notificationSettings.businessApprovalAlerts}
                onChange={() => setNotificationSettings({
                  ...notificationSettings,
                  businessApprovalAlerts: !notificationSettings.businessApprovalAlerts
                })}
                className="checked:bg-blue-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
              />
              <label
                htmlFor="businessApprovalAlerts"
                className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                  notificationSettings.businessApprovalAlerts ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              ></label>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">User Registration Alerts</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Notify when new users register
              </p>
            </div>
            <div className="relative inline-block w-10 mr-2 align-middle select-none">
              <input
                type="checkbox"
                id="userRegistrationAlerts"
                checked={notificationSettings.userRegistrationAlerts}
                onChange={() => setNotificationSettings({
                  ...notificationSettings,
                  userRegistrationAlerts: !notificationSettings.userRegistrationAlerts
                })}
                className="checked:bg-blue-500 outline-none focus:outline-none right-4 checked:right-0 duration-200 ease-in absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
              />
              <label
                htmlFor="userRegistrationAlerts"
                className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                  notificationSettings.userRegistrationAlerts ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              ></label>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SystemSettings; 