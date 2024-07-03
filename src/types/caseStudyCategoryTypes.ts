import { Document, Schema } from "mongoose";

export type Technology = {
  icon: string;
  name: string;
};

export type CaseStudy = {
  caseStudyId: Schema.Types.ObjectId;
};

export interface ICaseStudyCategory extends Document {
  categoryName: string;
  categorySlug: string;
  technologies: Technology[];
  caseStudies: CaseStudy[];
  status: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
