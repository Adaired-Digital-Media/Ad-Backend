import mongoose, { Schema } from "mongoose";

const pageSchema = new Schema({
  metaTitle: {
    type: String,
    required: true,
  },
  metaDescription: {
    type: String,
    required: true,
  },
  canonicalLink: {
    type: String,
    required: true,
  },
  openGraphImage: {
    type: String,
  },
  robotsText: {
    type: String,
    default: "index, follow",
  },
  focusKeyword: {
    type: String,
    required: true,
  },
  bodyData: {
    type: [{}],
    required: true,
  },
});

const Page = mongoose.model("Page", pageSchema);

export default Page;
