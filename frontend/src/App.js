import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { WagmiProvider, createConfig } from "wagmi"; // Adjusted import
import { mainnet } from "wagmi/chains";
import { injected } from '@wagmi/connectors'

import Signin from "./pages/signin";

// Create a Wagmi configuration
const config = createConfig({
  autoConnect: true,
  connectors: [injected()],
  chains: [mainnet], // Specify your chains here
});

const router = createBrowserRouter([
  {
    path: "/signin",
    element: <Signin />,
  },
  {
    path: "/",
    element: <h1>Home Component</h1>,
  },
]);

function App() {
  return (
    <WagmiProvider  config={config}>
      <RouterProvider router={router} />
    </WagmiProvider >
  );
}

export default App;