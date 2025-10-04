import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Get or create session ID
const getSessionId = () => {
  let sessionId = localStorage.getItem('blog_session_id')
  
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem('blog_session_id', sessionId)
  }
  
  return sessionId
}

/**
 * Hook to track blog post views
 * @param {string} postId - The blog post UUID
 * @param {object} user - Current user object (optional)
 */
export const usePostView = (postId, user = null) => {
  useEffect(() => {
    if (!postId) return

    const trackView = async () => {
      try {
        const sessionId = getSessionId()
        const referrer = document.referrer || 'direct'
        const userAgent = navigator.userAgent

        await supabase.rpc('track_post_view', {
          p_post_id: postId,
          p_session_id: sessionId,
          p_user_id: user?.id || null,
          p_referrer: referrer,
          p_user_agent: userAgent
        })
      } catch (error) {
        // Silent fail - don't disrupt user experience
        console.error('Analytics tracking error:', error)
      }
    }

    // Track after a short delay to avoid counting quick bounces
    const timer = setTimeout(trackView, 2000)

    return () => clearTimeout(timer)
  }, [postId, user])
}

/**
 * Function to track events (like, share, click)
 * @param {string} postId - The blog post UUID
 * @param {string} eventType - Event type (like, share, click)
 * @param {object} user - Current user object (optional)
 */
export const trackEvent = async (postId, eventType, user = null) => {
  try {
    const sessionId = getSessionId()

    await supabase
      .from('blog_analytics')
      .insert([{
        post_id: postId,
        event_type: eventType,
        user_id: user?.id || null,
        session_id: sessionId
      }])
  } catch (error) {
    console.error('Event tracking error:', error)
  }
}

/**
 * Hook to fetch post stats
 * @param {string} postId - The blog post UUID
 * @returns {object} Stats object with loading state
 */
export const usePostStats = (postId) => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!postId) return

    const fetchStats = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_post_stats', { p_post_id: postId })

        if (error) throw error

        setStats(data[0] || {
          unique_views: 0,
          total_views: 0,
          total_likes: 0,
          total_shares: 0,
          total_clicks: 0
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [postId])

  return { stats, loading }
}

export default {
  usePostView,
  trackEvent,
  usePostStats
}

