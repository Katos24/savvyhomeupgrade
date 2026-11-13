import { redirect } from 'next/navigation';

// The booking form settings now live inside the app (with the sidebar) at
// /dashboard/services?view=form. This keeps old links and bookmarks working.
export default async function FormPage({ params }: { params: Promise<{ company: string }> }) {
  const { company } = await params;
  redirect(`/${company}/dashboard/services?view=form`);
}