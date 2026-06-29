import { NavLink, Outlet } from 'react-router-dom'
import { PageHeader } from '../ui/PageHeader'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-brand-100 text-brand-800 dark:bg-brand-500/15 dark:text-brand-200'
      : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-100',
  ].join(' ')

export function SettingsLayout() {
  return (
    <div className="space-y-8">
      <PageHeader title="Settings" description="Manage your account preferences and security." />

      <div className="flex flex-col gap-8 lg:flex-row">
        <nav className="flex shrink-0 gap-1 lg:w-52 lg:flex-col">
          <NavLink to="/settings" end className={navLinkClass}>
            Overview
          </NavLink>
          <NavLink to="/settings/security" className={navLinkClass}>
            Security
          </NavLink>
        </nav>

        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
