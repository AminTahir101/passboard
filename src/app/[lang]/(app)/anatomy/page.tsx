import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { localePath } from '@/lib/i18n';
import AnatomyModule from '@/components/anatomy/AnatomyModule';

export const metadata = { title: 'Anatomy | Passboard' };

export default async function AnatomyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(localePath(lang, '/login'));

  return (
    <div className="-m-6 h-[calc(100vh-57px)] lg:h-screen overflow-hidden">
      <AnatomyModule lang={lang as 'en' | 'ar'} userId={user.id} />
    </div>
  );
}
