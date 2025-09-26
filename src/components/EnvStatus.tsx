"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

export default function EnvStatus() {
    const hasMongoDb = !!process.env.MONGODB_URI;
    const hasGoogleOAuth = !!(
        process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    );
    const hasCloudinary = !!(
        process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY
    );

    return (
        <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="font-medium text-blue-900 mb-2">
                            Environment Status
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-blue-800">
                                    MongoDB Database:
                                </span>
                                <Badge
                                    variant={
                                        hasMongoDb ? "default" : "secondary"
                                    }
                                    className="text-xs"
                                >
                                    {hasMongoDb ? (
                                        <>
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Connected
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="w-3 h-3 mr-1" />
                                            Not Configured
                                        </>
                                    )}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-blue-800">
                                    Google OAuth:
                                </span>
                                <Badge
                                    variant={
                                        hasGoogleOAuth ? "default" : "secondary"
                                    }
                                    className="text-xs"
                                >
                                    {hasGoogleOAuth ? (
                                        <>
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Ready
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="w-3 h-3 mr-1" />
                                            Not Configured
                                        </>
                                    )}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-blue-800">
                                    Cloudinary Images:
                                </span>
                                <Badge
                                    variant={
                                        hasCloudinary ? "default" : "secondary"
                                    }
                                    className="text-xs"
                                >
                                    {hasCloudinary ? (
                                        <>
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Ready
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="w-3 h-3 mr-1" />
                                            Not Configured
                                        </>
                                    )}
                                </Badge>
                            </div>
                        </div>

                        {(!hasMongoDb || !hasGoogleOAuth || !hasCloudinary) && (
                            <p className="text-xs text-blue-700 mt-3">
                                💡 Add environment variables to `.env.local` to
                                enable all features. Check the README for setup
                                instructions.
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
