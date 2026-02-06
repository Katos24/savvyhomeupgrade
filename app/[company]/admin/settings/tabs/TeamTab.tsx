'use client';

export default function TeamTab({ company, currentUser }: { company: any; currentUser: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Team Management</h2>
        <p className="text-gray-600">Manage your team members and their permissions</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 text-center space-y-4">
        <div className="text-6xl">👥</div>
        <h3 className="text-xl font-bold">Team Management</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Invite team members, assign roles, and manage permissions from the dedicated team page.
        </p>
        
          href={`/${company.slug}/admin/team`}
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
        >
          Go to Team Management →
        </a>
      </div>
    </div>
  );
}
