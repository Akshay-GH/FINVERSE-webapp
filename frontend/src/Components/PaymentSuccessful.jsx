// PaymentSuccessPopup.jsx
import { CheckCircle } from "lucide-react";

export default function PaymentSuccessPopup({ amount, onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center relative w-[320px] animate-fadeIn">
        
        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <CheckCircle className="text-green-500 w-16 h-16" />
            <div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-30"></div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-xl font-semibold text-gray-800">Payment Successful!</h2>
        <p className="text-gray-600 mt-2">₹{amount} Paid Successfully</p>

        {/* Close button */}
        <button
          onClick={onClose}
          className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-xl transition"
        >
          Done
        </button>
      </div>
    </div>
  );
}
