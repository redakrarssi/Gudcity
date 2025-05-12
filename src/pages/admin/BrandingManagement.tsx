import React, { useState, useEffect } from 'react';
import { 
  Image, 
  Edit2, 
  Save, 
  RefreshCw, 
  PaintBucket,
  Type,
  Check,
  X
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import GudcityLogo from '../../assets/logo';

const BrandingManagement: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [branding, setBranding] = useState({
    siteName: 'GudCity Loyalty',
    tagline: 'Transform Customer Loyalty for Your Business',
    primaryColor: '#3B82F6', // blue-500
    secondaryColor: '#1E40AF', // blue-800
    accentColor: '#F59E0B', // amber-500
    fontFamily: 'Inter',
    faviconUrl: '/favicon.svg',
    logoWidth: 150,
    logoHeight: 60
  });
  
  const [previewStyles, setPreviewStyles] = useState({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState('');
  
  // Load branding data
  useEffect(() => {
    // Simulating API call
    setTimeout(() => {
      setIsLoading(false);
      // Update preview styles
      updatePreviewStyles();
    }, 1000);
  }, []);
  
  // Update preview styles when branding changes
  useEffect(() => {
    updatePreviewStyles();
  }, [branding]);
  
  const updatePreviewStyles = () => {
    setPreviewStyles({
      primary: {
        backgroundColor: branding.primaryColor,
        color: '#FFFFFF'
      },
      secondary: {
        backgroundColor: branding.secondaryColor,
        color: '#FFFFFF'
      },
      accent: {
        backgroundColor: branding.accentColor,
        color: '#FFFFFF'
      },
      text: {
        fontFamily: branding.fontFamily
      }
    });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBranding(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFaviconFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const saveBrandingSettings = () => {
    // In a real application, you would upload the files and save the settings to your backend
    // For this demo, we'll just show a success message
    
    toast.success('Branding settings saved successfully!');
    
    // Reset file inputs
    setLogoFile(null);
    setFaviconFile(null);
  };
  
  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all branding to default settings? This action cannot be undone.')) {
      setBranding({
        siteName: 'GudCity Loyalty',
        tagline: 'Transform Customer Loyalty for Your Business',
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        accentColor: '#F59E0B',
        fontFamily: 'Inter',
        faviconUrl: '/favicon.svg',
        logoWidth: 150,
        logoHeight: 60
      });
      
      setLogoPreview('');
      setFaviconPreview('');
      setLogoFile(null);
      setFaviconFile(null);
      
      toast.success('Branding reset to defaults');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Branding Management</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Customize your website branding and appearance
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={resetToDefaults}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reset Defaults</span>
          </Button>
          <Button
            variant="primary"
            onClick={saveBrandingSettings}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Changes</span>
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <Card>
          <div className="p-6 text-center">
            <p>Loading branding settings...</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Logo & Site Name */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-medium mb-4 flex items-center">
                  <Type className="h-5 w-5 mr-2 text-gray-400" />
                  Logo & Site Name
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Logo
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-800 p-6 flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded-md">
                      {logoPreview ? (
                        <img 
                          src={logoPreview} 
                          alt="New Logo" 
                          className="max-h-20 object-contain"
                        />
                      ) : (
                        <GudcityLogo width={branding.logoWidth} height={branding.logoHeight} />
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="logoUpload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Upload New Logo
                    </label>
                    <div className="mt-1 flex items-center">
                      <input
                        id="logoUpload"
                        name="logoUpload"
                        type="file"
                        accept="image/svg+xml,image/png"
                        onChange={handleLogoChange}
                        className="sr-only"
                      />
                      <label
                        htmlFor="logoUpload"
                        className="cursor-pointer py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
                      >
                        Select Logo File
                      </label>
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                        SVG or PNG recommended
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Site Name
                      </label>
                      <input
                        type="text"
                        id="siteName"
                        name="siteName"
                        value={branding.siteName}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tagline
                      </label>
                      <input
                        type="text"
                        id="tagline"
                        name="tagline"
                        value={branding.tagline}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="logoWidth" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Logo Width (px)
                      </label>
                      <input
                        type="number"
                        id="logoWidth"
                        name="logoWidth"
                        value={branding.logoWidth}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="logoHeight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Logo Height (px)
                      </label>
                      <input
                        type="number"
                        id="logoHeight"
                        name="logoHeight"
                        value={branding.logoHeight}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Favicon */}
          <div className="lg:col-span-1">
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-medium mb-4 flex items-center">
                  <Image className="h-5 w-5 mr-2 text-gray-400" />
                  Favicon
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Favicon
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-800 p-6 flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded-md">
                      {faviconPreview ? (
                        <img 
                          src={faviconPreview} 
                          alt="New Favicon" 
                          className="h-16 w-16 object-contain"
                        />
                      ) : (
                        <img 
                          src={branding.faviconUrl} 
                          alt="Current Favicon" 
                          className="h-16 w-16 object-contain"
                        />
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="faviconUpload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Upload New Favicon
                    </label>
                    <div className="mt-1 flex items-center">
                      <input
                        id="faviconUpload"
                        name="faviconUpload"
                        type="file"
                        accept="image/svg+xml,image/png,image/x-icon"
                        onChange={handleFaviconChange}
                        className="sr-only"
                      />
                      <label
                        htmlFor="faviconUpload"
                        className="cursor-pointer py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
                      >
                        Select Favicon File
                      </label>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      SVG or PNG recommended. Should be square.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Color Scheme */}
          <div className="lg:col-span-3">
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-medium mb-4 flex items-center">
                  <PaintBucket className="h-5 w-5 mr-2 text-gray-400" />
                  Color Scheme
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Primary Color
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <div 
                        className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400"
                        style={previewStyles.primary as React.CSSProperties}
                      >
                        <div className="w-4 h-4 rounded-full"></div>
                      </div>
                      <input
                        type="text"
                        id="primaryColor"
                        name="primaryColor"
                        value={branding.primaryColor}
                        onChange={handleInputChange}
                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                      />
                      <input
                        type="color"
                        value={branding.primaryColor}
                        onChange={(e) => setBranding({...branding, primaryColor: e.target.value})}
                        className="absolute right-0 opacity-0 cursor-pointer h-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Secondary Color
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <div 
                        className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400"
                        style={previewStyles.secondary as React.CSSProperties}
                      >
                        <div className="w-4 h-4 rounded-full"></div>
                      </div>
                      <input
                        type="text"
                        id="secondaryColor"
                        name="secondaryColor"
                        value={branding.secondaryColor}
                        onChange={handleInputChange}
                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                      />
                      <input
                        type="color"
                        value={branding.secondaryColor}
                        onChange={(e) => setBranding({...branding, secondaryColor: e.target.value})}
                        className="absolute right-0 opacity-0 cursor-pointer h-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="accentColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Accent Color
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <div 
                        className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400"
                        style={previewStyles.accent as React.CSSProperties}
                      >
                        <div className="w-4 h-4 rounded-full"></div>
                      </div>
                      <input
                        type="text"
                        id="accentColor"
                        name="accentColor"
                        value={branding.accentColor}
                        onChange={handleInputChange}
                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                      />
                      <input
                        type="color"
                        value={branding.accentColor}
                        onChange={(e) => setBranding({...branding, accentColor: e.target.value})}
                        className="absolute right-0 opacity-0 cursor-pointer h-full"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Font Family
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Inter', 'Roboto', 'Open Sans', 'Montserrat'].map(font => (
                      <div 
                        key={font}
                        className={`
                          cursor-pointer p-3 rounded-md border ${
                            branding.fontFamily === font 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-400' 
                              : 'border-gray-300 dark:border-gray-700'
                          }
                        `}
                        onClick={() => setBranding({...branding, fontFamily: font})}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">{font}</span>
                          {branding.fontFamily === font && (
                            <Check className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                          )}
                        </div>
                        <p style={{ fontFamily: font }} className="text-gray-700 dark:text-gray-300">
                          The quick brown fox jumps over the lazy dog.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Preview */}
          <div className="lg:col-span-3">
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-medium mb-4">Brand Preview</h2>
                
                <div className="border rounded-md overflow-hidden">
                  {/* Header */}
                  <div 
                    className="p-4 flex justify-between items-center" 
                    style={{ 
                      backgroundColor: branding.primaryColor,
                      color: 'white',
                      fontFamily: branding.fontFamily
                    }}
                  >
                    <div className="flex items-center">
                      {logoPreview ? (
                        <img 
                          src={logoPreview} 
                          alt="Logo" 
                          className="h-8 object-contain mr-2"
                        />
                      ) : (
                        <GudcityLogo width={40} height={40} />
                      )}
                      <span className="font-bold">{branding.siteName}</span>
                    </div>
                    <div className="flex space-x-2">
                      <div className="px-3 py-1 rounded-md text-sm" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                        Login
                      </div>
                      <div 
                        className="px-3 py-1 rounded-md text-sm" 
                        style={{ 
                          backgroundColor: branding.accentColor,
                          color: 'white'
                        }}
                      >
                        Sign Up
                      </div>
                    </div>
                  </div>
                  
                  {/* Hero */}
                  <div 
                    className="p-8 text-center"
                    style={{ 
                      backgroundColor: branding.secondaryColor,
                      color: 'white',
                      fontFamily: branding.fontFamily
                    }}
                  >
                    <h2 className="text-2xl font-bold mb-2">{branding.tagline}</h2>
                    <p className="opacity-80">
                      GudCity Loyalty helps businesses of all sizes create, manage, and grow customer loyalty programs.
                    </p>
                    <div className="mt-4 flex justify-center space-x-3">
                      <div 
                        className="px-4 py-2 rounded-md font-medium" 
                        style={{ 
                          backgroundColor: 'white',
                          color: branding.secondaryColor,
                        }}
                      >
                        Get Started
                      </div>
                      <div 
                        className="px-4 py-2 rounded-md font-medium" 
                        style={{ 
                          backgroundColor: branding.accentColor,
                          color: 'white',
                        }}
                      >
                        Learn More
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div 
                    className="p-6"
                    style={{ 
                      fontFamily: branding.fontFamily
                    }}
                  >
                    <h3 
                      className="text-lg font-medium mb-2"
                      style={{ color: branding.primaryColor }}
                    >
                      Features
                    </h3>
                    <div className="flex space-x-4">
                      <div className="flex-1 p-4 border rounded-md">
                        <div 
                          className="w-10 h-10 rounded-full mb-2 flex items-center justify-center"
                          style={{ backgroundColor: `${branding.primaryColor}20` }}
                        >
                          <span style={{ color: branding.primaryColor }}>1</span>
                        </div>
                        <h4 className="font-medium">Customer Loyalty</h4>
                        <p className="text-sm text-gray-500">Keep your customers coming back.</p>
                      </div>
                      <div className="flex-1 p-4 border rounded-md">
                        <div 
                          className="w-10 h-10 rounded-full mb-2 flex items-center justify-center"
                          style={{ backgroundColor: `${branding.primaryColor}20` }}
                        >
                          <span style={{ color: branding.primaryColor }}>2</span>
                        </div>
                        <h4 className="font-medium">Reward Programs</h4>
                        <p className="text-sm text-gray-500">Incentivize repeat business.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandingManagement; 