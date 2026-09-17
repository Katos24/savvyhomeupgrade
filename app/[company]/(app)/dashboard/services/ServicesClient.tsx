'use client';

import CategoriesTab from './CategoriesTab';

export default function ServicesClient({
  company,
  currentUser,
}: {
  company: any;
  currentUser?: any;
}) {
  return <CategoriesTab company={company} currentUser={currentUser} />;
}