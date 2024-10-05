import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { useAccount, useConnect, useSignMessage, useDisconnect } from "wagmi";
import { injected  } from 'wagmi/connectors';
import axios from "axios";

export default function MetaMaskLogin(props:any){
  const handleMetaMask = props.handleMetaMask
  const navigate = useNavigate();

  const { connectAsync } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const handleAuth = async () => {
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
        `${process.env.REACT_APP_SERVER_URL}/request-message`,
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
  
      await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/verify`,
        {
          message,
          signature,
        },
        { withCredentials: true } // set cookie from Express server
      );
  
      // redirect to /user
      navigate("/user");
    } catch (error) {
      console.error(error);
    }


  };
  
  return (
    <div>
      <button
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
        onClick={handleAuth}
      >
        Authenticate via MetaMask
      </button>
    </div>
  );
}