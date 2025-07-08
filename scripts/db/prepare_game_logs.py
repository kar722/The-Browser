import pandas as pd
import glob
import os
from datetime import datetime

def clean_column_name(col):
    """Clean column names to be Supabase friendly"""
    # Special column mappings
    column_mapping = {
        'FG%': 'fg_pct',
        '3P': 'three_p',
        '3PA': 'three_pa',
        '3P%': 'three_p_pct',
        '2P': 'two_p',
        '2PA': 'two_pa',
        '2P%': 'two_p_pct',
        'eFG%': 'efg_pct',
        'FT%': 'ft_pct',
        '+/-': 'plus_minus',
        '': 'is_away'  # Blank column indicates home/away
    }
    
    if col in column_mapping:
        return column_mapping[col]
    
    # For other columns, just make them lowercase and replace spaces with underscores
    return col.strip().lower().replace(' ', '_')

def process_game_logs():
    # Get all CSV files in the game_logs directory
    csv_files = glob.glob('data/game_logs/game_logs_*.csv')
    
    # Create output directory if it doesn't exist
    os.makedirs('scripts/db/output', exist_ok=True)
    
    # SQL types mapping
    sql_types = {
        'int64': 'integer',
        'float64': 'numeric',
        'object': 'text',
        'datetime64[ns]': 'timestamp',
        'bool': 'boolean'
    }
    
    # Combined SQL file for all table creations
    all_sql = []
    
    for file in csv_files:
        # Get season from filename
        season = int(file.split('_')[-1].replace('.csv', ''))
        
        # Handle season naming
        if season == 2013:
            season_start = 2012  # Special case for 2012-2013 season
        else:
            season_start = season - 1
            
        season_name = f"{season_start}_{season}"
        table_name = f"game_logs_{season_start}_{season}"
        
        # Read CSV file
        df = pd.read_csv(file)
        
        # Save the away game information before column renaming
        away_games = df.iloc[:, 5] == '@'  # The blank column is at index 5
        
        # Clean column names
        df.columns = [clean_column_name(col) for col in df.columns]
        
        # Set the is_away column and drop the unnamed column
        df['is_away'] = away_games
        df = df.drop('unnamed:_5', axis=1)
        
        # Convert date to proper format
        df['date'] = pd.to_datetime(df['date'])
        
        # Sort by date to ensure chronological order
        df = df.sort_values('date')
        
        # Save gtm values before filtering
        gtm_values = df['gtm'].copy()
        
        # Filter out non-played games
        played_games = df[pd.to_numeric(df['gs'], errors='coerce').notna()].copy()
        
        # Add id column as primary key
        played_games['id'] = range(1, len(played_games) + 1)
        
        # Reorder columns to put id first
        cols = ['id'] + [col for col in played_games.columns if col != 'id']
        played_games = played_games[cols]
        
        # Export to CSV
        output_csv = f'scripts/db/output/game_logs_{season_start}_{season}.csv'
        played_games.to_csv(output_csv, index=False)
        print(f"Exported {season_name} data to {output_csv}")
        
        # Create SQL table definition
        sql_columns = []
        for col in played_games.columns:
            dtype = str(played_games[col].dtype)
            sql_type = sql_types.get(dtype, 'text')
            
            # Special case for id column
            if col == 'id':
                sql_columns.append(f"    id integer primary key")
            else:
                sql_columns.append(f"    {col} {sql_type}")
        
        sql_create = f"-- {season_start}-{season} Season\n"
        sql_create += f"create table {table_name} (\n" + ",\n".join(sql_columns) + "\n);\n\n"
        all_sql.append(sql_create)
    
    # Save all SQL statements to a single file
    with open('scripts/db/create_game_logs_tables.sql', 'w') as f:
        f.write("-- Anthony Davis Game Logs Tables\n\n")
        f.writelines(all_sql)
    print("\nSQL table definitions exported to scripts/db/create_game_logs_tables.sql")

if __name__ == "__main__":
    process_game_logs() 