import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card'

export function SettingsPage() {
  return (
    <div className="space-y-4">
      <Card padding="lg" className="space-y-4">
        <div>
          <h2 className="font-semibold text-surface-900 dark:text-surface-100">Account settings</h2>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            Choose a section to update your preferences.
          </p>
        </div>

        <ul className="divide-y divide-surface-200 dark:divide-surface-800">
          <li>
            <Link
              to="/settings/security"
              className="flex items-center justify-between py-3 text-sm transition-colors hover:text-brand-700 dark:hover:text-brand-300"
            >
              <span>
                <span className="block font-medium text-surface-900 dark:text-surface-100">Security</span>
                <span className="text-surface-500 dark:text-surface-400">
                  Two-factor authentication and account protection
                </span>
              </span>
              <span aria-hidden="true" className="text-surface-400">
                →
              </span>
            </Link>
          </li>
        </ul>
      </Card>
    </div>
  )
}
