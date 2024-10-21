import React, { useState, useEffect } from "react";

// Import Particle Auth hooks and provider
import { useEthereum, useConnect, useAuthCore } from "@particle-network/authkit";
import { ethers, Eip1193Provider } from "ethers"; // Eip1193Provider is the interface for the injected BrowserProvider

import TitleHeader from "./TitleHeader";

// Import the utility functions
import { formatBalance, truncateAddress } from "../utils/utils";

import axios from "axios";
import { useAccount, useConnect as wagmaConnect, useSignMessage, useDisconnect } from "wagmi";
import { injected  } from 'wagmi/connectors';

import DetailInfo from "./DetailInfo";
import './particle.css'

const Particle: React.FC = () => {
  // Hooks to manage logins, data display, and transactions
    const { connect, disconnect, connectionStatus, connected } = useConnect();
    const { address, provider, chainInfo} = useEthereum();
    const { userInfo } = useAuthCore();
    const [balance, setBalance] = useState<string>(""); // states for fetching and display the balance

  // Create provider instance with ethers V6
  // use new ethers.providers.Web3Provider(provider, "any"); for Ethers V5
    const ethersProvider = new ethers.BrowserProvider(
        provider as Eip1193Provider,
        "any"
    );

  // Fetch the balance when userInfo or chainInfo changes
    useEffect(() => {
        if (userInfo) { fetchBalance(); }
    }, [userInfo, chainInfo]);

  // Fetch the user's balance in Ether
    const fetchBalance = async () => {
        try {
            const signer = await ethersProvider.getSigner();
            const address = await signer.getAddress();
            const balanceResponse = await ethersProvider.getBalance(address);
            const balanceInEther = ethers.formatEther(balanceResponse); // ethers V5 will need the utils module for those convertion operations
            const fixedBalance = formatBalance(balanceInEther);
            setBalance(fixedBalance);
        } catch (error) {
            console.error("Error fetching balance:", error);
        }
    };

    const handleLogin = async () => {
        if (!connected) {
        try {
            await connect({}); 
        } catch (error) {
            console.error("Error disconnecting:", error);
        }
        }
    };

    const handleDisconnect = async () => {
        try {
            // If user uses Particle Network for sign in
            await disconnect();
        } catch (error) {
            console.error("Error disconnecting:", error);
        }
    };

/////// ----   MetaMask Sign In   ---- ///////

    const { connectAsync } = wagmaConnect();
    const { disconnectAsync } = useDisconnect();
    const { isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const [userInfo_meta, setUserInfo_Meta] = useState(localStorage.getItem('user'));

    const handleMetaMask = async () => {
        //disconnects the web3 provider if it's already active
        if (isConnected) {
            await disconnectAsync();
        }
        // enabling the web3 provider metamask
        try {
            const new_account = await connectAsync({
                connector: injected()
            });
            const user_data = { address: new_account?.accounts[0], chain: 1 };

            // making a post request to our 'request-message' endpoint
            const { data } = await axios.post(
                `${process.env.REACT_APP_SERVER_URL}/api/request-message`,
                user_data,
                {
                headers: {
                    "content-type": "application/json",
                },
                }
            );    
            const message = data.message;
            // signing the received message via metamask
            const signature = await signMessageAsync({ message });
        
            const res = await axios.post(
                `${process.env.REACT_APP_SERVER_URL}/api/verify`,
                { message, signature, },
                { withCredentials: true } // set cookie from Express server
            );
            
            const userData = await axios(`${process.env.REACT_APP_SERVER_URL}/api/authenticate`, {
                withCredentials: true,
            })
            
            localStorage.setItem('user', userData.data.address)
            setUserInfo_Meta(userData.data.address)
        } catch (error) {
            console.error(error);
        }
    }
    useEffect(()=>{
        if (userInfo_meta) {
            MetaBalance();
        }
    },[userInfo_meta])

    const MetaBalance = async () => {
        try {
            const address = localStorage.getItem('user') || '';
            const balanceResponse = await ethersProvider.getBalance(address);
            const balanceInEther = ethers.formatEther(balanceResponse); // ethers V5 will need the utils module for those convertion operations
            const fixedBalance = formatBalance(balanceInEther);
            setBalance(fixedBalance);
        } catch (error) {
            console.error("Error fetching balance:", error);
        }
    };

    const handleLogOut = async () => {
        try {
            // If user uses MetaMask for sign in
            await axios(`${process.env.REACT_APP_SERVER_URL}/api/logout`, {
                withCredentials: true,
            });
            setUserInfo_Meta('')
            localStorage.removeItem('user')
        } catch (error) {
            console.error("Error disconnecting:", error);
        }
    };
//////////////////////////////////////////////////

////// The UI
    return (
        <div className="min-h-screen flex flex-col items-center justify-between bg-black text-white">
            <TitleHeader />
            <main className="login_main">
                {(!userInfo && !userInfo_meta) && 
                    <div style={{width:'300px', justifyContent:'center'}} className="flex-grow flex flex-col justify-center">
                        <div className="bg-gray-800 p-3 rounded-lg shadow-lg max-w-sm mx-auto mb-4">
                            <h2 className="login_status">
                                Status: {connectionStatus}
                            </h2>
                        </div>
                        <div className="login_section">
                            <button className="login_button" onClick={handleLogin}>
                                Authenticate via Particle
                            </button>
                            <button className="login_button" onClick={handleMetaMask}>
                                Authenticate via MetaMask
                            </button>
                        </div>
                    </div>
                }
                {(userInfo && !userInfo_meta) && (
                    <div className="loginpage">
                        <div className="loginstatepage">
                            <div className="bg-gray-800 p-3 rounded-lg shadow-lg max-w-sm mx-auto mb-4">
                                <h2 className="login_status">
                                    Status: {connectionStatus}
                                </h2>
                            </div>
                            <div style={{width:'100%'}}>
                                <div className="border border-purple-500 p-6 rounded-lg">
                                    <h2 className="text-2xl font-bold mb-2 text-white text-center">
                                        Connection Info
                                    </h2>
                                    <h2 className="text-lg font-semibold mb-2 text-white">
                                        Wallet: Particle Wallet
                                    </h2>
                                    <h2 className="text-lg font-semibold mb-2 text-white">
                                        Address: <code>{truncateAddress(address || "")}</code>
                                    </h2>
                                    <h2 className="text-lg font-semibold mb-2 text-white">
                                        Chain: {chainInfo.name}
                                    </h2>
                                    <div className="flex items-center">
                                        <h2 className="text-lg font-semibold mb-2 text-white">
                                            Balance: {balance} {chainInfo.nativeCurrency.symbol}
                                        </h2>
                                        <button
                                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-2 rounded transition duration-300 ease-in-out transform hover:scale-105 shadow-lg flex items-center"
                                            onClick={fetchBalance}
                                        >
                                            🔄
                                        </button>
                                    </div>
                                    <div className="button_section">
                                        <button className="connect_button" onClick={handleDisconnect}>
                                            Disconnect
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="Detail_container">
                            <DetailInfo address = { address }/>
                        </div>
                    </div>
                )}
                {(!userInfo && userInfo_meta) && (
                    <div className="loginpage">
                        <div className="loginstatepage">
                            <div className="bg-gray-800 p-3 rounded-lg shadow-lg max-w-sm mx-auto mb-4">
                                <h2 className="login_status">
                                    Status: {"connected"}
                                </h2>
                            </div>
                            <div style={{width:'100%'}}>
                                <div className="border border-purple-500 p-6 rounded-lg">
                                    <h2 className="text-2xl font-bold mb-2 text-white text-center">
                                        Connection Info
                                    </h2>
                                    <h2 className="text-lg font-semibold mb-2 text-white">
                                        Wallet: MetaMask Wallet
                                    </h2>
                                    <h2 className="text-lg font-semibold mb-2 text-white">
                                        Address: <code>{truncateAddress(userInfo_meta || "")}</code>
                                    </h2>
                                    <h2 className="text-lg font-semibold mb-2 text-white">
                                        Chain: {chainInfo.name}
                                    </h2>
                                    <div className="flex items-center">
                                        <h2 className="text-lg font-semibold mb-2 text-white">
                                            Balance: {balance} {chainInfo.nativeCurrency.symbol}
                                        </h2>
                                        <button
                                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-2 rounded transition duration-300 ease-in-out transform hover:scale-105 shadow-lg flex items-center"
                                            onClick={MetaBalance}
                                        >
                                            🔄
                                        </button>
                                    </div>
                                    <div className="button_section">
                                        <button className="connect_button" onClick={handleLogOut}>
                                            Disconnect
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="Detail_container">
                            <DetailInfo address = { userInfo_meta }/>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Particle;
