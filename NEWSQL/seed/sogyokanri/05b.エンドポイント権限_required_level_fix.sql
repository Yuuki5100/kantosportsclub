-- Map authority_category into required_level for PermissionConfigProvider
UPDATE endpoint_authority_mapping
SET required_level = CAST(authority_category AS SIGNED)
WHERE required_level IS NULL;
