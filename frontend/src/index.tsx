import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from './reportWebVitals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';

// Particle imports
import { ParticleAuthkit } from "./components/Authkit";

const queryClient = new QueryClient()
const root = ReactDOM.createRoot( document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <ParticleAuthkit>
      <QueryClientProvider client={queryClient}>
        <SnackbarProvider maxSnack={3}>
          <App />
        </SnackbarProvider>
      </QueryClientProvider>
    </ParticleAuthkit>
  </React.StrictMode>
);
reportWebVitals();
