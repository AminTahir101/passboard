-- ============================================================
-- Passboard Anatomy Module — Database Schema
-- Migration: 20261006000001
-- ============================================================

-- ── Enums ────────────────────────────────────────────────────

CREATE TYPE anatomy_sex AS ENUM ('male', 'female', 'both');

CREATE TYPE anatomy_structure_type AS ENUM (
  'bone', 'muscle', 'joint', 'nerve',
  'artery', 'vein', 'lymphatic', 'organ',
  'ligament', 'fascia', 'tendon', 'bursa',
  'gland', 'region', 'cavity', 'other'
);

CREATE TYPE anatomy_review_status AS ENUM ('draft', 'reviewed', 'approved');

CREATE TYPE anatomy_layer AS ENUM (
  'skin', 'superficial_fascia', 'muscle_superficial', 'muscle_deep',
  'skeleton', 'organ', 'nerve', 'artery', 'vein', 'lymphatic'
);

CREATE TYPE anatomy_level AS ENUM ('1','2','3','4','5','6','7');

-- ── Hierarchy nodes ──────────────────────────────────────────

CREATE TABLE anatomy_nodes (
  id              TEXT PRIMARY KEY,               -- FMA ID as string e.g. "FMA:7088"
  fma_id          INTEGER UNIQUE,                 -- raw integer e.g. 7088
  fma_uri         TEXT,                           -- http://purl.org/sig/ont/fma/fmaXXXX
  ta2_id          INTEGER,                        -- TA2 entity number (NULL if not published)
  name_en         TEXT NOT NULL,                  -- English preferred name
  name_latin      TEXT,                           -- TA2 Latin preferred name
  name_ar         TEXT,                           -- Standard medical Arabic
  name_fma        TEXT,                           -- FMA preferred label (may differ from name_en)
  name_clinical   TEXT,                           -- Common clinical synonym
  synonyms        TEXT[]   NOT NULL DEFAULT '{}',
  abbreviations   TEXT[]   NOT NULL DEFAULT '{}',
  parent_id       TEXT REFERENCES anatomy_nodes(id),
  level           anatomy_level NOT NULL,
  region_tags     TEXT[]   NOT NULL DEFAULT '{}', -- e.g. ['thorax']
  system_tags     TEXT[]   NOT NULL DEFAULT '{}', -- e.g. ['cardiovascular']
  structure_type  anatomy_structure_type NOT NULL,
  sex             anatomy_sex NOT NULL DEFAULT 'both',
  layer           anatomy_layer,
  mesh_ids        TEXT[]   NOT NULL DEFAULT '{}', -- GLB mesh names
  content_id      TEXT,                           -- FK set after content insert
  model_pending   BOOLEAN  NOT NULL DEFAULT FALSE,-- TRUE = no GLB mesh yet
  highlight_color TEXT,                           -- hex, for medical colour coding
  sort_order      INTEGER  NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Children are derived by querying parent_id, not stored redundantly.

CREATE INDEX idx_anatomy_nodes_parent    ON anatomy_nodes(parent_id);
CREATE INDEX idx_anatomy_nodes_fma       ON anatomy_nodes(fma_id);
CREATE INDEX idx_anatomy_nodes_region    ON anatomy_nodes USING GIN(region_tags);
CREATE INDEX idx_anatomy_nodes_system    ON anatomy_nodes USING GIN(system_tags);
CREATE INDEX idx_anatomy_nodes_type      ON anatomy_nodes(structure_type);
CREATE INDEX idx_anatomy_nodes_sex       ON anatomy_nodes(sex);
CREATE INDEX idx_anatomy_nodes_mesh      ON anatomy_nodes USING GIN(mesh_ids);

-- Full-text search index
CREATE INDEX idx_anatomy_nodes_fts ON anatomy_nodes USING GIN(
  to_tsvector('english',
    coalesce(name_en, '') || ' ' ||
    coalesce(name_latin, '') || ' ' ||
    coalesce(name_clinical, '') || ' ' ||
    coalesce(array_to_string(synonyms, ' '), '') || ' ' ||
    coalesce(array_to_string(abbreviations, ' '), '')
  )
);

-- ── Content records ──────────────────────────────────────────

CREATE TABLE anatomy_content (
  id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  node_id               TEXT NOT NULL REFERENCES anatomy_nodes(id) ON DELETE CASCADE,

  -- Universal fields
  description           TEXT,
  function_text         TEXT,          -- "function" is reserved SQL keyword
  location_relations    JSONB,         -- {anterior, posterior, superior, inferior, medial, lateral}
  arterial_supply       TEXT,
  venous_drainage       TEXT,
  lymphatic_drainage    TEXT,
  innervation           TEXT,
  embryological_origin  TEXT,          -- germ layer + developmental source
  histology             TEXT,
  anatomical_variations JSONB,         -- [{description, prevalence_percent, source}]
  clinical_correlations JSONB,         -- [{pathology, signs, symptoms, anatomy_explanation}]
  clinical_examination  TEXT,
  procedures_surgical   TEXT,
  imaging_appearance    JSONB,         -- {xray, ct, mri, ultrasound}
  exam_points           JSONB,         -- [{point, exam_tag: 'USMLE'|'SMLE', importance: 1-3}]
  sex_differences       TEXT,

  -- Muscle-specific
  muscle_origin         TEXT,
  muscle_insertion      TEXT,
  muscle_action         TEXT,
  muscle_innervation    TEXT,          -- with root values e.g. "musculocutaneous nerve (C5, C6)"
  muscle_blood_supply   TEXT,
  muscle_test           TEXT,

  -- Bone-specific
  bone_parts            TEXT,
  ossification_centres  JSONB,         -- [{name, timing_weeks_or_years, type: 'primary'|'secondary'}]
  bone_articulations    TEXT,
  bone_attachments      TEXT,
  common_fractures      JSONB,         -- [{name, mechanism, eponym, complication}]

  -- Joint-specific
  joint_type            TEXT,
  articular_surfaces    TEXT,
  joint_ligaments       JSONB,         -- [{name, attachment_from, attachment_to, function}]
  joint_movements       TEXT,
  stability_factors     TEXT,
  common_injuries       TEXT,

  -- Nerve-specific
  nerve_root_values     TEXT,          -- e.g. "C8, T1"
  nerve_course          TEXT,
  nerve_branches        TEXT,
  nerve_motor           TEXT,
  nerve_sensory         TEXT,
  nerve_lesion          JSONB,         -- [{site, presentation, eponym}]

  -- Vessel-specific
  vessel_origin         TEXT,
  vessel_course         TEXT,
  vessel_branches       TEXT,
  vessel_territory      TEXT,
  vessel_anastomoses    TEXT,
  vessel_clinical       TEXT,

  -- Organ-specific
  organ_surfaces        TEXT,
  organ_borders         TEXT,
  organ_peritoneal      TEXT,          -- peritoneal relations
  organ_segments        TEXT,
  referred_pain         TEXT,

  -- Governance
  sources               JSONB NOT NULL DEFAULT '[]', -- [{author, title, edition, page, url}]
  review_status         anatomy_review_status NOT NULL DEFAULT 'draft',
  reviewed_by           TEXT,
  reviewed_at           TIMESTAMPTZ,
  approved_by           TEXT,
  approved_at           TIMESTAMPTZ,
  version               INTEGER NOT NULL DEFAULT 1,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_anatomy_content_node ON anatomy_content(node_id);
ALTER TABLE anatomy_nodes
  ADD CONSTRAINT fk_content FOREIGN KEY (content_id)
  REFERENCES anatomy_content(id) DEFERRABLE INITIALLY DEFERRED;

-- ── Mesh mappings ─────────────────────────────────────────────

CREATE TABLE anatomy_mesh_mappings (
  id        SERIAL PRIMARY KEY,
  glb_file  TEXT NOT NULL,             -- e.g. "thorax_male_v1.glb"
  mesh_name TEXT NOT NULL,             -- mesh name as in glTF scene
  node_id   TEXT NOT NULL REFERENCES anatomy_nodes(id),
  sex       anatomy_sex NOT NULL,
  lod_level INTEGER NOT NULL DEFAULT 0, -- 0=full, 1=mid, 2=low
  UNIQUE(glb_file, mesh_name)
);

CREATE INDEX idx_mesh_node ON anatomy_mesh_mappings(node_id);
CREATE INDEX idx_mesh_file ON anatomy_mesh_mappings(glb_file);

-- ── Quiz & Assessment ─────────────────────────────────────────

CREATE TABLE anatomy_quiz_attempts (
  id            SERIAL PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  node_id       TEXT NOT NULL REFERENCES anatomy_nodes(id),
  quiz_type     TEXT NOT NULL, -- 'identification' | 'naming' | 'clinical_vignette'
  correct       BOOLEAN NOT NULL,
  response_ms   INTEGER,       -- time to answer in milliseconds
  next_review   DATE,          -- spaced repetition next date
  interval_days INTEGER NOT NULL DEFAULT 1,
  ease_factor   NUMERIC(4,2)  NOT NULL DEFAULT 2.5,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quiz_user     ON anatomy_quiz_attempts(user_id);
CREATE INDEX idx_quiz_node     ON anatomy_quiz_attempts(node_id);
CREATE INDEX idx_quiz_review   ON anatomy_quiz_attempts(user_id, next_review);

-- ── Bookmarks & Notes ─────────────────────────────────────────

CREATE TABLE anatomy_bookmarks (
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  node_id    TEXT NOT NULL REFERENCES anatomy_nodes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, node_id)
);

CREATE TABLE anatomy_notes (
  id         SERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  node_id    TEXT NOT NULL REFERENCES anatomy_nodes(id) ON DELETE CASCADE,
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, node_id)
);

-- ── Recently viewed ───────────────────────────────────────────

CREATE TABLE anatomy_recent_views (
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  node_id    TEXT NOT NULL REFERENCES anatomy_nodes(id) ON DELETE CASCADE,
  viewed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, node_id)
);

-- ── Error reports ─────────────────────────────────────────────

CREATE TABLE anatomy_error_reports (
  id          SERIAL PRIMARY KEY,
  node_id     TEXT NOT NULL REFERENCES anatomy_nodes(id),
  user_id     UUID REFERENCES auth.users(id),
  field_name  TEXT,             -- which field has the error
  description TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'open', -- open | in_review | resolved
  resolved_by TEXT,
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_errors_node   ON anatomy_error_reports(node_id);
CREATE INDEX idx_errors_status ON anatomy_error_reports(status);

-- ── AI Tutor conversations ────────────────────────────────────

CREATE TABLE anatomy_tutor_sessions (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  node_id       TEXT REFERENCES anatomy_nodes(id),
  mode          TEXT NOT NULL DEFAULT 'explain', -- explain | exam | clinical | socratic
  sex_model     anatomy_sex NOT NULL DEFAULT 'male',
  messages      JSONB NOT NULL DEFAULT '[]',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tutor_user ON anatomy_tutor_sessions(user_id);
CREATE INDEX idx_tutor_node ON anatomy_tutor_sessions(node_id);

-- ── Progress tracking ─────────────────────────────────────────

CREATE VIEW anatomy_user_progress AS
SELECT
  qa.user_id,
  n.region_tags[1]                           AS region,
  n.system_tags[1]                           AS system,
  COUNT(DISTINCT qa.node_id)                 AS structures_attempted,
  COUNT(DISTINCT CASE WHEN qa.correct THEN qa.node_id END) AS structures_correct,
  ROUND(
    100.0 * COUNT(CASE WHEN qa.correct THEN 1 END)::NUMERIC /
    NULLIF(COUNT(*), 0), 1
  )                                          AS accuracy_pct,
  MAX(qa.created_at)                         AS last_attempt
FROM anatomy_quiz_attempts qa
JOIN anatomy_nodes n ON n.id = qa.node_id
GROUP BY qa.user_id, n.region_tags[1], n.system_tags[1];

-- ── RLS ───────────────────────────────────────────────────────

ALTER TABLE anatomy_nodes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE anatomy_content         ENABLE ROW LEVEL SECURITY;
ALTER TABLE anatomy_mesh_mappings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE anatomy_quiz_attempts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE anatomy_bookmarks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE anatomy_notes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE anatomy_recent_views    ENABLE ROW LEVEL SECURITY;
ALTER TABLE anatomy_error_reports   ENABLE ROW LEVEL SECURITY;
ALTER TABLE anatomy_tutor_sessions  ENABLE ROW LEVEL SECURITY;

-- Nodes and approved content: readable by all authenticated users
CREATE POLICY "anatomy_nodes_read" ON anatomy_nodes
  FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "anatomy_content_read_approved" ON anatomy_content
  FOR SELECT TO authenticated
  USING (review_status = 'approved');

-- Draft content: admin only
CREATE POLICY "anatomy_content_admin" ON anatomy_content
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "anatomy_mesh_read" ON anatomy_mesh_mappings
  FOR SELECT TO authenticated USING (TRUE);

-- User-scoped tables: own rows only
CREATE POLICY "quiz_own"     ON anatomy_quiz_attempts   FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "bookmark_own" ON anatomy_bookmarks        FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "note_own"     ON anatomy_notes            FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "recent_own"   ON anatomy_recent_views     FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "tutor_own"    ON anatomy_tutor_sessions   FOR ALL TO authenticated USING (user_id = auth.uid());

-- Error reports: insert by any authenticated user, read/update by admin
CREATE POLICY "error_insert"  ON anatomy_error_reports FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "error_read"    ON anatomy_error_reports FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── updated_at triggers ───────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_nodes_updated    BEFORE UPDATE ON anatomy_nodes           FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_content_updated  BEFORE UPDATE ON anatomy_content         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_notes_updated    BEFORE UPDATE ON anatomy_notes           FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_tutor_updated    BEFORE UPDATE ON anatomy_tutor_sessions  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
