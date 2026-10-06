import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { AnatomySearchResult } from '@/types/anatomy';
import { dbRowToNode } from '@/lib/anatomy/db-mappers';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() ?? '';
    const region = searchParams.get('region');
    const system = searchParams.get('system');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50);

    if (q.length < 1) return NextResponse.json({ results: [] });

    let query = (supabase as any)
      .from('anatomy_nodes')
      .select('*')
      .limit(limit);

    if (region) query = query.contains('region_tags', [region]);
    if (system) query = query.contains('system_tags', [system]);

    const term = q.toLowerCase();
    query = query.or(
      `name_en.ilike.%${term}%,name_latin.ilike.%${term}%,name_clinical.ilike.%${term}%,name_ar.ilike.%${term}%`
    );

    const { data, error } = await query.order('sort_order', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const results: AnatomySearchResult[] = (data ?? []).map((row: Record<string, unknown>) => {
      const node = dbRowToNode(row);
      const lowerQ = q.toLowerCase();
      let matchField: AnatomySearchResult['matchField'] = 'name_en';
      if (node.nameLatin?.toLowerCase().includes(lowerQ)) matchField = 'name_latin';
      else if (node.synonyms.some((s) => s.toLowerCase().includes(lowerQ))) matchField = 'synonym';
      else if (node.abbreviations.some((a) => a.toLowerCase().includes(lowerQ))) matchField = 'abbreviation';

      return {
        nodeId: node.id,
        nameEn: node.nameEn,
        nameLatin: node.nameLatin,
        nameAr: node.nameAr,
        structureType: node.structureType,
        regionTags: node.regionTags,
        systemTags: node.systemTags,
        matchField,
        rank: matchField === 'name_en' ? 1 : 2,
      } satisfies AnatomySearchResult;
    });

    results.sort((a, b) => {
      const aExact = a.nameEn.toLowerCase() === q.toLowerCase() ? 0 : 1;
      const bExact = b.nameEn.toLowerCase() === q.toLowerCase() ? 0 : 1;
      return aExact - bExact || a.rank - b.rank;
    });

    return NextResponse.json({ results });
  } catch (err) {
    console.error('[anatomy/search]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
