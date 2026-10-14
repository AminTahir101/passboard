export type NotificationType =
  | 'exam_countdown'
  | 'study_plan_reminder'
  | 'access_expiring'
  | 'inactivity'
  | 'mock_exam_result'
  | 'case_lab_ready'
  | 'announcement'
  | 'access_approved'

export const ALL_NOTIFICATION_TYPES: NotificationType[] = [
  'exam_countdown',
  'study_plan_reminder',
  'access_expiring',
  'inactivity',
  'mock_exam_result',
  'case_lab_ready',
  'announcement',
  'access_approved',
]

export interface NotifyOptions {
  userId: string
  type: NotificationType
  title: { en: string; ar: string }
  body: { en: string; ar: string }
  metadata?: Record<string, unknown>
}

export interface NotificationRow {
  id: string
  user_id: string
  type: NotificationType
  title_en: string
  title_ar: string
  body_en: string
  body_ar: string
  read_at: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface PreferenceRow {
  id: string
  user_id: string
  type: NotificationType
  in_app: boolean
  email: boolean
  push: boolean
}
