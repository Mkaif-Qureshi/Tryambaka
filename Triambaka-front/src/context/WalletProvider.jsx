import { createContext, useContext, useState, useEffect } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import Cookies from "js-cookie";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
    const [walletAddress, setWalletAddress] = useState(null);

    const connectWallet = async () => {
        let provider = await detectEthereumProvider();
        if (!provider) provider = window.ethereum;

        if (provider) {
            try {
                const accounts = await provider.request({ method: "eth_requestAccounts" });
                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                    Cookies.set("walletAddress", accounts[0], { expires: 1 });
                }
            } catch (error) {
                console.error("Error connecting wallet:", error);
            }
        } else {
            console.error("MetaMask not detected.");
        }
    };

    const disconnectWallet = () => {
        setWalletAddress(null);
        Cookies.remove("walletAddress");
    };

    useEffect(() => {
        const savedAddress = Cookies.get("walletAddress");
        if (savedAddress) setWalletAddress(savedAddress);
    }, []);

    return (
        <WalletContext.Provider value={{ walletAddress, connectWallet, disconnectWallet }}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => useContext(WalletContext);
