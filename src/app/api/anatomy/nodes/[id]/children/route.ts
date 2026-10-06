import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { dbRowToNode } from '@/lib/anatomy/db-mappers';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await (supabase as any)
      .from('anatomy_nodes')
      .select('*')
      .eq('parent_id', id)
      .order('sort_order', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const children = (data ?? []).map(dbRowToNode);
    return NextResponse.json({ children });
  } catch (err) {
    console.error('[anatomy/nodes/[id]/children]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
