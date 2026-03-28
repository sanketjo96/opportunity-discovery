import mongoose from "mongoose";

const telegramMetadataSchema = new mongoose.Schema(
  {
    updateId: { type: Number, required: true },
    messageId: { type: Number, required: true },
    date: { type: Number, required: true },
    chatId: { type: Number, required: true },
    chatType: String,
    chatUsername: String,
    fromUserId: { type: Number, required: true },
    fromUsername: String,
    fromIsBot: { type: Boolean, required: true },
    fromFirstName: String,
    fromLastName: String,
  },
  { _id: false }
);

const opportunitySchema = new mongoose.Schema(
  {
    source: { type: String, default: "telegram" },
    rawText: { type: String, required: true },

    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["casting", "workshop", "other"],
      required: true,
    },

    roles: [String],
    ageRange: String,
    location: String,
    language: String,
    email: String,
    url: String,
    contact: String,
    deadline: String,
    metadata: { type: telegramMetadataSchema, required: true },
  },
  {
    timestamps: true,
  }
);

export const OpportunityModel = mongoose.model("Opportunity", opportunitySchema);
