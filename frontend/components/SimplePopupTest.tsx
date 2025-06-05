'use client'

import React from 'react'

// Simple test component to verify the basic popup structure
export function SimplePopupTest() {
  return (
    <div style={{
      width: '100%',
      height: '100dvh',
      background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.8) 0%, rgba(34, 34, 34, 0.8) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      position: 'relative'
    }}>
      {/* Close button */}
      <button style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        color: '#ffffff',
        background: 'none',
        border: 'none',
        fontSize: '24px',
        opacity: 0.6
      }}>
        ×
      </button>
      
      {/* Content container */}
      <div style={{
        width: '60%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        paddingTop: '35px'
      }}>
        {/* Logo */}
        <img 
          src="https://cdn.shopify.com/s/files/1/0596/6977/4402/files/tmpg0yfskf9_logo.png?v=1744057418"
          alt="highabove-logo"
          style={{
            width: '130px',
            height: 'auto',
            objectFit: 'contain',
            paddingTop: '5px'
          }}
        />
        
        {/* Heading 1 */}
        <div style={{
          color: '#FFFFFF',
          fontSize: '35px',
          textAlign: 'center',
          fontWeight: '600',
          lineHeight: '1.1',
          paddingTop: '35px'
        }}>
          You've got
        </div>
        
        {/* Heading 2 */}
        <div style={{
          color: '#FFFFFF',
          fontSize: '60px',
          textAlign: 'center',
          fontWeight: '700',
          lineHeight: '1.1',
          paddingTop: '5px'
        }}>
          Free Shipping
        </div>
        
        {/* Email Input */}
        <input
          type="email"
          placeholder="What's your email?"
          style={{
            color: '#000000',
            width: '90%',
            border: '1px solid #FFFFFF',
            padding: '14px',
            marginTop: '35px',
            borderRadius: '26px',
            backgroundColor: '#FFFFFF',
            outline: 'none'
          }}
        />
        
        {/* Submit Button */}
        <button style={{
          color: '#FFFFFF',
          width: '90%',
          cursor: 'pointer',
          padding: '14px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          marginTop: '10px',
          borderRadius: '26px',
          backgroundColor: '#FF671B',
          border: 'none',
          fontSize: '16px',
          fontWeight: '600'
        }}>
          Get Free Shipping
        </button>
        
        {/* Secondary Text */}
        <div style={{
          color: '#FFFFFF',
          cursor: 'pointer',
          fontSize: '16px',
          marginTop: '24px',
          textAlign: 'center',
          lineHeight: '1.1',
          marginBottom: '120px'
        }}>
          No, I want to pay full price
        </div>
      </div>
    </div>
  )
}