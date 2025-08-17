-- migrate:up
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret TEXT,
    is_verified BOOL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login DATETIME NULL
);

CREATE TABLE IF NOT EXISTS refresh_tokens(
  id INT AUTO_INCREMENT PRIMARY KEY, 
  user_id INT NOT NULL, 
  token_hash VARCHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL, 
  created_at DATETIME  DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS verification_tokens(
  id INT AUTO_INCREMENT PRIMARY KEY, 
  user_id INT NOT NULL UNIQUE, 
  token_hash VARCHAR(64) NOT NULL,
  token_type ENUM('email_verification', 'password_reset') NOT NULL,
  expires_at DATETIME NOT NULL, 
  created_at DATETIME  DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS recovery_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    code_hash VARCHAR(255) NOT NULL, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_code_hash (code_hash)
);


-- migrate:down
DROP TABLE user;
DROP TABLE refresh_tokens;
DROP TABLE verification_tokens;
