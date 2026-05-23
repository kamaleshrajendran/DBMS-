import React, { useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import '../styles/ScanPage.css';

export default function ScanPage() {
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: { width: 250, height: 250 },
      fps: 5,
    });

    scanner.render(
      (decodedText) => {
        setResult(decodedText);
        setTimeout(() => {
          if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
            window.location.href = decodedText;
          } else {
            const buildingId = decodedText.split('/').pop();
            navigate(`/visitor/${buildingId}`);
          }
        }, 1000);
      },
      (error) => {
        console.log('QR error:', error);
      }
    );

    return () => {
      scanner.clear().catch(e => console.log('Scanner clear error', e));
    };
  }, [navigate]);

  return (
    <div className="scan-page">
      <h1>Scan QR Code</h1>
      <div id="reader"></div>
      {result && <p>Scanned: {result}</p>}
    </div>
  );
}
