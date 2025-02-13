import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

const WatermarkEmbed = () => {
    const [image, setImage] = useState(null);
    const [key, setKey] = useState("");
    const [delta, setDelta] = useState("");
    const [watermarkedImage, setWatermarkedImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEmbed = async () => {
        if (!image || !key || !delta) {
            alert("Please fill all fields and upload an image.");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post("http://localhost:5000/api/watermark/embed", {
                image: image.split(",")[1], // Remove the base64 prefix
                key: parseInt(key),
                delta: parseFloat(delta),
            });

            setWatermarkedImage(`data:image/jpeg;base64,${response.data.watermarked_image}`);
        } catch (error) {
            console.error("Error embedding watermark:", error);
            alert("Failed to embed watermark. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md p-6 bg-white shadow-lg rounded-lg">
                <h1 className="text-2xl font-bold mb-4 text-center">Watermark Embedding</h1>

                {/* Image Upload */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Upload Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full p-2 border rounded"
                    />
                </div>

                {/* Key Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Key</label>
                    <Input
                        type="number"
                        placeholder="Enter key (integer)"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>

                {/* Delta Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Delta</label>
                    <Input
                        type="number"
                        step="0.01"
                        placeholder="Enter delta (float)"
                        value={delta}
                        onChange={(e) => setDelta(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                </div>

                {/* Embed Button */}
                <Button
                    onClick={handleEmbed}
                    disabled={loading}
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                    {loading ? "Embedding..." : "Embed Watermark"}
                </Button>

                {/* Display Watermarked Image */}
                {watermarkedImage && (
                    <div className="mt-6">
                        <h2 className="text-xl font-bold mb-2">Watermarked Image</h2>
                        <img
                            src={watermarkedImage}
                            alt="Watermarked"
                            className="w-full rounded"
                        />
                    </div>
                )}
            </Card>
        </div>
    );
};

export default WatermarkEmbed;