import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Dashboard = () => {
    // User details
    const userDetails = {
        name: "John Doe",
        email: "john.doe@example.com",
        accountId: "123456789",
    };

    // Transaction details
    const transactions = [
        { id: 1, date: "2024-02-01", hash: "a1b2c3d4", status: "Completed" },
        { id: 2, date: "2024-02-05", hash: "e5f6g7h8", status: "Pending" },
        { id: 3, date: "2024-02-10", hash: "i9j0k1l2", status: "Completed" },
    ];

    // Watermarked files
    const watermarkedFiles = [
        { id: 1, name: "document.pdf", date: "2024-02-09", status: "Completed" },
        { id: 2, name: "image.jpg", date: "2024-02-10", status: "Pending" },
        { id: 3, name: "video.mp4", date: "2024-02-11", status: "Completed" },
    ];

    // Pending verifications
    const pendingVerifications = [
        { id: 1, name: "verify-doc.pdf", date: "2024-02-12", status: "In Progress" },
        { id: 2, name: "check-image.png", date: "2024-02-13", status: "Queued" },
    ];

    // PDF generation function
    const generatePDF = () => {
        const doc = new jsPDF();
    
        // Page dimensions
        const pageWidth = doc.internal.pageSize.getWidth();
    
        // Add logo and text in a single line
        const logoUrl = '/logo-noback.png';
        const logoWidth = 30; // Width of the logo
        const logoHeight = 20; // Height of the logo
    
        // Calculate the total width of the logo + text
        doc.setFontSize(17);
        doc.setFont("helvetica", "bold");
        const text = "Trimbaka";
        const textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        
        // Keep original total width calculation (without spacing adjustments)
        const totalWidth = logoWidth + textWidth;
    
        // Calculate the starting X position to center the logo and text
        const startX = (pageWidth - totalWidth) / 2;
    
        // Add the logo (position remains unchanged)
        const logoY = 20;
        doc.addImage(logoUrl, 'PNG', startX, logoY, logoWidth, logoHeight);
    
        // Add text with LEFT SHIFT adjustment
        const textXShift = -10; // Negative value moves text LEFT toward the logo
        const textX = startX + logoWidth + textXShift;
        doc.text(text, textX, logoY + logoHeight / 2 + 1.5);
    
        // Add address below the logo and text
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        const addressText = "123 Trimbaka Street, Trimbaka City, 123456";
        const addressTextWidth = doc.getStringUnitWidth(addressText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        const addressX = (pageWidth - addressTextWidth) / 2;
        doc.text(addressText, addressX, logoY + logoHeight + 5);
    

        // Report title (centered)
        doc.setFontSize(18);
        const reportTitle = "User & Transaction Report";
        const reportTitleWidth = doc.getStringUnitWidth(reportTitle) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        const reportTitleX = (pageWidth - reportTitleWidth) / 2;
        doc.text(reportTitle, reportTitleX, logoY + logoHeight + 20); // Position below the address

        // User details table (vertical layout)
        autoTable(doc, {
            startY: logoY + logoHeight + 30, // Adjusted to bring the table closer
            head: [["Field", "Value"]], // Table headers
            body: [
                ["Name", userDetails.name],
                ["Account ID", userDetails.accountId],
                ["Email", userDetails.email],
            ],
            theme: "grid",
            headStyles: { 
                fillColor: [41, 128, 185],
                textColor: 255,
                fontStyle: "bold"
            },
            styles: {
                cellPadding: 1.5,
                fontSize: 10,
            },
            columnStyles: {
                0: { fontStyle: "bold" }, // Make the "Field" column bold
            },
        });

        
        // Transactions table
        autoTable(doc, {
            startY: logoY + logoHeight + 60, // Adjusted to bring the table closer
            head: [["ID", "Date", "Hash Code", "Status"]],
            body: transactions.map(t => [t.id, t.date, t.hash, t.status]),
            theme: "grid",
            headStyles: { 
                fillColor: [41, 128, 185],
                textColor: 255,
                fontStyle: "bold"
            },
            styles: {
                cellPadding: 1.5,
                fontSize: 10,
            },
        });

        // Footer note
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);

            // Define the note text
            const noteText = "Note: This report has been securely generated and verified using Trimbaka’s blockchain-powered watermarking technology, ensuring authenticity and integrity.";

            // Split the text into multiple lines to fit within the page width
            const maxWidth = pageWidth - 40; // Leave 20 units margin on both sides
            const splitText = doc.splitTextToSize(noteText, maxWidth);

            // Add the note text to the bottom of the page
            doc.text(splitText, 20, doc.internal.pageSize.height - 20); // Adjust vertical position as needed
        }

        doc.save("user_transaction_report.pdf");
    };
    
    return (
        <div className="space-y-8 p-6">
            {/* Header with Download Button */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <Button 
                    onClick={generatePDF}
                    variant="outline"
                    className="large"
                >
                    Download Transaction Report
                </Button>
            </div>

            {/* My Watermarked Files */}
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
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </section>

            {/* Pending Verifications */}
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

            {/* Transaction History */}
            <section>
                <h2 className="text-2xl font-semibold mb-4">Transaction History</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Hash Code</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                                <TableCell>{transaction.id}</TableCell>
                                <TableCell>{transaction.date}</TableCell>
                                <TableCell>{transaction.hash}</TableCell>
                                <TableCell>{transaction.status}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </section>
        </div>
    );
};

export default Dashboard;