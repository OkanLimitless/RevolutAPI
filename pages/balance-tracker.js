import { useState, useEffect } from 'react';
import styles from '../styles/BalanceTracker.module.css';

export default function BalanceTracker() {
    const [balanceData, setBalanceData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const formatCurrency = (amountInCents) => {
        return Number(amountInCents).toLocaleString('nl-NL', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
    };

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const response = await fetch('/api/revolut/balance');
                const data = await response.json();
                
                console.log('Balance API Response:', data);  // Debug log
                
                if (data.status === 'success') {
                    setBalanceData(data.accounts);
                    console.log('Parsed Balance Data:', data.accounts);  // Debug log

                    if (data.transactions) {
                        setTransactions(data.transactions);
                    }
                } else {
                    setError(data.message || 'Failed to fetch balance');
                }
            } catch (err) {
                setError('Failed to load balance data');
                console.error('Balance fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchBalance();
        // Refresh every 5 minutes
        const interval = setInterval(fetchBalance, 5 * 60 * 1000);
        
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading balance data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>{error}</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>🚀 Diamond Sky Marketing</h1>
            <h2 className={styles.subtitle}>February Goal Tracker</h2>
            
            <div className={styles.balanceGrid}>
                {balanceData?.map((account) => (
                    <div key={account.id} className={styles.balanceCard}>
                        <h3 className={styles.accountName}>
                            💰 Total Balance
                        </h3>
                        <div className={styles.balanceAmount}>
                            €{formatCurrency(account.balance || 0)}
                        </div>
                        <div className={styles.motivationalText}>
                            February Goal: €
                            {account.monthlyGoal.toLocaleString('nl-NL', { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                            })}
                            <div className={styles.progressBar}>
                                <div 
                                    className={styles.progressFill}
                                    style={{ 
                                        width: `${Math.min(100, (account.balance / account.monthlyGoal) * 100)}%` 
                                    }}
                                />
                            </div>
                            <div className={styles.progressText}>
                                {Math.round((account.balance / account.monthlyGoal) * 100)}% of goal
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.motivationalQuote}>
                "February Goal: €5,000 - Let's make it happen! 💪"
            </div>

            {transactions.length > 0 && (
                <div className={styles.transactionsSection}>
                    <h2>Recent Transactions</h2>
                    <div className={styles.motivationalText}>
                        Keep pushing forward! Every transaction brings you closer to success.
                    </div>
                    {transactions.slice(0, 5).map(transaction => (
                        <div key={transaction.id} className={styles.transactionCard}>
                            <div className={styles.transactionId}>ID: {transaction.id}</div>
                            <div className={styles.transactionAmount}>
                                €{formatCurrency(transaction.amount)}
                            </div>
                            <div className={styles.transactionDate}>
                                {new Date(transaction.date).toLocaleString('nl-NL')}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className={styles.lastUpdated}>
                Last updated: {new Date().toLocaleString('nl-NL')}
            </div>
        </div>
    );
} 