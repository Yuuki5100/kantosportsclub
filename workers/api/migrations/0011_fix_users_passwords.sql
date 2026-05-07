-- Repair corrupted seeded passwords and normalize to PBKDF2.
-- This fixes cases where earlier migrations left truncated values in users.password.

UPDATE users
SET password = 'pbkdf2-sha256$10000$3f347321712739e8bc0b05746409243f$38b5c7fde0c1cf72176cd979058b1270fef61c4727359492dffbca853ec6f629'
WHERE username IN ('admin', 'user', 'viewer');
