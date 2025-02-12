"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowRight, Upload, Shield, Database, Lock, Globe, Cpu, GitBranch } from "lucide-react"
import { motion } from "framer-motion"
import Particles from "react-tsparticles"
import { loadSlim } from "tsparticles-slim" // Use the slim version for better performance

const Home = () => {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    }

    const particlesInit = async (engine) => {
        await loadSlim(engine) // Use the slim version of tsparticles
    }

    return (
        <div className="min-h-screen bg-white text-black relative">
            {/* Particle Background */}
            <div className="absolute inset-0 z-0">
                <Particles
                    id="tsparticles"
                    init={particlesInit}
                    options={{
                        background: {
                            color: "#ffffff", // White background
                        },
                        fpsLimit: 60,
                        interactivity: {
                            events: {
                                onHover: {
                                    enable: true,
                                    mode: "repulse",
                                },
                            },
                            modes: {
                                repulse: {
                                    distance: 100,
                                    duration: 0.4,
                                },
                            },
                        },
                        particles: {
                            color: {
                                value: "#000000", // Black particles
                            },
                            links: {
                                color: "#000000", // Black links
                                distance: 150,
                                enable: true,
                                opacity: 0.5,
                                width: 1,
                            },
                            move: {
                                enable: true,
                                speed: 2,
                            },
                            number: {
                                density: {
                                    enable: true,
                                    area: 800,
                                },
                                value: 80,
                            },
                            opacity: {
                                value: 0.5,
                            },
                            shape: {
                                type: "circle",
                            },
                            size: {
                                value: { min: 1, max: 3 },
                            },
                        },
                    }}
                />
            </div>

            {/* Hero Section */}
            <motion.section
                className="relative text-center space-y-8 py-32 z-10" // z-10 to ensure it's above the particles
                initial="hidden"
                animate={mounted ? "visible" : "hidden"}
                variants={fadeIn}
                transition={{ duration: 0.5 }}
            >
                <div className="relative max-w-6xl mx-auto px-4">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
                        Secure Your Digital Legacy
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mt-6">
                        Harness the power of blockchain for unbreakable watermarking and provenance tracking.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                        <Button
                            asChild
                            size="lg"
                            className="bg-black text-white rounded-full px-8 py-6 text-lg font-semibold transition-all duration-300 ease-in-out hover:bg-gray-800"
                        >
                            <Link to="/upload">
                                Start Watermarking
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            className="border-2 border-black text-black rounded-full px-8 py-6 text-lg font-semibold transition-all duration-300 ease-in-out hover:bg-black hover:text-white"
                        >
                            <Link to="/verify">Verify Content</Link>
                        </Button>
                    </div>
                </div>
            </motion.section>

            {/* How It Works Section */}
            <motion.section
                className="mt-24 max-w-6xl mx-auto px-4 relative z-10" // z-10 to ensure it's above the particles
                initial="hidden"
                animate={mounted ? "visible" : "hidden"}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: Upload,
                            title: "Upload",
                            description: "Securely upload your digital content to our cutting-edge platform.",
                        },
                        {
                            icon: Shield,
                            title: "Watermark",
                            description: "Apply an unbreakable blockchain-powered watermark to your content.",
                        },
                        {
                            icon: Database,
                            title: "Track",
                            description: "Monitor your content's journey and verify its authenticity anytime.",
                        },
                    ].map((step, index) => (
                        <motion.div
                            key={index}
                            className="bg-gray-50 rounded-xl p-6 text-center transition-all duration-300 ease-in-out hover:shadow-lg border-black border-2"
                            whileHover={{ y: -5 }}
                        >
                            <div className="bg-black rounded-full p-4 inline-block mb-4">
                                <step.icon className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                            <p className="text-gray-600">{step.description}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* Features Section */}
            <motion.section
                className="mt-24 max-w-6xl mx-auto px-4 relative z-10" // z-10 to ensure it's above the particles
                initial="hidden"
                animate={mounted ? "visible" : "hidden"}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    {[
                        {
                            icon: Lock,
                            title: "Unbreakable Security",
                            description: "Military-grade encryption ensures your content remains tamper-proof.",
                        },
                        {
                            icon: Globe,
                            title: "Global Accessibility",
                            description: "Access and verify your content from anywhere in the world, anytime.",
                        },
                        {
                            icon: Cpu,
                            title: "AI-Powered Analysis",
                            description: "Advanced algorithms detect even the slightest modifications to your content.",
                        },
                        {
                            icon: GitBranch,
                            title: "Immutable Tracking",
                            description:
                                "Every interaction with your content is recorded on the blockchain, creating an unalterable history.",
                        },
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            className="flex items-start space-x-4 bg-gray-50 rounded-xl p-6 transition-all duration-300 ease-in-out hover:shadow-lg border-2 border-black"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                        >
                            <div className="bg-black rounded-full p-3">
                                <feature.icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* Testimonials Section */}
            <motion.section
                className="mt-24 max-w-6xl mx-auto px-4 bg-gray-50 rounded-xl p-8 relative z-10" // z-10 to ensure it's above the particles
                initial="hidden"
                animate={mounted ? "visible" : "hidden"}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.6 }}
            >
                <h2 className="text-3xl font-bold text-center mb-8">What Our Users Say</h2>
                <blockquote className="text-center">
                    <p className="text-xl italic mb-4">
                        "Triambaka has revolutionized how we protect our digital assets. The blockchain integration provides a
                        level of security and transparency we've never seen before."
                    </p>
                    <footer className="text-gray-600">- Sarah Johnson, Digital Rights Manager at TechCorp</footer>
                </blockquote>
            </motion.section>

            {/* Stats Section */}
            <motion.section
                className="mt-24 max-w-6xl mx-auto px-4 relative z-10" // z-10 to ensure it's above the particles
                initial="hidden"
                animate={mounted ? "visible" : "hidden"}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.8 }}
            >
                <h2 className="text-3xl font-bold text-center mb-12">Triambaka by the Numbers</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { number: "1M+", label: "Files Protected" },
                        { number: "99.99%", label: "Uptime" },
                        { number: "150+", label: "Countries Served" },
                        { number: "0", label: "Successful Breaches" },
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            className="text-center bg-gray-50 rounded-xl p-6 transition-all duration-300 ease-in-out hover:shadow-lg border-2 border-black"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1 * index, type: "spring", stiffness: 100 }}
                        >
                            <div className="text-4xl font-bold mb-2">{stat.number}</div>
                            <div className="text-gray-600">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* CTA Section */}
            <motion.section
                className="text-center mt-24 py-16 bg-black relative z-10" // z-10 to ensure it's above the particles
                initial="hidden"
                animate={mounted ? "visible" : "hidden"}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 1 }}
            >
                <h2 className="text-3xl font-bold mb-6 text-white">Ready to secure your digital future?</h2>
                <Button
                    asChild
                    size="lg"
                    className="bg-white text-black rounded-full px-8 py-6 text-lg font-semibold transition-all duration-300 ease-in-out hover:bg-gray-100"
                >
                    <Link to="/upload">
                        Get Started Now
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </motion.section>
        </div>
    )
}

export default Home