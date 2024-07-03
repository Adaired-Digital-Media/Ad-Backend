import { Document, Schema } from "mongoose";

// Define the type for Challenge and Solution
export type ChallengeAndSolution = {
  title: string;
  content: string;
};

// Define the type for Technology Used
export type TechnologyUsed = {
  technologyId: Schema.Types.ObjectId;
};

// Define the type for Objective
export type Objective = {
  title: string;
  content: string;
};

// Define the type for Strategy
export type Strategy = {
  title: string;
  content: string;
};

// Define the type for Growth Box
export type GrowthBox = {
  title: string;
  content: string;
};

// Define the type for Result Box
export type ResultBox = {
  title: string;
  percentage: string;
  description: string;
  icon: string;
};

// Define the interface for Case Study
export interface ICaseStudy extends Document {
  categoryId: Schema.Types.ObjectId;
  categorySlug: string;
  colorScheme: string;
  cardImage: string;
  slug: string;
  subHeading: string;
  caseStudyName: string;
  caseStudyDescription: string;
  caseStudyImage: string;
  aboutProjectDescription: string;
  challengesImage: string;
  challengesDescription: string;
  solutionsImage: string;
  solutionsDescription: string;
  challengesAndSolutions: ChallengeAndSolution[];
  technologiesUsedTitle: string;
  technologiesUsedDescription: string;
  technologiesUsed: TechnologyUsed[];
  goalsTitle: string;
  goalsDescription: string;
  objectives: Objective[];
  stratergy: Strategy[];
  goalImage: string;
  growthBox: GrowthBox[];
  resultDescription: string;
  resultBox: ResultBox[];
  resultFinalDescription: string;
  createdAt?: Date;
  updatedAt?: Date;
}
