"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Flag, Eye, Loader2, Calendar } from "lucide-react";

interface Report {
    _id: string;
    reporter: {
        _id: string;
        name: string;
        email: string;
    };
    reportedUser: {
        _id: string;
        name: string;
        email: string;
        warnings?: {
            count: number;
        };
    };
    reportedProduct: {
        _id: string;
        title: string;
        price: number;
        images: string[];
    };
    reason: string;
    description?: string;
    status: string;
    adminNotes?: string;
    adminAction?: string;
    customMessage?: string;
    createdAt: string;
    reviewedAt?: string;
    reviewedBy?: {
        name: string;
    };
}

export default function AdminReportsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState("pending");
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [actionData, setActionData] = useState({
        action: "",
        adminNotes: "",
        customMessage: "",
    });

    const checkAdminAccess = useCallback(async () => {
        if (!session?.user || !("id" in session.user)) {
            router.push("/login");
            return;
        }

        try {
            const response = await fetch("/api/admin/check-access");
            if (!response.ok) {
                router.push("/");
                return;
            }
        } catch (error) {
            console.error("Admin access check failed:", error);
            router.push("/");
        }
    }, [session?.user, router]);

    const fetchReports = useCallback(async () => {
        try {
            const response = await fetch(
                `/api/reports?status=${selectedStatus}`
            );
            if (response.ok) {
                const data = await response.json();
                setReports(data.reports);
            } else {
                toast.error("Failed to fetch reports");
            }
        } catch (error) {
            console.error("Error fetching reports:", error);
            toast.error("Failed to fetch reports");
        } finally {
            setLoading(false);
        }
    }, [selectedStatus]);

    useEffect(() => {
        if (status === "loading") return;
        checkAdminAccess();
    }, [status, checkAdminAccess]);

    useEffect(() => {
        if (session?.user) {
            fetchReports();
        }
    }, [session?.user, fetchReports]);

    const handleStatusChange = (status: string) => {
        setSelectedStatus(status);
    };

    const handleViewReport = (report: Report) => {
        setSelectedReport(report);
        setIsDialogOpen(true);
    };

    const handleProcessReport = async () => {
        if (!selectedReport || !actionData.action) {
            toast.error("Please select an action");
            return;
        }

        setIsProcessing(true);

        try {
            const response = await fetch(`/api/reports/${selectedReport._id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(actionData),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Report processed successfully");
                setIsDialogOpen(false);
                setActionData({
                    action: "",
                    adminNotes: "",
                    customMessage: "",
                });
                fetchReports();
            } else {
                toast.error(data.error || "Failed to process report");
            }
        } catch (error) {
            console.error("Error processing report:", error);
            toast.error("Failed to process report");
        } finally {
            setIsProcessing(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "reviewed":
                return "bg-blue-100 text-blue-800";
            case "resolved":
                return "bg-green-100 text-green-800";
            case "dismissed":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getReasonLabel = (reason: string) => {
        const reasonMap: { [key: string]: string } = {
            spam: "Spam",
            inappropriate_content: "Inappropriate Content",
            fake_product: "Fake Product",
            scam: "Scam",
            duplicate_listing: "Duplicate Listing",
            wrong_category: "Wrong Category",
            prohibited_item: "Prohibited Item",
            harassment: "Harassment",
            other: "Other",
        };
        return reasonMap[reason] || reason;
    };

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading reports...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-8 animate-fade-in">
                {/* Breadcrumbs */}
                <Breadcrumbs
                    items={[
                        { label: "Admin", href: "/admin" },
                        { label: "Reports" },
                    ]}
                />

                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Report Management
                    </h1>
                    <p className="text-gray-600">
                        Review and manage user reports for inappropriate content
                    </p>
                </div>

                {/* Status Filter */}
                <div className="mb-6">
                    <Select
                        value={selectedStatus}
                        onValueChange={handleStatusChange}
                    >
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="dismissed">Dismissed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Reports List */}
                <div className="space-y-4">
                    {reports.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Flag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    No Reports Found
                                </h3>
                                <p className="text-gray-600">
                                    No reports found for the selected status.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        reports.map((report) => (
                            <Card key={report._id} className="hover-lift">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <Flag className="w-5 h-5 text-red-500" />
                                            <div>
                                                <CardTitle className="text-lg">
                                                    {getReasonLabel(
                                                        report.reason
                                                    )}
                                                </CardTitle>
                                                <p className="text-sm text-gray-600">
                                                    Reported by{" "}
                                                    {report.reporter.name}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge
                                                className={getStatusColor(
                                                    report.status
                                                )}
                                            >
                                                {report.status}
                                            </Badge>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleViewReport(report)
                                                }
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                View
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">
                                                Reported Product
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                {report.reportedProduct.title}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                ₹
                                                {report.reportedProduct.price.toLocaleString()}
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">
                                                Reported User
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                {report.reportedUser.name}
                                            </p>
                                            {report.reportedUser.warnings && (
                                                <p className="text-sm text-red-600">
                                                    {
                                                        report.reportedUser
                                                            .warnings.count
                                                    }
                                                    /3 warnings
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {report.description && (
                                        <div className="mt-4">
                                            <h4 className="font-medium text-gray-900 mb-2">
                                                Description
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                {report.description}
                                            </p>
                                        </div>
                                    )}
                                    <div className="mt-4 flex items-center text-sm text-gray-500">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {new Date(
                                            report.createdAt
                                        ).toLocaleDateString()}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Report Details Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Report Details</DialogTitle>
                            <DialogDescription>
                                Review the report and take appropriate action
                            </DialogDescription>
                        </DialogHeader>

                        {selectedReport && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Reporter</Label>
                                        <p className="text-sm text-gray-600">
                                            {selectedReport.reporter.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {selectedReport.reporter.email}
                                        </p>
                                    </div>
                                    <div>
                                        <Label>Reported User</Label>
                                        <p className="text-sm text-gray-600">
                                            {selectedReport.reportedUser.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {selectedReport.reportedUser.email}
                                        </p>
                                        {selectedReport.reportedUser
                                            .warnings && (
                                            <p className="text-xs text-red-600">
                                                Warnings:{" "}
                                                {
                                                    selectedReport.reportedUser
                                                        .warnings.count
                                                }
                                                /3
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label>Product</Label>
                                    <p className="text-sm text-gray-600">
                                        {selectedReport.reportedProduct.title}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        ₹
                                        {selectedReport.reportedProduct.price.toLocaleString()}
                                    </p>
                                </div>

                                <div>
                                    <Label>Reason</Label>
                                    <p className="text-sm text-gray-600">
                                        {getReasonLabel(selectedReport.reason)}
                                    </p>
                                </div>

                                {selectedReport.description && (
                                    <div>
                                        <Label>Description</Label>
                                        <p className="text-sm text-gray-600">
                                            {selectedReport.description}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="action">Action</Label>
                                    <Select
                                        value={actionData.action}
                                        onValueChange={(value) =>
                                            setActionData((prev) => ({
                                                ...prev,
                                                action: value,
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select action" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="no_action">
                                                No Action
                                            </SelectItem>
                                            <SelectItem value="warning">
                                                Issue Warning
                                            </SelectItem>
                                            <SelectItem value="remove_listing">
                                                Remove Listing
                                            </SelectItem>
                                            <SelectItem value="suspend_user">
                                                Suspend User
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="adminNotes">
                                        Admin Notes
                                    </Label>
                                    <Textarea
                                        id="adminNotes"
                                        placeholder="Internal notes about this report..."
                                        value={actionData.adminNotes}
                                        onChange={(e) =>
                                            setActionData((prev) => ({
                                                ...prev,
                                                adminNotes: e.target.value,
                                            }))
                                        }
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="customMessage">
                                        Custom Message to User
                                    </Label>
                                    <Textarea
                                        id="customMessage"
                                        placeholder="Custom message to send to the reported user..."
                                        value={actionData.customMessage}
                                        onChange={(e) =>
                                            setActionData((prev) => ({
                                                ...prev,
                                                customMessage: e.target.value,
                                            }))
                                        }
                                        rows={3}
                                    />
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                                disabled={isProcessing}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleProcessReport}
                                disabled={isProcessing || !actionData.action}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    "Process Report"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
