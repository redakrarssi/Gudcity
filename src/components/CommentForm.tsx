import React, { useState, useEffect } from 'react';
import { addComment, getComments } from '../services/neonService';

const CommentForm: React.FC = () => {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<Array<{ comment: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedComments = await getComments();
      setComments(fetchedComments);
    } catch (err) {
      console.error('Error loading comments:', err);
      setError('Failed to load comments. Please check your database connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please enter a comment');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await addComment(comment);
      setComment('');
      setSuccess('Comment added successfully!');
      await loadComments(); // Refresh the comments list
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to submit comment. Please check your database connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Comment Section</h2>
      <p className="mb-4 text-gray-600">
        This form demonstrates connection to the Neon PostgreSQL database.
      </p>
      
      {/* Comment form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
            Add a Comment
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Write your comment here..."
          ></textarea>
        </div>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-2 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {loading ? 'Submitting...' : 'Submit Comment'}
        </button>
      </form>
      
      {/* Display comments */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-2">Comments</h3>
        {loading && <p className="text-gray-600">Loading comments...</p>}
        
        {comments.length === 0 && !loading ? (
          <p className="text-gray-600">No comments yet. Be the first to comment!</p>
        ) : (
          <ul className="space-y-3">
            {comments.map((item, index) => (
              <li key={index} className="p-3 bg-gray-50 rounded-md">
                {item.comment}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Database connection info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Connected to Neon PostgreSQL database with 
          <code className="bg-gray-100 px-1 rounded ml-1">@neondatabase/serverless</code> driver.
        </p>
      </div>
    </div>
  );
};

export default CommentForm; 