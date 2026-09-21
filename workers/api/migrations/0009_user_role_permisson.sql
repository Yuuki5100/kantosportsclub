DELETE FROM user_role_permissions
WHERE user_id IN (4, 5, 6, 7, 8, 9, 10, 11, 12);

-- 0008_adduser.sql removes the users that used to occupy IDs 4-12.  The old
-- hard-coded INSERTs therefore violate the users(id) foreign key.  User and
-- permission data is rebuilt from usernames by 0024_users_and_permissions_sync.sql.
