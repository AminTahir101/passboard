#!/usr/bin/env tsx
/**
 * Seed anatomy module with thorax hierarchy and heart content.
 * Usage: npx tsx scripts/anatomy/seed-thorax.ts
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Import seed data ──────────────────────────────────────────

// We inline minimal node definitions here so the script is standalone
// (thorax-nodes.ts has TS types that tsx handles fine, but we re-export
// from the source directly)

const THORAX_NODES = await import('../../src/data/anatomy/thorax-nodes')
  .then((m) => m.ALL_THORAX_NODES);

const HEART_CONTENTS = await import('../../src/data/anatomy/heart-content')
  .then((m) => [
    m.CONTENT_HEART,
    m.CONTENT_SA_NODE,
    m.CONTENT_AV_NODE,
    m.CONTENT_LAD,
    m.CONTENT_FOSSA_OVALIS,
    m.CONTENT_MITRAL_VALVE,
    m.CONTENT_MODERATOR_BAND,
    m.CONTENT_RCA,
  ]);

// ── Helpers ───────────────────────────────────────────────────

function nodeToRow(n: typeof THORAX_NODES[0]) {
  return {
    id:              n.id,
    fma_id:          n.fmaId,
    fma_uri:         n.fmaUri,
    ta2_id:          n.ta2Id,
    name_en:         n.nameEn,
    name_latin:      n.nameLatin,
    name_ar:         n.nameAr,
    name_fma:        n.nameFma,
    name_clinical:   n.nameClinical,
    synonyms:        n.synonyms,
    abbreviations:   n.abbreviations,
    parent_id:       n.parentId,
    level:           String(n.level),
    region_tags:     n.regionTags,
    system_tags:     n.systemTags,
    structure_type:  n.structureType,
    sex:             n.sex,
    layer:           n.layer,
    mesh_ids:        n.meshIds,
    model_pending:   n.modelPending,
    highlight_color: n.highlightColor,
    sort_order:      n.sortOrder,
  };
}

function contentToRow(c: typeof HEART_CONTENTS[0]) {
  return {
    id:                     c.id,
    node_id:                c.nodeId,
    description:            c.description,
    function_text:          c.functionText,
    location_relations:     c.locationRelations,
    arterial_supply:        c.arterialSupply,
    venous_drainage:        c.venousDrainage,
    lymphatic_drainage:     c.lymphaticDrainage,
    innervation:            c.innervation,
    embryological_origin:   c.embryologicalOrigin,
    histology:              c.histology,
    anatomical_variations:  c.anatomicalVariations,
    clinical_correlations:  c.clinicalCorrelations,
    clinical_examination:   c.clinicalExamination,
    procedures_surgical:    c.proceduresSurgical,
    imaging_appearance:     c.imagingAppearance,
    exam_points:            c.examPoints,
    sex_differences:        c.sexDifferences,
    muscle_origin:          c.muscleOrigin,
    muscle_insertion:       c.muscleInsertion,
    muscle_action:          c.muscleAction,
    muscle_innervation:     c.muscleInnervation,
    muscle_blood_supply:    c.muscleBloodSupply,
    muscle_test:            c.muscleTest,
    bone_parts:             c.boneParts,
    ossification_centres:   c.ossificationCentres,
    bone_articulations:     c.boneArticulations,
    bone_attachments:       c.boneAttachments,
    common_fractures:       c.commonFractures,
    joint_type:             c.jointType,
    articular_surfaces:     c.articularSurfaces,
    joint_ligaments:        c.jointLigaments,
    joint_movements:        c.jointMovements,
    stability_factors:      c.stabilityFactors,
    common_injuries:        c.commonInjuries,
    nerve_root_values:      c.nerveRootValues,
    nerve_course:           c.nerveCourse,
    nerve_branches:         c.nerveBranches,
    nerve_motor:            c.nerveMotor,
    nerve_sensory:          c.nerveSensory,
    nerve_lesion:           c.nerveLesion,
    vessel_origin:          c.vesselOrigin,
    vessel_course:          c.vesselCourse,
    vessel_branches:        c.vesselBranches,
    vessel_territory:       c.vesselTerritory,
    vessel_anastomoses:     c.vesselAnastomoses,
    vessel_clinical:        c.vesselClinical,
    organ_surfaces:         c.organSurfaces,
    organ_borders:          c.organBorders,
    organ_peritoneal:       c.organPeritoneal,
    organ_segments:         c.organSegments,
    referred_pain:          c.referredPain,
    sources:                c.sources,
    review_status:          c.reviewStatus,
    reviewed_by:            c.reviewedBy,
    reviewed_at:            c.reviewedAt,
    approved_by:            c.approvedBy,
    approved_at:            c.approvedAt,
    version:                c.version,
  };
}

// ── Main ──────────────────────────────────────────────────────

async function main() {
  console.log(`\n🦴 Seeding anatomy module…`);
  console.log(`   ${THORAX_NODES.length} nodes, ${HEART_CONTENTS.length} content records`);
  console.log(`   Target: ${SUPABASE_URL}\n`);

  // 1. Upsert all nodes (insert in sort-order to satisfy FK)
  // Level 1 first, then 2, 3 … (parent must exist before child)
  const sorted = [...THORAX_NODES].sort((a, b) => a.level - b.level);
  const nodeRows = sorted.map(nodeToRow);

  console.log('  → Inserting nodes…');
  const { error: nodeErr } = await (supabase as any)
    .from('anatomy_nodes')
    .upsert(nodeRows, { onConflict: 'id' });

  if (nodeErr) {
    console.error('  ✗ Node insert failed:', nodeErr.message);
    process.exit(1);
  }
  console.log(`  ✓ ${nodeRows.length} nodes upserted`);

  // 2. Upsert content records
  const contentRows = HEART_CONTENTS.map(contentToRow);
  console.log('  → Inserting content records…');

  for (const row of contentRows) {
    const { error: cErr } = await (supabase as any)
      .from('anatomy_content')
      .upsert(row, { onConflict: 'id' });
    if (cErr) {
      console.error(`  ✗ Content insert failed for ${row.node_id}:`, cErr.message);
    } else {
      // Update anatomy_nodes.content_id
      await (supabase as any)
        .from('anatomy_nodes')
        .update({ content_id: row.id })
        .eq('id', row.node_id);
      console.log(`  ✓ Content for ${row.node_id}`);
    }
  }

  console.log('\n✅ Seed complete!\n');
  console.log('   Run the migration first if tables do not exist:');
  console.log('   supabase db push  (or apply migration manually)\n');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
