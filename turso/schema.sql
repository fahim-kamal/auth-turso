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

  FOREIGN KEY (userID) REFERENCES User (id)
    ON DELETE CASCADE
);