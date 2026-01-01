export const CREATE_STREAK_TABLE = `CREATE TABLE IF NOT EXISTS streaks (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT UNIQUE, streak INTEGER, bestStreak INTEGER);`;

export const GET_STREAKS = `SELECT * FROM streaks ORDER BY date DESC LIMIT 7;`;

export const GET_STREAK = `SELECT * FROM streaks ORDER BY date DESC LIMIT 1;`;

export const UPDATE_STREAK = `INSERT INTO streaks (date, streak, bestStreak) VALUES (datetime('now', 'localtime'), ?, ?);`;

export const DELETE_ALL_STEAKS = `DELETE FROM streaks`;

export const DELETE_LAST_STREAK = `WITH last_streak AS (
    SELECT id FROM streaks ORDER BY date DESC LIMIT 1
)
DELETE FROM streaks 
WHERE id = (SELECT id FROM last_streak)
RETURNING *;`;

