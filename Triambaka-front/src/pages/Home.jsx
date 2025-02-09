"use client"

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, Shield, Database } from "lucide-react";
import { motion } from "framer-motion";

const Home = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center px-4">
            <motion.section
                className="text-center space-y-6"
                initial="hidden"
                animate={mounted ? "visible" : "hidden"}
                variants={fadeIn}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-5xl font-bold">Secure Your Digital Legacy</h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Harness the power of blockchain for watermarking and provenance tracking.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button asChild className="bg-black text-white px-6 py-3 text-lg">
                        <Link to="/upload">
                            Start Watermarking
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="border-black text-black px-6 py-3 text-lg">
                        <Link to="/verify">Verify Content</Link>
                    </Button>
                </div>
            </motion.section>

            <motion.section
                className="mt-16 max-w-3xl w-full"
                initial="hidden"
                animate={mounted ? "visible" : "hidden"}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <h2 className="text-2xl font-semibold text-center mb-8">How It Works</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { icon: Upload, title: "Upload", description: "Securely upload your content." },
                        { icon: Shield, title: "Watermark", description: "Apply blockchain-powered watermarking." },
                        { icon: Database, title: "Track", description: "Monitor and verify authenticity." },
                    ].map((step, index) => (
                        <motion.div
                            key={index}
                            className="border p-6 rounded-lg text-center"
                            whileHover={{ scale: 1.05 }}
                        >
                            <step.icon className="h-8 w-8 mb-4 text-black" />
                            <h3 className="text-lg font-medium">{step.title}</h3>
                            <p className="text-gray-600 text-sm">{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.section>
        </div>
    );
};

export default Home;
