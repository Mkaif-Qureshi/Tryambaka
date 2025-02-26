"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ExternalLink, Loader2, Wallet, Download, Eye } from "lucide-react"
import { useWallet } from "@/context/WalletProvider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import jsPDF from "jspdf"
import "jspdf-autotable"

export default function Dashboard() {
    const { walletAddress } = useWallet()
    const [userContent, setUserContent] = useState([])
    const [loading, setLoading] = useState(false)
    const [walletBalance, setWalletBalance] = useState("0.0 ETH")
    const [selectedContent, setSelectedContent] = useState(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    useEffect(() => {
        const fetchUserContent = async () => {
            if (!walletAddress) return
            try {
                setLoading(true)
                const response = await fetch(`http://127.0.0.1:5000/api/blockchain/get_user_content?user_address=${walletAddress}`)
                const data = await response.json()
                if (data.content_ids && data.content_ids.length > 0) {
                    const contentDetails = await Promise.all(
                        data.content_ids.map(async (id) => {
                            const contentResponse = await fetch(`http://127.0.0.1:5000/api/blockchain/get_content?content_id=${id}`)
                            const contentData = await contentResponse.json()
                            return { id, ...contentData }
                        })
                    )
                    setUserContent(contentDetails)
                }
            } catch (error) {
                console.error("Error fetching user content:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchUserContent()
    }, [walletAddress])

    const generatePDF = () => {
        const doc = new jsPDF({ orientation: "landscape" })
        const logoUrl = "logo.png" // Replace with actual path
        const headerHeight = 20
        doc.addImage(logoUrl, "PNG", 14, 10, 20, 20)
        doc.setFontSize(18)
        doc.text("Tryambaka", 40, 20)
        doc.setFontSize(12)
        doc.setFont("times", "italic")
        doc.text("Blockchain-Powered Watermarking", 40, 26)
        doc.setFont("times", "normal")
        doc.setFontSize(16)
        doc.text("Transaction Report", 14, headerHeight + 25)
        doc.setFontSize(12)
        doc.text(`Wallet Address: ${walletAddress}`, 14, headerHeight + 35)
        const tableColumn = ["ID", "IPFS Hash", "Image Hash (SHA-256)", "Timestamp"]
        const tableRows = userContent.map(content => [
            content.id,
            content.ipfs_hash,
            content.sha256_hash,
            new Date(Number.parseInt(content.timestamp) * 1000).toLocaleDateString(),
        ])
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: headerHeight + 45,
            styles: { fontSize: 10 },
            columnStyles: {
                0: { cellWidth: 10 },
                1: { cellWidth: 110 },
                2: { cellWidth: 125 },
                3: { cellWidth: 22 },
            },
        })
        const pageHeight = doc.internal.pageSize.height
        doc.setFontSize(10)
        doc.text(
            "NOTE: This report has been securely generated and verified using Tryambaka’s blockchain-powered watermarking technology, ensuring authenticity and integrity.",
            14,
            pageHeight - 20,
            { maxWidth: 250 }
        )
        doc.save("transactions.pdf")
    }

    return (
        <div className="space-y-6 p-6">
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur-md">
                <CardHeader>
                    <CardTitle className="text-xl font-bold text-primary flex items-center space-x-2">
                        <Wallet className="h-6 w-6" />
                        <span>Wallet Details</span>
                    </CardTitle>
                    <CardDescription>Your wallet information and balance</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <span className="font-medium">Wallet Address:</span>
                            <span className="font-mono text-sm break-all">
                                {walletAddress || "Not connected"}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="font-medium">Balance:</span>
                            <span className="text-sm">{walletBalance}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/80 backdrop-blur-md">
                <CardHeader className="flex justify-between flex-row">
                    <div>
                        <CardTitle className="text-xl font-bold text-primary">Your Content</CardTitle>
                        <CardDescription>All content registered by your wallet</CardDescription>
                    </div>
                    <Button onClick={generatePDF} variant="outline" className="flex items-center space-x-2">
                        <Download className="h-4 w-4" />
                        <span>Download Transactions PDF</span>
                    </Button>
                </CardHeader>
                <CardContent>
                    {!walletAddress ? (
                        <div className="text-center py-8 text-muted-foreground">Connect your wallet to view your content</div>
                    ) : loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : userContent.length > 0 ? (
                        <div className="rounded-xl overflow-hidden border border-gray-200">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/50">
                                            <TableHead>ID</TableHead>
                                            <TableHead className="hidden md:table-cell">IPFS Hash</TableHead>
                                            <TableHead className="hidden lg:table-cell">Image Hash (SHA-256)</TableHead>
                                            <TableHead className="hidden sm:table-cell">Timestamp</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {userContent.map((content) => (
                                            <TableRow key={content.id} className="hover:bg-gray-50/50">
                                                <TableCell className="font-medium">{content.id}</TableCell>
                                                <TableCell className="hidden md:table-cell font-mono text-sm text-muted-foreground">
                                                    {`${content.ipfs_hash.slice(0, 8)}...${content.ipfs_hash.slice(-6)}`}
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell font-mono text-sm text-muted-foreground">
                                                    {content.sha256_hash}
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell text-muted-foreground">
                                                    {new Date(Number.parseInt(content.timestamp) * 1000).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right flex justify-end space-x-2">
                                                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedContent(content)
                                                                    setIsDialogOpen(true)
                                                                }}
                                                                className="hover:text-primary"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="bg-white p-6 rounded-lg max-w-4xl">
                                                            <DialogHeader>
                                                                <DialogTitle>Content Details</DialogTitle>
                                                                <DialogDescription>ID: {selectedContent?.id}</DialogDescription>
                                                            </DialogHeader>
                                                            {selectedContent && (
                                                                <div className="flex flex-col md:flex-row gap-6">
                                                                    <div className="w-full md:w-1/2">
                                                                        <img
                                                                            src={`https://ipfs.io/ipfs/${selectedContent.ipfs_hash}`}
                                                                            alt="Content"
                                                                            className="rounded-lg w-full h-auto object-cover"
                                                                            onError={(e) => (e.target.src = "/placeholder-image.jpg")}
                                                                        />
                                                                    </div>
                                                                    <div className="w-full md:w-1/2 space-y-4">
                                                                        <div>
                                                                            <span className="font-medium">IPFS Hash:</span>
                                                                            <p className="font-mono text-sm break-all">{selectedContent.ipfs_hash}</p>
                                                                        </div>
                                                                        <div>
                                                                            <span className="font-medium">Image Hash (SHA-256):</span>
                                                                            <p className="font-mono text-sm break-all">{selectedContent.sha256_hash}</p>
                                                                        </div>
                                                                        <div>
                                                                            <span className="font-medium">Timestamp:</span>
                                                                            <p>{new Date(Number.parseInt(selectedContent.timestamp) * 1000).toLocaleString()}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </DialogContent>
                                                    </Dialog>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => window.open(`https://ipfs.io/ipfs/${content.ipfs_hash}`, "_blank")}
                                                        className="hover:text-primary"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">No content found for your wallet</div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}