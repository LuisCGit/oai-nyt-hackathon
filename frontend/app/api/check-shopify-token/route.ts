import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check if SHOPIFY_ACCESS_TOKEN exists in environment variables
    const token = process.env.SHOPIFY_ACCESS_TOKEN;
    const hasToken = !!token;
    
    console.log('SHOPIFY_ACCESS_TOKEN check:', {
      hasToken,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? `${token.substring(0, 10)}...` : 'undefined'
    });
    
    return NextResponse.json({ 
      hasToken,
      tokenPreview: token ? `${token.substring(0, 10)}...` : 'undefined'
    });
  } catch (error) {
    console.error('Error checking Shopify token:', error);
    return NextResponse.json({ hasToken: false }, { status: 500 });
  }
}