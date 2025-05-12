import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Edit2, 
  Trash2, 
  Plus, 
  Save, 
  Eye, 
  Search, 
  Filter, 
  CornerUpLeft,
  Layers,
  Layout,
  Globe,
  Settings
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

// Define page interface
interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  description: string;
  isPublished: boolean;
  lastModified: string;
  createdAt: string;
  template: 'default' | 'landing' | 'contact' | 'about';
}

const ContentManagement: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [filteredPages, setFilteredPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [pageContent, setPageContent] = useState('');
  const [pageMetadata, setPageMetadata] = useState({
    title: '',
    slug: '',
    description: '',
    template: 'default' as 'default' | 'landing' | 'contact' | 'about',
    isPublished: true
  });

  // Load pages data
  useEffect(() => {
    // In a real implementation, this would be an API call
    const timer = setTimeout(() => {
      const mockPages = [
        {
          id: '1',
          title: 'Home',
          slug: '/',
          content: '<h1>Welcome to GudCity Loyalty</h1><p>The premier loyalty program solution.</p>',
          description: 'GudCity Loyalty - Customer Loyalty Management System',
          isPublished: true,
          lastModified: '2023-09-22',
          createdAt: '2023-01-10',
          template: 'landing' as const
        },
        {
          id: '2',
          title: 'About Us',
          slug: '/about',
          content: '<h1>About GudCity Loyalty</h1><p>Our mission and team.</p>',
          description: 'Learn about the GudCity Loyalty team and our mission',
          isPublished: true,
          lastModified: '2023-08-15',
          createdAt: '2023-01-15',
          template: 'about' as const
        },
        {
          id: '3',
          title: 'Services',
          slug: '/services',
          content: '<h1>Our Services</h1><p>Explore our loyalty program solutions.</p>',
          description: 'GudCity Loyalty offers comprehensive loyalty program management',
          isPublished: true,
          lastModified: '2023-09-05',
          createdAt: '2023-01-20',
          template: 'default' as const
        },
        {
          id: '4',
          title: 'Contact',
          slug: '/contact',
          content: '<h1>Contact Us</h1><p>Get in touch with our team.</p>',
          description: 'Contact the GudCity Loyalty team',
          isPublished: true,
          lastModified: '2023-07-18',
          createdAt: '2023-01-25',
          template: 'contact' as const
        },
        {
          id: '5',
          title: 'Privacy Policy',
          slug: '/privacy',
          content: '<h1>Privacy Policy</h1><p>Our privacy commitments to you.</p>',
          description: 'GudCity Loyalty Privacy Policy',
          isPublished: true,
          lastModified: '2023-06-30',
          createdAt: '2023-02-10',
          template: 'default' as const
        }
      ];
      
      setPages(mockPages);
      setFilteredPages(mockPages);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Filter pages when search term or filter changes
  useEffect(() => {
    let filtered = [...pages];
    
    // Apply template filter
    if (filter !== 'all') {
      filtered = filtered.filter(page => page.template === filter);
    }
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        page => page.title.toLowerCase().includes(term) || 
                page.slug.toLowerCase().includes(term)
      );
    }
    
    setFilteredPages(filtered);
  }, [pages, searchTerm, filter]);

  // Handle page edit
  const openPageEditor = (page: Page) => {
    setCurrentPage(page);
    setPageContent(page.content);
    setPageMetadata({
      title: page.title,
      slug: page.slug,
      description: page.description,
      template: page.template,
      isPublished: page.isPublished
    });
    setIsEditing(true);
  };

  // Handle creating a new page
  const createNewPage = () => {
    const newPage: Page = {
      id: `new-${Date.now()}`,
      title: 'New Page',
      slug: `/new-page-${Date.now()}`,
      content: '<h1>New Page</h1><p>Add your content here.</p>',
      description: 'New page description',
      isPublished: false,
      lastModified: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      template: 'default'
    };
    
    setCurrentPage(newPage);
    setPageContent(newPage.content);
    setPageMetadata({
      title: newPage.title,
      slug: newPage.slug,
      description: newPage.description,
      template: newPage.template,
      isPublished: newPage.isPublished
    });
    setIsEditing(true);
  };

  // Handle saving a page
  const savePage = () => {
    if (!currentPage) return;
    
    const updatedPage: Page = {
      ...currentPage,
      title: pageMetadata.title,
      slug: pageMetadata.slug,
      description: pageMetadata.description,
      template: pageMetadata.template,
      isPublished: pageMetadata.isPublished,
      content: pageContent,
      lastModified: new Date().toISOString().split('T')[0]
    };
    
    // If it's a new page, add to pages array
    if (currentPage.id.startsWith('new-')) {
      const newId = `page-${Date.now()}`;
      setPages([...pages, { ...updatedPage, id: newId }]);
      toast.success('Page created successfully!');
    } else {
      // Otherwise update existing page
      setPages(
        pages.map(page => 
          page.id === currentPage.id ? updatedPage : page
        )
      );
      toast.success('Page updated successfully!');
    }
    
    setIsEditing(false);
    setCurrentPage(null);
  };

  // Handle deleting a page
  const deletePage = (pageId: string) => {
    if (window.confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      setPages(pages.filter(page => page.id !== pageId));
      toast.success('Page deleted successfully!');
    }
  };

  return (
    <div className="space-y-6">
      {!isEditing ? (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Content Management</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Manage website pages and content
              </p>
            </div>
            <Button
              variant="primary"
              onClick={createNewPage}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Page</span>
            </Button>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search pages by title or slug..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-700 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative inline-block text-left">
              <div className="flex">
                <div className="inline-flex shadow-sm rounded-md">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 text-sm">
                    <Filter className="h-4 w-4 mr-1" />
                    Template:
                  </span>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="block pl-3 pr-10 py-2 text-base border border-gray-300 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-r-md"
                  >
                    <option value="all">All Templates</option>
                    <option value="default">Default</option>
                    <option value="landing">Landing</option>
                    <option value="about">About</option>
                    <option value="contact">Contact</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Pages Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Page
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      URL
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Template
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Modified
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        Loading pages...
                      </td>
                    </tr>
                  ) : filteredPages.length > 0 ? (
                    filteredPages.map(page => (
                      <tr key={page.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-md bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{page.title}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{page.description.substring(0, 50)}{page.description.length > 50 ? '...' : ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {page.slug}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            page.template === 'landing' 
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                              : page.template === 'about'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : page.template === 'contact'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                          }`}>
                            {page.template}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            page.isPublished
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                          }`}>
                            {page.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {page.lastModified}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => openPageEditor(page)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              title="Edit page"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => window.open(page.slug, '_blank')}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              title="View page"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {page.slug !== '/' && page.slug !== '/about' && page.slug !== '/contact' && (
                              <button
                                onClick={() => deletePage(page.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Delete page"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        No pages found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        /* Page Editor */
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">
                {currentPage?.id.startsWith('new-') ? 'Create New Page' : 'Edit Page'}
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {currentPage?.id.startsWith('new-') ? 'Add a new page to your website' : `Editing: ${currentPage?.title}`}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setCurrentPage(null);
                }}
                className="flex items-center gap-2"
              >
                <CornerUpLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <Button
                variant="primary"
                onClick={savePage}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                <span>Save Page</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Page Content Editor */}
            <div className="lg:col-span-3">
              <Card className="p-4">
                <div className="mb-4">
                  <label htmlFor="pageTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Page Title
                  </label>
                  <input
                    type="text"
                    id="pageTitle"
                    value={pageMetadata.title}
                    onChange={(e) => setPageMetadata({...pageMetadata, title: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="pageContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Page Content (HTML)
                  </label>
                  <textarea
                    id="pageContent"
                    rows={15}
                    value={pageContent}
                    onChange={(e) => setPageContent(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 font-mono"
                  />
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>Preview</span>
                  </div>
                  <div 
                    className="border border-gray-200 dark:border-gray-600 rounded p-4 bg-white dark:bg-gray-800 min-h-[200px] prose max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: pageContent }}
                  />
                </div>
              </Card>
            </div>

            {/* Page Metadata and Settings */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="p-4">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-gray-400" />
                  Page Settings
                </h3>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="pageSlug" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      URL Slug
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
                        /
                      </span>
                      <input
                        type="text"
                        id="pageSlug"
                        value={pageMetadata.slug.replace(/^\//, '')}
                        onChange={(e) => setPageMetadata({...pageMetadata, slug: `/${e.target.value}`})}
                        className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 dark:bg-gray-800 dark:border-gray-700"
                        placeholder="e.g. about-us"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="pageTemplate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Page Template
                    </label>
                    <select
                      id="pageTemplate"
                      value={pageMetadata.template}
                      onChange={(e) => setPageMetadata({...pageMetadata, template: e.target.value as any})}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-700"
                    >
                      <option value="default">Default</option>
                      <option value="landing">Landing Page</option>
                      <option value="about">About Page</option>
                      <option value="contact">Contact Page</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="pageDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Meta Description
                    </label>
                    <textarea
                      id="pageDescription"
                      rows={3}
                      value={pageMetadata.description}
                      onChange={(e) => setPageMetadata({...pageMetadata, description: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700"
                      placeholder="Brief description for search engines"
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {pageMetadata.description.length}/160 characters
                    </p>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="isPublished"
                      name="isPublished"
                      type="checkbox"
                      checked={pageMetadata.isPublished}
                      onChange={(e) => setPageMetadata({...pageMetadata, isPublished: e.target.checked})}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-700"
                    />
                    <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                      Publish this page
                    </label>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-gray-400" />
                  SEO Preview
                </h3>
                <div className="border border-gray-200 dark:border-gray-700 rounded p-4 bg-white dark:bg-gray-800">
                  <div className="text-blue-600 dark:text-blue-400 text-lg truncate">
                    {pageMetadata.title} | GudCity Loyalty
                  </div>
                  <div className="text-green-600 dark:text-green-400 text-sm truncate">
                    www.gudcity.com{pageMetadata.slug}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    {pageMetadata.description.length > 160 
                      ? pageMetadata.description.substring(0, 157) + '...'
                      : pageMetadata.description}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManagement; 