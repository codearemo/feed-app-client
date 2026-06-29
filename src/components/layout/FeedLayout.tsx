import { Outlet } from 'react-router-dom'

export function FeedLayout() {
  return (
    <div className="-my-8 flex justify-center">
      <div className="w-full max-w-[600px] border-x border-surface-200 dark:border-surface-800">
        <Outlet />
      </div>
    </div>
  )
}
