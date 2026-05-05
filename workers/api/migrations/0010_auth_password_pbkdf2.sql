-- Move default seeded users from bcrypt cost 12 to Workers-native PBKDF2.
-- Custom passwords are not overwritten: only the known 0008 seed hash is replaced.

UPDATE users
SET password = 'pbkdf2-sha256$10000$1ff2cbb110ccc645a068285e885d20ab$f9f77d02b0098d27656ef68210ec337b96e09450c58389f3288e4fc5825f12bc'
WHERE username = 'admin'
  AND password = '$2b$12$NipHmH6Z.Ml1RInl1FEyeeFgZhHCpbHQuxvLqxew3rTJywzS9QHm.';

UPDATE users
SET password = 'pbkdf2-sha256$10000$a4960d1d636808e6fdd7b5c463d26d31$0d278a36d8b862396a8f1b202416cab4bbfa76d0e4a8e70b802438d44c7e1fd0'
WHERE username = 'user'
  AND password = '$2b$12$NipHmH6Z.Ml1RInl1FEyeeFgZhHCpbHQuxvLqxew3rTJywzS9QHm.';

UPDATE users
SET password = 'pbkdf2-sha256$10000$efb7b736a970525edf6f706605f19ffe$b687037423ce76ca925ad88bfbe12c917bd18be629562ba0ac3134df11b24bcd'
WHERE username = 'viewer'
  AND password = '$2b$12$NipHmH6Z.Ml1RInl1FEyeeFgZhHCpbHQuxvLqxew3rTJywzS9QHm.';
