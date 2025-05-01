'use client'

import * as React from 'react'

interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  className?: string
  children: React.ReactNode
}

const Tabs = ({ value, onValueChange, className, children }: TabsProps) => {
  return (
    <div className={className} data-value={value}>
      {children}
    </div>
  )
}

interface TabsListProps {
  className?: string
  children: React.ReactNode
}

const TabsList = React.forwardRef<
  HTMLDivElement,
  TabsListProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 ${className || ''}`}
    {...props}
  />
))
TabsList.displayName = 'TabsList'

interface TabsTriggerProps {
  value: string
  className?: string
  children: React.ReactNode
}

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  TabsTriggerProps & React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, value, ...props }, ref) => {
  const parent = React.useContext(TabsContext)
  const isActive = parent?.value === value

  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all disabled:opacity-50 ${isActive ? 'bg-white shadow-sm' : ''} ${className || ''}`}
      onClick={() => parent?.onValueChange(value)}
      data-state={isActive ? 'active' : 'inactive'}
      {...props}
    />
  )
})
TabsTrigger.displayName = 'TabsTrigger'

interface TabsContentProps {
  value: string
  className?: string
  children: React.ReactNode
}

const TabsContent = React.forwardRef<
  HTMLDivElement,
  TabsContentProps & React.HTMLAttributes<HTMLDivElement>
>(({ className, value, ...props }, ref) => {
  const parent = React.useContext(TabsContext)
  const isActive = parent?.value === value

  if (!isActive) return null

  return (
    <div
      ref={ref}
      className={`mt-2 ${className || ''}`}
      data-state={isActive ? 'active' : 'inactive'}
      {...props}
    />
  )
})
TabsContent.displayName = 'TabsContent'

// Context for managing tabs state
interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

// Wrap the Tabs component to provide context
const TabsRoot = ({ value, onValueChange, className, children }: TabsProps) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <Tabs value={value} onValueChange={onValueChange} className={className}>
        {children}
      </Tabs>
    </TabsContext.Provider>
  )
}

export { TabsRoot as Tabs, TabsList, TabsTrigger, TabsContent }