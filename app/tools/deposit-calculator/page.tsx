import type { Metadata } from 'next';
import CalculatorPage from './CalculatorPage';

export const metadata: Metadata = {
  title: 'Contractor Deposit Calculator (Free) | Lead2Project',
  description:
    'Work out the deposit and the balance due for any job in seconds. Enter the price, sales tax and deposit percent or flat amount. Free, no sign-up.',
  alternates: { canonical: '/tools/deposit-calculator' },
  openGraph: {
    title: 'Contractor Deposit Calculator (Free)',
    description: 'Deposit to get started, balance on completion and job total, with sales tax. Free, no sign-up.',
    url: '/tools/deposit-calculator',
    type: 'website',
  },
};

export default function DepositCalculatorPage() {
  return <CalculatorPage />;
}