"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LayoutDashboard, Menu, Stamp, ShieldCheck, Route, Home as HomeIcon, Wallet } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import detectEthereumProvider from "@metamask/detect-provider";
import Cookies from "js-cookie";
import { useWallet } from "@/context/WalletProvider";

const Layout = ({ children }) => {
    const { walletAddress, connectWallet, disconnectWallet } = useWallet(); // ✅ Using Context
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNavbarVisible, setIsNavbarVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const navItems = [
        { name: "Home", path: "/", icon: HomeIcon },
        { name: "Upload & Watermark", path: "/upload", icon: Stamp },
        { name: "Verify Content", path: "/verify", icon: ShieldCheck },
        { name: "Track Provenance", path: "/provenance", icon: Route },
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    ];

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setIsNavbarVisible(currentScrollY < lastScrollY);
            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    return (
        <TooltipProvider>
            <div className="flex flex-col min-h-screen">
                <header className={`fixed top-0 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-4xl bg-white/80 backdrop-blur-md shadow-lg rounded-xl z-50 transition-transform duration-300 ${isNavbarVisible ? "translate-y-0" : "-translate-y-full"}`}>
                    <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
                        <Link to="/" className="flex items-center text-2xl font-bold text-primary">
                            <img src="/logo.png" alt="Logo" className="h-14 w-14 mr-1" />
                            Triambaka
                        </Link>
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
                        <div className="flex items-center space-x-4">
                            {walletAddress ? (
                                <button onClick={disconnectWallet} className="text-gray-700 hover:text-red-500">Disconnect</button>
                            ) : (
                                <Button onClick={connectWallet} variant="outline">
                                    <Wallet className="h-4 w-4" /> Connect
                                </Button>
                            )}
                        </div>
                    </nav>
                </header>

                <main className="flex-grow container mx-auto px-4 py-8 mt-24">{children}</main>

                <footer className="bg-gray-100 text-center py-6">
                    © 2024 Triambaka. All rights reserved.
                </footer>
            </div>
        </TooltipProvider>
    );
};

export default Layout;
