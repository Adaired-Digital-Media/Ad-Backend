import mongoose, { Schema, Model } from "mongoose";
import {
  ICaseStudyCategory,
  Technology,
  CaseStudy,
} from "../types/caseStudyCategoryTypes";

const technologySchema = new Schema<Technology>({
  icon: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const caseStudySchema = new Schema<CaseStudy>({
  caseStudyId: {
    type: Schema.Types.ObjectId,
    ref: "CaseStudy",
  },
});

const caseStudyCategorySchema = new Schema<ICaseStudyCategory>(
  {
    categoryName: {
      type: String,
      required: true,
    },
    categorySlug: {
      type: String,
      required: true,
      unique: true,
    },
    technologies: {
      type: [technologySchema],
      default: [],
    },
    caseStudies: {
      type: [caseStudySchema],
      default: [],
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const CaseStudyCategories: Model<ICaseStudyCategory> =
  mongoose.model<ICaseStudyCategory>(
    "CaseStudyCategory",
    caseStudyCategorySchema
  );

export default CaseStudyCategories;
