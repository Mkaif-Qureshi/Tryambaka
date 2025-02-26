"use client"

import { useState, useRef } from "react"
import {
    Upload,
    AlertCircle,
    CheckCircle,
    Eye,
    Download,
    Calendar,
    User,
    FileIcon as FileHash,
    Link,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function VerifyWatermark() {
    const [file, setFile] = useState(null)
    const [imageUrl, setImageUrl] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [result, setResult] = useState(null)
    const [showImageModal, setShowImageModal] = useState(false)
    const fileInputRef = useRef(null)

    const handleFileChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            const selectedFile = event.target.files[0]
            setFile(selectedFile)
            setImageUrl(URL.createObjectURL(selectedFile))
            setError("")
            setResult(null)
        }
    }

    const handleDrop = (event) => {
        event.preventDefault()
        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            const droppedFile = event.dataTransfer.files[0]
            setFile(droppedFile)
            setImageUrl(URL.createObjectURL(droppedFile))
            setError("")
            setResult(null)
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setLoading(true)
        setError("")
        setResult(null)

        if (!file) {
            setError("Please upload an image")
            setLoading(false)
            return
        }

        try {
            const formData = new FormData()
            formData.append("image", file)

            const response = await fetch("http://127.0.0.1:5000/api/watermark/check_image", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                throw new Error("Failed to verify watermark")
            }

            const data = await response.json()
            setResult(data)
        } catch (err) {
            setError(err.message || "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    const handleViewIPFS = () => {
        if (result?.blockchain_data?.ipfs_hash) {
            setShowImageModal(true)
        }
    }

    const handleDownloadIPFS = () => {
        if (result?.blockchain_data?.ipfs_hash) {
            window.open(`https://ipfs.io/ipfs/${result.blockchain_data.ipfs_hash}?download=true`, "_blank")
        }
    }

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return "N/A"
        const date = new Date(timestamp * 1000) // Convert from Unix timestamp if needed
        return date.toLocaleString()
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <Card className="max-w-4xl mx-auto">
                <div className="md:grid md:grid-cols-2 md:gap-6 bg-grey-50 rounded-2xl shadow-xl">
                    <div className="p-6">
                        <div className="space-y-4">
                            <h1 className="text-3xl font-bold">Verify Watermark</h1>
                            <p className="text-muted-foreground">Upload an image to verify its digital watermark</p>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                            <div
                                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {file ? file.name : "Drop your image here or click to browse"}
                                </p>
                            </div>

                            <Button className="w-full" type="submit" disabled={loading}>
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        <span>Verifying...</span>
                                    </div>
                                ) : (
                                    "Verify Watermark"
                                )}
                            </Button>
                        </form>
                    </div>

                    <div className="border-t md:border-t-0 md:border-l">
                        <div className="p-6 space-y-6">
                            {imageUrl && (
                                <div>
                                    <Label>Uploaded Image</Label>
                                    <div className="mt-2 aspect-video rounded-lg overflow-hidden bg-muted">
                                        <img src={imageUrl || "/placeholder.svg"} alt="Uploaded" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            )}

                            {result && (
                                <div
                                    className={`p-4 rounded-lg ${result.is_watermarked
                                        ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                                        : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        {result.is_watermarked ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                                        <h3 className="font-semibold text-lg">
                                            {result.is_watermarked ? "Watermark Verified" : "No Watermark Detected"}
                                        </h3>
                                    </div>

                                    <div className="bg-white/30 dark:bg-black/20 p-2 rounded mb-4">
                                        <span className="font-medium">Image Hash:</span>
                                        <p className="break-all text-xs mt-1">{result.image_hash}</p>
                                    </div>

                                    {result.blockchain_data && (
                                        <div className="mt-4 p-4 bg-white/50 dark:bg-black/30 rounded-lg">
                                            <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                                                <Badge variant="outline" className="px-2 py-1">
                                                    Blockchain Record
                                                </Badge>
                                            </h4>

                                            <Table>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell className="py-2 pl-0 pr-2 align-top">
                                                            <div className="flex items-center gap-2">
                                                                <Link className="h-4 w-4" />
                                                                <span className="font-medium">IPFS Hash</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-2 break-all text-xs">{result.blockchain_data.ipfs_hash}</TableCell>
                                                    </TableRow>

                                                    <TableRow>
                                                        <TableCell className="py-2 pl-0 pr-2 align-top">
                                                            <div className="flex items-center gap-2">
                                                                <User className="h-4 w-4" />
                                                                <span className="font-medium">Owner</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-2 break-all text-xs">{result.blockchain_data.owner}</TableCell>
                                                    </TableRow>

                                                    <TableRow>
                                                        <TableCell className="py-2 pl-0 pr-2 align-top">
                                                            <div className="flex items-center gap-2">
                                                                <FileHash className="h-4 w-4" />
                                                                <span className="font-medium">SHA256</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-2 break-all text-xs">
                                                            {result.blockchain_data.sha256_hash || "N/A"}
                                                        </TableCell>
                                                    </TableRow>

                                                    <TableRow>
                                                        <TableCell className="py-2 pl-0 pr-2 align-top">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-4 w-4" />
                                                                <span className="font-medium">Timestamp</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-2 text-xs">
                                                            {formatTimestamp(result.blockchain_data.timestamp)}
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={handleViewIPFS}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View Image
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleDownloadIPFS}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Download Image
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {error && (
                                <div className="p-4 bg-destructive/10 text-destructive rounded-lg flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Image View Modal */}
            <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>IPFS Image</DialogTitle>
                    </DialogHeader>
                    <div className="mt-2 rounded-lg overflow-hidden bg-muted/30 p-1">
                        {result?.blockchain_data?.ipfs_hash && (
                            <img
                                src={`https://ipfs.io/ipfs/${result.blockchain_data.ipfs_hash}`}
                                alt="IPFS Image"
                                className="w-full h-auto object-contain max-h-[70vh]"
                            />
                        )}
                    </div>
                    <div className="flex justify-end mt-2">
                        <Button variant="outline" size="sm" onClick={handleDownloadIPFS} className="flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Download
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

