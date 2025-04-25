import { Types } from "mongoose";

export interface TicketAttachment {
  url: string;
  publicId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
}

export interface TicketMessage {
  _id: Types.ObjectId;
  sender: Types.ObjectId;
  message: string;
  attachments: TicketAttachment[];
  readBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export enum TicketStatus {
  OPEN = "Open",
  IN_PROGRESS = "In Progress",
  RESOLVED = "Resolved",
  CLOSED = "Closed",
  REOPENED = "Reopened"
}

export enum TicketPriority {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  URGENT = "Urgent"
}

export interface TicketMetadata {
  createdBy: "customer" | "support" | "admin";
  createdForCustomer: boolean;
  supportCreatedAsCustomer?: boolean;
}

export interface Ticket {
  _id: Types.ObjectId;
  ticketId: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdBy: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  customer?: Types.ObjectId;
  messages: TicketMessage[];
  participants?: Types.ObjectId[];
  metadata: TicketMetadata;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  closedBy?: Types.ObjectId;
}
