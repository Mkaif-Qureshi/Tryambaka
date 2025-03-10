import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowRight, Upload, Shield, Database, Lock, Globe, Cpu, GitBranch } from "lucide-react"
import { motion } from "framer-motion"
import Particles from "react-tsparticles"
import { loadSlim } from "tsparticles-slim" // Use the slim version for better performance
// import { motion } from "framer-motion";

const steps = [
    "Upload PDF",
    "Watermark Generation",
    "Watermark Embedding",
    "Cryptographic Hashing & Signature",
    "Added to Blockchain Ledger",
    "Ready for Download ",
];

const firstRowImages = [
    "/images/1.jpeg",
    "/images/2.jpg",
    "/images/3.jpg",
    "/images/4.jpeg",
    "/images/5.jpeg",
    "/images/6.jpeg",
    "/images/7.jpg",
    "/images/8.jpeg",
];

const secondRowImages = [
    "/images/9.jpeg",
    "/images/10.jpg",
    "/images/11.jpeg",
    "/images/12.jpeg",
    "/images/13.jpeg",
    "/images/14.jpeg",
    "/images/15.jpeg",
    "/images/16.jpeg",
];

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

            <div className="relative flex flex-col gap-6 py-16 overflow-hidden mt-32">
                <h2 className="text-3xl font-bold text-center mb-8">Legecy Artworks</h2>
                <div className="flex flex-col gap-8">
                    {/* First Row - Scrolls Right to Left */}
                    <div className="flex overflow-hidden whitespace-nowrap">
                        <motion.div
                            className="flex flex-nowrap"
                            animate={{ x: ["0%", "-100%"] }}
                            transition={{
                                duration: 20,
                                ease: "linear",
                                repeat: Infinity,
                            }}
                        >
                            {firstRowImages.concat(firstRowImages).map((src, index) => (
                                <img
                                    key={index}
                                    src={src}
                                    alt="scrolling"
                                    className="h-60 w-80 object-cover border-2 border-black rounded-xl 
                  filter grayscale hover:filter-none transition-all duration-300 flex-shrink-0 mr-4"
                                />
                            ))}
                        </motion.div>
                    </div>

                    {/* Second Row - Scrolls Left to Right */}
                    <div className="flex overflow-hidden whitespace-nowrap">
                        <motion.div
                            className="flex flex-nowrap"
                            animate={{ x: ["-100%", "0%"] }}
                            transition={{
                                duration: 20,
                                ease: "linear",
                                repeat: Infinity,
                            }}
                        >
                            {secondRowImages.concat(secondRowImages).map((src, index) => (
                                <img
                                    key={index}
                                    src={src}
                                    alt="scrolling"
                                    className="h-60 w-80 object-cover border-2 border-black rounded-xl 
                  filter grayscale hover:filter-none transition-all duration-300 flex-shrink-0 mr-4"
                                />
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>


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
                            title: "Blockchain-Powered Provenance & Ownership",
                            description: "Immutable smart contracts link assets to blockchain records, ensuring verifiable time-stamped proof of existence.",
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

            {/* Stats Section */}
            <motion.section
                className=" relative z-10 bg-gray-50 border-2 border-black rounded-2xl w-[100%] mx-auto min-h-[300px] flex justify-center items-center py-8 px-12 mt-48 mb-20"
            >
                {/* Horizontal Line Animation */}
                <motion.div
                    className="absolute h-[4px] bg-black"
                    initial={{ width: 0 }}
                    animate={{ width: "76%" }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    style={{ top: "50%", left: "12%" }}
                />

                {/* Nodes + Vertical Lines + Text */}
                <div className="flex w-[80%] justify-between relative">
                    {steps.map((step, index) => (
                        <div key={index} className="relative flex flex-col items-center">
                            {/* Node (Circle) */}
                            <div className="w-6 h-6 bg-black rounded-full absolute top-1/2 transform -translate-y-1/2" />

                            {/* Vertical Line Animation */}
                            <motion.div
                                className="w-[2px] bg-black absolute"
                                initial={{ height: 0 }}
                                animate={{ height: "60px" }}
                                transition={{ duration: 1, delay: index * 0.5 }}
                                style={{
                                    top: index % 2 === 0 ? "-70px" : "10px", // Adjust vertical positioning
                                    left: "50%",
                                }}
                            />

                            {/* Step Text */}
                            <motion.p
                                className="absolute text-lg font-semibold text-black text-center whitespace-nowrap"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.3 }}
                                style={{
                                    top: index % 2 === 0 ? "-120px" : "80px", // Position text properly
                                    left: "50%",
                                    transform: "translateX(-50%)"
                                }}
                            >
                                {step}
                            </motion.p>
                        </div>
                    ))}
                </div>
            </motion.section>


        </div>
    )
}

export default Home