require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
const { parse } = require('csv-parse/sync'); // Updated import

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to parse CSV data
function parseCSV(fileContent) {
  try {
    return parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
  } catch (error) {
    console.error('Error parsing CSV:', error);
    throw error;
  }
}

// Helper function to check if a row is a summary row
function isSummaryRow(row) {
  // Check for empty rows
  if (!row.Season || !row.Team) return true;
  
  // Check for summary rows that contain "Yrs"
  if (row.Season.includes('Yrs') || row.Team.includes('Yrs')) return true;
  
  // Check for rows where Season isn't in the format "YYYY-YY"
  if (!/^\d{4}-\d{2}$/.test(row.Season)) return true;
  
  return false;
}

// Helper function to transform per game stats
function transformPerGameStats(row) {
  try {
    return {
      season: row.Season,
      age: parseInt(row.Age),
      team: row.Team,
      league: row.Lg,
      position: row.Pos,
      games: parseInt(row.G),
      games_started: parseInt(row.GS),
      minutes_per_game: parseFloat(row.MP),
      field_goals: parseFloat(row.FG),
      field_goal_attempts: parseFloat(row.FGA),
      field_goal_percentage: parseFloat(row['FG%']),
      three_pointers: parseFloat(row['3P']),
      three_point_attempts: parseFloat(row['3PA']),
      three_point_percentage: parseFloat(row['3P%'] || '0'),
      two_pointers: parseFloat(row['2P']),
      two_point_attempts: parseFloat(row['2PA']),
      two_point_percentage: parseFloat(row['2P%']),
      effective_field_goal_percentage: parseFloat(row['eFG%']),
      free_throws: parseFloat(row.FT),
      free_throw_attempts: parseFloat(row.FTA),
      free_throw_percentage: parseFloat(row['FT%']),
      offensive_rebounds: parseFloat(row.ORB),
      defensive_rebounds: parseFloat(row.DRB),
      total_rebounds: parseFloat(row.TRB),
      assists: parseFloat(row.AST),
      steals: parseFloat(row.STL),
      blocks: parseFloat(row.BLK),
      turnovers: parseFloat(row.TOV),
      personal_fouls: parseFloat(row.PF),
      points: parseFloat(row.PTS),
      awards: row.Awards || null
    };
  } catch (error) {
    console.error('Error transforming per game stats row:', row);
    throw error;
  }
}

// Helper function to transform advanced stats
function transformAdvancedStats(row) {
  try {
    return {
      season: row.Season,
      age: parseInt(row.Age),
      team: row.Team,
      league: row.Lg,
      position: row.Pos,
      games: parseInt(row.G),
      games_started: parseInt(row.GS),
      minutes_played: parseInt(row.MP),
      player_efficiency_rating: parseFloat(row.PER),
      true_shooting_percentage: parseFloat(row['TS%']),
      three_point_attempt_rate: parseFloat(row['3PAr']),
      free_throw_rate: parseFloat(row.FTr),
      offensive_rebound_percentage: parseFloat(row['ORB%']),
      defensive_rebound_percentage: parseFloat(row['DRB%']),
      total_rebound_percentage: parseFloat(row['TRB%']),
      assist_percentage: parseFloat(row['AST%']),
      steal_percentage: parseFloat(row['STL%']),
      block_percentage: parseFloat(row['BLK%']),
      turnover_percentage: parseFloat(row['TOV%']),
      usage_percentage: parseFloat(row['USG%']),
      offensive_win_shares: parseFloat(row.OWS),
      defensive_win_shares: parseFloat(row.DWS),
      win_shares: parseFloat(row.WS),
      win_shares_per_48: parseFloat(row['WS/48']),
      offensive_box_plus_minus: parseFloat(row.OBPM),
      defensive_box_plus_minus: parseFloat(row.DBPM),
      box_plus_minus: parseFloat(row.BPM),
      value_over_replacement: parseFloat(row.VORP),
      awards: row.Awards || null
    };
  } catch (error) {
    console.error('Error transforming advanced stats row:', row);
    throw error;
  }
}

async function uploadStats() {
  try {
    // Read and parse per game stats
    const perGamePath = path.join(__dirname, '..', 'data', 'regular-season', 'per_game.csv');
    const perGameData = await fs.readFile(perGamePath, 'utf8');
    const perGameStats = parseCSV(perGameData);
    
    // Read and parse advanced stats
    const advancedPath = path.join(__dirname, '..', 'data', 'regular-season', 'advanced.csv');
    const advancedData = await fs.readFile(advancedPath, 'utf8');
    const advancedStats = parseCSV(advancedData);
    
    console.log('Processing per game stats...');
    const transformedPerGame = perGameStats
      .filter(row => !isSummaryRow(row))
      .map(transformPerGameStats);
    
    console.log('Processing advanced stats...');
    const transformedAdvanced = advancedStats
      .filter(row => !isSummaryRow(row))
      .map(transformAdvancedStats);
    
    // Upload per game stats
    console.log('Uploading per game stats...');
    const { error: perGameError } = await supabase
      .from('per_game_stats')
      .insert(transformedPerGame);
    
    if (perGameError) {
      console.error('Error uploading per game stats:', perGameError);
      throw perGameError;
    } else {
      console.log('Successfully uploaded per game stats!');
    }
    
    // Upload advanced stats
    console.log('Uploading advanced stats...');
    const { error: advancedError } = await supabase
      .from('advanced_stats')
      .insert(transformedAdvanced);
    
    if (advancedError) {
      console.error('Error uploading advanced stats:', advancedError);
      throw advancedError;
    } else {
      console.log('Successfully uploaded advanced stats!');
    }
    
  } catch (error) {
    console.error('Error processing stats:', error);
    process.exit(1);
  }
}

uploadStats(); 