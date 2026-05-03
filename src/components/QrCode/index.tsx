import React, { useRef, useEffect } from "react";
import QRCode from "easyqrcodejs";

interface QrCodeProps {
  slug: string;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  margin?: number;
  logoSizeRatio?: number;
}

const QrCode = ({ slug, errorCorrectionLevel = "M", margin = 4, logoSizeRatio = 0.3 }: QrCodeProps) => {
  const qrCodeRef = useRef<HTMLDivElement>(null);

  console.log("QrCode slug", slug);

  useEffect(() => {
    if (qrCodeRef.current && slug) {
      qrCodeRef.current.innerHTML = "";
      const displaySize = 200;
      const qrSize = 1000; // High resolution for sharpness
      const logoSize = qrSize * logoSizeRatio;
      const options = {
        text: slug,
        width: qrSize,
        height: qrSize,
        logo: window.location.origin + "/images/logoblack-bg.png",
        logoBackgroundTransparent: false,
        logoBackgroundColor: "#000000",
        logoWidth: logoSize,
        logoHeight: logoSize,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel[errorCorrectionLevel],
        quietZone: margin,
      };
      new QRCode(qrCodeRef.current, options);
    }
  }, [slug, errorCorrectionLevel, margin, logoSizeRatio]);

  return (
    <>
      <div className="qrcode" ref={qrCodeRef} style={{ width: 200, height: 200 }} />
      <style>{`
        .qrcode canvas, .qrcode img {
          width: 100% !important;
          height: 100% !important;
          display: block;
        }
      `}</style>
    </>
  );
};

export default QrCode;
