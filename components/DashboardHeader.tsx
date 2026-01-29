'use client';

import { useRouter } from 'next/navigation';

export default function DashboardHeader({
  companySlug,
  companyName,
  companyLogoUrl,
  currentUser,
  currentPage = 'dashboard'
}: {
  companySlug: string;
  companyName: string;
  companyLogoUrl?: string | null;
  currentUser?: any;
  currentPage?: 'dashboard' | 'team' | 'settings' | 'deleted-leads';
}) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { label: 'Dashboard', href: `/${companySlug}/dashboard`, key: 'dashboard' },
    { label: 'Team', href: `/${companySlug}/team`, key: 'team', adminOnly: true },
    { label: 'Settings', href: `/${companySlug}/settings`, key: 'settings' },
  ];

  // Check if user is admin or owner
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'owner';

  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          
          {/* Left: Logo + Company Name */}
          <div className="flex items-center gap-4">
            {companyLogoUrl ? (
              <img 
                src={companyLogoUrl} 
                alt={`${companyName} logo`}
                className="h-12 w-auto object-contain"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                {companyName.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold gradient-text">{companyName}</h1>
              {currentUser && (
                <p className="text-sm text-gray-600">
                  {currentUser.name || currentUser.email}
                </p>
              )}
            </div>
          </div>

          {/* Right: Navigation + Logout */}
          <div className="flex items-center gap-6">
            
            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-4">
              {navItems.map(item => {
                // Skip admin-only items if not admin
                if (item.adminOnly && !isAdmin) return null;

                const isActive = currentPage === item.key;
                
                return (
                  <a
                    key={item.key}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      isActive
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>

            {/* Deleted Leads Link (if admin) */}
            {isAdmin && (
              <a
                href={`/${companySlug}/dashboard/deleted-leads`}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-700 px-4 py-2 rounded-lg font-semibold transition border border-red-500/30 flex items-center gap-2 text-sm"
              >
                🗑️ Deleted
              </a>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Logout →
            </button>
          </div>
        </div>

        {/* Mobile Navigation (if needed) */}
        <nav className="md:hidden flex gap-2 mt-4 overflow-x-auto">
          {navItems.map(item => {
            if (item.adminOnly && !isAdmin) return null;
            
            const isActive = currentPage === item.key;
            
            return (
              <a
                key={item.key}
                href={item.href}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}