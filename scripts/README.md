# Shot Data Upload Scripts

This directory contains scripts for uploading Anthony Davis's shot data to Supabase.

## Setup

1. First, create the shots table in your Supabase database:
   - Copy the contents of `create_shots_table.sql`
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Paste the SQL and run it

2. Install dependencies:
   ```bash
   npm install @supabase/supabase-js
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   ```
   Note: Use the service key (not the anon key) as we need write permissions.

## Usage

To upload shot data for a specific season:

```bash
node upload_shots.js 2013
```

Replace `2013` with the desired season year. The script will:
1. Read the corresponding JSON file (e.g., `shots_2013.json`)
2. Parse and transform the data
3. Upload it to Supabase in batches
4. Show progress in the console

## Data Structure

The shots table in Supabase will contain:
- `x`, `y`: Shot coordinates
- `shot_type`: 'make' or 'miss'
- `game_date`: Date of the game
- `season`: Season in format '2012-2013'
- `quarter`: Quarter of the game
- `time_remaining`: Time remaining in the quarter
- `shot_description`: Description of the shot
- `score_situation`: Game score at the time
- `distance`: Shot distance in feet

## Error Handling

The script:
- Processes shots in batches of 100
- Continues even if one batch fails
- Logs errors to the console
- Shows upload progress 