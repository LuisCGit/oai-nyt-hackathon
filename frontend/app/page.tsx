"use client";

import React, { useState } from "react";
import { ShopifyConnection } from "../components/ShopifyConnection";
import { PopupPreview } from "../components/PopupPreview";

const HomePage: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {!isConnected ? (
        <ShopifyConnection onConnect={() => setIsConnected(true)} />
      ) : (
        <PopupPreview />
      )}
    </div>
  );
};

export default HomePage;