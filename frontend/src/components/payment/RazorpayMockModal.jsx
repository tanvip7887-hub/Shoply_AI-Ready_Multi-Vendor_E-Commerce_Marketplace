import React, { useState } from "react";
import { X, CreditCard, Building, Smartphone, Wallet, Lock, TrendingUp } from "lucide-react";
import Button from "../ui/Button.jsx";
import toast from "react-hot-toast";
import { mockPaymentData } from "../../utils/mockPaymentData.js";

const RazorpayMockModal = ({ amount, onConfirmPayment, onCancel }) => {
  const [activeTab, setActiveTab] = useState("UPI");
  const [isVerifying, setIsVerifying] = useState(false);
  const [processingText, setProcessingText] = useState("");

  // UPI State
  const [upiMethod, setUpiMethod] = useState("ID"); // 'ID' or 'QR'
  const [upiId, setUpiId] = useState("");

  // Card State
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Net Banking State
  const [selectedBank, setSelectedBank] = useState("");

  // Wallet State
  const [selectedWallet, setSelectedWallet] = useState("");

  const handleSimulate = async () => {
    setIsVerifying(true);
    setProcessingText("Processing Payment...");
    
    try {
      await onConfirmPayment();
    } catch (err) {
      // Error is already handled by toast in PaymentPage, but we stop loading state
    } finally {
      setIsVerifying(false);
      setProcessingText("");
    }
  };

  const handlePay = () => {
    // Validate inputs depending on tab before allowing SUCCESS
    if (activeTab === "UPI" && upiMethod === "ID" && !upiId) return toast.error("Please enter a UPI ID");
    if (activeTab === "CARD" && (!cardNumber || !cardName || !cardExpiry || !cardCvv)) return toast.error("Please fill all card details");
    if (activeTab === "NETBANKING" && !selectedBank) return toast.error("Please select a bank");
    if (activeTab === "WALLET" && !selectedWallet) return toast.error("Please select a wallet");

    handleSimulate();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#570D48] p-5 text-white relative flex-shrink-0">
          <button 
            onClick={() => onCancel()} 
            disabled={isVerifying}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center gap-2 mb-6">
            <Lock size={18} className="text-white/80" />
            <span className="font-bold tracking-wide">Shoply Secure Payment Gateway</span>
          </div>
          
          <div className="flex justify-between items-end">
            <div>
              <p className="text-white/70 text-sm mb-1">Secure Checkout</p>
              <h2 className="text-3xl font-bold">₹{amount}</h2>
            </div>
          </div>
        </div>

        {isVerifying ? (
          <div className="p-12 flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#570D48] rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-medium text-gray-800">{processingText}</p>
            <p className="text-sm text-gray-500 mt-2">Please wait...</p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50 flex-shrink-0 overflow-x-auto">
              {[
                { id: "UPI", icon: Smartphone, label: "UPI" },
                { id: "CARD", icon: CreditCard, label: "Card" },
                { id: "NETBANKING", icon: Building, label: "Net Banking" },
                { id: "WALLET", icon: Wallet, label: "Wallets" },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id ? "border-[#570D48] text-[#570D48] bg-white" : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <tab.icon size={16} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 overflow-y-auto flex-1">
              
              {/* UPI TAB */}
              {activeTab === "UPI" && (
                <div className="space-y-4 animate-in slide-in-from-right-2">
                  <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-6">
                    <button 
                      className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${upiMethod === 'ID' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                      onClick={() => setUpiMethod('ID')}
                    >
                      Enter UPI ID
                    </button>
                    <button 
                      className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${upiMethod === 'QR' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                      onClick={() => setUpiMethod('QR')}
                    >
                      Scan QR Code
                    </button>
                  </div>

                  {upiMethod === "ID" ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm text-gray-600 block">Enter UPI ID</label>
                        <input 
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. username@upi"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570D48] outline-none"
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" size="sm" 
                          className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
                          onClick={() => setUpiId(mockPaymentData.upi.demoUpi)}
                        >
                          Use Demo UPI
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="relative w-44 h-44 bg-white p-3 rounded-lg shadow-sm border border-gray-200 mb-6 flex items-center justify-center">
                        <svg viewBox="0 0 33 33" fill="currentColor" className="text-black w-full h-full">
                          <path d="M0,0v9h9V0H0z M7,7H2V2h5V7z M24,0v9h9V0H24z M31,7h-5V2h5V7z M0,24v9h9v-9H0z M7,31H2v-5h5V31z" />
                          <path d="M3,3v3h3V3H3z M27,3v3h3V3H27z M3,27v3h3v-3H3z" />
                          <path d="M10,0h2v2h-2z M13,0h1v4h-1z M15,1h3v2h-3z M19,0h2v1h-2z M22,2h1v3h-1z M11,3h2v1h-2z M10,5h3v2h-3z M14,5h1v1h-1z M16,4h2v3h-2z M19,3h1v2h-1z M21,5h2v1h-2z M0,10h2v2h-2z M3,11h3v1h-3z M7,10h1v3h-1z M9,11h2v2h-2z M12,10h1v1h-1z M14,10h4v2h-4z M19,10h2v2h-2z M22,11h1v1h-1z M24,10h3v1h-3z M28,10h2v2h-2z M31,11h2v1h-2z M0,13h1v3h-1z M2,14h2v2h-2z M5,13h3v1h-3z M9,14h1v1h-1z M11,14h2v3h-2z M22,13h2v2h-2z M25,14h1v2h-1z M27,13h3v2h-3z M31,14h2v3h-2z M0,17h2v2h-2z M3,18h1v3h-1z M5,17h2v1h-2z M8,18h2v2h-2z M11,17h1v1h-1z M22,18h3v1h-3z M26,17h1v2h-1z M28,18h2v2h-2z M31,17h2v2h-2z M0,20h1v3h-1z M2,21h3v2h-3z M6,20h2v1h-2z M9,21h1v1h-1z M11,21h4v2h-4z M16,20h2v2h-2z M19,21h2v1h-2z M22,20h1v3h-1z M24,21h3v1h-3z M28,20h2v3h-2z M31,22h2v1h-2z M10,24h2v2h-2z M13,25h3v2h-3z M17,24h1v1h-1z M19,24h3v2h-3z M23,25h2v1h-2z M10,27h1v3h-1z M12,28h2v2h-2z M15,27h3v1h-3z M19,28h1v1h-1z M21,27h3v2h-3z M10,31h2v2h-2z M13,31h1v1h-1z M15,30h3v3h-3z M19,31h2v2h-2z M22,30h1v2h-1z" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                            <div className="text-emerald-500 font-extrabold text-xl">
                              <TrendingUp size={28} strokeWidth={3} />
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mb-4">QR expires in 05:00</p>
                      <Button size="sm" onClick={() => handleSimulate()} className="w-full bg-[#570D48] hover:bg-[#4a0b3d]">
                        Simulate Successful Scan
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* CARD TAB */}
              {activeTab === "CARD" && (
                <div className="space-y-4 animate-in slide-in-from-right-2">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 block">Card Number</label>
                    <input 
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="XXXX XXXX XXXX XXXX"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570D48] outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 block">Cardholder Name</label>
                    <input 
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Name on card"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570D48] outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600 block">Expiry</label>
                      <input 
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570D48] outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600 block">CVV</label>
                      <input 
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="***"
                        maxLength="4"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#570D48] outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button 
                      variant="outline" size="sm" 
                      className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
                      onClick={() => {
                        setCardNumber(mockPaymentData.card.number);
                        setCardName(mockPaymentData.card.name);
                        setCardExpiry(mockPaymentData.card.expiry);
                        setCardCvv(mockPaymentData.card.cvv);
                      }}
                    >
                      Use Demo Card
                    </Button>
                  </div>
                </div>
              )}

              {/* NET BANKING TAB */}
              {activeTab === "NETBANKING" && (
                <div className="space-y-4 animate-in slide-in-from-right-2">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 block">Select Bank</label>
                    <div className="grid grid-cols-2 gap-2">
                      {mockPaymentData.netBanking.banks.map(bank => (
                        <button
                          key={bank}
                          onClick={() => setSelectedBank(bank)}
                          className={`p-3 text-sm border rounded-lg text-left transition-colors ${selectedBank === bank ? 'border-[#570D48] bg-pink-50 font-semibold text-[#570D48]' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button 
                      variant="outline" size="sm" 
                      className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
                      onClick={() => setSelectedBank(mockPaymentData.netBanking.demoBank)}
                    >
                      Use Demo Bank
                    </Button>
                  </div>
                </div>
              )}

              {/* WALLETS TAB */}
              {activeTab === "WALLET" && (
                <div className="space-y-4 animate-in slide-in-from-right-2">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 block">Select Wallet</label>
                    <div className="grid grid-cols-2 gap-2">
                      {mockPaymentData.wallets.wallets.map(wallet => (
                        <button
                          key={wallet}
                          onClick={() => setSelectedWallet(wallet)}
                          className={`p-3 text-sm border rounded-lg text-left transition-colors ${selectedWallet === wallet ? 'border-[#570D48] bg-pink-50 font-semibold text-[#570D48]' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
                        >
                          {wallet}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button 
                      variant="outline" size="sm" 
                      className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
                      onClick={() => setSelectedWallet(mockPaymentData.wallets.demoWallet)}
                    >
                      Use Demo Wallet
                    </Button>
                  </div>
                </div>
              )}

            </div>

            {/* Footer / Actions */}
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex-shrink-0">
              
              {/* Only show the main Pay button if not on QR simulation */}
              {!(activeTab === "UPI" && upiMethod === "QR") && (
                <button 
                  className="w-full text-[16px] font-bold py-3.5 rounded-md shadow-sm mb-2 bg-[#570D48] hover:bg-[#4a0b3d] text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                  onClick={handlePay}
                  disabled={isVerifying}
                >
                  <Lock size={16} /> Pay ₹{amount}
                </button>
              )}

            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RazorpayMockModal;
