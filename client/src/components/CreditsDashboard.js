import React, { useState, useEffect } from 'react';

const CreditsDashboard = () => {
  const [balance, setBalance] = useState(0);
  const [ledger, setLedger] = useState([]);

  useEffect(() => {
    // Mock Solana devnet wallet balance
    const mockBalance = async () => {
      // Simulate API call to Solana
      setBalance(50);
      setLedger([
        { id: 1, type: 'earned', amount: 10, description: 'Daily check-in', date: '2024-04-25' },
        { id: 2, type: 'redeemed', amount: -20, description: 'Gas card', date: '2024-04-24' }
      ]);
    };
    mockBalance();
  }, []);

  const redeemCredits = () => {
    // Mock Solana transaction
    alert('Credits redeemed for gas card via Solana!');
    setBalance(balance - 20);
  };

  return (
    <div>
      <h2>My Wallet</h2>
      <p>Solana Balance: {balance} credits</p>
      <button onClick={redeemCredits} disabled={balance < 20} className="btn-primary">Redeem for Gas Card (20 credits)</button>
      <h3>Transaction History</h3>
      <ul>
        {ledger.map(tx => (
          <li key={tx.id}>
            {tx.type}: {tx.amount} credits - {tx.description} ({tx.date})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CreditsDashboard;