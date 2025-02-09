"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, CheckCircle, XCircle } from "lucide-react"

const Verification = () => {
    const [file, setFile] = useState(null)
    const [verificationStatus, setVerificationStatus] = useState(null)

    const handleFileChange = (event) => {
        setFile(event.target.files[0])
    }

    const handleVerify = () => {
        // Simulating verification process
        setTimeout(() => {
            setVerificationStatus(Math.random() > 0.5 ? "authentic" : "tampered")
        }, 1500)
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-center">Verify Content</h1>
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="file-upload">Upload Content to Verify</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                            accept="image/*,video/*,.pdf"
                        />
                        <Label htmlFor="file-upload" className="cursor-pointer">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <span className="mt-2 block text-sm font-semibold text-gray-900">
                                {file ? file.name : "Click to upload or drag and drop"}
                            </span>
                        </Label>
                    </div>
                </div>

                <Button onClick={handleVerify} className="w-full" disabled={!file}>
                    Verify Content
                </Button>

                {verificationStatus && (
                    <div className={`p-4 rounded-lg ${verificationStatus === "authentic" ? "bg-green-100" : "bg-red-100"}`}>
                        {verificationStatus === "authentic" ? (
                            <div className="flex items-center">
                                <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                                <span className="font-semibold text-green-800">Authentic Content</span>
                            </div>
                        ) : (
                            <div className="flex items-center">
                                <XCircle className="h-6 w-6 text-red-600 mr-2" />
                                <span className="font-semibold text-red-800">Tampered Content</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Verification

