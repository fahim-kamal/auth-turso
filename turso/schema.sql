CREATE TABLE IF NOT EXISTS User (
  id TEXT PRIMARY KEY, 
  name TEXT, 
  email TEXT, 
  emailVerified TEXT, 
  image TEXT,

  unique(email)
);

CREATE TABLE IF NOT EXISTS Session (
  id TEXT PRIMARY KEY, 
  expires TEXT, 
  sessionToken TEXT, 
  userId TEXT,

  FOREIGN KEY (userId) REFERENCES User (id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Account (
  id TEXT PRIMARY KEY, 
  userId TEXT, 
  type TEXT, 
  provider TEXT, 
  providerAccountId TEXT, 
  refresh_token TEXT, 
  access_token TEXT, 
  expires_at NUMBER, 
  token_type TEXT, 
  scope TEXT, 
  id_token TEXT, 
  session_state TEXT,

  FOREIGN KEY (userId) REFERENCES User (id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS VerificationToken (
  token TEXT PRIMARY KEY, 
  identifier TEXT, 
  expires TEXT
);