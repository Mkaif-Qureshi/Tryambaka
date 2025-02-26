"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink } from "lucide-react";

const ProvenanceTracking = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [provenanceData, setProvenanceData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery) return;

        setLoading(true);
        setProvenanceData(null);

        try {
            const response = await fetch(`http://127.0.0.1:5000/api/blockchain/check_image_hash?image_hash=${searchQuery}`);
            const data = await response.json();

            if (data.exists) {
                setProvenanceData({
                    timestamp: new Date(parseInt(data.timestamp) * 1000).toLocaleString(),
                    owner: data.owner,
                    ipfsHash: data.ipfs_hash,
                    imageUrl: `https://ipfs.io/ipfs/${data.ipfs_hash}`
                });
            } else {
                alert("No provenance data found for this hash.");
            }
        } catch (error) {
            console.error("Error fetching provenance data:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-center">Provenance Tracking</h1>
            <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="search">Enter content hash to retrieve history</Label>
                    <div className="flex space-x-2">
                        <Input
                            id="search"
                            type="text"
                            placeholder="Enter hash"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button type="submit" disabled={loading}>
                            {loading ? "Searching..." : <><Search className="h-4 w-4 mr-2" /> Search</>}
                        </Button>
                    </div>
                </div>
            </form>

            {provenanceData && (
                <div className="flex space-x-8 p-6 bg-white rounded-lg shadow-md">
                    {/* Left Side: Image */}
                    <div className="flex-shrink-0">
                        <img
                            src={provenanceData.imageUrl}
                            alt="Provenance"
                            className="h-48 w-48 rounded-lg object-cover"
                        />
                    </div>

                    {/* Right Side: Blockchain Details */}
                    <div className="flex-grow space-y-4">
                        <h2 className="text-xl font-semibold">Provenance Details</h2>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <span className="font-medium">Owner:</span>
                                <Badge variant="outline">{provenanceData.owner}</Badge>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="font-medium">Timestamp:</span>
                                <span>{provenanceData.timestamp}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="font-medium">Status:</span>
                                <Badge variant="success">Registered</Badge>
                            </div>
                        </div>
                        <div className="flex space-x-4">
                            <Button asChild>
                                <a href={`https://ipfs.io/ipfs/${provenanceData.ipfsHash}`} target="_blank" rel="noopener noreferrer">
                                    View on IPFS
                                </a>
                            </Button>
                            <Button variant="outline" asChild>
                                <a href="https://etherscan.io/" target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View on Blockchain
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProvenanceTracking;