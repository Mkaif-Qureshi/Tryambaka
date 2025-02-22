"use client"

import { useState, useRef, useEffect } from "react"
import Cookies from "js-cookie"
import { Upload, ShieldCheck, PenTool, Send, CloudUpload } from "lucide-react"
import { motion } from "framer-motion"
import Web3 from "web3"
import ContentRegistryABI from "./ContentRegistry_abi.json"

const Spinner = () => <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>

const UploadWatermark = () => {
    const [file, setFile] = useState(null)
    const [originalImageUrl, setOriginalImageUrl] = useState(null)
    const [watermarkedImageUrl, setWatermarkedImageUrl] = useState(null)
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [step, setStep] = useState(0)
    const [walletAddress, setWalletAddress] = useState("")
    const [buttonText, setButtonText] = useState("Check Image")
    const [buttonDisabled, setButtonDisabled] = useState(true)
    const [ipfsHash, setIpfsHash] = useState("")
    const [sha256Hash, setSha256Hash] = useState("")
    const [delta, setDelta] = useState(0)
    const [stepResponses, setStepResponses] = useState({})

    const fileInputRef = useRef(null)
    const web3Ref = useRef(null)
    const contractRef = useRef(null)

    const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
    // console.log("Contract Address:", CONTRACT_ADDRESS);

    useEffect(() => {
        console.log("Initializing Web3...")
        console.log("Window ethereum:", window.ethereum)
        const address = Cookies.get("walletAddress")
        if (address) {
            console.log("Found wallet address:", address)
            setWalletAddress(address)
        }

        if (window.ethereum) {
            web3Ref.current = new Web3(window.ethereum)
            initializeContract()
            console.log("Web3 initialized:", web3Ref.current)
            console.log("Contract initialized:", contractRef.current)
        } else {
            console.log("No ethereum object found")
        }
    }, [])

    const initializeContract = async () => {
        try {
            if (!contractRef.current && web3Ref.current) {
                console.log("Initializing contract with ABI:", ContentRegistryABI)
                contractRef.current = new web3Ref.current.eth.Contract(ContentRegistryABI, CONTRACT_ADDRESS)
                // Verify contract initialization
                const methods = await contractRef.current.methods
                console.log("Contract methods available:", methods)
            }
        } catch (error) {
            console.error("Contract initialization error:", error)
            setErrorMessage("Failed to initialize smart contract")
        }
    }

    const handleFileChange = (event) => {
        if (event.target.files && event.target.files.length > 0) {
            const selectedFile = event.target.files[0]
            setFile(selectedFile)
            setOriginalImageUrl(URL.createObjectURL(selectedFile))
            setErrorMessage("")
            setWatermarkedImageUrl(null)
            setStep(1)
            setButtonDisabled(false)
            setButtonText("Check Image")
            setStepResponses({})
        }
    }

    const handleCheckImage = async () => {
        setLoading(true)
        setErrorMessage("")

        const formData = new FormData()
        formData.append("image", file)

        try {
            const response = await fetch("http://127.0.0.1:5000/api/watermark/check_image", {
                method: "POST",
                body: formData,
            })

            const result = await response.json()
            if (result.valid) {
                setStepResponses({ ...stepResponses, 1: "Image already exists on the blockchain." })
                setStep(0)
                setButtonDisabled(true)
            } else {
                setStepResponses({ ...stepResponses, 1: "Image is unique and can be watermarked." })
                setButtonText("Watermark Image")
                setStep(2)
            }
        } catch (error) {
            setStepResponses({ ...stepResponses, 1: "Error checking image: " + error.message })
            setStep(0)
            setButtonDisabled(true)
        }
        setLoading(false)
    }

    const handleWatermark = async () => {
        setLoading(true);
        setErrorMessage("");

        // Ensure a file is selected
        if (!file) {
            setErrorMessage("No image file selected.");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("image", file); // Append the image file to the FormData

        try {
            const watermarkResponse = await fetch("http://127.0.0.1:5000/api/watermark/embed", {
                method: "POST",
                body: formData,
            });

            // Handle non-OK responses
            if (!watermarkResponse.ok) {
                const errorData = await watermarkResponse.json();
                throw new Error(errorData.error || "Failed to process the image.");
            }

            // Convert the response to a Blob and create a URL for the watermarked image
            const blob = await watermarkResponse.blob();
            const watermarkedUrl = URL.createObjectURL(blob);
            setWatermarkedImageUrl(watermarkedUrl);
            console.log(blob)

            // Extract metadata from response headers
            const imageHash = watermarkResponse.headers.get("X-Image-Hash");
            const deltaValue = watermarkResponse.headers.get("X-Delta");
            const berValue = watermarkResponse.headers.get("X-BER");

            // Update state with the extracted metadata
            setSha256Hash(imageHash);
            setDelta(Math.round(Number.parseFloat(deltaValue) * 1e6));
            console.log("Image metadata:", { imageHash, deltaValue, berValue });

            // Update step responses and UI
            setStepResponses({ ...stepResponses, 2: "Image successfully watermarked." });
            setButtonText("Upload to IPFS");
            setStep(3);
        } catch (error) {
            // Handle errors and update UI
            setStepResponses({ ...stepResponses, 2: "Error watermarking image: " + error.message });
            setErrorMessage(error.message);
            setStep(1);
            setButtonText("Check Image");
        } finally {
            setLoading(false); // Ensure loading is set to false regardless of success or failure
        }
    };


    const handleUploadIPFS = async () => {
        setLoading(true)
        setErrorMessage("")

        const formData = new FormData()
        formData.append("file", file)

        try {
            const ipfsResponse = await fetch("http://127.0.0.1:5000/api/ipfs/upload_ipfs", {
                method: "POST",
                body: formData,
            })

            if (!ipfsResponse.ok) throw new Error("Failed to upload to IPFS.")

            const ipfsResult = await ipfsResponse.json()
            setIpfsHash(ipfsResult.ipfs_hash)

            setStepResponses({ ...stepResponses, 3: `Successfully uploaded to IPFS. Hash: ${ipfsResult.ipfs_hash}` })
            setButtonText("Sign Transaction")
            setStep(4)
        } catch (error) {
            setStepResponses({ ...stepResponses, 3: "Error uploading to IPFS: " + error.message })
            setStep(2)
            setButtonText("Watermark Image")
        }
        setLoading(false)
    }

    const handleSignTransaction = async () => {
        console.log("Starting transaction...");

        // Basic checks
        if (!web3Ref.current || !contractRef.current) {
            setErrorMessage("Web3 or contract not initialized.");
            return;
        }
        if (!walletAddress) {
            setErrorMessage("Wallet not connected.");
            return;
        }
        if (!ipfsHash || !sha256Hash) {
            setErrorMessage("Missing IPFS hash or SHA256 hash.");
            return;
        }

        setLoading(true);
        setErrorMessage("");

        try {
            // Request account access if needed
            await window.ethereum.request({ method: "eth_requestAccounts" });
            const accounts = await web3Ref.current.eth.getAccounts();
            const account = accounts[0];
            if (!account) throw new Error("No connected wallet found.");

            console.log("Transaction details:", { walletAddress, account, ipfsHash, sha256Hash, delta });

            // Estimate gas and gasPrice for the transaction
            const gas = await contractRef.current.methods
                .registerContent(ipfsHash, sha256Hash, delta)
                .estimateGas({ from: account });
            const gasPrice = await web3Ref.current.eth.getGasPrice();

            // Send the transaction from MetaMask
            const receipt = await contractRef.current.methods
                .registerContent(ipfsHash, sha256Hash, delta)
                .send({ from: account, gas, gasPrice });

            console.log("Transaction successful:", receipt.transactionHash);

            // Optionally, update your UI with the transaction hash
            setStepResponses({
                ...stepResponses,
                4: "Transaction signed, content registered, and data added to the blockchain.",
            });
            setButtonText("Transaction Complete");
            setStep(5);
        } catch (error) {
            console.error("Transaction error:", error);
            setErrorMessage("Transaction failed: " + error.message);
            setStep(3);
            setButtonText("Sign Transaction");
        }
        setLoading(false);
    };

    const steps = [
        { label: "Upload Image", icon: Upload },
        { label: "Check Blockchain", icon: ShieldCheck },
        { label: "Watermark Image", icon: PenTool },
        { label: "Upload to IPFS", icon: CloudUpload },
        { label: "Sign Transaction", icon: Send },
    ]

    const handleButtonClick = () => {
        switch (step) {
            case 1:
                handleCheckImage()
                break
            case 2:
                handleWatermark()
                break
            case 3:
                handleUploadIPFS()
                break
            case 4:
                handleSignTransaction()
                break
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="md:flex">
                    <div className="md:w-1/2 p-8">
                        <h1 className="text-4xl font-bold mb-6">Watermark Your Image</h1>
                        <p className="text-gray-600 mb-8">Protect your digital assets with blockchain-powered watermarking.</p>
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" ref={fileInputRef} />
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <span className="mt-2 block text-sm font-medium text-gray-900">
                                {file ? file.name : "Click to upload or drag and drop"}
                            </span>
                        </div>
                        <button
                            className={`w-full py-3 px-4 rounded-lg flex items-center justify-center mt-4 ${buttonDisabled ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700 text-white font-bold"}`}
                            disabled={buttonDisabled || loading}
                            onClick={handleButtonClick}
                        >
                            {loading ? <Spinner /> : buttonText}
                        </button>
                    </div>
                    <div className="md:w-1/2 bg-gray-100 p-8 max-h-screen overflow-y-auto">
                        {originalImageUrl && (
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold mb-4">Original Image</h2>
                                <img
                                    src={originalImageUrl || "/placeholder.svg"}
                                    alt="Original"
                                    className="w-full h-64 object-cover rounded-lg"
                                />
                            </div>
                        )}
                        <div className="flex flex-col space-y-4">
                            {steps.map((stepObj, index) => (
                                <motion.div
                                    key={index}
                                    className="space-y-2"
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.2 }}
                                >
                                    <div
                                        className={`p-3 rounded-lg text-white flex items-center space-x-3 transition duration-300 ${index < step ? "bg-green-500" : index === step ? "bg-blue-500" : "bg-gray-400"}`}
                                    >
                                        <stepObj.icon className="w-5 h-5" />
                                        <span>{stepObj.label}</span>
                                    </div>
                                    {stepResponses[index + 1] && (
                                        <div className="ml-8 p-2 bg-white rounded-lg text-sm">{stepResponses[index + 1]}</div>
                                    )}
                                    {index === 2 && watermarkedImageUrl && (
                                        <div className="ml-8 mt-2">
                                            <img
                                                src={watermarkedImageUrl || "/placeholder.svg"}
                                                alt="Watermarked"
                                                className="w-full h-48 object-cover rounded-lg"
                                            />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UploadWatermark

