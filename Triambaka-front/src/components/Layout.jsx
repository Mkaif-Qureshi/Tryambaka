"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LayoutDashboard, Menu, Stamp, ShieldCheck, Route, Home as HomeIcon } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"

const Layout = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isNavbarVisible, setIsNavbarVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)

    const navItems = [
        { name: "Home", path: "/", icon: HomeIcon },
        { name: "Upload & Watermark", path: "/upload", icon: Stamp },
        { name: "Verify Content", path: "/verify", icon: ShieldCheck },
        { name: "Track Provenance", path: "/provenance", icon: Route },
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    ]

    const handleLoginLogout = () => {
        setIsLoggedIn(!isLoggedIn)
    }

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY

            if (currentScrollY > lastScrollY) {
                // Scrolling down
                setIsNavbarVisible(false)
            } else {
                // Scrolling up
                setIsNavbarVisible(true)
            }

            setLastScrollY(currentScrollY)
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [lastScrollY])

    return (
        <TooltipProvider>
            <div className="flex flex-col min-h-screen">
                {/* Floating Navbar */}
                <header
                    className={`fixed top-0 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-4xl bg-white/80 backdrop-blur-md shadow-lg rounded-xl z-50 transition-transform duration-300 ${isNavbarVisible ? "translate-y-0" : "-translate-y-full"
                        }`}
                >
                    <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
                        <Link to="/" className="text-2xl font-bold text-primary">
                            Triambaka
                        </Link>
                        <div className="flex-1 flex justify-center">
                            <div className="hidden md:flex space-x-4">
                                {navItems.map((item) => (
                                    <Tooltip key={item.name}>
                                        <TooltipTrigger asChild>
                                            <Link to={item.path} className="text-gray-600 hover:text-primary p-2">
                                                <item.icon className="h-6 w-6" />
                                            </Link>
                                        </TooltipTrigger>
                                        <TooltipContent>{item.name}</TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Button onClick={handleLoginLogout} variant="outline">
                                {isLoggedIn ? "Logout" : "Login"}
                            </Button>
                            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                                <SheetTrigger asChild className="md:hidden">
                                    <Button variant="outline" size="icon">
                                        <Menu className="h-6 w-6" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right">
                                    <nav className="flex flex-col space-y-4 mt-8">
                                        {navItems.map((item) => (
                                            <Tooltip key={item.name}>
                                                <TooltipTrigger asChild>
                                                    <Link
                                                        to={item.path}
                                                        className="text-gray-600 hover:text-primary flex items-center gap-2"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                    >
                                                        <item.icon className="h-6 w-6" />
                                                        <span>{item.name}</span>
                                                    </Link>
                                                </TooltipTrigger>
                                                <TooltipContent>{item.name}</TooltipContent>
                                            </Tooltip>
                                        ))}
                                    </nav>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </nav>
                </header>

                {/* Main Content */}
                <main className="flex-grow container mx-auto px-4 py-8 mt-24">{children}</main>

                {/* Footer */}
                <footer className="bg-gray-100">
                    <div className="container mx-auto px-4 py-6 text-center text-gray-600">
                        © 2024 Triambaka. All rights reserved.
                    </div>
                </footer>
            </div>
        </TooltipProvider>
    )
}

export default Layout