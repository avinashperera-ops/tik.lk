import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { TurnstileScanner } from '@/components/TurnstileScanner';

export const dynamic = 'force-dynamic';

// Roles allowed to operate the gate scanner
const ALLOWED_ROLES = ['ORGANIZER'];

export default async function CommitteePage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/login');
  }

  if (!ALLOWED_ROLES.includes(session.user.role ?? '')) {
    redirect('/dashboard');
  }

  return <TurnstileScanner />;
}