// PaymentSuccessPopup.jsx
import { CheckCircle } from "lucide-react";

export default function PaymentSuccessPopup({ amount, onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="surface-card relative w-[340px] p-8 text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <CheckCircle className="h-16 w-16 text-[var(--brand-primary)]" />
            <div className="absolute inset-0 pulse-ring rounded-full bg-[var(--brand-primary)]/30"></div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-xl font-semibold text-[var(--brand-deep)]">
          Payment successful
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Rs {amount} sent to recipient
        </p>

        {/* Close button */}
        <button
          onClick={onClose}
          className="btn-primary mt-6 w-full px-4 py-2 text-sm font-semibold"
        >
          Done
        </button>
      </div>
    </div>
  );
}
