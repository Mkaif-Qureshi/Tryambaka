"use client"

import { useState } from "react"
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

    const handleFileChange = (event) => {
        setFile(event.target.files[0])
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        // Handle form submission
        console.log({ file, watermarkType, blockchain })
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-center">Upload & Watermark</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="file-upload">Upload File</Label>
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

