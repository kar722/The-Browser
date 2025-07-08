-- Example queries for Anthony Davis's game logs

-- 1. Basic season stats (points, rebounds, assists averages)
WITH all_seasons AS (
    SELECT 
        CASE 
            WHEN date >= '2024-10-01' THEN '2024-25'
            WHEN date >= '2023-10-01' THEN '2023-24'
            WHEN date >= '2022-10-01' THEN '2022-23'
            WHEN date >= '2021-10-01' THEN '2021-22'
            WHEN date >= '2020-12-01' THEN '2020-21' -- COVID season started late
            WHEN date >= '2019-10-01' THEN '2019-20'
            WHEN date >= '2018-10-01' THEN '2018-19'
            WHEN date >= '2017-10-01' THEN '2017-18'
            WHEN date >= '2016-10-01' THEN '2016-17'
            WHEN date >= '2015-10-01' THEN '2015-16'
            WHEN date >= '2014-10-01' THEN '2014-15'
            WHEN date >= '2013-10-01' THEN '2013-14'
            ELSE '2012-13'
        END as season,
        CAST(pts AS numeric) as pts,
        CAST(trb AS numeric) as trb,
        CAST(ast AS numeric) as ast,
        CAST(blk AS numeric) as blk,
        CAST(stl AS numeric) as stl,
        mp
    FROM (
        SELECT * FROM game_logs_2012_2013
        UNION ALL SELECT * FROM game_logs_2013_2014
        UNION ALL SELECT * FROM game_logs_2014_2015
        UNION ALL SELECT * FROM game_logs_2015_2016
        UNION ALL SELECT * FROM game_logs_2016_2017
        UNION ALL SELECT * FROM game_logs_2017_2018
        UNION ALL SELECT * FROM game_logs_2018_2019
        UNION ALL SELECT * FROM game_logs_2019_2020
        UNION ALL SELECT * FROM game_logs_2020_2021
        UNION ALL SELECT * FROM game_logs_2021_2022
        UNION ALL SELECT * FROM game_logs_2022_2023
        UNION ALL SELECT * FROM game_logs_2023_2024
        UNION ALL SELECT * FROM game_logs_2024_2025
    ) all_games
)
SELECT 
    season,
    COUNT(*) as games_played,
    ROUND(AVG(pts), 1) as ppg,
    ROUND(AVG(trb), 1) as rpg,
    ROUND(AVG(ast), 1) as apg,
    ROUND(AVG(blk), 1) as bpg,
    ROUND(AVG(stl), 1) as spg
FROM all_seasons
GROUP BY season
ORDER BY season;

-- 2. Career highs
WITH career_highs AS (
    SELECT 
        date,
        team,
        opp,
        result,
        CAST(pts AS numeric) as pts,
        CAST(trb AS numeric) as trb,
        CAST(ast AS numeric) as ast,
        CAST(blk AS numeric) as blk,
        CAST(stl AS numeric) as stl
    FROM (
        SELECT * FROM game_logs_2012_2013
        UNION ALL SELECT * FROM game_logs_2013_2014
        UNION ALL SELECT * FROM game_logs_2014_2015
        UNION ALL SELECT * FROM game_logs_2015_2016
        UNION ALL SELECT * FROM game_logs_2016_2017
        UNION ALL SELECT * FROM game_logs_2017_2018
        UNION ALL SELECT * FROM game_logs_2018_2019
        UNION ALL SELECT * FROM game_logs_2019_2020
        UNION ALL SELECT * FROM game_logs_2020_2021
        UNION ALL SELECT * FROM game_logs_2021_2022
        UNION ALL SELECT * FROM game_logs_2022_2023
        UNION ALL SELECT * FROM game_logs_2023_2024
        UNION ALL SELECT * FROM game_logs_2024_2025
    ) all_games
)
SELECT * FROM (
    SELECT 
        'Points' as category,
        pts as value,
        date,
        team,
        opp,
        result
    FROM career_highs
    WHERE pts = (SELECT MAX(pts) FROM career_highs)
    
    UNION ALL
    
    SELECT 
        'Rebounds' as category,
        trb as value,
        date,
        team,
        opp,
        result
    FROM career_highs
    WHERE trb = (SELECT MAX(trb) FROM career_highs)
    
    UNION ALL
    
    SELECT 
        'Assists' as category,
        ast as value,
        date,
        team,
        opp,
        result
    FROM career_highs
    WHERE ast = (SELECT MAX(ast) FROM career_highs)
    
    UNION ALL
    
    SELECT 
        'Blocks' as category,
        blk as value,
        date,
        team,
        opp,
        result
    FROM career_highs
    WHERE blk = (SELECT MAX(blk) FROM career_highs)
    
    UNION ALL
    
    SELECT 
        'Steals' as category,
        stl as value,
        date,
        team,
        opp,
        result
    FROM career_highs
    WHERE stl = (SELECT MAX(stl) FROM career_highs)
) career_bests
ORDER BY category;

-- 3. Home vs Away performance
WITH home_away AS (
    SELECT 
        is_away,
        CAST(pts AS numeric) as pts,
        CAST(trb AS numeric) as trb,
        CAST(ast AS numeric) as ast,
        CAST(blk AS numeric) as blk,
        CAST(stl AS numeric) as stl,
        team
    FROM (
        SELECT * FROM game_logs_2012_2013
        UNION ALL SELECT * FROM game_logs_2013_2014
        UNION ALL SELECT * FROM game_logs_2014_2015
        UNION ALL SELECT * FROM game_logs_2015_2016
        UNION ALL SELECT * FROM game_logs_2016_2017
        UNION ALL SELECT * FROM game_logs_2017_2018
        UNION ALL SELECT * FROM game_logs_2018_2019
        UNION ALL SELECT * FROM game_logs_2019_2020
        UNION ALL SELECT * FROM game_logs_2020_2021
        UNION ALL SELECT * FROM game_logs_2021_2022
        UNION ALL SELECT * FROM game_logs_2022_2023
        UNION ALL SELECT * FROM game_logs_2023_2024
        UNION ALL SELECT * FROM game_logs_2024_2025
    ) all_games
)
SELECT 
    CASE WHEN is_away THEN 'Away' ELSE 'Home' END as location,
    COUNT(*) as games,
    ROUND(AVG(pts), 1) as ppg,
    ROUND(AVG(trb), 1) as rpg,
    ROUND(AVG(ast), 1) as apg,
    ROUND(AVG(blk), 1) as bpg,
    ROUND(AVG(stl), 1) as spg
FROM home_away
GROUP BY is_away
ORDER BY location;

-- 4. Performance against specific teams
WITH vs_teams AS (
    SELECT 
        opp,
        CAST(pts AS numeric) as pts,
        CAST(trb AS numeric) as trb,
        CAST(ast AS numeric) as ast,
        CAST(blk AS numeric) as blk,
        CAST(stl AS numeric) as stl,
        CAST(CASE WHEN result LIKE 'W%' THEN 1 ELSE 0 END AS numeric) as is_win
    FROM (
        SELECT * FROM game_logs_2012_2013
        UNION ALL SELECT * FROM game_logs_2013_2014
        UNION ALL SELECT * FROM game_logs_2014_2015
        UNION ALL SELECT * FROM game_logs_2015_2016
        UNION ALL SELECT * FROM game_logs_2016_2017
        UNION ALL SELECT * FROM game_logs_2017_2018
        UNION ALL SELECT * FROM game_logs_2018_2019
        UNION ALL SELECT * FROM game_logs_2019_2020
        UNION ALL SELECT * FROM game_logs_2020_2021
        UNION ALL SELECT * FROM game_logs_2021_2022
        UNION ALL SELECT * FROM game_logs_2022_2023
        UNION ALL SELECT * FROM game_logs_2023_2024
        UNION ALL SELECT * FROM game_logs_2024_2025
    ) all_games
)
SELECT 
    opp,
    COUNT(*) as games,
    ROUND(AVG(pts), 1) as ppg,
    ROUND(AVG(trb), 1) as rpg,
    ROUND(AVG(ast), 1) as apg,
    ROUND(AVG(blk), 1) as bpg,
    ROUND(AVG(stl), 1) as spg,
    ROUND(AVG(is_win) * 100, 1) as win_pct
FROM vs_teams
GROUP BY opp
ORDER BY ppg DESC;

-- 5. Best scoring games
SELECT 
    date,
    team,
    opp,
    result,
    pts,
    trb,
    ast,
    blk,
    stl,
    mp,
    fg || '-' || fga as fg,
    three_p || '-' || three_pa as three_p,
    ft || '-' || fta as ft
FROM (
    SELECT * FROM game_logs_2012_2013
    UNION ALL SELECT * FROM game_logs_2013_2014
    UNION ALL SELECT * FROM game_logs_2014_2015
    UNION ALL SELECT * FROM game_logs_2015_2016
    UNION ALL SELECT * FROM game_logs_2016_2017
    UNION ALL SELECT * FROM game_logs_2017_2018
    UNION ALL SELECT * FROM game_logs_2018_2019
    UNION ALL SELECT * FROM game_logs_2019_2020
    UNION ALL SELECT * FROM game_logs_2020_2021
    UNION ALL SELECT * FROM game_logs_2021_2022
    UNION ALL SELECT * FROM game_logs_2022_2023
    UNION ALL SELECT * FROM game_logs_2023_2024
    UNION ALL SELECT * FROM game_logs_2024_2025
) all_games
ORDER BY pts DESC
LIMIT 10;

-- 6. Double-doubles and triple-doubles
WITH performance_types AS (
    SELECT 
        date,
        team,
        opp,
        result,
        CAST(pts AS numeric) as pts,
        CAST(trb AS numeric) as trb,
        CAST(ast AS numeric) as ast,
        CAST(blk AS numeric) as blk,
        CASE 
            WHEN CAST(pts AS numeric) >= 10 AND CAST(trb AS numeric) >= 10 AND CAST(ast AS numeric) >= 10 THEN 'Triple-double'
            WHEN (CAST(pts AS numeric) >= 10 AND CAST(trb AS numeric) >= 10) OR 
                 (CAST(pts AS numeric) >= 10 AND CAST(ast AS numeric) >= 10) OR 
                 (CAST(trb AS numeric) >= 10 AND CAST(ast AS numeric) >= 10) THEN 'Double-double'
            ELSE 'Regular'
        END as game_type
    FROM (
        SELECT * FROM game_logs_2012_2013
        UNION ALL SELECT * FROM game_logs_2013_2014
        UNION ALL SELECT * FROM game_logs_2014_2015
        UNION ALL SELECT * FROM game_logs_2015_2016
        UNION ALL SELECT * FROM game_logs_2016_2017
        UNION ALL SELECT * FROM game_logs_2017_2018
        UNION ALL SELECT * FROM game_logs_2018_2019
        UNION ALL SELECT * FROM game_logs_2019_2020
        UNION ALL SELECT * FROM game_logs_2020_2021
        UNION ALL SELECT * FROM game_logs_2021_2022
        UNION ALL SELECT * FROM game_logs_2022_2023
        UNION ALL SELECT * FROM game_logs_2023_2024
        UNION ALL SELECT * FROM game_logs_2024_2025
    ) all_games
)
SELECT 
    game_type,
    COUNT(*) as count,
    ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM performance_types) * 100, 1) as percentage
FROM performance_types
GROUP BY game_type
ORDER BY 
    CASE game_type 
        WHEN 'Triple-double' THEN 1
        WHEN 'Double-double' THEN 2
        ELSE 3
    END; 