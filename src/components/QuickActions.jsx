import React from 'react';
import { supabase } from '../supabase/supabaseClient'; 
import'../styles/quickaction.css'

const QuickActions = () => {

  const handleAction = async (type) => {
    const amountStr = prompt(`How much you wan ${type}?`);
    if (!amountStr) return;
    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) return alert('Enter valid amount');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert('Please login');

    const { data: wallet } = await supabase.from('wallets').select('balance').eq('user_id', user.id).single();

    if (!wallet || wallet.balance < amount) {
      return alert(`Insufficient balance. You get ₦${wallet?.balance || 0}`);
    }

    const newBalance = wallet.balance - amount;
    const { error } = await supabase.from('wallets').update({ balance: newBalance }).eq('user_id', user.id);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      await supabase.from('transactions').insert({
        user_id: user.id,
        amount: -amount,
        type: type,
        status: 'success'
      });
      alert(`${type} of ₦${amount.toLocaleString()} successful!`);
      window.location.reload();
    }
  };

  return (
    <div style={{ display: 'flex', gap: '12px', padding: '15px', justifyContent: 'space-between' }}>
      
      <button onClick={() => handleAction('Send')} style={{ flex: 1, padding: '15px', background: '#f5f5f5', borderRadius: '12px', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
        <span style={{ fontSize: '20px' }}>💸</span>
        <strong style={{ fontSize: '12px' }}>Send</strong>
        <span style={{ fontSize: '10px', color: 'gray' }}>To CheqPay User</span>
      </button>

      <button onClick={() => handleAction('Transfer to Bank')} style={{ flex: 1, padding: '15px', background: '#f5f5f5', borderRadius: '12px', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
        <span style={{ fontSize: '20px' }}>🏦</span>
        <strong style={{ fontSize: '12px' }}>Transfer to Bank</strong>
        <span style={{ fontSize: '10px', color: 'gray' }}>To Bank</span>
      </button>

      <button onClick={() => handleAction('Withdraw')} style={{ flex: 1, padding: '15px', background: '#f5f5f5', borderRadius: '12px', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
        <span style={{ fontSize: '20px' }}>💵</span>
        <strong style={{ fontSize: '12px' }}>Withdraw</strong>
        <span style={{ fontSize: '10px', color: 'gray' }}>Cash Out Easily</span>
      </button>

    </div>
  );
};

export default QuickActions;