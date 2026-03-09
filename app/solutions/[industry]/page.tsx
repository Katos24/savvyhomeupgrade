// app/solutions/[industry]/page.tsx
import { notFound } from 'next/navigation';
import { getIndustryContent, industryList } from '@/lib/industry-content';
import IndustryLandingPage from '@/components/marketing/IndustryLandingPage';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ industry: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { industry } = await params;
  const content = getIndustryContent(industry);
  if (!content) return {};
  return {
    title: content.seo.title,
    description: content.seo.description,
  };
}

export default async function IndustryPage({ params }: Props) {
  const { industry } = await params;
  const content = getIndustryContent(industry);
  if (!content) notFound();
  return <IndustryLandingPage content={content} />;
}