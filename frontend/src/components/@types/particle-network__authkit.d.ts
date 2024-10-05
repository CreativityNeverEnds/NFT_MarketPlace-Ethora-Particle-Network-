declare module '@particle-network/authkit/chains' {
    export const mainnet: any;
    export const polygon: any;
    // Add other exports as needed
}

declare module '@wagmi/core' {
    export function injected(): any; // Adjust types as necessary
    // Declare other functions or types as needed
}