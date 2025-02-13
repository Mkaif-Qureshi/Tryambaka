"use client"

import { useState, useRef } from "react"
import { Upload, Download, ArrowRight, AlertCircle } from "lucide-react"

const Spinner = () => <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>

const UploadWatermark = () => {
    const [file, setFile] = useState(null)
    const [originalImageUrl, setOriginalImageUrl] = useState(null)
    const [keyValue, setKeyValue] = useState("12345")
    const [delta, setDelta] = useState("7.75")
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [showExpected, setShowExpected] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [ber, setBer] = useState(null)

    const fileInputRef = useRef(null)

    const handleFileChange = (event) => {
        if (event.target.files && event.target.files.length > 0) {
            const selectedFile = event.target.files[0]
            setFile(selectedFile)
            setOriginalImageUrl(URL.createObjectURL(selectedFile))
            setErrorMessage("")
            setBer(null)
        }
    }

    const handleDrop = (event) => {
        event.preventDefault()
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            const droppedFile = event.dataTransfer.files[0]
            setFile(droppedFile)
            setOriginalImageUrl(URL.createObjectURL(droppedFile))
            setErrorMessage("")
            setBer(null)
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setLoading(true)
        setResult(null)
        setShowExpected(false)
        setErrorMessage("")
        setBer(null)

        if (!file) {
            setErrorMessage("Please upload a file.")
            setLoading(false)
            return
        }

        try {
            const reader = new FileReader()
            reader.onloadend = async () => {
                const base64Image = reader.result.split(",")[1]

                const payload = {
                    image: base64Image,
                    key: Number.parseInt(keyValue, 10),
                    delta: Number.parseFloat(delta),
                }

                const response = await fetch("http://127.0.0.1:5000/api/watermark/embed", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                })

                const data = await response.json()

                if (!response.ok) {
                    if (data.error === "The image is already watermarked.") {
                        setErrorMessage(data.error)
                        setBer(data.BER)
                    } else {
                        throw new Error(data.error || "Failed to process the image.")
                    }
                } else {
                    setResult(data)
                    setBer(data.BER)
                }
            }

            reader.readAsDataURL(file)
        } catch (error) {
            console.error(error)
            setErrorMessage(error.message)
        } finally {
            setLoading(false)
        }
    }

    const downloadFile = (dataUrl, filename) => {
        const link = document.createElement("a")
        link.href = dataUrl
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="md:flex">
                    <div className="md:w-1/2 p-8">
                        <h1 className="text-4xl font-bold mb-6">Watermark Your Image</h1>
                        <p className="text-gray-600 mb-8">Protect your digital assets with our advanced watermarking technology.</p>
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
                                    Delta
                                </label>
                                <input
                                    id="delta-input"
                                    type="number"
                                    step="any"
                                    value={delta}
                                    onChange={(e) => setDelta(e.target.value)}
                                    placeholder="Enter delta (e.g., 7.75)"
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
                                    <>
                                        Watermark Image
                                        <ArrowRight className="ml-2" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                    <div className="md:w-1/2 bg-gray-100 p-8 max-h-screen overflow-y-auto">
                        {originalImageUrl && (
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold mb-4">Original Image</h2>
                                <div className="relative h-64 rounded-lg overflow-hidden group">
                                    <img
                                        src={originalImageUrl || "/placeholder.svg"}
                                        alt="Original"
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                    <button
                                        onClick={() => downloadFile(originalImageUrl, "original_image.png")}
                                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                        title="Download Original"
                                    >
                                        <Download className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        )}
                        {result && result.watermarked_image && (
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Watermarked Image</h2>
                                <div className="relative h-64 rounded-lg overflow-hidden group">
                                    <img
                                        src={`data:image/jpeg;base64,${result.watermarked_image}`}
                                        alt="Watermarked"
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                    <button
                                        onClick={() =>
                                            downloadFile(`data:image/jpeg;base64,${result.watermarked_image}`, "watermarked_image.jpg")
                                        }
                                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                        title="Download Watermarked"
                                    >
                                        <Download className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        )}
                        {errorMessage && (
                            <div className="mt-8 p-4 bg-yellow-100 text-yellow-700 rounded-lg flex items-start">
                                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold">{errorMessage}</p>
                                    {ber !== null && <p className="mt-2">Bit Error Rate (BER): {ber.toFixed(4)}</p>}
                                </div>
                            </div>
                        )}
                        {result && !result.error && (
                            <div className="mt-8 p-4 bg-green-100 text-green-700 rounded-lg">
                                <p>Watermark embedded successfully!</p>
                                {ber !== null && <p className="mt-2">Bit Error Rate (BER): {ber.toFixed(4)}</p>}
                                <button onClick={() => setShowExpected(!showExpected)} className="mt-2 text-blue-600 hover:underline">
                                    {showExpected ? "Hide" : "Show"} Expected Watermark
                                </button>
                                {showExpected && (
                                    <pre className="bg-white p-4 rounded-md mt-2 overflow-auto max-h-60 text-sm">
                                        {JSON.stringify(result.expected_watermark, null, 2)}
                                    </pre>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UploadWatermark

