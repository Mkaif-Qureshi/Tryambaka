"use client"

import { useState, useRef, useEffect } from "react"
import Cookies from "js-cookie"
import { Upload, ShieldCheck, PenTool, Send, CloudUpload, AlertCircle, Download, Check } from "lucide-react"
import { motion } from "framer-motion"
import Web3 from "web3"
import ContentRegistryABI from "./ContentRegistry_abi.json"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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

  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS
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

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (step > 0 && step < 5) {
        e.preventDefault()
        e.returnValue = "Your transaction isn't complete. Do you want to leave?"
        return e.returnValue
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [step])

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (!walletAddress && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
          if (accounts[0]) {
            setWalletAddress(accounts[0])
            Cookies.set("walletAddress", accounts[0])
          } else {
            setErrorMessage("Please connect your wallet to continue")
            setButtonDisabled(true)
          }
        } catch (error) {
          setErrorMessage("Please connect your wallet to continue")
          setButtonDisabled(true)
        }
      }
    }

    checkWalletConnection()
  }, [walletAddress])

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

      // Store the image hash and delta for later use
      if (result.image_hash) {
        setSha256Hash(result.image_hash)
      }
      if (result.delta) {
        setDelta(result.delta)
      }

      // Allow watermarking only if blockchain_data is null
      if (result.blockchain_data === null) {
        setStepResponses({
          ...stepResponses,
          1: "Image is unique and can be watermarked.",
        })
        setButtonText("Watermark Image")
        setStep(2)
      } else {
        setStepResponses({
          ...stepResponses,
          1: `Image already watermarked.\nOwner's address: ${result.blockchain_data.owner}\nIPFS Hash: ${result.blockchain_data.ipfs_hash}`,
        })
        setStep(0)
        setButtonDisabled(true)
      }
    } catch (error) {
      setStepResponses({ ...stepResponses, 1: "Error checking image: " + error.message })
      setStep(0)
      setButtonDisabled(true)
    }
    setLoading(false)
  }

  const handleWatermark = async () => {
    setLoading(true)
    setErrorMessage("")

    // Ensure a file is selected
    if (!file) {
      setErrorMessage("No image file selected.")
      setLoading(false)
      return
    }

    const formData = new FormData()
    formData.append("image", file) // Append the image file to the FormData

    try {
      const watermarkResponse = await fetch("http://127.0.0.1:5000/api/watermark/embed", {
        method: "POST",
        body: formData,
      })

      // Handle non-OK responses
      if (!watermarkResponse.ok) {
        const errorData = await watermarkResponse.json()
        throw new Error(errorData.error || "Failed to process the image.")
      }

      // Convert the response to a Blob and create a URL for the watermarked image
      const blob = await watermarkResponse.blob()
      const watermarkedUrl = URL.createObjectURL(blob)
      setWatermarkedImageUrl(watermarkedUrl)
      console.log(blob)

      // Extract metadata from response headers
      const imageHash = watermarkResponse.headers.get("X-Image-Hash")
      const deltaValue = watermarkResponse.headers.get("X-Delta")
      const berValue = watermarkResponse.headers.get("X-BER")

      // Update state with the extracted metadata
      setSha256Hash(imageHash)
      setDelta(Math.round(Number.parseFloat(deltaValue) * 1e6))
      console.log("Image metadata:", { imageHash, deltaValue, berValue })

      // Update step responses and UI
      setStepResponses({ ...stepResponses, 2: "Image successfully watermarked." })
      setButtonText("Upload to IPFS")
      setStep(3)
    } catch (error) {
      // Handle errors and update UI
      setStepResponses({ ...stepResponses, 2: "Error watermarking image: " + error.message })
      setErrorMessage(error.message)
      setStep(1)
      setButtonText("Check Image")
    } finally {
      setLoading(false) // Ensure loading is set to false regardless of success or failure
    }
  }

  const handleUploadIPFS = async () => {
    setLoading(true)
    setErrorMessage("")

    // Create a new FormData with the watermarked image
    const formData = new FormData()

    // Convert watermarked image URL to Blob
    try {
      const response = await fetch(watermarkedImageUrl)
      const watermarkedBlob = await response.blob()

      // Create filename with timestamp
      const timestamp = new Date().getTime()
      const originalName = file.name.split(".")[0]
      const extension = file.name.split(".").pop()
      const newFileName = `${originalName}_${timestamp}.${extension}`

      formData.append("file", watermarkedBlob, newFileName)

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
    console.log("Starting transaction...")

    // Basic checks
    if (!web3Ref.current || !contractRef.current) {
      setErrorMessage("Web3 or contract not initialized.")
      return
    }
    if (!walletAddress) {
      setErrorMessage("Wallet not connected.")
      return
    }
    if (!ipfsHash || !sha256Hash) {
      setErrorMessage("Missing IPFS hash or SHA256 hash.")
      return
    }

    setLoading(true)
    setErrorMessage("")

    try {
      // Request account access if needed
      await window.ethereum.request({ method: "eth_requestAccounts" })
      const accounts = await web3Ref.current.eth.getAccounts()
      const account = accounts[0]
      if (!account) throw new Error("No connected wallet found.")

      console.log("Transaction details:", { walletAddress, account, ipfsHash, sha256Hash, delta })

      // Estimate gas and gasPrice for the transaction
      const gas = await contractRef.current.methods
        .registerContent(ipfsHash, sha256Hash, delta)
        .estimateGas({ from: account })
      const gasPrice = await web3Ref.current.eth.getGasPrice()

      // Send the transaction from MetaMask
      const receipt = await contractRef.current.methods
        .registerContent(ipfsHash, sha256Hash, delta)
        .send({ from: account, gas, gasPrice })

      console.log("Transaction successful:", receipt.transactionHash)

      // Optionally, update your UI with the transaction hash
      setStepResponses({
        ...stepResponses,
        4: "Transaction signed, content registered, and data added to the blockchain.",
      })
      setButtonText("Transaction Complete")
      setStep(5)
    } catch (error) {
      console.error("Transaction error:", error)
      setErrorMessage("Transaction failed: " + error.message)
      setStep(3)
      setButtonText("Sign Transaction")
    }
    setLoading(false)
  }

  const steps = [
    { label: "Upload Image", icon: Upload },
    { label: "Check Blockchain", icon: ShieldCheck },
    { label: "Watermark Image", icon: PenTool },
    { label: "Upload to IPFS", icon: CloudUpload },
    { label: "Sign Transaction", icon: Send },
  ]

  const checkWalletBeforeAction = async () => {
    if (!walletAddress) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        if (accounts[0]) {
          setWalletAddress(accounts[0])
          Cookies.set("walletAddress", accounts[0])
          return true
        }
      } catch (error) {
        setErrorMessage("Please connect your wallet to continue")
        setButtonDisabled(true)
        return false
      }
    }
    return true
  }

  const handleButtonClick = async () => {
    const isWalletConnected = await checkWalletBeforeAction()
    if (!isWalletConnected) return

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

  const downloadWatermarkedImage = () => {
    if (watermarkedImageUrl) {
      const link = document.createElement("a")
      link.href = watermarkedImageUrl
      link.download = "watermarked-image.png"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="md:flex">
          {/* Left Side: Upload Section */}
          <div className="md:w-1/2 p-8">
            <h1 className="text-4xl font-bold mb-6">Watermark Your Image</h1>
            <p className="text-gray-600 mb-8">Protect your digital assets with blockchain-powered watermarking.</p>

            {/* Upload Box */}
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

            {/* Submit Button */}
            <Button className="w-full mt-4" disabled={loading || buttonDisabled} onClick={handleButtonClick}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Processing...</span>
                </div>
              ) : (
                buttonText
              )}
            </Button>
            {errorMessage && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Error</span>
                </div>
                <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
              </div>
            )}
          </div>

          {/* Right Side: Steps & Image Preview */}
          <div className="md:w-1/2 bg-gray-100 p-8 max-h-screen overflow-y-auto">
            {/* Steps List */}
            {/* Steps List */}
            <div className="flex flex-col space-y-6">
              {steps.map((stepObj, index) => (
                <motion.div
                  key={index}
                  className="space-y-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Step Label Bar */}
                  <div
                    className={`p-3 rounded-lg flex items-center gap-3 transition-colors ${index < step
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : index === step
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "bg-muted text-muted-foreground"
                      }`}
                  >
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full ${index < step
                        ? "bg-green-500 text-white"
                        : index === step
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted-foreground/30 text-muted-foreground"
                        }`}
                    >
                      {index < step ? <Check className="h-3.5 w-3.5" /> : <stepObj.icon className="h-3.5 w-3.5" />}
                    </div>
                    <span className="font-medium">{stepObj.label}</span>
                  </div>

                  {/* Step Content Container */}
                  <div className="ml-4 space-y-4">
                    {/* Upload Image Preview */}
                    {index === 0 && originalImageUrl && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Uploaded Image:</p>
                        <div className="relative rounded-lg overflow-hidden bg-muted/50 border">
                          <img
                            src={originalImageUrl || "/placeholder.svg"}
                            alt="Original"
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      </div>
                    )}

                    {/* Blockchain Check Result */}
                    {index === 1 && stepResponses[1] && (
                      <div className="p-4 bg-card rounded-lg border space-y-2">
                        {stepResponses[1].includes("already watermarked") ? (
                          <>
                            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
                              <ShieldCheck className="w-5 h-5" />
                              <span className="font-medium">Image Already Registered</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="space-y-3">
                              {stepResponses[1].split("\n").map((line, i) => (
                                <div key={i} className="text-sm">
                                  {line.includes("Owner's address:") ? (
                                    <div className="space-y-1">
                                      <span className="text-muted-foreground font-medium">Owner's Address:</span>
                                      <div className="bg-muted p-2 rounded text-xs break-all font-mono">
                                        {line.split(": ")[1]}
                                      </div>
                                    </div>
                                  ) : line.includes("IPFS Hash:") ? (
                                    <div className="space-y-1">
                                      <span className="text-muted-foreground font-medium">IPFS Hash:</span>
                                      <div className="bg-muted p-2 rounded text-xs break-all font-mono">
                                        {line.split(": ")[1]}
                                      </div>
                                    </div>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
                            <ShieldCheck className="w-5 h-5" />
                            <span className="font-medium">Image is unique and can be watermarked</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Watermarked Image Preview */}
                    {index === 2 && watermarkedImageUrl && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-muted-foreground">Watermarked Image:</p>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={downloadWatermarkedImage}
                                  className="h-8 w-8"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Download watermarked image</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="relative rounded-lg overflow-hidden bg-muted/50 border">
                          <img
                            src={watermarkedImageUrl || "/placeholder.svg"}
                            alt="Watermarked"
                            className="w-full h-48 object-cover"
                          />
                          <Badge
                            variant="secondary"
                            className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm"
                          >
                            Watermarked
                          </Badge>
                        </div>
                      </div>
                    )}

                    {/* IPFS Upload Status */}
                    {index === 3 && stepResponses[3] && (
                      <div className="p-4 bg-card rounded-lg border space-y-2">
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
                          <CloudUpload className="w-5 h-5" />
                          <span className="font-medium">Upload Successful</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-muted-foreground text-sm font-medium">IPFS Hash:</span>
                          <div className="bg-muted p-2 rounded text-xs break-all font-mono">
                            {stepResponses[3].split("Hash: ")[1]}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Transaction Status */}
                    {index === 4 && stepResponses[4] && (
                      <div className="p-4 bg-card rounded-lg border space-y-2">
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
                          <Send className="w-5 h-5" />
                          <span className="font-medium">Transaction Complete</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{stepResponses[4]}</p>
                      </div>
                    )}
                  </div>
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

