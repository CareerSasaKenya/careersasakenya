/**
 * Calculate estimated reading time for blog post content
 * Based on average reading speed of 200-250 words per minute
 */

export const calculateReadingTime = (content) => {
  if (!content) return 0;

  // Remove markdown symbols and HTML tags for accurate word count
  const cleanContent = content
    .replace(/[#*_~`]/g, '') // Remove markdown symbols
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\n+/g, ' ') // Replace line breaks with spaces
    .trim();

  // Count words
  const words = cleanContent.split(/\s+/).filter(word => word.length > 0).length;

  // Calculate reading time (assuming 200 words per minute)
  const minutes = Math.ceil(words / 200);

  return minutes;
};

export const formatReadingTime = (minutes) => {
  if (minutes < 1) return 'Less than 1 min read';
  if (minutes === 1) return '1 min read';
  return `${minutes} min read`;
};

