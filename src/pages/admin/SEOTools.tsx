import React, { useState, useEffect } from 'react';
import { 
  Search,
  FileText,
  Globe,
  Share2,
  BarChart2,
  ArrowUp,
  Zap,
  Tag,
  Edit2,
  Save,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

// Mock data for SEO analysis
const mockSeoData = {
  pages: [
    { 
      url: '/', 
      title: 'GudCity Loyalty - Customer Loyalty Management System',
      description: 'GudCity Loyalty helps businesses of all sizes create, manage, and grow customer loyalty programs that drive retention and increase revenue.',
      score: 92,
      issues: ['Missing alt text on 2 images', 'Meta description could be improved']
    },
    { 
      url: '/about', 
      title: 'About Us - GudCity Loyalty',
      description: 'Learn about the GudCity Loyalty team and our mission to transform customer loyalty for businesses worldwide.',
      score: 87,
      issues: ['H1 tag is too long', 'Page could use more internal links']
    },
    { 
      url: '/services', 
      title: 'Services - GudCity Loyalty',
      description: 'Explore our comprehensive loyalty program management services designed for businesses of all sizes.',
      score: 78,
      issues: ['Title tag is too short', 'Low keyword density', 'Missing structured data']
    },
    { 
      url: '/contact', 
      title: 'Contact Us - GudCity Loyalty',
      description: 'Get in touch with our team to learn how we can help your business build customer loyalty.',
      score: 95,
      issues: []
    }
  ],
  siteStats: {
    averageScore: 88,
    indexedPages: 12,
    crawlErrors: 2,
    lastSitemapUpdate: '2023-09-15'
  },
  keywords: [
    { keyword: 'loyalty program software', position: 8, change: +2 },
    { keyword: 'customer loyalty management', position: 12, change: -1 },
    { keyword: 'loyalty rewards system', position: 15, change: +5 },
    { keyword: 'business loyalty cards', position: 22, change: 0 }
  ]
};

const SEOTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState('meta-tags');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [seoData, setSeoData] = useState(mockSeoData);
  const [metaTagsForm, setMetaTagsForm] = useState({
    pageTitle: 'GudCity Loyalty - Customer Loyalty Management System',
    metaDescription: 'GudCity Loyalty helps businesses create, manage, and grow customer loyalty programs that drive retention and increase revenue.',
    keywords: 'loyalty program, customer retention, rewards program, customer loyalty',
    ogTitle: 'GudCity Loyalty',
    ogDescription: 'Transform your customer loyalty program',
    ogImage: 'https://gudcity.com/og-image.jpg',
    twitterCard: 'summary_large_image',
    canonicalUrl: 'https://gudcity.com/'
  });
  
  const handleMetaTagsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMetaTagsForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const generateMetaTags = () => {
    // In a real application, this would update the meta tags in your pages
    toast.success('Meta tags generated successfully!');
  };
  
  const analyzeSEO = () => {
    setIsAnalyzing(true);
    // Simulate API call
    setTimeout(() => {
      setIsAnalyzing(false);
      toast.success('SEO analysis completed!');
    }, 2000);
  };
  
  const updateSitemap = () => {
    // Simulate API call
    toast.success('Sitemap updated and submitted to search engines!');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">SEO Tools</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Optimize your website for search engines
          </p>
        </div>
        <Button
          variant="primary"
          onClick={analyzeSEO}
          disabled={isAnalyzing}
          className="flex items-center gap-2"
        >
          {isAnalyzing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Site SEO'}</span>
        </Button>
      </div>
      
      {/* SEO Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 flex flex-col items-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
            {seoData.siteStats.averageScore}%
          </div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Average SEO Score
          </div>
        </Card>
        
        <Card className="p-6 flex flex-col items-center">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
            {seoData.siteStats.indexedPages}
          </div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Indexed Pages
          </div>
        </Card>
        
        <Card className="p-6 flex flex-col items-center">
          <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
            {seoData.siteStats.crawlErrors}
          </div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Crawl Errors
          </div>
        </Card>
        
        <Card className="p-6 flex flex-col items-center">
          <div className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
            {seoData.siteStats.lastSitemapUpdate}
          </div>
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Last Sitemap Update
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={updateSitemap}
            className="mt-2"
          >
            Update Now
          </Button>
        </Card>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('meta-tags')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'meta-tags'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}
            `}
          >
            <Tag className="inline-block h-4 w-4 mr-2" />
            Meta Tags Generator
          </button>
          
          <button
            onClick={() => setActiveTab('sitemap')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'sitemap'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}
            `}
          >
            <FileText className="inline-block h-4 w-4 mr-2" />
            Sitemap Management
          </button>
          
          <button
            onClick={() => setActiveTab('performance')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'performance'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}
            `}
          >
            <BarChart2 className="inline-block h-4 w-4 mr-2" />
            SEO Performance
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'meta-tags' && (
        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Meta Tags Generator</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="pageTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Page Title
              </label>
              <input
                type="text"
                id="pageTitle"
                name="pageTitle"
                value={metaTagsForm.pageTitle}
                onChange={handleMetaTagsChange}
                className="block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {metaTagsForm.pageTitle.length}/60 characters (recommended 50-60)
              </p>
            </div>
            
            <div>
              <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Meta Description
              </label>
              <textarea
                id="metaDescription"
                name="metaDescription"
                rows={3}
                value={metaTagsForm.metaDescription}
                onChange={handleMetaTagsChange}
                className="block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {metaTagsForm.metaDescription.length}/160 characters (recommended 120-158)
              </p>
            </div>
            
            <div>
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Keywords (comma separated)
              </label>
              <input
                type="text"
                id="keywords"
                name="keywords"
                value={metaTagsForm.keywords}
                onChange={handleMetaTagsChange}
                className="block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ogTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Open Graph Title
                </label>
                <input
                  type="text"
                  id="ogTitle"
                  name="ogTitle"
                  value={metaTagsForm.ogTitle}
                  onChange={handleMetaTagsChange}
                  className="block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="ogDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Open Graph Description
                </label>
                <input
                  type="text"
                  id="ogDescription"
                  name="ogDescription"
                  value={metaTagsForm.ogDescription}
                  onChange={handleMetaTagsChange}
                  className="block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ogImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Open Graph Image URL
                </label>
                <input
                  type="text"
                  id="ogImage"
                  name="ogImage"
                  value={metaTagsForm.ogImage}
                  onChange={handleMetaTagsChange}
                  className="block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="twitterCard" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Twitter Card Type
                </label>
                <select
                  id="twitterCard"
                  name="twitterCard"
                  value={metaTagsForm.twitterCard}
                  onChange={handleMetaTagsChange}
                  className="block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md"
                >
                  <option value="summary">Summary</option>
                  <option value="summary_large_image">Summary with Large Image</option>
                  <option value="app">App</option>
                  <option value="player">Player</option>
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="canonicalUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Canonical URL
              </label>
              <input
                type="text"
                id="canonicalUrl"
                name="canonicalUrl"
                value={metaTagsForm.canonicalUrl}
                onChange={handleMetaTagsChange}
                className="block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md"
              />
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Generated HTML</h3>
              <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded-md overflow-x-auto">
                {`<title>${metaTagsForm.pageTitle}</title>
<meta name="description" content="${metaTagsForm.metaDescription}" />
<meta name="keywords" content="${metaTagsForm.keywords}" />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${metaTagsForm.canonicalUrl}" />
<meta property="og:title" content="${metaTagsForm.ogTitle}" />
<meta property="og:description" content="${metaTagsForm.ogDescription}" />
<meta property="og:image" content="${metaTagsForm.ogImage}" />

<!-- Twitter -->
<meta property="twitter:card" content="${metaTagsForm.twitterCard}" />
<meta property="twitter:url" content="${metaTagsForm.canonicalUrl}" />
<meta property="twitter:title" content="${metaTagsForm.ogTitle}" />
<meta property="twitter:description" content="${metaTagsForm.ogDescription}" />
<meta property="twitter:image" content="${metaTagsForm.ogImage}" />

<link rel="canonical" href="${metaTagsForm.canonicalUrl}" />`}
              </pre>
            </div>
            
            <div className="text-right">
              <Button
                variant="primary"
                onClick={generateMetaTags}
              >
                <Save className="h-4 w-4 mr-2" />
                Generate & Save Meta Tags
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {activeTab === 'sitemap' && (
        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Sitemap Management</h2>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Sitemap Status</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {seoData.siteStats.lastSitemapUpdate}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('/sitemap.xml', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Sitemap
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={updateSitemap}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update Sitemap
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pages in Sitemap</h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        URL
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Last Modified
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Priority
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Changefreq
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {seoData.pages.map((page, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {page.url}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {seoData.siteStats.lastSitemapUpdate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {page.url === '/' ? '1.0' : '0.8'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {page.url === '/' ? 'daily' : 'weekly'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Engine Submission</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-md">
                  <div className="flex items-center">
                    <Search className="h-5 w-5 mr-2 text-blue-600" />
                    <span className="font-medium">Google</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Last submitted: {seoData.siteStats.lastSitemapUpdate}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => toast.success('Sitemap submitted to Google!')}
                  >
                    Submit to Google
                  </Button>
                </div>
                
                <div className="p-4 border rounded-md">
                  <div className="flex items-center">
                    <Search className="h-5 w-5 mr-2 text-purple-600" />
                    <span className="font-medium">Bing</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Last submitted: {seoData.siteStats.lastSitemapUpdate}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => toast.success('Sitemap submitted to Bing!')}
                  >
                    Submit to Bing
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
      
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-medium mb-4">Keyword Rankings</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Keyword
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Position
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Change
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {seoData.keywords.map((keyword, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {keyword.keyword}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {keyword.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          keyword.change > 0
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : keyword.change < 0
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                        }`}>
                          {keyword.change > 0 ? '+' : ''}{keyword.change}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-lg font-medium mb-4">Page Performance</h2>
            
            <div className="space-y-6">
              {seoData.pages.map((page, index) => (
                <div key={index} className="border rounded-md p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{page.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{page.url}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className={`text-lg font-bold ${
                        page.score >= 90
                          ? 'text-green-600 dark:text-green-400'
                          : page.score >= 70
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {page.score}/100
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">SEO Score</div>
                    </div>
                  </div>
                  
                  {page.issues.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Issues to Fix:</h4>
                      <ul className="space-y-1">
                        {page.issues.map((issue, i) => (
                          <li key={i} className="text-sm text-red-600 dark:text-red-400 flex items-center">
                            <div className="w-1 h-1 bg-red-500 dark:bg-red-400 rounded-full mr-2"></div>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(page.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Page
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SEOTools; 