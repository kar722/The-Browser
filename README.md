# Anthony Davis Basketball Reference Scraper

This project creates a comprehensive database of Anthony Davis's NBA career by scraping all available statistics and information from Basketball Reference. This data will serve as the foundation for an Anthony Davis encyclopedia web application.

## Setup

1. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

Run the scraper:
```bash
python scrape_ad_stats.py
```

## Data Collection

The scraper collects the following data, organized in the `data` directory:

### Basic Information
- `player_info.json`: Comprehensive player information including:
  - Basic biographical data
  - Physical measurements
  - Draft information
  - NBA debut details
  - Nicknames
  - Teams played for

### Career Statistics
1. Regular Season Statistics (`*_stats.csv`):
   - Per Game statistics
   - Per 36 Minutes statistics
   - Per 100 Possessions statistics
   - Advanced statistics

2. Playoff Statistics (`playoffs_*_stats.csv`):
   - Per Game statistics
   - Per 36 Minutes statistics
   - Per 100 Possessions statistics
   - Advanced statistics

### Detailed Game Data
1. Game Logs (`game_logs/`):
   - Regular season game logs by season
   - Playoff game logs by season
   - Detailed statistics for each game played

2. Play-by-Play Data (`play_by_play/`):
   - Detailed play-by-play statistics by season
   - On-court/Off-court impact

### Statistical Breakdowns
1. Splits (`splits/`):
   - Home/Away splits
   - Monthly splits
   - By opponent
   - By day of week
   - Other situational splits

2. Shooting Data (`shooting/`):
   - Shot types and locations
   - Shooting percentages by distance
   - Shooting percentages by type

### Career Achievements
1. Game Highs (`game_highs/`):
   - Career highs in various statistical categories
   - Season highs

2. Awards and Honors (`awards/`):
   - All-Star selections
   - All-NBA teams
   - Other awards and achievements

### Historical Data
- `transactions/transactions.json`: Complete history of trades, signings, and other transactions

## Data Structure

Each type of data is stored in its own subdirectory within the `data` folder for better organization. Most statistical data is stored in CSV format for easy analysis, while metadata and textual information is stored in JSON format.

## Note

This scraper is designed to be respectful of Basketball Reference's servers and includes appropriate delays between requests. Please use the data in accordance with Basketball Reference's terms of service.

## Future Enhancements
- College statistics scraping
- International statistics scraping
- Advanced analytics and visualization tools
- API endpoint creation for web application
