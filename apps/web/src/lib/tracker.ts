import { ApplicationStatus } from "@prisma/client";

export interface Application {
  id: string;
  jobTitle: string;
  company: string;
  location: string | null;
  jobUrl: string | null;
  salary: string | null;
  status: ApplicationStatus;
  matchScore: number | null;
  notes: string | null;
  appliedAt: string | null;
  interviewAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const COLUMNS: {
  id: ApplicationStatus;
  label: string;
  color: string;
  dot: string;
  description: string;
}[] = [
  {
    id: "SAVED",
    label: "Saved",
    color: "text-text-muted",
    dot: "bg-border",
    description: "Jobs you want to apply to",
  },
  {
    id: "APPLIED",
    label: "Applied",
    color: "text-primary",
    dot: "bg-primary",
    description: "Applications sent",
  },
  {
    id: "INTERVIEW",
    label: "Interview",
    color: "text-warning",
    dot: "bg-warning",
    description: "You've got a call or interview",
  },
  {
    id: "OFFER",
    label: "Offer",
    color: "text-success",
    dot: "bg-success",
    description: "Offer received 🎉",
  },
  {
    id: "CLOSED",
    label: "Closed",
    color: "text-danger",
    dot: "bg-danger",
    description: "No response or rejected",
  },
];
