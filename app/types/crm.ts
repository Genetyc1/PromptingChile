export type DealStatus =
  | "Prospección General"
  | "Prospección Contingente"
  | "Estudio"
  | "Entregadas"
  | "Negociación"
  | "Ganado"
  | "Perdido"

export type ActivityType = "call" | "email" | "meeting" | "task" | "follow_up" | "demo" | "proposal"

export type ActivityStatus = "pending" | "completed" | "cancelled"

export interface Deal {
  id: string
  title: string
  organization?: string
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  status: DealStatus
  value: number
  quality_lead: number
  margin?: number
  proposal_type?: string
  channel?: string
  due_date?: string
  delivery_date?: string
  notes?: string
  reason?: string
  archived: boolean
  created_at: string
  updated_at: string
  created_by: string
  activities?: Activity[]
}

export interface Activity {
  id: string
  deal_id: string
  title: string
  description?: string
  type: ActivityType
  status: ActivityStatus
  scheduled_date: string
  scheduled_time?: string
  completed_at?: string
  created_by: string
  assigned_to?: string
  created_at: string
  updated_at: string
  user?: {
    name?: string
    email: string
  }
}

export interface DealNote {
  id: string
  deal_id: string
  author_id: string
  content: string
  created_at: string
  author?: {
    name?: string
    email: string
  }
}

export interface DealAttachment {
  id: string
  deal_id: string
  filename: string
  file_path: string
  file_size: number
  mime_type: string
  uploaded_by: string
  created_at: string
}

export interface DealStatusHistory {
  id: string
  deal_id: string
  old_status?: string
  new_status: string
  changed_by: string
  changed_at: string
  notes?: string
  user?: {
    name?: string
    email: string
  }
}

export type CRMViewMode = "board" | "table"

export interface CRMFilters {
  status?: DealStatus[]
  search?: string
  organization?: string
  quality_lead?: number[]
  value_min?: number
  value_max?: number
  date_from?: string
  date_to?: string
  show_archived?: boolean
}

export interface DealWithActivityStatus extends Deal {
  activity_status: "overdue" | "today" | "upcoming" | "none"
  next_activity?: Activity
}
