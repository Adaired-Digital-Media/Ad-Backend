import { Types } from "mongoose";

export type ServiceTypes = {
  metaTitle: string;
  metaDescription: string;
  canonicalLink: string;
  openGraphImage?: string; // Optional
  robotsText?: string; // Optional, with a default value
  focusKeyword: string;
  serviceName: string;
  slug: string;
  colorScheme: string;
  parentService?: Types.ObjectId | null; // ObjectId or null
  status: "publish" | "draft";
  childServices: Array<{
    childServiceId: Types.ObjectId;
  }>; // Array of objects with childServiceId
  bodyData: Array<Record<string, any>>; // Array of objects with any shape
};