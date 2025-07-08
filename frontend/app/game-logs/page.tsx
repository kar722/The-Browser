'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { ChevronDown, ChevronUp } from 'lucide-react'
import ShotChart from '../components/ShotChart'
import SeasonShotChart from '../components/SeasonShotChart'

interface GameLog {
  id: number
  date: string
  team: string
  opp: string
  result: string
  pts: string
  trb: string
  ast: string
  stl: string
  blk: string
  fg: string
  fga: string
  fg_pct: string
  three_p: string
  three_pa: string
  three_p_pct: string
  ft: string
  fta: string
  ft_pct: string
  orb: string
  drb: string
  tov: string
  pf: string
  plus_minus: string
  mp: string
  gmsc: string
  gcar: string
  gs: string
  is_away: boolean
  // Add other fields as needed
}

interface SeasonStats {
  gamesPlayed: number
  record: string
  minutes_per_game: number
  points: number
  rebounds: number
  assists: number
  steals: number
  blocks: number
  fgPercent: number
  threePtPercent: number
  ftPercent: number
  trueShootingPercent: number
  per: number
}

interface Season {
  start: number
  end: number
  label: string
  tableName: string
}

interface ExpandedRowProps {
  game: GameLog
}

const ExpandedRow: React.FC<ExpandedRowProps> = ({ game }) => {
  return (
    <tr className="bg-muted/30">
      <td colSpan={9} className="px-6 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Shooting</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <span className="text-muted-foreground">FG:</span>
                  <span className="text-foreground">{game.fg}/{game.fga} ({game.fg_pct})</span>
                  <span className="text-muted-foreground">3P:</span>
                  <span className="text-foreground">{game.three_p}/{game.three_pa} ({game.three_p_pct || '0.000'})</span>
                  <span className="text-muted-foreground">FT:</span>
                  <span className="text-foreground">{game.ft}/{game.fta} ({game.ft_pct})</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Rebounds</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <span className="text-muted-foreground">ORB:</span>
                  <span className="text-foreground">{game.orb}</span>
                  <span className="text-muted-foreground">DRB:</span>
                  <span className="text-foreground">{game.drb}</span>
                  <span className="text-muted-foreground">TRB:</span>
                  <span className="text-foreground">{game.trb}</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Other</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <span className="text-muted-foreground">Minutes:</span>
                  <span className="text-foreground">{game.mp}</span>
                  <span className="text-muted-foreground">Turnovers:</span>
                  <span className="text-foreground">{game.tov}</span>
                  <span className="text-muted-foreground">Fouls:</span>
                  <span className="text-foreground">{game.pf}</span>
                  <span className="text-muted-foreground">+/-:</span>
                  <span className="text-foreground">{game.plus_minus}</span>
                  <span className="text-muted-foreground">Career Game:</span>
                  <span className="text-foreground">{game.gcar}</span>
                  <span className="text-muted-foreground">Started:</span>
                  <span className="text-foreground">{game.gs === '1' ? 'Yes' : 'No'}</span>
                  <span className="text-muted-foreground">Location:</span>
                  <span className="text-foreground">{game.is_away ? 'Away' : 'Home'}</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Shot Chart</h4>
            <div className="p-4">
              <ShotChart gameDate={game.date} width={400} height={376} />
            </div>
          </div>
        </div>
      </td>
    </tr>
  )
}

// Add a list of all NBA teams and their acronyms
const ALL_TEAMS = [
  'ATL', 'BOS', 'BRK', 'CHI', 'CHO', 'CLE', 'DAL', 'DEN', 'DET', 'GSW', 'HOU', 'IND', 'LAC', 'MEM', 'MIA', 'MIL', 'MIN', 'NOP', 'NYK', 'OKC', 'ORL', 'PHI', 'PHO', 'POR', 'SAC', 'SAS', 'TOR', 'UTA', 'WAS', 'LAL', 'CHA'
]

// Helper to get full team name from acronym, with special handling for Charlotte
function getTeamName(acronym: string, season: Season | null): string {
  if (!season) return acronym
  const { start } = season
  if ((start === 2012 || start === 2013) && acronym === 'CHA') return 'Charlotte Bobcats'
  if ((start === 2012 || start === 2013) && acronym === 'CHO') return '' // Don't show Hornets in these years
  if (start >= 2014 && acronym === 'CHO') return 'Charlotte Hornets'
  // fallback to general mapping
  return TEAM_NAMES[acronym] || acronym
}

// Helper to get full team name from acronym
const TEAM_NAMES: Record<string, string> = {
  ATL: 'Atlanta Hawks', BOS: 'Boston Celtics', BRK: 'Brooklyn Nets', CHI: 'Chicago Bulls', CHO: 'Charlotte Hornets', CLE: 'Cleveland Cavaliers', DAL: 'Dallas Mavericks', DEN: 'Denver Nuggets', DET: 'Detroit Pistons', GSW: 'Golden State Warriors', HOU: 'Houston Rockets', IND: 'Indiana Pacers', LAC: 'LA Clippers', MEM: 'Memphis Grizzlies', MIA: 'Miami Heat', MIL: 'Milwaukee Bucks', MIN: 'Minnesota Timberwolves', NOP: 'New Orleans Pelicans', NYK: 'New York Knicks', OKC: 'Oklahoma City Thunder', ORL: 'Orlando Magic', PHI: 'Philadelphia 76ers', PHO: 'Phoenix Suns', POR: 'Portland Trail Blazers', SAC: 'Sacramento Kings', SAS: 'San Antonio Spurs', TOR: 'Toronto Raptors', UTA: 'Utah Jazz', WAS: 'Washington Wizards', LAL: 'Los Angeles Lakers', CHA: 'Charlotte Bobcats', // for early seasons
}

function getOpponentList(season: Season | null): string[] {
  if (!season) return []
  const { start, end } = season
  // 2012-2013: all except NOH, CHA (Charlotte is CHA)
  if (start === 2012) {
    return ALL_TEAMS.filter(t => t !== 'NOH')
  }
  // 2013-2014: all except NOP, CHA (Charlotte is CHA)
  if (start === 2013) {
    return ALL_TEAMS.filter(t => t !== 'NOP')
  }
  // 2014-2015 to 2018-2019: all except NOP, Charlotte is CHO
  if (start >= 2014 && start <= 2018) {
    return ALL_TEAMS.filter(t => t !== 'NOP' && t !== 'CHA')
  }
  // 2019-2020 to 2023-2024: all except LAL, Charlotte is CHO
  if (start >= 2019 && start <= 2023) {
    return ALL_TEAMS.filter(t => t !== 'LAL' && t !== 'CHA')
  }
  // 2024-2025: all 30 teams, Charlotte is CHO
  if (start === 2024) {
    return ALL_TEAMS.filter(t => t !== 'CHA')
  }
  // fallback
  return ALL_TEAMS
}

export default function GameLogs() {
  const [gameLogs, setGameLogs] = useState<GameLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null)
  const [seasonStats, setSeasonStats] = useState<SeasonStats | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [sortConfig, setSortConfig] = useState<{ key: keyof GameLog | null, direction: 'desc' | 'asc' | null }>({ key: null, direction: null })
  const [opponentFilter, setOpponentFilter] = useState<string>('')
  const [opponentSearch, setOpponentSearch] = useState<string>('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [showOpponentDropdown, setShowOpponentDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false)
  const seasonDropdownRef = useRef<HTMLDivElement>(null)
  const [seasonSearch, setSeasonSearch] = useState('')
  
  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Generate seasons from 2012-2013 to 2024-2025
  const seasons: Season[] = Array.from({ length: 13 }, (_, i) => {
    const end = 2025 - i
    const start = end - 1
    return {
      start,
      end,
      label: `${start}-${end.toString().slice(-2)}`, // Changed to use YY format
      tableName: `game_logs_${start}_${end}`
    }
  })

  useEffect(() => {
    // Set initial season to current or most recent
    if (!selectedSeason && seasons.length > 0) {
      setSelectedSeason(seasons[0]);
    }
  }, [seasons]);

  useEffect(() => {
    const fetchGameLogs = async () => {
      if (!selectedSeason) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from(selectedSeason.tableName)
          .select('*')
          .not('date', 'eq', '1969-12-31')  // Exclude the season total row
          .order('date', { ascending: false });
        
        if (error) throw error;
        
        setGameLogs(data || []);

        // Fetch season stats from our new tables
        const stats = await fetchSeasonStats(selectedSeason.label, selectedSeason.tableName);
        if (stats) {
          setSeasonStats(stats);
        } else {
          setSeasonStats(null);
        }
      } catch (error) {
        console.error('Error in fetchGameLogs:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSeasonStats = async (season: string, tableName: string) => {
      try {
        // Only use 2TM for 2024-25 season, for other seasons we'll determine the team from the data
        const team = season === '2024-25' ? '2TM' : null;

        let query = supabase
          .from('per_game_stats')
          .select('*')
          .eq('season', season);
        
        if (team) {
          query = query.eq('team', team);
        }

        const { data: perGameData, error: perGameError } = await query.single();
        if (perGameError) return null;

        let advancedQuery = supabase
          .from('advanced_stats')
          .select('*')
          .eq('season', season);
        
        if (team) {
          advancedQuery = advancedQuery.eq('team', team);
        }

        const { data: advancedData, error: advancedError } = await advancedQuery.single();
        if (advancedError) return null;

        // Calculate win-loss record from game logs
        const { data: gameLogsData } = await supabase
          .from(tableName)
          .select('result');

        const wins = gameLogsData?.filter(g => g.result.startsWith('W')).length || 0;
        const losses = gameLogsData?.filter(g => g.result.startsWith('L')).length || 0;

        return {
          gamesPlayed: perGameData.games,
          record: `${wins}-${losses}`,
          minutes_per_game: perGameData.minutes_per_game,
          points: perGameData.points,
          rebounds: perGameData.total_rebounds,
          assists: perGameData.assists,
          steals: perGameData.steals,
          blocks: perGameData.blocks,
          fgPercent: perGameData.field_goal_percentage * 100,
          threePtPercent: perGameData.three_point_percentage * 100,
          ftPercent: perGameData.free_throw_percentage * 100,
          trueShootingPercent: advancedData.true_shooting_percentage * 100,
          per: advancedData.player_efficiency_rating
        };
      } catch (error) {
        console.error('Error in fetchSeasonStats:', error);
        return null;
      }
    };

    fetchGameLogs();
  }, [selectedSeason]);

  const toggleRow = (id: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleSort = (key: keyof GameLog) => {
    setSortConfig(prev => {
      if (prev.key !== key) {
        return { key, direction: 'desc' }
      } else if (prev.direction === 'desc') {
        return { key, direction: 'asc' }
      } else if (prev.direction === 'asc') {
        return { key: null, direction: null }
      } else {
        return { key, direction: 'desc' }
      }
    })
  }

  const sortedGameLogs = React.useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return gameLogs
    const key = sortConfig.key
    const sorted = [...gameLogs].sort((a, b) => {
      if (!key) return 0 // type guard for TS
      const aValue = a[key] ?? ''
      const bValue = b[key] ?? ''
      const aNum = parseFloat(String(aValue))
      const bNum = parseFloat(String(bValue))
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortConfig.direction === 'desc' ? bNum - aNum : aNum - bNum
      }
      if (aValue < bValue) return sortConfig.direction === 'desc' ? 1 : -1
      if (aValue > bValue) return sortConfig.direction === 'desc' ? -1 : 1
      return 0
    })
    return sorted
  }, [gameLogs, sortConfig])

  // Get the correct list of opponents for the selected season
  const opponentList = React.useMemo(() => getOpponentList(selectedSeason), [selectedSeason])

  // Filtered and mapped opponent list for dropdown
  const filteredOpponentList = React.useMemo(() => {
    const search = opponentSearch.toLowerCase()
    return opponentList
      .map(acr => ({
        acronym: acr,
        name: getTeamName(acr, selectedSeason)
      }))
      .filter(opt => opt.name && (opt.acronym.toLowerCase().includes(search) || opt.name.toLowerCase().includes(search)))
  }, [opponentList, opponentSearch, selectedSeason])

  // Filter game logs by opponent if filter is set
  const filteredGameLogs = React.useMemo(() => {
    if (!opponentFilter) return sortedGameLogs
    return sortedGameLogs.filter(game => game.opp === opponentFilter)
  }, [sortedGameLogs, opponentFilter])

  // Calculate stats for filtered games if opponent is selected
  const filteredStats = React.useMemo(() => {
    if (!opponentFilter || filteredGameLogs.length === 0) return null
    const wins = filteredGameLogs.filter(game => game.result.startsWith('W')).length
    const losses = filteredGameLogs.filter(game => game.result.startsWith('L')).length
    const totalPoints = filteredGameLogs.reduce((sum, game) => sum + (parseInt(game.pts) || 0), 0)
    const totalRebounds = filteredGameLogs.reduce((sum, game) => sum + (parseInt(game.trb) || 0), 0)
    const totalAssists = filteredGameLogs.reduce((sum, game) => sum + (parseInt(game.ast) || 0), 0)
    const totalSteals = filteredGameLogs.reduce((sum, game) => sum + (parseInt(game.stl) || 0), 0)
    const totalBlocks = filteredGameLogs.reduce((sum, game) => sum + (parseInt(game.blk) || 0), 0)
    return {
      gamesPlayed: filteredGameLogs.length,
      record: `${wins}-${losses}`,
      avgPoints: filteredGameLogs.length ? Math.round((totalPoints / filteredGameLogs.length) * 10) / 10 : 0,
      avgRebounds: filteredGameLogs.length ? Math.round((totalRebounds / filteredGameLogs.length) * 10) / 10 : 0,
      avgAssists: filteredGameLogs.length ? Math.round((totalAssists / filteredGameLogs.length) * 10) / 10 : 0,
      avgSteals: filteredGameLogs.length ? Math.round((totalSteals / filteredGameLogs.length) * 10) / 10 : 0,
      avgBlocks: filteredGameLogs.length ? Math.round((totalBlocks / filteredGameLogs.length) * 10) / 10 : 0,
    }
  }, [filteredGameLogs, opponentFilter])

  // Filtered season list for dropdown
  const filteredSeasonList = React.useMemo(() => {
    if (!seasonSearch) return seasons
    const search = seasonSearch.toLowerCase()
    return seasons.filter(s => s.label.toLowerCase().includes(search))
  }, [seasons, seasonSearch])

  // Close season dropdown when clicking outside
  useEffect(() => {
    if (!showSeasonDropdown) return;
    function handleClickOutside(event: MouseEvent) {
      if (seasonDropdownRef.current && !seasonDropdownRef.current.contains(event.target as Node)) {
        setShowSeasonDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSeasonDropdown]);

  // Get all game dates for the selected season
  const seasonGameDates = React.useMemo(() => {
    if (!gameLogs.length) return [];
    return gameLogs.map(game => game.date).filter(Boolean);
  }, [gameLogs]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <h1 className="text-6xl font-bold text-foreground">Anthony Davis Game Logs</h1>
      </div>
      
      <div className="flex gap-4 mb-8">
        <div className="relative w-64">
          <button
            className="w-full px-4 py-2 text-left border rounded-lg shadow-sm bg-background hover:bg-muted flex justify-between items-center"
            onClick={() => setShowSeasonDropdown(!showSeasonDropdown)}
          >
            <span>{selectedSeason ? selectedSeason.label : 'Select Season'}</span>
            {showSeasonDropdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showSeasonDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <input
                type="text"
                className="block w-full px-3 py-2 bg-card text-foreground border-b border-border focus:outline-none text-sm rounded-t-lg"
                placeholder="Search season..."
                value={seasonSearch}
                onChange={e => setSeasonSearch(e.target.value)}
                autoFocus
              />
              <div>
                {filteredSeasonList.length === 0 && (
                  <div className="px-4 py-2 text-muted-foreground">No seasons found</div>
                )}
                {filteredSeasonList.map(season => (
                  <div
                    key={season.label}
                    className={`px-4 py-2 cursor-pointer hover:bg-muted ${selectedSeason?.label === season.label ? 'font-semibold' : ''}`}
                    onClick={() => {
                      setSelectedSeason(season)
                      setShowSeasonDropdown(false)
                      setOpponentFilter('') // reset opponent filter on season change
                      setOpponentSearch('')
                      setSeasonSearch('')
                    }}
                  >
                    {season.label} Season
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="relative w-64">
          <button
            className="w-full px-4 py-2 text-left border rounded-lg shadow-sm bg-background hover:bg-muted flex justify-between items-center"
            onClick={() => setShowOpponentDropdown(!showOpponentDropdown)}
          >
            <span>{opponentFilter ? getTeamName(opponentFilter, selectedSeason) : 'All Teams'}</span>
            {showOpponentDropdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showOpponentDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <input
                type="text"
                className="block w-full px-3 py-2 bg-card text-foreground border-b border-border focus:outline-none text-sm rounded-t-lg"
                placeholder="Search opponent..."
                value={opponentSearch}
                onChange={e => setOpponentSearch(e.target.value)}
                autoFocus
              />
              <div>
                <div
                  className={`px-4 py-2 cursor-pointer hover:bg-muted ${opponentFilter === '' ? 'font-semibold' : ''}`}
                  onClick={() => {
                    setOpponentFilter('')
                    setShowOpponentDropdown(false)
                  }}
                >
                  All Opponents
                </div>
                {filteredOpponentList.length === 0 && (
                  <div className="px-4 py-2 text-muted-foreground">No teams found</div>
                )}
                {filteredOpponentList.map(opt => (
                  <div
                    key={opt.acronym}
                    className={`px-4 py-2 cursor-pointer hover:bg-muted ${opponentFilter === opt.acronym ? 'font-semibold' : ''}`}
                    onClick={() => {
                      setOpponentFilter(opt.acronym)
                      setShowOpponentDropdown(false)
                    }}
                  >
                    {opt.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Season Stats */}
      {!opponentFilter ? (
        <div className="rounded-lg bg-card p-6">
          <h2 className="text-2xl font-semibold mb-6">Season Stats</h2>
          <div className="grid grid-cols-2 gap-x-12 gap-y-4">
            <div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <span className="text-muted-foreground">Record:</span>
                <span className="font-medium text-foreground">{seasonStats?.record}</span>
                <span className="text-muted-foreground">Games:</span>
                <span className="font-medium text-foreground">{seasonStats?.gamesPlayed}</span>
                <span className="text-muted-foreground">MPG:</span>
                <span className="font-medium text-foreground">{seasonStats?.minutes_per_game?.toFixed(1)}</span>
                <span className="text-muted-foreground">PPG:</span>
                <span className="font-medium text-foreground">{seasonStats?.points?.toFixed(1)}</span>
                <span className="text-muted-foreground">RPG:</span>
                <span className="font-medium text-foreground">{seasonStats?.rebounds?.toFixed(1)}</span>
                <span className="text-muted-foreground">APG:</span>
                <span className="font-medium text-foreground">{seasonStats?.assists?.toFixed(1)}</span>
                <span className="text-muted-foreground">SPG:</span>
                <span className="font-medium text-foreground">{seasonStats?.steals?.toFixed(1)}</span>
                <span className="text-muted-foreground">BPG:</span>
                <span className="font-medium text-foreground">{seasonStats?.blocks?.toFixed(1)}</span>
                <span className="text-muted-foreground">FG%:</span>
                <span className="font-medium text-foreground">{seasonStats?.fgPercent?.toFixed(1)}%</span>
                <span className="text-muted-foreground">3P%:</span>
                <span className="font-medium text-foreground">{seasonStats?.threePtPercent?.toFixed(1)}%</span>
                <span className="text-muted-foreground">FT%:</span>
                <span className="font-medium text-foreground">{seasonStats?.ftPercent?.toFixed(1)}%</span>
                <span className="text-muted-foreground">TS%:</span>
                <span className="font-medium text-foreground">{seasonStats?.trueShootingPercent?.toFixed(1)}%</span>
                <span className="text-muted-foreground">PER:</span>
                <span className="font-medium text-foreground">{seasonStats?.per?.toFixed(1)}</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Shot Chart</h3>
              {selectedSeason && (
                <SeasonShotChart 
                  seasonLabel={selectedSeason.label}
                  gameDates={seasonGameDates}
                  width={400} 
                  height={376} 
                />
              )}
            </div>
          </div>
        </div>
      ) : filteredStats && selectedSeason ? (
        <div className="rounded-lg bg-card p-6">
          <h2 className="text-2xl font-semibold mb-6">Stats vs {getTeamName(opponentFilter, selectedSeason)}</h2>
          <div className="grid grid-cols-2 gap-x-12">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <span className="text-muted-foreground">Record:</span>
              <span className="font-medium text-foreground">{filteredStats.record}</span>
              <span className="text-muted-foreground">Games:</span>
              <span className="font-medium text-foreground">{filteredStats.gamesPlayed}</span>
              <span className="text-muted-foreground">PPG:</span>
              <span className="font-medium text-foreground">{filteredStats.avgPoints?.toFixed(1)}</span>
              <span className="text-muted-foreground">RPG:</span>
              <span className="font-medium text-foreground">{filteredStats.avgRebounds?.toFixed(1)}</span>
              <span className="text-muted-foreground">APG:</span>
              <span className="font-medium text-foreground">{filteredStats.avgAssists?.toFixed(1)}</span>
              <span className="text-muted-foreground">SPG:</span>
              <span className="font-medium text-foreground">{filteredStats.avgSteals?.toFixed(1)}</span>
              <span className="text-muted-foreground">BPG:</span>
              <span className="font-medium text-foreground">{filteredStats.avgBlocks?.toFixed(1)}</span>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Shot Chart</h3>
              {selectedSeason && (
                <SeasonShotChart
                  seasonLabel={selectedSeason.label}
                  gameDates={filteredGameLogs.map(g => g.date)}
                  width={400}
                  height={376}
                />
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Game Logs Table */}
      <div className="bg-card rounded-lg shadow-lg dark:shadow-[0_4px_20px_-4px_rgba(255,255,255,0.1)] w-full">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th
                className="px-6 py-4 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider cursor-pointer select-none"
                onClick={() => handleSort('date')}
              >
                Date{sortConfig.key === 'date' && (sortConfig.direction === 'desc' ? ' ↓' : sortConfig.direction === 'asc' ? ' ↑' : '')}
              </th>
              <th className="px-4 py-4 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">Team</th>
              <th className="px-4 py-4 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">Opponent</th>
              <th className="px-4 py-4 text-left text-sm font-medium text-muted-foreground uppercase tracking-wider">Result</th>
              <th
                className="px-4 py-4 text-right text-sm font-medium text-muted-foreground uppercase tracking-wider cursor-pointer select-none"
                onClick={() => handleSort('pts')}
              >
                PTS{sortConfig.key === 'pts' && (sortConfig.direction === 'desc' ? ' ↓' : sortConfig.direction === 'asc' ? ' ↑' : '')}
              </th>
              <th
                className="px-4 py-4 text-right text-sm font-medium text-muted-foreground uppercase tracking-wider cursor-pointer select-none"
                onClick={() => handleSort('trb')}
              >
                REB{sortConfig.key === 'trb' && (sortConfig.direction === 'desc' ? ' ↓' : sortConfig.direction === 'asc' ? ' ↑' : '')}
              </th>
              <th
                className="px-4 py-4 text-right text-sm font-medium text-muted-foreground uppercase tracking-wider cursor-pointer select-none"
                onClick={() => handleSort('ast')}
              >
                AST{sortConfig.key === 'ast' && (sortConfig.direction === 'desc' ? ' ↓' : sortConfig.direction === 'asc' ? ' ↑' : '')}
              </th>
              <th
                className="px-4 py-4 text-right text-sm font-medium text-muted-foreground uppercase tracking-wider cursor-pointer select-none"
                onClick={() => handleSort('stl')}
              >
                STL{sortConfig.key === 'stl' && (sortConfig.direction === 'desc' ? ' ↓' : sortConfig.direction === 'asc' ? ' ↑' : '')}
              </th>
              <th
                className="px-6 py-4 text-right text-sm font-medium text-muted-foreground uppercase tracking-wider cursor-pointer select-none"
                onClick={() => handleSort('blk')}
              >
                BLK{sortConfig.key === 'blk' && (sortConfig.direction === 'desc' ? ' ↓' : sortConfig.direction === 'asc' ? ' ↑' : '')}
              </th>
              <th
                className="px-6 py-4 text-right text-sm font-medium text-muted-foreground uppercase tracking-wider cursor-pointer select-none"
                onClick={() => handleSort('gmsc')}
              >
                GMSC{sortConfig.key === 'gmsc' && (sortConfig.direction === 'desc' ? ' ↓' : sortConfig.direction === 'asc' ? ' ↑' : '')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredGameLogs.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-lg text-muted-foreground">
                  No games found against the selected opponent.
                </td>
              </tr>
            ) : (
              filteredGameLogs.map((game) => (
                <React.Fragment key={game.id}>
                  <tr 
                    onClick={() => toggleRow(game.id)} 
                    className="hover:bg-muted/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-md text-foreground">
                      <div className="flex items-center gap-2">
                        {expandedRows.has(game.id) ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                        {new Date(game.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-md text-foreground">{game.team}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-md text-foreground">{game.opp}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-md text-foreground">{game.result}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-md text-foreground text-right">{game.pts}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-md text-foreground text-right">{game.trb}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-md text-foreground text-right">{game.ast}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-md text-foreground text-right">{game.stl}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-md text-foreground text-right">{game.blk}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-md text-foreground text-right">{game.gmsc}</td>
                  </tr>
                  {expandedRows.has(game.id) && <ExpandedRow game={game} />}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
} 