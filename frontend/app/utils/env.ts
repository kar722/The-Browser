export const getYouTubeApiKey = () => {
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
  if (!apiKey) {
    console.error('YouTube API key is not set in environment variables')
    console.error('Available env vars:', process.env)
    throw new Error('YouTube API key is required')
  }
  return apiKey
} 