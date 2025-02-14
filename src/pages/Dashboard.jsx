import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const Dashboard = () => {
    const watermarkedFiles = [
        { id: 1, name: "document.pdf", date: "2024-02-09", status: "Completed" },
        { id: 2, name: "image.jpg", date: "2024-02-10", status: "Pending" },
        { id: 3, name: "video.mp4", date: "2024-02-11", status: "Completed" },
    ]

    const pendingVerifications = [
        { id: 1, name: "verify-doc.pdf", date: "2024-02-12", status: "In Progress" },
        { id: 2, name: "check-image.png", date: "2024-02-13", status: "Queued" },
    ]

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>

            <section>
                <h2 className="text-2xl font-semibold mb-4">My Watermarked Files</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>File Name</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {watermarkedFiles.map((file) => (
                            <TableRow key={file.id}>
                                <TableCell className="font-medium">{file.name}</TableCell>
                                <TableCell>{file.date}</TableCell>
                                <TableCell>{file.status}</TableCell>
                                <TableCell>
                                    <Button variant="outline" size="sm" className="mr-2">
                                        View
                                    </Button>

                                    <Button variant="outline" size="sm">
                                        Download PDF
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4">Pending Verifications</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>File Name</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pendingVerifications.map((verification) => (
                            <TableRow key={verification.id}>
                                <TableCell className="font-medium">{verification.name}</TableCell>
                                <TableCell>{verification.date}</TableCell>
                                <TableCell>{verification.status}</TableCell>
                                <TableCell>
                                    <Button variant="outline" size="sm">
                                        Check Status
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4">Transaction History</h2>
                <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <p className="text-gray-600">Transaction history will be displayed here.</p>
                </div>
            </section>
        </div>
    )
}

export default Dashboard

