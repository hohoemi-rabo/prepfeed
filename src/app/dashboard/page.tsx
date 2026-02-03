import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        ダッシュボード
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        ようこそ、{user?.user_metadata?.full_name || user?.email}さん
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
        このページは今後のチケットで拡張されます。
      </p>
    </div>
  );
}
