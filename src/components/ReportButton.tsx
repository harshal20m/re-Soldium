"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ReportButtonProps {
    productId: string;
    productTitle: string;
    sellerId: string;
    variant?: "default" | "outline" | "ghost";
    size?: "default" | "sm" | "lg";
    className?: string;
}

const REPORT_REASONS = [
    { value: "spam", label: "Spam" },
    { value: "inappropriate_content", label: "Inappropriate Content" },
    { value: "fake_product", label: "Fake Product" },
    { value: "scam", label: "Scam" },
    { value: "duplicate_listing", label: "Duplicate Listing" },
    { value: "wrong_category", label: "Wrong Category" },
    { value: "prohibited_item", label: "Prohibited Item" },
    { value: "harassment", label: "Harassment" },
    { value: "other", label: "Other" },
];

export default function ReportButton({
    productId,
    productTitle,
    sellerId: _sellerId, // eslint-disable-line @typescript-eslint/no-unused-vars
    variant = "ghost",
    size = "sm",
    className = "",
}: ReportButtonProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        reason: "",
        description: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!session?.user) {
            toast.error("Please log in to report listings");
            router.push("/login");
            return;
        }

        if (!formData.reason) {
            toast.error("Please select a reason for reporting");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/reports", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productId,
                    reason: formData.reason,
                    description: formData.description,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(
                    "Report submitted successfully. Thank you for helping keep our community safe!"
                );
                setIsOpen(false);
                setFormData({ reason: "", description: "" });

                // Refresh the page to hide the reported listing
                router.refresh();
            } else {
                toast.error(data.error || "Failed to submit report");
            }
        } catch (error) {
            console.error("Error submitting report:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!session?.user) {
            toast.error("Please log in to report listings");
            router.push("/login");
            return;
        }
        setIsOpen(open);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant={variant}
                    size={size}
                    className={`text-gray-500 hover:text-red-600 ${className}`}
                >
                    <Flag className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Report Listing</DialogTitle>
                    <DialogDescription>
                        Help us keep the community safe by reporting
                        inappropriate content.
                        <br />
                        <strong>Reporting: {productTitle}</strong>
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="reason">Reason for reporting</Label>
                            <Select
                                value={formData.reason}
                                onValueChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        reason: value,
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    {REPORT_REASONS.map((reason) => (
                                        <SelectItem
                                            key={reason.value}
                                            value={reason.value}
                                        >
                                            {reason.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">
                                Additional details (optional)
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Please provide any additional information that might help us review this report..."
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                                maxLength={500}
                                rows={3}
                            />
                            <p className="text-xs text-gray-500">
                                {formData.description.length}/500 characters
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !formData.reason}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Report"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
