-- Create indexes for better query performance
DO $$
DECLARE
    season_start INT;
    season_end INT;
    table_name TEXT;
BEGIN
    FOR season_end IN 2013..2025 LOOP
        -- Handle 2012-2013 season special case
        IF season_end = 2013 THEN
            season_start := 2012;
        ELSE
            season_start := season_end - 1;
        END IF;
        
        table_name := 'game_logs_' || season_start || '_' || season_end;
        
        -- Create index on date for chronological queries
        EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I (date)',
            'idx_' || table_name || '_date',
            table_name
        );
        
        -- Create index on team for filtering by team
        EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I (team)',
            'idx_' || table_name || '_team',
            table_name
        );
        
        -- Create index on is_away for home/away game filtering
        EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I (is_away)',
            'idx_' || table_name || '_is_away',
            table_name
        );
    END LOOP;
END $$; 