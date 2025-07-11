import { TEAM_NAMES } from '../game-logs/page'
import { getYouTubeApiKey } from './env'

interface YouTubeSearchResult {
  id: {
    videoId: string
  }
  snippet: {
    title: string
    description: string
    publishedAt: string
    thumbnails: {
      default: { url: string }
      medium: { url: string }
      high: { url: string }
    }
  }
}

interface YouTubeSearchResponse {
  items: YouTubeSearchResult[]
}

export async function searchGameHighlights(gameDate: string, team: string, opponent: string): Promise<string | null> {
  try {
    const apiKey = getYouTubeApiKey()
    // Convert team and opponent codes to full names
    const teamName = TEAM_NAMES[team] || team
    const opponentName = TEAM_NAMES[opponent] || opponent

    // Format date for search and comparison
    const date = new Date(gameDate)
    const formattedDate = date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric'
    })

    // Get date range for video publish date check (only allow up to 2 days after the game)
    const gameDay = new Date(date)
    gameDay.setHours(0, 0, 0, 0)
    const maxDate = new Date(gameDay)
    maxDate.setDate(maxDate.getDate() + 2)
    maxDate.setHours(23, 59, 59, 999)

    // Construct search query
    const query = `${teamName} vs ${opponentName} ${formattedDate} full game highlights`

    // Make API request with more results to filter through
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(
        query
      )}&key=${apiKey}&type=video&order=relevance`
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('YouTube API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      throw new Error(`YouTube API request failed: ${response.status} ${response.statusText}`)
    }

    const data: YouTubeSearchResponse = await response.json()

    // Filter and find the best matching video
    if (data.items && data.items.length > 0) {
      // Helper function to check if title contains team names (including variations)
      const titleContainsTeams = (title: string) => {
        const titleLower = title.toLowerCase()
        const teamVariations = [
          teamName.toLowerCase(),
          team.toLowerCase(),
          teamName.split(' ').pop()?.toLowerCase() || ''
        ]
        const oppVariations = [
          opponentName.toLowerCase(),
          opponent.toLowerCase(),
          opponentName.split(' ').pop()?.toLowerCase() || ''
        ]
        
        // Require at least one exact match (full name or abbreviation) and one partial match
        const hasExactTeamMatch = titleLower.includes(teamName.toLowerCase()) || titleLower.includes(team.toLowerCase())
        const hasExactOppMatch = titleLower.includes(opponentName.toLowerCase()) || titleLower.includes(opponent.toLowerCase())
        const hasAnyTeamMatch = teamVariations.some(t => titleLower.includes(t))
        const hasAnyOppMatch = oppVariations.some(o => titleLower.includes(o))
        
        return (hasExactTeamMatch || hasExactOppMatch) && hasAnyTeamMatch && hasAnyOppMatch
      }

      // Find the first video that matches our criteria
      const matchingVideo = data.items.find(video => {
        // Check if video was published within our date range
        const publishDate = new Date(video.snippet.publishedAt)
        const isWithinDateRange = publishDate >= gameDay && publishDate <= maxDate

        // Check if title contains both team names
        const hasTeamNames = titleContainsTeams(video.snippet.title)

        // Check if title contains "highlight" or "highlights" and not "career highlights"
        const titleLower = video.snippet.title.toLowerCase()
        const hasHighlightWord = titleLower.includes('highlight') && !titleLower.includes('career highlight')

        // More strict date matching - if the title includes a date, it should match our game date
        const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
        const titleHasDate = monthNames.some(month => titleLower.includes(month))
        if (titleHasDate) {
          const gameDateStr = formattedDate.toLowerCase()
          // If title has a date but doesn't match our game date, reject it
          if (!titleLower.includes(gameDateStr.toLowerCase())) {
            return false
          }
        }

        return isWithinDateRange && hasTeamNames && hasHighlightWord
      })

      if (matchingVideo) {
        return matchingVideo.id.videoId
      }
    }

    return null
  } catch (error) {
    console.error('Error searching YouTube:', error)
    return null
  }
} 

export async function searchPlayerHighlights(gameDate: string, team: string, opponent: string): Promise<string | null> {
  try {
    const apiKey = getYouTubeApiKey()
    
    // Format date for search and comparison
    const date = new Date(gameDate)
    const formattedDate = date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric'
    })

    // Get date range for video publish date check (allow up to 3 days after the game)
    const gameDay = new Date(date)
    gameDay.setHours(0, 0, 0, 0)
    const maxDate = new Date(gameDay)
    maxDate.setDate(maxDate.getDate() + 3)
    maxDate.setHours(23, 59, 59, 999)

    // Construct search query for AD's highlights - simpler query for better results
    const query = `Anthony Davis ${formattedDate}`

    // Make API request with more results to filter through
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(
        query
      )}&key=${apiKey}&type=video&order=relevance`
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('YouTube API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      throw new Error(`YouTube API request failed: ${response.status} ${response.statusText}`)
    }

    const data: YouTubeSearchResponse = await response.json()

    // Filter and find the best matching video
    if (data.items && data.items.length > 0) {
      // Helper function to check if title contains AD's name
      const titleContainsAD = (title: string) => {
        const titleLower = title.toLowerCase()
        return titleLower.includes('anthony davis') || 
               (titleLower.includes('davis') && !titleLower.includes('davis vs')) // Avoid "Davis vs Smith" type titles
      }

      // Helper function to check if title contains the date
      const titleContainsDate = (title: string) => {
        const titleLower = title.toLowerCase()
        const dateFormats = [
          formattedDate.toLowerCase(), // "April 11, 2025"
          date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }), // "4/11/2025"
          `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`, // "4/11/2025"
          `${date.getMonth() + 1}.${date.getDate()}.${date.getFullYear()}`, // "4.11.2025"
          date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), // "Apr 11, 2025"
          date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }).toLowerCase(), // "april 11"
        ]
        return dateFormats.some(format => titleLower.includes(format))
      }

      // Find the first video that matches our criteria
      const matchingVideo = data.items.find(video => {
        // Check if video was published within our date range
        const publishDate = new Date(video.snippet.publishedAt)
        const isWithinDateRange = publishDate >= gameDay && publishDate <= maxDate

        // Check if title contains AD's name
        const hasADName = titleContainsAD(video.snippet.title)

        // Check if title contains the date or was published on game day
        const hasDateMatch = titleContainsDate(video.snippet.title) || 
                           publishDate.toDateString() === gameDay.toDateString()

        // Check for common highlight video indicators - more lenient now
        const titleLower = video.snippet.title.toLowerCase()
        const hasHighlightIndicators = 
          titleLower.includes('highlights') || 
          titleLower.includes('pts') || 
          titleLower.includes('points') ||
          titleLower.includes('performance') ||
          titleLower.includes('drops') ||
          titleLower.includes('double') ||
          titleLower.includes('triple') ||
          titleLower.includes('quadruple') ||
          titleLower.includes('monster') ||
          titleLower.includes('career high') ||
          titleLower.includes('clutch') ||
          titleLower.includes('dominates')

        return isWithinDateRange && hasADName && hasDateMatch && hasHighlightIndicators
      })

      if (matchingVideo) {
        return matchingVideo.id.videoId
      }
    }

    return null
  } catch (error) {
    console.error('Error searching YouTube:', error)
    return null
  }
} 