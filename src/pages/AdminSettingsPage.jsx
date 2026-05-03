import { GearSix, Moon, Palette, ShieldCheck } from '@phosphor-icons/react'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { cn } from '../lib/utils'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'

function getInitials(value) {
  return String(value ?? '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'A'
}

export function AdminSettingsPage() {
  const { adminProfile, user } = useAuth()
  const { darkThemeVariant, isDarkMode, setDarkThemeVariant, setThemeMode } = useTheme()

  const accountCards = [
    {
      icon: (
        <Avatar>
          <AvatarFallback className="bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            {getInitials(adminProfile?.name || user?.email || user?.uid)}
          </AvatarFallback>
        </Avatar>
      ),
      label: 'Account',
      value: adminProfile?.name || user?.email || user?.uid,
    },
    {
      icon: <ShieldCheck size={24} weight="duotone" className="text-[var(--color-accent)]" />,
      label: 'Role',
      value: adminProfile?.role || 'No role',
    },
    {
      icon: <GearSix size={24} weight="duotone" className="text-[var(--color-accent)]" />,
      label: 'Email',
      value: adminProfile?.email || user?.email || 'No email',
    },
  ]

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {accountCards.map((item) => (
          <Card
            key={item.label}
            className="bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,255,255,0.78))] dark:bg-[linear-gradient(180deg,rgba(24,24,27,0.96),rgba(24,24,27,0.88))]"
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-accent-soft)]">
                {item.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--color-muted)]">{item.label}</p>
                <p className="truncate text-base font-semibold">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,255,255,0.78))] dark:bg-[linear-gradient(180deg,rgba(24,24,27,0.96),rgba(24,24,27,0.88))]">
        <CardHeader className="gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary">
              <Moon size={14} weight="fill" />
              Display preferences
            </Badge>
            <div>
              <CardTitle className="text-2xl">Dark mode style</CardTitle>
              <CardDescription>
                Choose which palette should be used whenever dark mode is enabled.
                {isDarkMode ? ' Dark mode is currently active.' : ' Dark mode is currently off.'}
              </CardDescription>
            </div>
          </div>

          <Button variant="outline" onClick={() => setThemeMode('dark')}>
            Preview dark mode
          </Button>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2">
          {[
            {
              description: 'Near-black surfaces with neutral contrast.',
              key: 'default',
              title: 'Default dark',
            },
            {
              description: 'Ocean-toned dark mode using the current blue palette.',
              key: 'blue',
              title: 'Blue dark',
            },
          ].map((option) => {
            const isActive = darkThemeVariant === option.key

            return (
              <button
                key={option.key}
                type="button"
                className={cn(
                  'flex min-h-36 items-start gap-4 rounded-3xl border p-5 text-left transition-colors',
                  isActive
                    ? 'border-transparent bg-[var(--color-accent)] text-[var(--color-on-accent)] shadow-sm'
                    : 'border-[var(--color-border)] bg-[var(--color-panel-bg)] hover:bg-[var(--color-card-soft)]',
                )}
                onClick={() => setDarkThemeVariant(option.key)}
              >
                <span
                  className={cn(
                    'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
                    isActive
                      ? 'bg-[color:rgba(255,255,255,0.16)] text-[var(--color-on-accent)]'
                      : 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
                  )}
                >
                  <Palette size={18} weight="duotone" />
                </span>
                <span className="space-y-1">
                  <span className="block font-semibold">{option.title}</span>
                  <span
                    className={cn(
                      'block text-sm',
                      isActive
                        ? 'text-[color:rgba(255,255,255,0.82)]'
                        : 'text-[var(--color-muted)]',
                    )}
                  >
                    {option.description}
                  </span>
                </span>
              </button>
            )
          })}
        </CardContent>
      </Card>
    </section>
  )
}
