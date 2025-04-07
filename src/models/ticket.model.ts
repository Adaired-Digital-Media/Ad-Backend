import mongoose, { Model, Schema } from "mongoose";
import { Ticket, TicketStatus, TicketPriority } from "../types/ticket.types";

const TicketAttachmentSchema = new Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const TicketMessageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    attachments: [TicketAttachmentSchema],
  },
  { timestamps: true }
);

const TicketSchema = new Schema<Ticket>(
  {
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(TicketStatus),
      default: TicketStatus.OPEN,
    },
    priority: {
      type: String,
      enum: Object.values(TicketPriority),
      default: TicketPriority.MEDIUM,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    customer: { type: Schema.Types.ObjectId, ref: "User" },
    messages: [TicketMessageSchema],
    metadata: {
      createdBy: {
        type: String,
        enum: ["customer", "support", "admin"],
        required: true,
      },
      createdForCustomer: { type: Boolean, required: true },
      supportCreatedAsCustomer: { type: Boolean },
    },
    closedAt: { type: Date },
    closedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Indexes
TicketSchema.index({ status: 1 });
TicketSchema.index({ priority: 1 });
TicketSchema.index({ createdBy: 1 });
TicketSchema.index({ assignedTo: 1 });
TicketSchema.index({ customer: 1 });
TicketSchema.index({ "metadata.createdBy": 1 });
TicketSchema.index({ "metadata.createdForCustomer": 1 });

const TicketModel: Model<Ticket> = mongoose.model<Ticket>(
  "Ticket",
  TicketSchema
);

export default TicketModel;
