import { useState, FormEvent, useEffect } from 'react';

const CommentForm = () => {
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [comments, setComments] = useState<Array<{ comment: string }>>([]);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    // Check API health
    checkApiHealth();
    // Fetch comments when the component mounts
    fetchComments();
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        const data = await response.json();
        setApiStatus(data.database === 'connected' ? 'online' : 'offline');
      } else {
        setApiStatus('offline');
      }
    } catch (err) {
      console.error('API health check failed:', err);
      setApiStatus('offline');
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch('/api/comments');
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const fetchedComments = await response.json();
      setComments(fetchedComments);
    } catch (err) {
      setError('Failed to fetch comments. Please try again later.');
      console.error('Fetch comments error:', err);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!comment) return;
    
    setSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      setComment('');
      // Refresh the comments list
      await fetchComments();
    } catch (err) {
      setError('Failed to submit comment. Please try again later.');
      console.error('Submit comment error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Comments</h2>
      
      {apiStatus === 'checking' && (
        <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded">
          Checking API connection...
        </div>
      )}
      
      {apiStatus === 'offline' && (
        <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
          API is currently unavailable. Comments may not load or be saved.
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm font-medium mb-1">
            Add a Comment
          </label>
          <input
            type="text"
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment"
            className="w-full p-2 border rounded-md"
            disabled={submitting || apiStatus === 'offline'}
          />
        </div>
        
        <button
          type="submit"
          disabled={submitting || !comment || apiStatus === 'offline'}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
        
        {error && (
          <p className="mt-2 text-red-600">{error}</p>
        )}
      </form>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Recent Comments</h3>
        {comments.length > 0 ? (
          <ul className="space-y-2">
            {comments.map((item, index) => (
              <li key={index} className="p-2 bg-gray-100 rounded-md">
                {item.comment}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No comments yet</p>
        )}
      </div>
    </div>
  );
};

export default CommentForm; 