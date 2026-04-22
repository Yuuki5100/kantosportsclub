INSERT INTO status_levels (status_level_id, status_level_name)
VALUES
    (1, 'NONE'),
    (2, 'READ'),
    (3, 'UPDATE')
ON DUPLICATE KEY UPDATE
    status_level_name = VALUES(status_level_name);

INSERT INTO permissions (permission_id, permission_name, module, creator_user_name)
VALUES
    (1, 'USER', 'USER', 'admin'),
    (2, 'ROLE', 'ROLE', 'admin'),
    (3, 'SYSTEM_SETTINGS', 'SYSTEM', 'admin'),
    (4, 'NOTICE', 'NOTICE', 'admin'),
    (5, 'MANUAL', 'MANUAL', 'admin'),
    (6, 'MOVIE', 'MEDIA', 'admin'),
    (7, 'PICTURE', 'MEDIA', 'admin')
ON DUPLICATE KEY UPDATE
    permission_name = VALUES(permission_name),
    module = VALUES(module),
    creator_user_name = VALUES(creator_user_name);

INSERT INTO role_permissions (role_id, permission_id, status_level_id)
VALUES
    (1, 1, 3),
    (1, 2, 3),
    (1, 3, 3),
    (1, 4, 3),
    (1, 5, 3),
    (1, 6, 1),
    (1, 7, 1)
ON DUPLICATE KEY UPDATE
    status_level_id = VALUES(status_level_id);
