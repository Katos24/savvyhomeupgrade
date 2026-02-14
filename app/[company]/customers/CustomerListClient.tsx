"use client";

interface CustomerListItem {
  name: string;
  email: string;
  phone: string;
  addresses: string[];
  latest_project: number;
  latest_status: string;
  latest_date: string;
}

export default function CustomerListClient({
  customers,
  companySlug
}: {
  customers: CustomerListItem[];
  companySlug: string;
}) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-extrabold mb-8">Customers</h1>

      <div className="space-y-4">
        {customers.map((c, i) => (
          <a
            key={i}
            href={`/${companySlug}/customers/${c.latest_project}`}
            className="block border border-gray-200 rounded-xl p-6 bg-white hover:shadow-md transition"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">{c.name}</h2>
              <span className="text-sm px-3 py-1 rounded-lg bg-blue-100 text-blue-700">
                {c.latest_status}
              </span>
            </div>

            <p className="text-gray-700 mt-1">{c.email}</p>
            <p className="text-gray-700">{c.phone}</p>

            {c.addresses.length > 0 && (
              <p className="text-gray-600 mt-2">
                📍 {c.addresses[0]}
                {c.addresses.length > 1 && ` +${c.addresses.length - 1} more`}
              </p>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}