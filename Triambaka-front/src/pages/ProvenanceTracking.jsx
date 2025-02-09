"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, ExternalLink } from "lucide-react"

const ProvenanceTracking = () => {
    const [searchQuery, setSearchQuery] = useState("")
    const [provenanceData, setProvenanceData] = useState(null)

    const handleSearch = (e) => {
        e.preventDefault()
        // Simulating provenance data fetch
        setProvenanceData([
            { timestamp: "2024-02-09T12:00:00Z", owner: "Alice", action: "Created" },
            { timestamp: "2024-02-10T15:30:00Z", owner: "Bob", action: "Purchased" },
            { timestamp: "2024-02-11T09:45:00Z", owner: "Charlie", action: "Modified" },
        ])
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-center">Provenance Tracking</h1>
            <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="search">Enter content hash or file to retrieve history</Label>
                    <div className="flex space-x-2">
                        <Input
                            id="search"
                            type="text"
                            placeholder="Enter hash or upload file"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button type="submit">
                            <Search className="h-4 w-4 mr-2" />
                            Search
                        </Button>
                    </div>
                </div>
            </form>

            {provenanceData && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">Provenance Timeline</h2>
                    <ul className="space-y-4">
                        {provenanceData.map((event, index) => (
                            <li key={index} className="bg-white shadow rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">{new Date(event.timestamp).toLocaleString()}</span>
                                    <span className="text-sm font-semibold">{event.owner}</span>
                                </div>
                                <div className="mt-2 text-lg">{event.action}</div>
                            </li>
                        ))}
                    </ul>
                    <Button className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on Blockchain Explorer
                    </Button>
                </div>
            )}
        </div>
    )
}

export default ProvenanceTracking

