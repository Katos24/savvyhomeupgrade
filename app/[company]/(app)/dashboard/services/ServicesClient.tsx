'use client';

import ServicesFormLanding from './ServicesFormLanding';

export default function ServicesClient({
  company,
  currentUser,
}: {
  company: any;
  currentUser?: any;
}) {
  return <ServicesFormLanding company={company} currentUser={currentUser} />;
}