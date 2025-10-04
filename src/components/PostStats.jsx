import './PostStats.css'

/**
 * Post Statistics Display Component
 * Shows view count, likes, shares, comments
 */
function PostStats({ stats, commentCount = 0, showLabels = true }) {
  if (!stats) return null

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const statItems = [
    {
      icon: '👁️',
      value: stats.unique_views || 0,
      label: 'Views',
      show: true
    },
    {
      icon: '❤️',
      value: stats.total_likes || 0,
      label: 'Likes',
      show: stats.total_likes > 0
    },
    {
      icon: '🔗',
      value: stats.total_shares || 0,
      label: 'Shares',
      show: stats.total_shares > 0
    },
    {
      icon: '💬',
      value: commentCount,
      label: 'Comments',
      show: commentCount > 0
    }
  ]

  return (
    <div className="post-stats">
      {statItems.filter(item => item.show).map((item, index) => (
        <div key={index} className="stat-item">
          <span className="stat-icon">{item.icon}</span>
          <span className="stat-value">{formatNumber(item.value)}</span>
          {showLabels && <span className="stat-label">{item.label}</span>}
        </div>
      ))}
    </div>
  )
}

export default PostStats

