import { useState, useEffect } from 'react';
import styles from '../styles/BalanceTracker.module.css';

export default function BalanceTracker() {
    const [balanceData, setBalanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const response = await fetch('/api/revolut/balance');
                const data = await response.json();
                
                console.log('Balance API Response:', data);  // Debug log
                
                if (data.status === 'success') {
                    setBalanceData(data.accounts);
                    console.log('Parsed Balance Data:', data.accounts);  // Debug log
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
            <h1 className={styles.title}>Diamond Sky Marketing</h1>
            <h2 className={styles.subtitle}>Balance Tracker</h2>
            
            <div className={styles.balanceGrid}>
                {balanceData?.map((account) => (
                    <div key={account.id} className={styles.balanceCard}>
                        <h3 className={styles.accountName}>{account.name}</h3>
                        {account.error ? (
                            <div className={styles.errorMessage}>
                                Failed to load balance
                            </div>
                        ) : (
                            <>
                                <div className={styles.balanceAmount}>
                                    €{((account.balance || 0) / 100).toLocaleString('nl-NL', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </div>
                                <div className={styles.availableAmount}>
                                    Available: €{((account.available || 0) / 100).toLocaleString('nl-NL', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </div>
                            </>
                        )}
                        <div className={styles.accountDetails}>
                            <span className={styles.currency}>{account.currency}</span>
                            <span className={styles.state}>{account.state}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.lastUpdated}>
                Last updated: {new Date().toLocaleString('nl-NL')}
            </div>
        </div>
    );
} 