CREATE TABLE IF NOT EXISTS User (
  id TEXT PRIMARY KEY, 
  name TEXT, 
  email TEXT, 
  emailVerified TEXT, 
  image TEXT
); 

CREATE TABLE IF NOT EXISTS Session (
  id TEXT PRIMARY KEY, 
  expires TEXT, 
  sessionToken TEXT, 
  userID TEXT, 
)