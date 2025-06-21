export type Subscriber = {
  id: string
  email: string
  name?: string
  createdAt: Date
  status: "active" | "unsubscribed"
  source?: string
}
