import {
  ChatCircleDots,
  CheckCircle,
  Clock,
  Package,
  ShoppingCartSimple,
  XCircle,
} from '@phosphor-icons/react'

export const CONVERSATION_RESULT_OPTIONS = [
  {
    value: 'decided_to_buy',
    label: 'Decided to buy',
    icon: ShoppingCartSimple,
    className:
      'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-200',
  },
  {
    value: 'ordered',
    label: 'Ordered',
    icon: Package,
    className:
      'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-200',
  },
  {
    value: 'declined',
    label: 'Declined',
    icon: XCircle,
    className:
      'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200',
  },
  {
    value: 'follow_up_needed',
    label: 'Follow-up needed',
    icon: ChatCircleDots,
    className:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200',
  },
  {
    value: 'maybe_later',
    label: 'Maybe later',
    icon: Clock,
    className:
      'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/30 dark:text-violet-200',
  },
  {
    value: 'no_response',
    label: 'No response',
    icon: CheckCircle,
    className:
      'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200',
  },
]

export function getConversationResultMeta(value) {
  return CONVERSATION_RESULT_OPTIONS.find((item) => item.value === value) ?? null
}
