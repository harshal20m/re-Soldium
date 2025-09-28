import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/utils/db";
import Report from "@/models/Report";
import Product from "@/models/Product";
import User from "@/models/User";
import { sendNotification } from "@/utils/notifications";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// Update report status and take action
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const { action, adminNotes, customMessage } = await request.json();

        if (!action) {
            return NextResponse.json(
                { error: "Action is required" },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if user is admin
        const adminUser = await User.findById(session.user.id).select("role");
        if (
            !adminUser ||
            (adminUser.role !== "admin" && adminUser.role !== "super_admin")
        ) {
            return NextResponse.json(
                { error: "Admin access required" },
                { status: 403 }
            );
        }

        // Find the report
        const report = await Report.findById(id)
            .populate("reportedUser")
            .populate("reportedProduct")
            .populate("reporter");

        if (!report) {
            return NextResponse.json(
                { error: "Report not found" },
                { status: 404 }
            );
        }

        if (report.status !== "pending") {
            return NextResponse.json(
                { error: "Report has already been processed" },
                { status: 400 }
            );
        }

        // Update report status
        report.status = "resolved";
        report.adminAction = action;
        report.adminNotes = adminNotes;
        report.customMessage = customMessage;
        report.reviewedAt = new Date();
        report.reviewedBy = session.user.id;

        await report.save();

        // Take action based on admin decision
        let notificationMessage = "";
        let warningCount = 0;

        switch (action) {
            case "warning":
                // Add warning to user
                const reportedUser = await User.findById(
                    report.reportedUser._id
                );
                if (reportedUser) {
                    reportedUser.warnings.count = Math.min(
                        reportedUser.warnings.count + 1,
                        3
                    );
                    reportedUser.warnings.lastWarningDate = new Date();

                    if (reportedUser.warnings.count >= 3) {
                        reportedUser.warnings.isSuspended = true;
                        reportedUser.warnings.suspensionReason =
                            "Multiple policy violations";
                        reportedUser.warnings.suspensionEndDate = new Date(
                            Date.now() + 30 * 24 * 60 * 60 * 1000
                        ); // 30 days
                        notificationMessage = `Your account has been suspended for 30 days due to multiple policy violations. Reason: ${
                            report.reason
                        }. ${customMessage || ""}`;
                    } else {
                        notificationMessage = `You have received a warning for violating our community guidelines. Reason: ${
                            report.reason
                        }. ${customMessage || ""}`;
                    }

                    await reportedUser.save();
                    warningCount = reportedUser.warnings.count;
                }
                break;

            case "remove_listing":
                // Remove the product
                await Product.findByIdAndUpdate(report.reportedProduct._id, {
                    status: "removed",
                    isActive: false,
                });
                notificationMessage = `Your listing "${
                    report.reportedProduct.title
                }" has been removed for violating our community guidelines. Reason: ${
                    report.reason
                }. ${customMessage || ""}`;
                break;

            case "suspend_user":
                // Suspend the user
                const userToSuspend = await User.findById(
                    report.reportedUser._id
                );
                if (userToSuspend) {
                    userToSuspend.warnings.isSuspended = true;
                    userToSuspend.warnings.suspensionReason = report.reason;
                    userToSuspend.warnings.suspensionEndDate = new Date(
                        Date.now() + 7 * 24 * 60 * 60 * 1000
                    ); // 7 days
                    await userToSuspend.save();
                }
                notificationMessage = `Your account has been suspended for 7 days due to policy violations. Reason: ${
                    report.reason
                }. ${customMessage || ""}`;
                break;

            case "no_action":
                notificationMessage = `A report about your listing "${report.reportedProduct.title}" has been reviewed and no action was taken. Thank you for following our community guidelines.`;
                break;
        }

        // Send notification to the reported user
        if (notificationMessage) {
            await sendNotification({
                userId: report.reportedUser._id.toString(),
                type: "report_action",
                title: "Report Action Taken",
                message: notificationMessage,
                data: {
                    reportId: report._id,
                    action,
                    warningCount,
                },
            });
        }

        return NextResponse.json({
            success: true,
            message: "Report processed successfully",
            action,
            warningCount,
        });
    } catch (error) {
        console.error("Error processing report:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Get specific report details
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;

        await connectDB();

        // Check if user is admin
        const user = await User.findById(session.user.id).select("role");
        if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
            return NextResponse.json(
                { error: "Admin access required" },
                { status: 403 }
            );
        }

        const report = await Report.findById(id)
            .populate("reporter", "name email")
            .populate("reportedUser", "name email warnings")
            .populate(
                "reportedProduct",
                "title price images description category condition"
            )
            .populate("reviewedBy", "name");

        if (!report) {
            return NextResponse.json(
                { error: "Report not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            report,
        });
    } catch (error) {
        console.error("Error fetching report:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
