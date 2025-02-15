"use client"

import { useState, useRef } from "react"
import { Upload, Download, AlertCircle, CheckCircle } from "lucide-react"

const Spinner = () => <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>

const VerifyWatermark = () => {
    const [file, setFile] = useState(null)
    const [originalImageUrl, setOriginalImageUrl] = useState(null)
    const [keyValue, setKeyValue] = useState("12345")
    const [delta, setDelta] = useState("1.0")
    const [extractedWatermark, setExtractedWatermark] = useState(null)
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const fileInputRef = useRef(null)

    const handleFileChange = (event) => {
        if (event.target.files && event.target.files.length > 0) {
            const selectedFile = event.target.files[0]
            setFile(selectedFile)
            setOriginalImageUrl(URL.createObjectURL(selectedFile))
            setErrorMessage("")
            setExtractedWatermark(null)
        }
    }

    const handleDrop = (event) => {
        event.preventDefault()
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            const droppedFile = event.dataTransfer.files[0]
            setFile(droppedFile)
            setOriginalImageUrl(URL.createObjectURL(droppedFile))
            setErrorMessage("")
            setExtractedWatermark(null)
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setLoading(true)
        setExtractedWatermark(null)
        setErrorMessage("")

        if (!file) {
            setErrorMessage("Please upload a file.")
            setLoading(false)
            return
        }

        try {
            const formData = new FormData()
            formData.append("image", file)
            formData.append("key", keyValue)
            formData.append("delta", delta)

            const response = await fetch("http://127.0.0.1:5000/api/watermark/extract", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json()
                setErrorMessage(errorData.error || "Failed to extract watermark.")
            } else {
                const data = await response.json()
                setExtractedWatermark(data.watermark)
            }
        } catch (error) {
            console.error(error)
            setErrorMessage(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="md:flex">
                    <div className="md:w-1/2 p-8">
                        <h1 className="text-4xl font-bold mb-6">Verify Watermark</h1>
                        <p className="text-gray-600 mb-8">Extract and validate embedded watermarks with ease.</p>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div
                                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition cursor-pointer hover:border-gray-400"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    ref={fileInputRef}
                                />
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <span className="mt-2 block text-sm font-medium text-gray-900">
                                    {file ? file.name : "Click to upload or drag and drop"}
                                </span>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="key-input" className="text-sm font-medium text-gray-700">
                                    Watermark Key
                                </label>
                                <input
                                    id="key-input"
                                    type="number"
                                    value={keyValue}
                                    onChange={(e) => setKeyValue(e.target.value)}
                                    placeholder="Enter key (e.g., 12345)"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="delta-input" className="text-sm font-medium text-gray-700">
                                    Delta Value
                                </label>
                                <input
                                    id="delta-input"
                                    type="number"
                                    value={delta}
                                    onChange={(e) => setDelta(e.target.value)}
                                    placeholder="Enter delta (e.g., 1.0)"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <Spinner />
                                        <span>Processing...</span>
                                    </div>
                                ) : (
                                    "Extract Watermark"
                                )}
                            </button>
                        </form>
                    </div>
                    <div className="md:w-1/2 bg-gray-100 p-8 max-h-screen overflow-y-auto">
                        {originalImageUrl && (
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold mb-4">Uploaded Image</h2>
                                <img
                                    src={originalImageUrl}
                                    alt="Uploaded"
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                            </div>
                        )}
                        {extractedWatermark && (
                            <div className="mt-8 p-4 bg-green-100 text-green-700 rounded-lg">
                                <CheckCircle className="w-6 h-6 inline-block mr-2" />
                                <span>Extracted Watermark: {extractedWatermark}</span>
                            </div>
                        )}
                        {errorMessage && (
                            <div className="mt-8 p-4 bg-yellow-100 text-yellow-700 rounded-lg flex items-start">
                                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                                <p className="font-semibold">{errorMessage}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VerifyWatermark
