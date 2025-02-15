"use client";

import { useState, useRef } from "react";
import { Upload, ArrowRight, AlertCircle } from "lucide-react";

const Spinner = () => <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>;

const VerifyWatermark = () => {
    const [file, setFile] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [keyValue, setKeyValue] = useState("12345");
    const [delta, setDelta] = useState("7.75");
    const [ber, setBer] = useState(null);
    const [imageHash, setImageHash] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        if (event.target.files.length > 0) {
            const selectedFile = event.target.files[0];
            setFile(selectedFile);
            setImageUrl(URL.createObjectURL(selectedFile));
            setErrorMessage("");
            setBer(null);
            setImageHash(null);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setBer(null);
        setImageHash(null);
        setErrorMessage("");

        if (!file) {
            setErrorMessage("Please upload an image.");
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append("image", file);
            formData.append("key", keyValue);
            formData.append("delta", delta);

            const response = await fetch("http://127.0.0.1:5000/api/watermark/verify", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to verify watermark.");
            }

            setBer(data.ber);
            setImageHash(data.image_hash);
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden p-8">
                <h1 className="text-3xl font-bold mb-6">Verify Watermark</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition cursor-pointer hover:border-gray-400"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex items-center space-x-2">
                                <Spinner />
                                <span>Verifying...</span>
                            </div>
                        ) : (
                            <>
                                Verify Image
                                <ArrowRight className="ml-2" />
                            </>
                        )}
                    </button>
                </form>

                {imageUrl && (
                    <div className="mt-6">
                        <h2 className="text-lg font-semibold">Uploaded Image</h2>
                        <img src={imageUrl} alt="Uploaded" className="w-full rounded-lg mt-2" />
                    </div>
                )}

                {errorMessage && (
                    <div className="mt-6 p-4 bg-yellow-100 text-yellow-700 rounded-lg flex items-start">
                        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="font-semibold">{errorMessage}</p>
                    </div>
                )}

                {ber !== null && (
                    <div className="mt-6 p-4 bg-green-100 text-green-700 rounded-lg">
                        <p>Verification successful!</p>
                        <p className="mt-2">Bit Error Rate (BER): {ber.toFixed(4)}</p>
                        <p className="mt-2">Image Hash: {imageHash}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyWatermark;
