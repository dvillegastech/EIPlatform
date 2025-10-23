import { Fragment, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  DocumentTextIcon,
  CreditCardIcon,
  ClipboardDocumentListIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Tableau de bord', href: '/', icon: HomeIcon },
  { name: 'Factures', href: '/invoices', icon: DocumentTextIcon },
  { name: 'Dépenses', href: '/expenses', icon: CreditCardIcon },
  { name: 'Déclarations', href: '/declarations', icon: ClipboardDocumentListIcon },
  { name: 'Rapports', href: '/reports', icon: DocumentChartBarIcon },
  { name: 'Paramètres', href: '/settings', icon: Cog6ToothIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b border-gray-200 px-4">
            <h1 className="text-xl font-bold text-primary-600">
              EI Platform
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                    'group flex items-center rounded-md px-3 py-2 text-sm font-medium'
                  )}
                >
                  <item.icon
                    className={classNames(
                      isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500',
                      'mr-3 h-6 w-6 flex-shrink-0'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4">
            <p className="text-xs text-gray-500 text-center">
              Enterprise Individuelle
              <br />
              © 2025
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
