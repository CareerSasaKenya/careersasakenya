import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import './Comments.css'

function Comments({ postId }) {
  const { user, profile } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    if (postId) {
      fetchComments()
    }
  }, [postId])

  const fetchComments = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('blog_comments')
        .select(`
          *,
          profiles!blog_comments_user_id_fkey (
            full_name,
            email,
            role
          )
        `)
        .eq('post_id', postId)
        .eq('status', 'approved')
        .order('created_at', { ascending: true })

      if (error) throw error

      // Organize comments into threads
      const organized = organizeComments(data || [])
      setComments(organized)
    } catch (err) {
      console.error('Error fetching comments:', err)
    } finally {
      setLoading(false)
    }
  }

  const organizeComments = (commentsList) => {
    // Separate top-level comments and replies
    const topLevel = commentsList.filter(c => !c.parent_id)
    const replies = commentsList.filter(c => c.parent_id)

    // Attach replies to their parents
    topLevel.forEach(comment => {
      comment.replies = replies.filter(r => r.parent_id === comment.id)
    })

    return topLevel
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!newComment.trim()) return
    if (!user) {
      alert('Please log in to comment')
      return
    }

    try {
      setSubmitting(true)

      const { error } = await supabase
        .from('blog_comments')
        .insert([{
          post_id: postId,
          user_id: user.id,
          content: newComment.trim(),
          parent_id: replyingTo,
          status: 'approved' // Auto-approve (change to 'pending' if moderation needed)
        }])

      if (error) throw error

      setNewComment('')
      setReplyingTo(null)
      await fetchComments()
    } catch (err) {
      console.error('Error posting comment:', err)
      alert('Failed to post comment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (commentId) => {
    if (!editContent.trim()) return

    try {
      const { error } = await supabase
        .from('blog_comments')
        .update({ content: editContent.trim() })
        .eq('id', commentId)

      if (error) throw error

      setEditingId(null)
      setEditContent('')
      await fetchComments()
    } catch (err) {
      console.error('Error updating comment:', err)
      alert('Failed to update comment')
    }
  }

  const handleDelete = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      const { error } = await supabase
        .from('blog_comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error

      await fetchComments()
    } catch (err) {
      console.error('Error deleting comment:', err)
      alert('Failed to delete comment')
    }
  }

  const startEdit = (comment) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditContent('')
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date

    // Less than 1 minute
    if (diff < 60000) return 'Just now'
    
    // Less than 1 hour
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000)
      return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`
    }
    
    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000)
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
    }
    
    // Less than 7 days
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000)
      return `${days} ${days === 1 ? 'day' : 'days'} ago`
    }

    // Older than a week
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const canEdit = (comment) => {
    if (!user) return false
    if (profile?.role === 'admin') return true
    if (comment.user_id !== user.id) return false
    
    // Check if within 15 minutes
    const commentTime = new Date(comment.created_at)
    const now = new Date()
    const diff = now - commentTime
    return diff < 900000 // 15 minutes
  }

  const canDelete = (comment) => {
    if (!user) return false
    return profile?.role === 'admin' || comment.user_id === user.id
  }

  const Comment = ({ comment, isReply = false }) => (
    <div className={`comment ${isReply ? 'comment-reply' : ''}`}>
      <div className="comment-avatar">
        <div className="avatar-circle">
          {comment.profiles?.full_name?.charAt(0).toUpperCase() || '?'}
        </div>
      </div>

      <div className="comment-content">
        <div className="comment-header">
          <span className="comment-author">{comment.profiles?.full_name || 'Unknown'}</span>
          {comment.profiles?.role === 'admin' && (
            <span className="admin-badge">Admin</span>
          )}
          <span className="comment-date">{formatDate(comment.created_at)}</span>
        </div>

        {editingId === comment.id ? (
          <div className="comment-edit-form">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
            />
            <div className="edit-actions">
              <button onClick={() => handleEdit(comment.id)} className="btn btn-small btn-primary">
                Save
              </button>
              <button onClick={cancelEdit} className="btn btn-small btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="comment-text">{comment.content}</p>
        )}

        <div className="comment-actions">
          {!isReply && user && (
            <button 
              onClick={() => setReplyingTo(comment.id)} 
              className="comment-action-btn"
            >
              Reply
            </button>
          )}
          {canEdit(comment) && editingId !== comment.id && (
            <button 
              onClick={() => startEdit(comment)} 
              className="comment-action-btn"
            >
              Edit
            </button>
          )}
          {canDelete(comment) && (
            <button 
              onClick={() => handleDelete(comment.id)} 
              className="comment-action-btn comment-delete"
            >
              Delete
            </button>
          )}
        </div>

        {replyingTo === comment.id && (
          <div className="reply-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your reply..."
              rows={3}
            />
            <div className="reply-actions">
              <button 
                onClick={handleSubmit} 
                disabled={submitting || !newComment.trim()}
                className="btn btn-small btn-primary"
              >
                {submitting ? 'Posting...' : 'Post Reply'}
              </button>
              <button 
                onClick={() => {
                  setReplyingTo(null)
                  setNewComment('')
                }} 
                className="btn btn-small btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && (
          <div className="comment-replies">
            {comment.replies.map(reply => (
              <Comment key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="comments-section">
      <h3>Comments ({comments.length})</h3>

      {user ? (
        <form onSubmit={handleSubmit} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            rows={4}
            disabled={submitting}
          />
          <button 
            type="submit" 
            disabled={submitting || !newComment.trim()}
            className="btn btn-primary"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <div className="login-prompt">
          <p>Please log in to leave a comment</p>
        </div>
      )}

      {loading ? (
        <div className="comments-loading">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="no-comments">
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="comments-list">
          {comments.map(comment => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Comments

