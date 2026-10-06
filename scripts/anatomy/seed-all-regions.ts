#!/usr/bin/env npx tsx
/**
 * Seed all anatomy regions except thorax (already seeded separately).
 * Regions: Head & Neck, Abdomen, Pelvis, Upper Limb, Lower Limb, Back & Spine
 *
 * Usage: npx tsx scripts/anatomy/seed-all-regions.ts
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { ALL_HEAD_NECK_NODES } from '../../src/data/anatomy/head-neck-nodes';
import { ALL_ABDOMEN_NODES } from '../../src/data/anatomy/abdomen-nodes';
import { ALL_PELVIS_NODES } from '../../src/data/anatomy/pelvis-nodes';
import { ALL_UPPER_LIMB_NODES } from '../../src/data/anatomy/upper-limb-nodes';
import { ALL_LOWER_LIMB_NODES } from '../../src/data/anatomy/lower-limb-nodes';
import { ALL_BACK_SPINE_NODES } from '../../src/data/anatomy/back-spine-nodes';
import type { AnatomyNode } from '../../src/types/anatomy';

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

const REGIONS: { name: string; nodes: AnatomyNode[] }[] = [
  { name: 'Head & Neck',   nodes: ALL_HEAD_NECK_NODES },
  { name: 'Abdomen',       nodes: ALL_ABDOMEN_NODES },
  { name: 'Pelvis',        nodes: ALL_PELVIS_NODES },
  { name: 'Upper Limb',    nodes: ALL_UPPER_LIMB_NODES },
  { name: 'Lower Limb',    nodes: ALL_LOWER_LIMB_NODES },
  { name: 'Back & Spine',  nodes: ALL_BACK_SPINE_NODES },
];

async function seedRegion(name: string, nodes: AnatomyNode[]) {
  // Sort by level so parents always come before children
  const sorted = [...nodes].sort((a, b) => a.level - b.level);
  const rows = sorted.map(nodeToRow);

  console.log(`\n  → ${name}: ${rows.length} nodes…`);

  // Remove stale rows: rows in the DB that share an fma_id with one of our nodes
  // but have a different primary key (id). These come from earlier incorrect seeds.
  const fmaIds = rows.map((r) => r.fma_id).filter(Boolean);
  const nodeIds = new Set(rows.map((r) => r.id));
  if (fmaIds.length > 0) {
    const { data: stale } = await (supabase as any)
      .from('anatomy_nodes')
      .select('id')
      .in('fma_id', fmaIds)
      .not('id', 'in', `(${[...nodeIds].map((id) => `"${id}"`).join(',')})`);

    if (stale && stale.length > 0) {
      const staleIds = stale.map((r: { id: string }) => r.id);
      console.log(`    ⚠ Removing ${staleIds.length} stale rows: ${staleIds.join(', ')}`);
      await (supabase as any)
        .from('anatomy_nodes')
        .delete()
        .in('id', staleIds);
    }
  }

  // Upsert in batches of 200 to stay within Supabase limits
  const BATCH = 200;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await (supabase as any)
      .from('anatomy_nodes')
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error(`  ✗ ${name} batch ${i / BATCH + 1} failed:`, error.message);
      return false;
    }
  }

  console.log(`  ✓ ${name}: ${rows.length} nodes upserted`);
  return true;
}

async function main() {
  const totalNodes = REGIONS.reduce((sum, r) => sum + r.nodes.length, 0);
  console.log(`\n🦴 Seeding all anatomy regions…`);
  console.log(`   ${REGIONS.length} regions · ${totalNodes} total nodes`);
  console.log(`   Target: ${SUPABASE_URL}\n`);

  let allOk = true;
  for (const { name, nodes } of REGIONS) {
    const ok = await seedRegion(name, nodes);
    if (!ok) allOk = false;
  }

  // Final counts
  const { count: nodeCount } = await (supabase as any)
    .from('anatomy_nodes')
    .select('*', { count: 'exact', head: true });

  console.log(`\n${allOk ? '✅' : '⚠️'} Seed ${allOk ? 'complete' : 'finished with errors'}!`);
  console.log(`   anatomy_nodes total: ${nodeCount} rows\n`);

  if (!allOk) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
