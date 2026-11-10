import { useState } from "react"

const SECTIONS = [
  {
    title: "About VEHZA",
    items: [
      { q: "What is Vehza ?", a: "Vehza is Nigeria's fast and secure platform for buying cheap data, airtime, paying electricity bills, and subscribing to cable TV (DStv, GOtv, and Startimes) — all in one place, in seconds." },
      { q: "Is Vehza legitimate and safe?", a: "Yes. CheqPay uses secure payments, encrypted transactions, and verified providers. Your wallet, PIN, and personal information are protected." },
     
      { q: "Do I need to download an app to use Vehza?", a: "No. Vehza works directly in your browser on mobile and desktop. No app download is required." },
      { q: "Is Vehza available 24/7?", a: "Yes. You can buy data, airtime, electricity, and cable subscriptions on CheqPay at any time, day or night, including weekends and public holidays." },
      { q: "What services does  offer?", a: "CheqPay offers cheap data bundles, airtime top-up, electricity bill payment, and Vehza cable TV subscriptions for DStv, GOtv, and Startimes." },
    ]
  },
  {
    title: "Account",
    items: [
      
    
      { q: "Can I have more than one Vehza account?", a: "No. Each user is allowed only one account, linked to one phone number and email address, for security reasons." },
      { q: "How do I update my profile information?", a: "Go to  Profile, edit your name, phone number, or email, and save the changes." },
      { q: "How do I change my password?", a: "Go to profile> Change Password, enter your old password, then create a new password." },
      { q: "I forgot my password. What should I do?", a: "Click Forgot Password on the login page, enter your email, and follow the link sent to you to reset your password." },
      { q: "Can I delete my CheqPay account?", a: "Yes.  contact support for assistance." },
    ]
  },
  {
    title: "Wallet",
    items: [
      { q: "How do I fund my Vehza wallet?", a: "Go to Fund wallet, choose an amount, and pay with bank transfer or card. Your wallet will be credited instantly." },
      { q: "Does Vehza charge for funding my wallet?", a: "No. Funding your wallet is completely free. There are zero funding charges." },
      { q: "What payment methods can I use?", a: "You can fund your wallet with bank transfer or debit card." },
      { q: "How long does wallet funding take?", a: "Most wallet funding is instant. If there is a bank delay, it may take up to 10 minutes. If it takes longer, contact support with your payment reference." },
      { q: "How do I check my wallet balance?", a: "Your wallet balance is displayed at the top of your dashboard and on each service page before you make a payment." },
      { q: "What is the minimum amount I can fund?", a: "You can fund your wallet with as little as ₦100." },
      { q: "Can I withdraw money from my wallet?", a: "For now, wallet funds are for purchases within Vehza. If you experience any funding issue, contact support." },
      { q: "My wallet was not credited after payment. What should I do?", a: "Wait 10 minutes, refresh your dashboard, and check your Transaction History. If it is still not credited, contact support with your payment reference and amount." },
    ]
  },
  {
    title: "Data",
    items: [
      { q: "How do I buy data on Vehza?", a: "Go to Data, select your network (MTN, Glo, Airtel, or 9mobile), choose a plan, enter the phone number, and confirm with your PIN." },
      { q: "Which networks does Vehza support for data?", a: "CheqPay supports MTN, Glo, Airtel, and 9mobile." },
      { q: "How long does data delivery take?", a: "Most deliveries are instant, in less than one minute. If the network is slow, it may take up to 5 minutes." },
      { q: "Can I buy data for someone else?", a: "Yes. Simply enter the recipient's phone number instead of yours." },
      { q: "Can I buy data in bulk?", a: "Yes. You can buy multiple data bundles for different numbers, one after the other, from your wallet." },
      { q: "Why is my data bundle not working after purchase?", a: "Ensure your phone is on the correct network and data is turned on. Restart your phone and check your data balance with your network's USSD code. If it still does not work, contact support." },
      { q: "Is Vehza data cheaper than others?", a: "Yes. Vehza offers some of the cheapest data bundles in Nigeria, plus zero funding charges, so you save more on every purchase." },
      { q: "Do CheqPay data bundles expire?", a: "Yes. Each data plan has its own validity period, such as daily, weekly, or monthly. The validity is shown before you buy." },
    ]
  },
  {
    title: "Airtime",
    items: [
      { q: "How do I buy airtime on Vehza?", a: "Go to Airtime, select the network, enter the phone number and amount, then confirm with your PIN." },
      { q: "Which networks can I buy airtime for?", a: "You can buy airtime for MTN, Glo, Airtel, and 9mobile." },
      { q: "What is the minimum amount for airtime?", a: "The minimum amount for airtime is ₦50." },
      { q: "Can I buy airtime for another number?", a: "Yes. Just enter the recipient's number during checkout." },
      { q: "How long does airtime delivery take?", a: "Airtime delivery is instant in most cases." },
    ]
  },
  {
    title: "Electricity",
    items: [
      { q: "How do I buy electricity tokens on Vehza?", a: "Go to Electricity, select your DISCO, choose Prepaid or Postpaid, enter your meter number, verify it, enter the amount and phone number, then confirm with your PIN." },
      { q: "Which electricity companies does Vehza support?", a: "CheqPay supports Ikeja (IKEDC), Eko (EKEDC), Abuja (AEDC), Kano (KEDCO), Enugu (EEDC), Port Harcourt (PHED), Ibadan (IBEDC), Kaduna (KAEDCO), Jos (JED), Benin (BEDC), and Yola (YEDC)." },
      { q: "What is the difference between Prepaid and Postpaid?", a: "Prepaid means you pay before you use electricity and receive a token to load. Postpaid means you pay after you have used electricity, to settle your bill." },
      { q: "Where will my electricity token be sent?", a: "Your token will appear on your screen immediately after payment, and it will also be sent to the phone number you provided via SMS." },
      { q: "What is the minimum amount for electricity?", a: "The minimum amount is ₦500 plus a ₦50 service fee. So for ₦500, the total is ₦550." },
      { q: "My meter number is not verifying. What should I do?", a: "Ensure you selected the correct DISCO and the correct Prepaid or Postpaid option. Double-check your meter number and try again. If it still fails, wait a few minutes or contact support." },
      { q: "I bought electricity but did not receive a token. What should I do?", a: "Check your Transaction History and SMS. If the transaction was successful but no token was shown, contact support with your meter number and transaction reference." },
      { q: "Can I pay electricity for someone else?", a: "Yes. Enter their meter number and phone number, and the token will be sent to that number." },
    ]
  },
  {
    title: "Cable TV",
    items: [
      { q: "Which cable providers does Vehza support?", a: "Vehza supports DStv, GOtv, and Startimes." },
      { q: "How do I renew my DStv or GOtv subscription?", a: "Go to Cable, select DStv or GOtv, enter your smartcard or IUC number, verify it, choose your bouquet, and confirm with your PIN." },
      { q: "How long does cable activation take?", a: "Cable subscriptions are activated instantly in most cases. If it takes longer than 15 minutes, restart your decoder and contact support." },
      { q: "Can I subscribe to cable for someone else?", a: "Yes. Enter the recipient's smartcard or IUC number instead of yours." },
      { q: "What happens if I choose the wrong bouquet?", a: "Cable subscriptions cannot be reversed once activated. Please confirm your bouquet and smartcard number carefully before payment." },
    ]
  },
  {
    title: "PIN & Security",
    items: [
      { q: "What is a Transaction PIN?", a: "It is a 4-digit PIN you create to confirm every payment. It protects your wallet so no one can spend your money, even if they have access to your phone." },
      { q: "How do I set my Transaction PIN?", a: "Go to profile> Set Transaction PIN, enter your 4-digit PIN, and confirm it. You must set a PIN before you can make any purchase." },
      { q: "I forgot my PIN. What should I do?", a: "Go to profile > Change PIN / Reset PIN and follow the steps to set a new PIN. If you are unable to, contact support." },
      { q: "Can someone else use my Vehza account?", a: "No. Never share your password or PIN with anyone. CheqPay staff will never ask you for your PIN or password." },
      { q: "How do I keep my account secure?", a: "Use a strong password, keep your PIN private, do not share your OTP, and always log out when using a shared device." },
    ]
  },
  {
    title: "Business",
    items: [
      { q: "Can I use Vehza for my business?", a: "Yes. Many vendors, POS operators, and small businesses use Vehza to sell data, airtime, electricity, and cable subscriptions to their customers." },
     
  
    ]
  },
  {
    title: "Refunds",
    items: [
      { q: "I paid but did not receive value. What happens?", a: "Do not worry. Check your Transaction History. If it shows failed, your money will be automatically refunded to your wallet within 24 hours. If it remains pending after 1 hour, contact support with your transaction reference." },
      { q: "How long does a refund take?", a: "Refunds for failed transactions are usually instant or within 24 hours, directly to your Vehza wallet." },
      { q: "How do I view my transaction history?", a: "Go to Dashboard > Transactions or History to see all your purchases, funding, and refunds." },
      { q: "How do I contact Vehza support?", a: "Go to Support / Help inside the app, or send us a message on WhatsApp or Email. We respond quickly." },
      { q: "What information should I send when reporting an issue?", a: "Send your full name, phone number, transaction reference, amount, date, and a screenshot if possible. This helps support resolve your issue faster." },
    ]
  },
]

export default function FAQPage() {
  const [active, setActive] = useState("All")
  const [openKey, setOpenKey] = useState(null)

  const shown = active === "All" ? SECTIONS : SECTIONS.filter(s => s.title === active)
  const total = shown.reduce((sum, s) => sum + s.items.length, 0)

  return (
    <div style={{ background: "#0F131A", minHeight: "100vh", padding: "12px 10px 36px", color: "#fff", fontFamily: "inherit" }}>
      <div style={{ maxWidth: 580, margin: "0 auto" }}>
        {/* HEADER - SMALLER */}
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <h1 style={{ fontSize: 17, fontWeight: 800, margin: "2px 0" }}>Frequently Asked Questions</h1>
          <p style={{ color: "#9AA3B2", fontSize: 10, margin: 0, lineHeight: 1.4 }}>Find answers about data, airtime, electricity, cable TV, wallet, PIN and more.</p>
        </div>

        {/* BUTTONS - REPLACED SEARCH */}
        <div style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 6, marginBottom: 10, scrollbarWidth: "none" }}>
          {["All", ...SECTIONS.map(s => s.title)].map(cat => (
            <button
              key={cat}
              onClick={() => { setActive(cat); setOpenKey(null) }}
              style={{
                whiteSpace: "nowrap", padding: "8px 12px", borderRadius: 5, border: "none",
                background: active === cat ? "#FFEB3B" : "#1E242E",
                color: active === cat ? "#000" : "#fff",
                fontWeight: 500, fontSize: 9, cursor: "pointer"
              }}
            >{cat}</button>
          ))}
        </div>

        <p style={{ color: "#888", fontSize: 10.5, margin: "0 0 8px" }}>{total} questions</p>

        {/* SECTIONS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {shown.map((sec, si) => (
            <div key={si}>
              <h2 style={{ fontSize: 10, fontWeight: 300, margin: "0 0 6px 2px", color: "#aaa25b", textTransform: "uppercase", letterSpacing: 0.4 }}>{sec.title}</h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {sec.items.map((item, ii) => {
                  const key = `${si}-${ii}`
                  const isOpen = openKey === key
                  return (
                    <div key={key} style={{ background: "#1E242E", border: isOpen ? "1px solid #FFEB3B" : "1px solid #2C3440", borderRadius: 10, overflow: "hidden" }}>
                      <button
                        onClick={() => setOpenKey(isOpen ? null : key)}
                        style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, textAlign: "left", background: "none", border: "none", padding: "9px 10px", cursor: "pointer", color: "#fff" }}
                      >
                        <span style={{ fontSize: 10, fontWeight: 300, lineHeight: 1.4 }}>{item.q}</span>
                        <span style={{
                          width: 20, height: 20, minWidth: 20, borderRadius: "50%", background: isOpen ? "#FFEB3B" : "#2C3440",
                          color: isOpen ? "#000" : "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 10, fontWeight: 300, transform: isOpen ? "rotate(45deg)" : "rotate(0deg)", transition: "0.2s"
                        }}>+</span>
                      </button>

                      {isOpen && (
                        <div style={{ padding: "0 10px 10px", fontSize: 9, lineHeight: 1.55, color: "#C5CBD6", borderTop: "1px solid #2C3440", paddingTop: 8 }}>
                          {item.a}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* STILL NEED HELP - SMALLER, STILL GOLDEN YELLOW */}
        <div style={{ marginTop: 16, background: "#FFEB3B", borderRadius: 12, padding: 12, textAlign: "center", color: "#000" }}>
          <h3 style={{ margin: "0 0 3px", fontSize: 12.5 }}>Still need help?</h3>
          <p style={{ margin: "0 0 10px", fontSize: 11, opacity: 0.8 }}>Our support team responds quickly.</p>
          <a href="https://wa.me/2348101234567?text=Hello%20CheqPay%2C%20I%20need%20help" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "8px 14px", borderRadius: 8, background: "#000", color: "#FFEB3B", fontWeight: 800, fontSize: 11, textDecoration: "none" }}>Contact Support</a>
        </div>

      </div>
    </div>
  )
}