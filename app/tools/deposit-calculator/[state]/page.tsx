import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CalculatorPage from '../CalculatorPage';
import { STATES, STATE_LIST } from '../states';

// One static page per supported state: /tools/deposit-calculator/new-york, etc.
export function generateStaticParams() {
  return STATE_LIST.map((s) => ({ state: s.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const { state } = await params;
  const info = STATES[state];
  if (!info) return {};
  const url = `/tools/deposit-calculator/${info.slug}`;
  return {
    title: info.title,
    description: info.description,
    alternates: { canonical: url },
    openGraph: {
      title: info.title.replace(' | Lead2Project', ''),
      description: info.description,
      url,
      type: 'website',
    },
  };
}

export default async function StateDepositCalculatorPage({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  if (!STATES[state]) notFound();
  return <CalculatorPage stateSlug={state} />;
}