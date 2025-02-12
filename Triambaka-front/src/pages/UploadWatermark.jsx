"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload } from "lucide-react"

const UploadWatermark = () => {
    const [file, setFile] = useState(null)
    const [watermarkType, setWatermarkType] = useState("auto")
    const [blockchain, setBlockchain] = useState("")
    const [isDragging, setIsDragging] = useState(false)

    const fileInputRef = useRef(null)

    // Handles file selection via the input field
    const handleFileChange = (event) => {
        if (event.target.files.length > 0) {
            setFile(event.target.files[0])
        }
    }

    // Handles drag-over event
    const handleDragOver = (event) => {
        event.preventDefault()
        setIsDragging(true)
    }

    // Handles drag-enter event
    const handleDragEnter = (event) => {
        event.preventDefault()
        setIsDragging(true)
    }

    // Handles drag-leave event
    const handleDragLeave = () => {
        setIsDragging(false)
    }

    // Handles drop event
    const handleDrop = (event) => {
        event.preventDefault()
        setIsDragging(false)

        if (event.dataTransfer.files.length > 0) {
            setFile(event.dataTransfer.files[0])
        }
    }

    // Opens file picker when the user clicks the label
    const handleClick = () => {
        fileInputRef.current.click()
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        console.log({ file, watermarkType, blockchain })
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-center">Upload & Watermark</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="file-upload">Upload File</Label>
                    <div 
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition cursor-pointer ${
                            isDragging ? "border-blue-500 bg-blue-100" : "border-gray-300"
                        }`}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={handleClick} // Trigger file input on click
                    >
                        <Input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                            accept="image/*,video/*,.pdf"
                            ref={fileInputRef}
                        />
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <span className="mt-2 block text-sm font-semibold text-gray-900">
                            {file ? file.name : "Click to upload or drag and drop"}
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Watermarking Options</Label>
                    <RadioGroup value={watermarkType} onValueChange={setWatermarkType}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="auto" id="auto" />
                            <Label htmlFor="auto">Auto (default watermark with user public key & hash)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="custom" id="custom" />
                            <Label htmlFor="custom">Custom (input text/logos)</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="blockchain">Choose Blockchain</Label>
                    <Select value={blockchain} onValueChange={setBlockchain}>
                        <SelectTrigger id="blockchain">
                            <SelectValue placeholder="Select blockchain" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ethereum">Ethereum</SelectItem>
                            <SelectItem value="polygon">Polygon</SelectItem>
                            <SelectItem value="hyperledger">Hyperledger</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button type="submit" className="w-full">
                    Submit
                </Button>
            </form>
        </div>
    )
}

export default UploadWatermark
