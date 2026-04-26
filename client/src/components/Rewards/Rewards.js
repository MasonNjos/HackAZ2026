import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import './Rewards.css';

const Rewards = () => {
    const { t } = useLanguage();
    const [rewardsData, setRewardsData] = useState({
        balance: 0,
        streak: 0,
        banner_bucks: 0,
        grocery_credit: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [redeemSuccess, setRedeemSuccess] = useState('');

    useEffect(() => {
        fetchRewards();
    }, []);

    const fetchRewards = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5001/api/credits/balance');
            setRewardsData(res.data);
            setLoading(false);
        } catch (err) {
            setError(t('Failed to load rewards data.'));
            setLoading(false);
        }
    };

    const handleRedeem = async (type, cost) => {
        if (rewardsData.balance < cost) {
            setError(t('Insufficient balance'));
            return;
        }

        try {
            const res = await axios.post('http://localhost:5001/api/redeem', {
                reward_type: type,
                cost: cost
            });
            setRedeemSuccess(`${t('Successfully redeemed')} ${type}!`);
            setError(null);
            fetchRewards(); // refresh balances
            setTimeout(() => setRedeemSuccess(''), 3000);
        } catch (err) {
            setError(t('Failed to redeem reward.'));
            console.error(err);
        }
    };

    if (loading) return <div className="rewards-loading">{t('Loading Rewards...')}</div>;

    return (
        <div className="rewards-container">
            <Link to="/" className="page-back-btn rewards-back-btn">&larr; {t('Back to Dashboard')}</Link>
            <header className="rewards-header">
                <h2>🎁 {t('Rewards & Incentives')}</h2>
            </header>

            {error && <div className="rewards-error">{error}</div>}
            {redeemSuccess && <div className="rewards-success">{redeemSuccess}</div>}

            <div className="rewards-stats">
                <div className="stat-card streak-card">
                    <h3>🔥 {rewardsData.streak} {rewardsData.streak === 1 ? t('Day') : t('Days')}</h3>
                    <p>{t('Current Streak')}</p>
                </div>
                <div className="stat-card balance-card">
                    <h3>⭐ {rewardsData.balance}</h3>
                    <p>{t('Available Points')}</p>
                </div>
            </div>

            <div className="balances-section">
                <h3>{t('My Balances')}</h3>
                <div className="balances-grid">
                    <div className="balance-item banner-bucks">
                        <div className="balance-icon">🏥</div>
                        <div className="balance-info">
                            <h4>{t('Banner Bucks')}</h4>
                            <p className="balance-amount">{rewardsData.banner_bucks}</p>
                            <small>{t('Use for medication and groceries discounts')}</small>
                        </div>
                    </div>
                    <div className="balance-item groceries">
                        <div className="balance-icon">🛒</div>
                        <div className="balance-info">
                            <h4>{t('Groceries Credit')}</h4>
                            <p className="balance-amount">{rewardsData.grocery_credit}</p>
                            <small>{t('Use for fresh groceries only')}</small>
                        </div>
                    </div>
                </div>
            </div>

            <div className="redeem-section">
                <h3>{t('Redeem Points')}</h3>
                <div className="redeem-grid">
                    <div className="redeem-card">
                        <div className="redeem-icon">🏥</div>
                        <h4>100 {t('Banner Bucks')}</h4>
                        <p>{t('Cost: 1000 Points')}</p>
                        <button
                            className="btn-primary redeem-btn"
                            onClick={() => handleRedeem('Banner Bucks', 1000)}
                            disabled={rewardsData.balance < 1000}
                        >
                            {t('Redeem')}
                        </button>
                    </div>
                    <div className="redeem-card">
                        <div className="redeem-icon">🛒</div>
                        <h4>50 {t('Groceries Credit')}</h4>
                        <p>{t('Cost: 500 Points')}</p>
                        <button
                            className="btn-primary redeem-btn"
                            onClick={() => handleRedeem('Groceries Credit', 500)}
                            disabled={rewardsData.balance < 500}
                        >
                            {t('Redeem')}
                        </button>
                    </div>
                    <div className="redeem-card">
                        <div className="redeem-icon">🏥</div>
                        <h4>20 {t('Banner Bucks')}</h4>
                        <p>{t('Cost: 200 Points')}</p>
                        <button
                            className="btn-primary redeem-btn"
                            onClick={() => handleRedeem('Banner Bucks', 200)}
                            disabled={rewardsData.balance < 200}
                        >
                            {t('Redeem')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Rewards;
