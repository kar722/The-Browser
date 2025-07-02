import os
import glob
from pathlib import Path

def add_csv_extension(directory):
    # Get all files in the current directory that don't have an extension
    files = [f for f in os.listdir(directory) if os.path.isfile(os.path.join(directory, f)) and '.' not in f]
    
    for file in files:
        old_path = os.path.join(directory, file)
        new_path = os.path.join(directory, f"{file}.csv")
        
        # Rename the file
        try:
            os.rename(old_path, new_path)
            print(f"Renamed: {old_path} -> {new_path}")
        except Exception as e:
            print(f"Error renaming {old_path}: {e}")

def process_year_directory(year_dir):
    # Process files in the year directory
    add_csv_extension(year_dir)
    
    # Process files in the playoffs subdirectory if it exists
    playoffs_dir = os.path.join(year_dir, "playoffs")
    if os.path.exists(playoffs_dir):
        add_csv_extension(playoffs_dir)

def main():
    # Get the base directory where the script is located
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Process each year directory
    for year in range(2013, 2026):  # 2013 to 2025
        year_dir = os.path.join(base_dir, str(year))
        if os.path.exists(year_dir):
            print(f"\nProcessing year {year}...")
            process_year_directory(year_dir)

if __name__ == "__main__":
    main() 