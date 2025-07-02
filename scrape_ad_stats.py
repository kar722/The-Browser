import time
import json
import pandas as pd
import numpy as np
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from webdriver_manager.chrome import ChromeDriverManager
from pathlib import Path
import os
from tqdm import tqdm

class BasketballReferenceScraper:
    def __init__(self):
        self.base_url = "https://www.basketball-reference.com"
        self.player_url = f"{self.base_url}/players/d/davisan02.html"
        self.first_season = "2012-13"  # AD's first season
        self.current_season = "2024-25"  # Current season
        self.seasons = [
            f"{year}-{str(year+1)[-2:]}" for year in range(2012, 2025)
        ]
        
        # Setup Chrome options
        self.chrome_options = Options()
        self.chrome_options.add_argument('--headless')
        self.chrome_options.add_argument('--no-sandbox')
        self.chrome_options.add_argument('--disable-dev-shm-usage')
        
        # Initialize webdriver
        self.driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()),
            options=self.chrome_options
        )
        self.driver.implicitly_wait(10)
        time.sleep(2)  # Allow driver to fully initialize
        
        # Create data directories
        self.data_dir = Path("ad_stats")
        for subdir in ['game_logs', 'advanced_logs', 'lineups']:
            (self.data_dir / subdir).mkdir(parents=True, exist_ok=True)

    def get_soup(self, url, wait_time=2):
        """Get BeautifulSoup object for a given URL"""
        try:
            self.driver.get(url)
            time.sleep(wait_time)  # Wait for dynamic content to load
            return BeautifulSoup(self.driver.page_source, 'html.parser')
        except Exception as e:
            print(f"Error getting page content: {str(e)}")
            return None

    def scrape_player_info(self):
        """Scrape comprehensive player information"""
        print("Fetching player information...")
        soup = self.get_soup(self.player_url)
        if not soup:
            return None
        
        info_div = soup.find('div', {'id': 'meta'})
        if not info_div:
            return None
        
        player_info = {
            'basic_info': {},
            'physical_stats': {},
            'draft_info': {},
            'career_stats': {},
            'awards': [],
            'college_stats': {}
        }
        
        try:
            # Basic info
            player_info['basic_info']['name'] = info_div.find('h1', {'itemprop': 'name'}).text.strip()
            player_info['basic_info']['position'] = info_div.find('strong', text='Position').next_sibling.strip()
            
            # Physical stats
            height_weight = info_div.find('span', {'itemprop': 'height'}).next_sibling
            player_info['physical_stats']['height'] = height_weight.split(',')[0].strip()
            player_info['physical_stats']['weight'] = height_weight.split(',')[1].strip()
            
            # Career stats from stats tables
            for table_id in ['per_game', 'totals', 'per_36', 'per_100', 'advanced']:
                table = soup.find('table', {'id': table_id})
                if table:
                    df = pd.read_html(str(table))[0]
                    df.to_csv(self.data_dir / 'player_info' / f'{table_id}.csv', index=False)
                    
            return player_info
            
        except Exception as e:
            print(f"Error scraping player info: {str(e)}")
            return None

    def scrape_game_logs(self, season):
        """Scrape regular game logs for a given season"""
        print(f"Scraping game logs for {season} season...")
        # Get the end year for the URL (e.g., "2012-13" -> "2013")
        end_year = season.split("-")[1]
        if len(end_year) == 2:
            end_year = "20" + end_year
        
        url = f"{self.base_url}/players/d/davisan02/gamelog/{end_year}"
        soup = self.get_soup(url)
        
        if not soup:
            return None
            
        # Find the regular season game log table
        table = soup.find('table', {'id': 'pgl_basic'})
        if not table:
            print(f"No game log table found for season {season}")
            return None
            
        # Convert table to DataFrame
        df = pd.read_html(str(table))[0]
        
        # Clean up the DataFrame
        df = df[df['Rk'].notna()]  # Remove header rows
        df = df.drop(['Rk', 'Unnamed: 5', 'Unnamed: 7'], axis=1, errors='ignore')
        
        # Save to CSV
        output_file = self.data_dir / 'game_logs' / f'regular_{season}.csv'
        df.to_csv(output_file, index=False)
        print(f"Saved game logs to {output_file}")

    def scrape_advanced_logs(self, season):
        """Scrape advanced game logs for a given season"""
        print(f"Scraping advanced game logs for {season} season...")
        # Get the end year for the URL
        end_year = season.split("-")[1]
        if len(end_year) == 2:
            end_year = "20" + end_year
            
        url = f"{self.base_url}/players/d/davisan02/gamelog-advanced/{end_year}"
        soup = self.get_soup(url)
        
        if not soup:
            return None
            
        # Find the advanced game log table
        table = soup.find('table', {'id': 'pgl_advanced'})
        if not table:
            print(f"No advanced game log table found for season {season}")
            return None
            
        # Convert table to DataFrame
        df = pd.read_html(str(table))[0]
        
        # Clean up the DataFrame
        df = df[df['Rk'].notna()]  # Remove header rows
        df = df.drop(['Rk', 'Unnamed: 5', 'Unnamed: 7'], axis=1, errors='ignore')
        
        # Save to CSV
        output_file = self.data_dir / 'advanced_logs' / f'advanced_{season}.csv'
        df.to_csv(output_file, index=False)
        print(f"Saved advanced game logs to {output_file}")

    def scrape_lineups(self, season):
        """Scrape lineup combinations for a given season"""
        print(f"Scraping lineup combinations for {season} season...")
        # Get the end year for the URL
        end_year = season.split("-")[1]
        if len(end_year) == 2:
            end_year = "20" + end_year
            
        url = f"{self.base_url}/players/d/davisan02/lineups/{end_year}"
        soup = self.get_soup(url)
        
        if not soup:
            return None
            
        lineup_data = {}
        
        # Scrape 5-man lineups
        table = soup.find('table', {'id': 'lineups-5-man'})
        if table:
            df = pd.read_html(str(table))[0]
            # Convert DataFrame to dict with string keys
            records = df.to_dict('records')
            # Convert any non-serializable values to strings
            lineup_data['5-man'] = [{str(k): str(v) if not isinstance(v, (int, float, str, bool, type(None))) else v 
                                   for k, v in record.items()} 
                                  for record in records]
            
        # Scrape 4-man lineups
        table = soup.find('table', {'id': 'lineups-4-man'})
        if table:
            df = pd.read_html(str(table))[0]
            records = df.to_dict('records')
            lineup_data['4-man'] = [{str(k): str(v) if not isinstance(v, (int, float, str, bool, type(None))) else v 
                                   for k, v in record.items()} 
                                  for record in records]
            
        # Scrape 3-man lineups
        table = soup.find('table', {'id': 'lineups-3-man'})
        if table:
            df = pd.read_html(str(table))[0]
            records = df.to_dict('records')
            lineup_data['3-man'] = [{str(k): str(v) if not isinstance(v, (int, float, str, bool, type(None))) else v 
                                   for k, v in record.items()} 
                                  for record in records]
            
        # Scrape 2-man lineups
        table = soup.find('table', {'id': 'lineups-2-man'})
        if table:
            df = pd.read_html(str(table))[0]
            records = df.to_dict('records')
            lineup_data['2-man'] = [{str(k): str(v) if not isinstance(v, (int, float, str, bool, type(None))) else v 
                                   for k, v in record.items()} 
                                  for record in records]
        
        if lineup_data:
            # Save to JSON
            output_file = self.data_dir / 'lineups' / f'lineups_{season}.json'
            with open(output_file, 'w') as f:
                json.dump(lineup_data, f, indent=2)
            print(f"Saved lineup combinations to {output_file}")

    def scrape_on_off(self, season):
        """Scrape on-off stats for a season"""
        print(f"Scraping on-off stats for {season}")
        url = f"{self.base_url}/players/d/davisan02/on-off/{season}"
        soup = self.get_soup(url)
        if soup:
            table = soup.find('table', {'id': 'on-off'})
            if table:
                df = pd.read_html(str(table))[0]
                df.to_csv(self.data_dir / 'on_off' / f'on_off_{season}.csv', index=False)
                print(f"Saved on-off stats for {season}")

    def scrape_all_seasons(self):
        """Scrape data for all seasons"""
        for season in tqdm(self.seasons):
            self.scrape_game_logs(season)
            self.scrape_advanced_logs(season)
            self.scrape_lineups(season)
            self.scrape_on_off(season)
            time.sleep(2)  # Delay between seasons to avoid rate limiting

    def close(self):
        """Close the webdriver"""
        self.driver.quit()

if __name__ == "__main__":
    scraper = BasketballReferenceScraper()
    try:
        scraper.scrape_all_seasons()
    finally:
        scraper.close() 