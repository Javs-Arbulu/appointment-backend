export interface Appointment {
  id: string;
  patientId: string;
  doctorId?: string;
  date: string;
  time: string;
  status: "SCHEDULED" | "CANCELLED" | "COMPLETED";
  createdAt: string;
  updatedAt?: string;
}
