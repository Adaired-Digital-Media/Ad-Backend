import mongoose, { Model, Schema } from "mongoose";
import { FormField, Form } from "../types/productTypes";

const FormFieldSchema = new Schema<FormField>({
  name: { type: String, required: true },
  label: { type: String, required: true },
  placeholder:{ type: String, required: true },
  type: { type: String, required: true },
  options: [{ label: String, value: Number }],
  required: { type: Boolean, default: false },
});

const FormSchema = new Schema<Form>(
  {
    productType: { type: String, required: true },
    fields: [FormFieldSchema],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const FormModel: Model<Form> = mongoose.model<Form>("ProductForm", FormSchema);

export default FormModel;
