ALTER TABLE school_tenants ADD COLUMN supported_locales_json TEXT NOT NULL DEFAULT '["en"]';
ALTER TABLE school_tenants ADD COLUMN brand_primary_color TEXT NOT NULL DEFAULT '#8c3a1f';
ALTER TABLE school_tenants ADD COLUMN support_url TEXT;
