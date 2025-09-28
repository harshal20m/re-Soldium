import mongoose, { Document, Schema } from "mongoose";

export interface IReport extends Document {
    reporter: mongoose.Types.ObjectId;
    reportedProduct: mongoose.Types.ObjectId;
    reportedUser: mongoose.Types.ObjectId;
    reason: string;
    description?: string;
    status: "pending" | "reviewed" | "resolved" | "dismissed";
    adminNotes?: string;
    adminAction?: "warning" | "remove_listing" | "suspend_user" | "no_action";
    customMessage?: string;
    createdAt: Date;
    updatedAt: Date;
    reviewedAt?: Date;
    reviewedBy?: mongoose.Types.ObjectId;
}

const ReportSchema = new Schema<IReport>(
    {
        reporter: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        reportedProduct: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        reportedUser: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        reason: {
            type: String,
            required: true,
            enum: [
                "spam",
                "inappropriate_content",
                "fake_product",
                "scam",
                "duplicate_listing",
                "wrong_category",
                "prohibited_item",
                "harassment",
                "other",
            ],
        },
        description: {
            type: String,
            maxlength: 500,
        },
        status: {
            type: String,
            enum: ["pending", "reviewed", "resolved", "dismissed"],
            default: "pending",
        },
        adminNotes: {
            type: String,
            maxlength: 1000,
        },
        adminAction: {
            type: String,
            enum: ["warning", "remove_listing", "suspend_user", "no_action"],
        },
        customMessage: {
            type: String,
            maxlength: 500,
        },
        reviewedAt: {
            type: Date,
        },
        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
ReportSchema.index({ reporter: 1, reportedProduct: 1 }, { unique: true });
ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ reportedUser: 1 });

const Report =
    mongoose.models.Report || mongoose.model<IReport>("Report", ReportSchema);

export default Report;
