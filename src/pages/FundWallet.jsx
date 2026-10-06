import { useState } from "react";
import { supabase } from "../supabase/supabaseClient";

export default function FundWallet() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const fundWallet = async () => {
    if (!amount || amount < 100) {
      alert("Amount must be at least ₦100");
      return;
    }

    setLoading(true);
    
    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: (await supabase.auth.getUser()).data.user.email,
      amount: amount * 100, // Paystack use kobo
      currency: "NGN",
      callback: async function(response) {
        // Verify for backend
        const { data, error } = await supabase.functions.invoke('verify-paystack', {
          body: { reference: response.reference, amount: Number(amount) }
        });
        
        if (error) {
          alert("Verification failed: " + error.message);
        } else {
          alert("Wallet funded! ₦" + amount);
          setAmount("");
          window.location.reload();
        }
        setLoading(false);
      },
      onClose: function() {
        alert("Payment cancelled");
        setLoading(false);
      }
    });
    handler.openIframe();
  };

  return (
    <div>
      <input 
        type="number" 
        value={amount} 
        onChange={(e) => setAmount(e.target.value)} 
        placeholder="Enter amount e.g 1000"
      />
      <button onClick={fundWallet} disabled={loading}>
        {loading ? "Processing..." : "Fund Wallet"}
      </button>
    </div>
  );
}