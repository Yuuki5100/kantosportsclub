-- Move default seeded users from bcrypt cost 12 to Workers-native PBKDF2.
-- Custom passwords are not overwritten: only the known 0008 seed hash is replaced.

UPDATE users
SET password = 'pbkdf2-sha256$10000$3f347321712739e8bc0b05746409243f$38b5c7fde0c1cf72176cd979058b1270fef61c4727359492dffbca853ec6f629'
WHERE username = 'admin'
  AND password = '$2b$12$NipHmH6Z.Ml1RInl1FEyeeFgZhHCpbHQuxvLqxew3rTJywzS9QHm.';

UPDATE users
SET password = 'pbkdf2-sha256$10000$3f347321712739e8bc0b05746409243f$38b5c7fde0c1cf72176cd979058b1270fef61c4727359492dffbca853ec6f629'
WHERE username = 'user'
  AND password = '$2b$12$NipHmH6Z.Ml1RInl1FEyeeFgZhHCpbHQuxvLqxew3rTJywzS9QHm.';

UPDATE users
SET password = 'pbkdf2-sha256$10000$3f347321712739e8bc0b05746409243f$38b5c7fde0c1cf72176cd979058b1270fef61c4727359492dffbca853ec6f629'
WHERE username = 'viewer'
  AND password = '$2b$12$NipHmH6Z.Ml1RInl1FEyeeFgZhHCpbHQuxvLqxew3rTJywzS9QHm.';
