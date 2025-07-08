require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to parse game date and season
function parseGameInfo(gameString) {
  // Example: "Oct 31, 2012, NOH vs SAS"
  const [month, day, yearTeams] = gameString.split(' ');
  const [year, ...rest] = yearTeams.split(',');
  
  // Convert month name to month number
  const months = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
    'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
    'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
  };
  
  const monthNum = months[month];
  const dayNum = day.replace(',', '').padStart(2, '0');
  
  // Determine season (e.g., for Oct 2012, season is 2012-2013)
  const gameYear = parseInt(year);
  let season;
  if (monthNum >= '10') { // Oct-Dec
    season = `${gameYear}-${gameYear + 1}`;
  } else { // Jan-Jun
    season = `${gameYear - 1}-${gameYear}`;
  }
  
  return {
    date: `${year}-${monthNum}-${dayNum}`,
    season
  };
}

// Helper function to parse quarter and time
function parseTimeInfo(timeString) {
  // Example: "1st Qtr, 10:10 remaining"
  const [quarter, timeRemaining] = timeString.split(', ');
  return {
    quarter,
    timeRemaining: timeRemaining.replace(' remaining', '')
  };
}

// Helper function to extract shot distance
function extractDistance(shotDescription) {
  // Example: "Made 2-pointer from 18 ft"
  const match = shotDescription.match(/from (\d+) ft/);
  return match ? parseInt(match[1]) : 0;
}

async function uploadShots(season) {
  try {
    // Read the shots file
    const filePath = path.join(__dirname, '..', 'data', 'shot_charts', `shots_${season}.json`);
    const data = await fs.readFile(filePath, 'utf8');
    const shots = JSON.parse(data);
    
    console.log(`Processing ${shots.length} shots from season ${season}...`);
    
    // Process shots in batches of 100
    const batchSize = 100;
    for (let i = 0; i < shots.length; i += batchSize) {
      const batch = shots.slice(i, i + batchSize);
      
      // Transform the data
      const transformedShots = batch.map(shot => {
        const gameInfo = parseGameInfo(shot.game);
        const timeInfo = parseTimeInfo(shot.time);
        
        return {
          x: shot.x,
          y: shot.y,
          shot_type: shot.type,
          game_date: gameInfo.date,
          season: gameInfo.season,
          quarter: timeInfo.quarter,
          time_remaining: timeInfo.timeRemaining,
          shot_description: shot.shot,
          score_situation: shot.score,
          distance: extractDistance(shot.shot)
        };
      });
      
      // Upload to Supabase
      const { data, error } = await supabase
        .from('shots')
        .insert(transformedShots);
      
      if (error) {
        console.error('Error uploading batch:', error);
        continue;
      }
      
      console.log(`Uploaded ${transformedShots.length} shots (${i + transformedShots.length}/${shots.length})`);
    }
    
    console.log('Upload completed successfully!');
  } catch (error) {
    console.error('Error processing shots:', error);
  }
}

// Get the season from command line argument
const season = process.argv[2];
if (!season) {
  console.error('Please provide a season year (e.g., node upload_shots.js 2013)');
  process.exit(1);
}

uploadShots(season); 