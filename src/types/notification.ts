export interface Notification {
  id: string;
  appointmentId: string;
  type: "REMINDER" | "CANCELLATION" | "CONFIRMATION";
  recipient: string;
  channel: "EMAIL" | "SMS";
  payload: Record<string, any>;
  createdAt: string;
}
