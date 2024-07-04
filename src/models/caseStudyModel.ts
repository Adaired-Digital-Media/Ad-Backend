import mongoose, { Schema, Model } from "mongoose";
import { ChallengeAndSolution, ICaseStudy } from "../types/caseStudyTypes";

const challengeAndSolutionSchema = new Schema<ChallengeAndSolution>({
  title: {
    type: String,
  },
  content: {
    type: String,
  },
});

const caseStudySchema = new Schema(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "CaseStudyCategory",
      required: [true, "Category ID is required"],
    },
    categorySlug: {
      type: String,
    },
    colorScheme: {
      type: String,
      required: [true, "Color Scheme is required"],
    },
    cardImage: {
      type: String,
      required: [true, "Card Image is required"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
    },
    subHeading: {
      type: String,
      required: [true, "Sub Heading is required"],
    },
    caseStudyName: {
      type: String,
      required: [true, "Case Study Name is required"],
    },
    caseStudyDescription: {
      type: String,
      required: [true, "Case Study Description is required"],
    },
    caseStudyImage: {
      type: String,
      required: [true, "Case Study Image is required"],
    },
    aboutProjectDescription: {
      type: String,
      required: [true, "About Project Description is required"],
    },
    challengesImage: {
      type: String,
      required: [true, "Challenges Image is required"],
    },
    challengesDescription: {
      type: String,
      required: [true, "Challenges Description is required"],
    },
    solutionsImage: {
      type: String,
      required: [true, "Solutions Image is required"],
    },
    solutionsDescription: {
      type: String,
      required: [true, "Solutions Description is required"],
    },
    challengesAndSolutions: {
      type: [challengeAndSolutionSchema],
      default: [],
    },
    technologiesUsedTitle: {
      type: String,
      required: [true, "Technologies Used Title is required"],
    },
    technologiesUsedDescription: {
      type: String,
      required: [true, "Technologies Used Description is required"],
    },
    technologiesUsed: {
      type: [
        {
          id: {
            type: Schema.Types.ObjectId,
          },
          icon: {
            type: String,
          },
          name: {
            type: String,
          },
        },
      ],
      default: [],
    },
    goalsTitle: {
      type: String,
      required: [true, "Goals Title is required"],
    },
    goalsDescription: {
      type: String,
      required: [true, "Goals Description is required"],
    },
    objectives: {
      type: [
        {
          title: {
            type: String,
            required: [true, "Objective Title is required"],
          },
          content: {
            type: String,
            required: [true, "Objective Content is required"],
          },
        },
      ],
      default: [],
    },
    stratergy: {
      type: [
        {
          title: {
            type: String,
            required: [true, "Strategy Title is required"],
          },
          content: {
            type: String,
            required: [true, "Strategy Content is required"],
          },
        },
      ],
      default: [],
    },
    goalImage: {
      type: String,
      required: [true, "Goal Image is required"],
    },
    growthBox: {
      type: [
        {
          title: {
            type: String,
            required: [true, "Growth Box Title is required"],
          },
          content: {
            type: String,
            required: [true, "Growth Box Content is required"],
          },
        },
      ],
      default: [],
    },
    resultDescription: {
      type: String,
      required: [true, "Result Description is required"],
    },
    resultBox: {
      type: [
        {
          title: {
            type: String,
            required: [true, "Result Box Title is required"],
          },
          percentage: {
            type: String,
            required: [true, "Result Box Percentage is required"],
          },
          description: {
            type: String,
            required: [true, "Result Box Description is required"],
          },
          icon: {
            type: String,
            required: [true, "Result Box Icon is required"],
          },
        },
      ],
      default: [],
    },
    resultFinalDescription: {
      type: String,
      required: [true, "Result Final Description is required"],
    },
  },
  {
    timestamps: true,
  }
);

const CaseStudy: Model<ICaseStudy> = mongoose.model<ICaseStudy>(
  "CaseStudies",
  caseStudySchema
);

export default CaseStudy;
