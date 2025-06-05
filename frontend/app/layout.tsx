import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Shopify Popup Optimizer',
  description: 'AI-powered popup optimization for Shopify stores',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
