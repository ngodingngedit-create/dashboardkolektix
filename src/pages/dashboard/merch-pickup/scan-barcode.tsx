// app/merch-pickup/scan-barcode/index.tsx
import React, { useState, useRef, useEffect } from "react";
import { Card, Button, Input } from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";

const ScanBarcodePage: React.FC = () => {
  const router = useRouter();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [isManualMode, setIsManualMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleBack = () => {
    router.back();
  };

  const simulateScanner = () => {
    // Simulasi scanner membaca barcode
    const mockBarcode = "5012345678900";
    setScannedData(mockBarcode);
    
    // Auto-focus kembali ke input untuk simulasi scanner
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      setScannedData(manualCode);
      setManualCode("");
    }
  };

  // Simulasi scanner input
  useEffect(() => {
    if (!isManualMode) {
      const interval = setInterval(() => {
        // Simulate random scanner input
        if (Math.random() > 0.7 && !scannedData) {
          simulateScanner();
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isManualMode, scannedData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="light"
            onPress={handleBack}
            className="mb-4"
            startContent={<Icon icon="mdi:arrow-left" width={20} height={20} />}
          >
            Kembali
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Scan Barcode dengan Scanner</h1>
          <p className="text-gray-600">Gunakan perangkat scanner untuk membaca barcode</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Scanner Interface */}
          <div>
            <Card className="p-6 h-full">
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon icon="mdi:barcode-scan" width={40} height={40} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Scanner Mode</h3>
                  <p className="text-gray-600">Sambungkan scanner dan mulai scan</p>
                </div>

                <div className="w-full mb-6">
                  <div className="bg-gray-900 rounded-lg p-4 border-2 border-green-500 relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-400 text-sm font-medium">Scanner Ready</span>
                      </div>
                      <Icon icon="mdi:bluetooth-connect" width={20} height={20} className="text-blue-400" />
                    </div>
                    
                    <div className="text-center py-4">
                      <div className="inline-block px-4 py-2 bg-green-900/50 rounded-lg border border-green-700">
                        <p className="text-green-300 text-sm font-mono">SCANNER CONNECTED</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 w-full">
                  <Button
                    color="success"
                    size="lg"
                    onPress={simulateScanner}
                    className="w-full"
                    startContent={<Icon icon="mdi:barcode-scan" width={20} height={20} />}
                  >
                    Simulasikan Scanner
                  </Button>

                  <div className="flex items-center gap-4">
                    <Divider className="flex-1" />
                    <span className="text-gray-400 text-sm">ATAU</span>
                    <Divider className="flex-1" />
                  </div>

                  <Button
                    color="default"
                    variant="bordered"
                    onPress={() => setIsManualMode(!isManualMode)}
                    className="w-full"
                  >
                    {isManualMode ? "Kembali ke Scanner Mode" : "Input Manual"}
                  </Button>
                </div>

                {isManualMode && (
                  <div className="mt-6 w-full space-y-3">
                    <Input
                      ref={inputRef}
                      label="Masukkan Kode Barcode Manual"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleManualSubmit();
                        }
                      }}
                      className="w-full"
                      autoFocus
                    />
                    <Button
                      color="primary"
                      onPress={handleManualSubmit}
                      className="w-full"
                      isDisabled={!manualCode.trim()}
                    >
                      Proses Kode Manual
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right: Result Display */}
          <div>
            <Card className="p-6 h-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Hasil Scan Barcode</h3>
              
              <div className="space-y-6">
                {scannedData ? (
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon icon="mdi:check-circle" width={20} height={20} className="text-green-600" />
                        <span className="font-medium text-green-700">Barcode Terdeteksi</span>
                      </div>
                      <p className="text-sm text-gray-600">Data berhasil dipindai dari barcode</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Data Barcode:</h4>
                      <div className="bg-gray-900 p-4 rounded-lg">
                        <div className="flex items-center justify-center mb-3">
                          {/* Simulated Barcode */}
                          <div className="flex space-x-1">
                            {Array.from({ length: 20 }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-12 ${Math.random() > 0.5 ? 'bg-white' : 'bg-black'}`}
                              ></div>
                            ))}
                          </div>
                        </div>
                        <p className="font-mono text-white text-center text-sm">{scannedData}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Data E-tiket</h4>
                      <p className="text-sm text-gray-600">
                        Data e-tiket akan ditampilkan di sini setelah scan berhasil
                      </p>
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Status:</span>
                          <span className="font-medium text-green-600">Tiket Valid</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tanggal:</span>
                          <span className="font-medium">15 Des 2024</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Waktu:</span>
                          <span className="font-medium">19:00 WIB</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button color="success" className="w-full" size="lg">
                        Konfirmasi Check-in
                      </Button>
                      <Button variant="bordered" className="w-full">
                        Reset Scanner
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon icon="mdi:barcode" width={24} height={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500">Scan barcode using scanner device...</p>
                    <p className="text-sm text-gray-400 mt-2">Data E-tiket akan ditampilkan di sini</p>
                    
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                      <p className="text-sm text-gray-600 mb-2">Instruksi:</p>
                      <ul className="text-xs text-gray-500 space-y-1 text-left">
                        <li className="flex items-center gap-2">
                          <Icon icon="mdi:check" width={12} height={12} className="text-green-500" />
                          <span>Pastikan scanner terhubung ke perangkat</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Icon icon="mdi:check" width={12} height={12} className="text-green-500" />
                          <span>Arahkan scanner ke barcode</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Icon icon="mdi:check" width={12} height={12} className="text-green-500" />
                          <span>Tunggu sampai scanner berbunyi</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Komponen Divider untuk styling
const Divider = ({ className }: { className?: string }) => (
  <div className={`h-px bg-gray-200 ${className}`}></div>
);

export default ScanBarcodePage;