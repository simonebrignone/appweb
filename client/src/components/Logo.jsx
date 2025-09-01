import React from 'react';

export default function Logo({ className = '' }) {
  return (
    <img src="/logo_spbapp.png" alt="Logo SPB" className={`mx-auto ${className}`} />
  );
}
