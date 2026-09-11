ALTER TABLE school_memberships ADD COLUMN status_before_suspension TEXT CHECK(status_before_suspension IN ('invited','active','suspended','revoked'));
