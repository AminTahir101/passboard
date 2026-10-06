#!/usr/bin/env npx tsx
/**
 * Seed anatomy module with thorax hierarchy and heart content.
 * Usage: npx tsx scripts/anatomy/seed-thorax.ts
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { ALL_THORAX_NODES } from '../../src/data/anatomy/thorax-nodes';
import {
  CONTENT_HEART,
  CONTENT_SA_NODE,
  CONTENT_AV_NODE,
  CONTENT_LAD,
  CONTENT_FOSSA_OVALIS,
  CONTENT_MITRAL_VALVE,
  CONTENT_MODERATOR_BAND,
  CONTENT_RCA,
} from '../../src/data/anatomy/heart-content';
import type { AnatomyNode, AnatomyContent } from '../../src/types/anatomy';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_URL = rawUrl.replace(/\\n/g, '').trim();
const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const SERVICE_KEY = rawKey.replace(/\\n/g, '').trim();

if (!SUPABASE_URL || SUPABASE_URL.includes('placeholder')) {
  console.error('Missing or placeholder NEXT_PUBLIC_SUPABASE_URL');
  process.exit(1);
}
if (!SERVICE_KEY || SERVICE_KEY.includes('placeholder')) {
  console.error('Missing or placeholder SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Row mappers ───────────────────────────────────────────────

function nodeToRow(n: AnatomyNode) {
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

function contentToRow(c: AnatomyContent) {
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
  const HEART_CONTENTS: AnatomyContent[] = [
    CONTENT_HEART,
    CONTENT_SA_NODE,
    CONTENT_AV_NODE,
    CONTENT_LAD,
    CONTENT_FOSSA_OVALIS,
    CONTENT_MITRAL_VALVE,
    CONTENT_MODERATOR_BAND,
    CONTENT_RCA,
  ];

  console.log(`\n🦴 Seeding anatomy module…`);
  console.log(`   ${ALL_THORAX_NODES.length} nodes, ${HEART_CONTENTS.length} content records`);
  console.log(`   Target: ${SUPABASE_URL}\n`);

  // Sort by level so parents come before children
  const sorted = [...ALL_THORAX_NODES].sort((a, b) => a.level - b.level);
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

  // Content records
  const contentRows = HEART_CONTENTS.map(contentToRow);
  console.log('  → Inserting content records…');

  for (const row of contentRows) {
    const { error: cErr } = await (supabase as any)
      .from('anatomy_content')
      .upsert(row, { onConflict: 'id' });

    if (cErr) {
      console.error(`  ✗ Content failed for ${row.node_id}:`, cErr.message);
    } else {
      // Wire up content_id on the node
      await (supabase as any)
        .from('anatomy_nodes')
        .update({ content_id: row.id })
        .eq('id', row.node_id);
      console.log(`  ✓ ${row.node_id}`);
    }
  }

  // Final counts
  const { count: nodeCount } = await (supabase as any)
    .from('anatomy_nodes')
    .select('*', { count: 'exact', head: true });
  const { count: contentCount } = await (supabase as any)
    .from('anatomy_content')
    .select('*', { count: 'exact', head: true });

  console.log(`\n✅ Seed complete!`);
  console.log(`   anatomy_nodes:   ${nodeCount} rows`);
  console.log(`   anatomy_content: ${contentCount} rows\n`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
