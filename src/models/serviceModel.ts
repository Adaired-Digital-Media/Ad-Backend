import mongoose, { Schema } from "mongoose";
import { ServiceTypes } from "../types/serviceTypes";

const serviceSchema = new Schema<ServiceTypes>({
  metaTitle: { type: String, required: true },
  metaDescription: { type: String, required: true },
  canonicalLink: { type: String, required: true },
  openGraphImage: { type: String },
  robotsText: { type: String, default: "noindex, nofollow" },
  focusKeyword: { type: String, required: true },
  serviceName: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  parentService: { type: Schema.Types.ObjectId, ref: "Service", default: null },
  status: { type: String, enum: ["publish", "draft"], required: true },
  childServices: [{ type: Schema.Types.ObjectId, ref: "Service" }],
  bodyData: [{ type: Schema.Types.Mixed }],
});

const Service = mongoose.model<ServiceTypes>("Service", serviceSchema);

export default Service;
