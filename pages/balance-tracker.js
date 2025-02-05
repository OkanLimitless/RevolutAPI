import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, LineElement, PointElement, LinearScale, CategoryScale } from 'chart.js';
import styles from '../styles/BalanceTracker.module.css';

// Register required Chart.js components
Chart.register(LineElement, PointElement, LinearScale, CategoryScale);

export default function BalanceTracker() {
    const [balanceData, setBalanceData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [balanceHistory, setBalanceHistory] = useState([]);

    const formatCurrency = (amount) => {
        return Number(amount).toLocaleString('nl-NL', { 
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

    // Calculate overall combined balance and goal in EUR if balanceData is available.
    const usdToEurRate = 0.92; // Convert USD to EUR using a static rate. Adjust as needed.

    // Convert account balance to EUR if in USD.
    const calculateConvertedBalance = (account) => {
        if (account.currency && account.currency.toUpperCase() === 'USD') {
            return account.balance * usdToEurRate;
        }
        return account.balance;
    };

    // Convert monthly goal to EUR if in USD.
    const calculateConvertedGoal = (account) => {
        if (account.monthlyGoal) {
            if (account.currency && account.currency.toUpperCase() === 'USD') {
                return account.monthlyGoal * usdToEurRate;
            }
            return account.monthlyGoal;
        }
        return 0;
    };

    const overallBalance = balanceData ? balanceData.reduce((sum, account) => sum + calculateConvertedBalance(account), 0) : 0;
    const overallGoal = balanceData ? balanceData.reduce((sum, account) => sum + calculateConvertedGoal(account), 0) : 0;

    // New Effect: Each time balanceData updates, record the current overall balance with a timestamp.
    useEffect(() => {
        if (balanceData) {
            setBalanceHistory(prevHistory => [...prevHistory, { 
                date: new Date(), 
                balance: overallBalance 
            }]);
        }
    }, [balanceData, overallBalance]);

    // Prepare data for the Line chart (balance history).
    const chartData = {
        labels: balanceHistory.map(point => new Date(point.date).toLocaleTimeString('nl-NL')),
        datasets: [{
            label: 'Overall Balance (€)',
            data: balanceHistory.map(point => point.balance),
            fill: false,
            borderColor: 'blue',
            tension: 0.1,
        }],
    };

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
            
            {/* Overall Combined Balance Section */}
            <div className={styles.overallBalanceSection}>
                <h2>Overall Balance</h2>
                <div className={styles.overallBalance}>
                    €{formatCurrency(overallBalance)}
                </div>
                {overallGoal > 0 && (
                    <div className={styles.overallProgress}>
                        <div className={styles.progressBar}>
                            <div 
                                className={styles.progressFill}
                                style={{ width: `${Math.min(100, (overallBalance / overallGoal) * 100)}%` }} 
                            />
                        </div>
                        <div className={styles.progressText}>
                            {Math.round((overallBalance / overallGoal) * 100)}% of overall goal
                        </div>
                    </div>
                )}
                {balanceData.some(acc => acc.currency && acc.currency.toUpperCase() === 'USD') && (
                    <div className={styles.exchangeRateNote}>
                        Conversion rate (USD to EUR): {usdToEurRate}
                    </div>
                )}
            </div>

            {/* New: Balance History Graph for visualization and motivation */}
            <div className={styles.chartContainer}>
                <Line data={chartData} options={{
                    responsive: true,
                    scales: {
                        x: { title: { display: true, text: 'Time' } },
                        y: { title: { display: true, text: 'Balance (€)' } }
                    }
                }} />
            </div>

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