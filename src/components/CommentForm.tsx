import { useState, FormEvent, useEffect } from 'react';
import { addComment, getComments } from '../services/neonService';

const CommentForm = () => {
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [comments, setComments] = useState<Array<{ comment: string }>>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch comments when the component mounts
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const fetchedComments = await getComments();
      setComments(fetchedComments);
    } catch (err) {
      setError('Failed to fetch comments');
      console.error(err);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!comment) return;
    
    setSubmitting(true);
    setError('');
    
    try {
      await addComment(comment);
      setComment('');
      // Refresh the comments list
      await fetchComments();
    } catch (err) {
      setError('Failed to submit comment');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Comments</h2>
      
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
            disabled={submitting}
          />
        </div>
        
        <button
          type="submit"
          disabled={submitting || !comment}
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