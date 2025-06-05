import React, { useState } from "react";

interface ShopifyConnectionProps {
  onConnect: () => void;
}

export const ShopifyConnection: React.FC<ShopifyConnectionProps> = ({ onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Check if SHOPIFY_ACCESS_TOKEN exists in environment
      const response = await fetch('/api/check-shopify-token');
      const data = await response.json();
      
      console.log('Shopify token check response:', data);
      
      if (data.hasToken) {
        console.log('Token found! Connecting...');
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        onConnect();
      } else {
        console.log('No token found');
        alert('Shopify access token not found in environment variables');
      }
    } catch (error) {
      console.error('Error checking Shopify token:', error);
      alert('Error connecting to Shopify');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Shopify Logo */}
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.8 2.1c-.5-.1-1.3-.1-2.2 0-2.2.3-4.6 1.8-6.1 4.2-.9 1.4-1.5 3-1.5 4.6 0 .4.1.8.2 1.2-1.8-.9-3.1-2.4-3.1-4.1 0-2.8 2.7-5.1 6-5.1.8 0 1.5.1 2.2.4l4.5-1.2zm-3.3 6.8c0-.3-.2-.5-.5-.5s-.5.2-.5.5v2.1c0 .3.2.5.5.5s.5-.2.5-.5V8.9zm0 4.2c0-.3-.2-.5-.5-.5s-.5.2-.5.5v2.1c0 .3.2.5.5.5s.5-.2.5-.5v-2.1z"/>
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Connect Your Shopify Store
          </h1>
          
          {/* Description */}
          <p className="text-gray-600 mb-8">
            Connect your Shopify store to get started with popup optimization powered by AI.
          </p>

          {/* Connect Button */}
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              isConnecting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isConnecting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Connecting...
              </div>
            ) : (
              'Connect Shopify Store'
            )}
          </button>

          {/* Info */}
          <p className="text-xs text-gray-500 mt-4">
            Make sure your SHOPIFY_ACCESS_TOKEN is set in environment variables
          </p>
        </div>
      </div>
    </div>
  );
};