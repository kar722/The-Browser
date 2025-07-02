import pandas as pd
import numpy as np
from bs4 import BeautifulSoup
import os
from pathlib import Path
import json
import re

def clean_table(df):
    # Remove unnamed columns
    df = df.loc[:, ~df.columns.str.contains('^Unnamed')]
    # Remove duplicate header rows
    df = df[~df.index.duplicated(keep='first')]
    # Reset index if it's not unique
    if not df.index.is_unique:
        df = df.reset_index(drop=True)
    return df

def save_table(df, filename, data_dir):
    # Clean the table
    df = clean_table(df)
    # Save to CSV
    df.to_csv(data_dir / filename, index=False)
    print(f"Saved {filename}")

def extract_player_info(soup):
    """Extract player information from the meta div"""
    player_info = {}
    
    # Get the meta div that contains all player info
    meta_div = soup.find('div', {'id': 'meta'})
    if not meta_div:
        return player_info
        
    # Get full name
    name_h1 = meta_div.find('h1', {'itemprop': 'name'})
    if name_h1:
        player_info['full_name'] = name_h1.text.strip()
        
    # Get Instagram and nicknames
    p_tags = meta_div.find_all('p')
    for p in p_tags:
        text = p.text.strip()
        
        # Get Instagram
        instagram_link = p.find('a', href=lambda x: x and 'instagram' in x.lower())
        if instagram_link:
            player_info['instagram'] = instagram_link.text.strip()
            
        # Get nicknames
        if '(' in text and ')' in text:
            nicknames = text[text.find('(')+1:text.find(')')].strip()
            player_info['nicknames'] = [n.strip() for n in nicknames.split(',')]
            
        # Position and shooting hand
        if 'Position:' in text:
            position_text = text.split('Position:')[1]
            if '•' in position_text:
                position_text = position_text.split('•')[0]
            player_info['position'] = position_text.strip()
            
        if 'Shoots:' in text:
            player_info['shoots'] = text.split('Shoots:')[1].strip()
            
        # Height and weight
        height_weight = re.search(r'(\d+-\d+), (\d+)lb \((\d+)cm, (\d+)kg\)', text)
        if height_weight:
            player_info['height_ft_in'] = height_weight.group(1)
            player_info['weight_lb'] = height_weight.group(2)
            player_info['height_cm'] = height_weight.group(3)
            player_info['weight_kg'] = height_weight.group(4)
            
        # Team
        team_link = p.find('a', href=lambda x: x and '/teams/' in x)
        if team_link:
            player_info['team'] = team_link.text.strip()
            
        # Birth info
        if 'Born:' in text:
            birth_text = text.split('Born:')[1].strip()
            # Extract date
            date_match = re.search(r'([A-Za-z]+ \d+, \d{4})', birth_text)
            if date_match:
                player_info['birth_date'] = date_match.group(1)
            # Extract location
            location_match = re.search(r'in (.*?)(,|\(|$)', birth_text)
            if location_match:
                player_info['birth_place'] = location_match.group(1).strip()
                
        # College
        if 'College:' in text:
            college_link = p.find('a')
            if college_link:
                player_info['college'] = college_link.text.strip()
                
        # High School
        if 'High School:' in text:
            hs_text = text.split('High School:')[1].strip()
            player_info['high_school'] = hs_text.split(' in ')[0].strip()
            if ' in ' in hs_text:
                player_info['high_school_location'] = hs_text.split(' in ')[1].strip()
                
        # Recruiting Rank
        if 'Recruiting Rank:' in text:
            rank_text = text.split('Recruiting Rank:')[1].strip()
            player_info['recruiting_rank_year'] = re.search(r'\d{4}', rank_text).group() if re.search(r'\d{4}', rank_text) else None
            rank_num = re.search(r'\((\d+)\)', rank_text)
            if rank_num:
                player_info['recruiting_rank'] = rank_num.group(1)
                
        # Draft info
        if 'Draft:' in text:
            draft_text = text.split('Draft:')[1].strip()
            team_link = p.find('a', href=lambda x: x and '/teams/' in x)
            if team_link:
                player_info['draft_team'] = team_link.text.strip()
            round_pick = re.search(r'(\d+)(?:st|nd|rd|th) round \((\d+)(?:st|nd|rd|th) pick, (\d+)(?:st|nd|rd|th) overall\)', draft_text)
            if round_pick:
                player_info['draft_round'] = round_pick.group(1)
                player_info['draft_pick'] = round_pick.group(2)
                player_info['draft_overall'] = round_pick.group(3)
            year_link = p.find('a', href=lambda x: x and 'draft' in x.lower())
            if year_link:
                player_info['draft_year'] = year_link.text.strip()
                
        # NBA Debut
        if 'NBA Debut:' in text:
            debut_link = p.find('a')
            if debut_link:
                player_info['nba_debut'] = debut_link.text.strip()
                
        # Experience
        if 'Experience:' in text:
            exp = text.split('Experience:')[1].strip()
            player_info['experience'] = exp.split(' ')[0]
            
    return player_info

def main():
    # Create data directory
    data_dir = Path("data")
    data_dir.mkdir(parents=True, exist_ok=True)
    
    # Read the HTML file
    html_file = Path("AD-HTML/Anthony Davis Stats, Height, Weight, Position, Draft Status and more _ Basketball-Reference.com.html")
    with open(html_file, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Dictionary of table IDs and their output filenames
    tables_to_scrape = {
        'per_game': 'per_game.csv',
        'totals': 'totals.csv',
        'per_minute': 'per_36_minutes.csv',
        'per_poss': 'per_100_poss.csv',
        'advanced': 'advanced.csv',
        'adj_shooting': 'adjusted_shooting.csv',
        'pbp': 'play_by_play.csv',
        'shooting': 'shooting.csv',
        'highs': 'game_highs.csv',
        'playoffs_series': 'playoffs_series.csv',
        'all_star': 'all_star_games.csv',
        'all_college_stats': 'college_stats.csv'
    }
    
    # Extract and save player info
    player_info = extract_player_info(soup)
    with open(data_dir / 'player_info.json', 'w') as f:
        json.dump(player_info, f, indent=4)
    print("Saved player_info.json")
    
    # Extract tables
    for table_id, filename in tables_to_scrape.items():
        table = soup.find('table', {'id': table_id})
        if table:
            try:
                # Handle multi-index tables
                if table.get('class') and 'suppress_all' in table.get('class'):
                    # For suppressed tables, we need to handle them differently
                    headers = []
                    for th in table.find_all('th'):
                        if th.get('aria-label'):
                            headers.append(th['aria-label'])
                        else:
                            headers.append(th.text.strip())
                    
                    rows = []
                    for tr in table.find_all('tr', class_=lambda x: x != 'thead'):
                        row = []
                        for td in tr.find_all(['td', 'th']):
                            row.append(td.text.strip())
                        if row:
                            rows.append(row)
                    
                    df = pd.DataFrame(rows, columns=headers)
                else:
                    df = pd.read_html(str(table))[0]
                save_table(df, filename, data_dir)
            except Exception as e:
                print(f"Error processing table {table_id}: {e}")

if __name__ == "__main__":
    main() 