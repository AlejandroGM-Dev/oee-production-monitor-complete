PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS machines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  target_rate_per_hour INTEGER NOT NULL CHECK (target_rate_per_hour > 0),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS machine_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  machine_id INTEGER NOT NULL,
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'STATE_CHANGE',
      'ALARM',
      'PRODUCTION_COUNT'
    )
  ),
  previous_state TEXT CHECK (
    previous_state IS NULL OR previous_state IN (
      'RUNNING',
      'STOPPED',
      'ALARM',
      'MAINTENANCE'
    )
  ),
  new_state TEXT CHECK (
    new_state IS NULL OR new_state IN (
      'RUNNING',
      'STOPPED',
      'ALARM',
      'MAINTENANCE'
    )
  ),
  alarm_code TEXT,
  alarm_message TEXT,
  units_produced INTEGER CHECK (
    units_produced IS NULL OR units_produced >= 0
  ),
  timestamp TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),

  FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE CASCADE,

  CHECK (
    event_type != 'STATE_CHANGE'
    OR new_state IS NOT NULL
  ),

  CHECK (
    event_type != 'ALARM'
    OR alarm_code IS NOT NULL
    OR alarm_message IS NOT NULL
  ),

  CHECK (
    event_type != 'PRODUCTION_COUNT'
    OR units_produced IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_machine_events_machine_timestamp
ON machine_events(machine_id, timestamp, id);

CREATE INDEX IF NOT EXISTS idx_machine_events_machine_type_timestamp
ON machine_events(machine_id, event_type, timestamp, id);
