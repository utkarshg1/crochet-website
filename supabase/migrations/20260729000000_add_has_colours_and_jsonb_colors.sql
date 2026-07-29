-- Add has_colours boolean column
ALTER TABLE products ADD COLUMN IF NOT EXISTS has_colours boolean DEFAULT false;

-- Convert colors from text[] to jsonb, preserving existing names
-- Existing text[] values like {'Red','Blue'} become [{"name":"Red","hex":""},{"name":"Blue","hex":""}]
ALTER TABLE products ALTER COLUMN colors TYPE jsonb
  USING CASE
    WHEN colors IS NULL OR colors = '{}' THEN '[]'::jsonb
    ELSE (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object('name', elem, 'hex', '')
      ), '[]'::jsonb)
      FROM unnest(colors) AS elem
    )
  END;

ALTER TABLE products ALTER COLUMN colors SET DEFAULT '[]'::jsonb;
