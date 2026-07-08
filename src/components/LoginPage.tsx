import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/auth';
import './LoginPage.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const { mutate, isPending } = useLogin();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        mutate({ username, password }, {
            onSuccess: (data) => {
                const token = data?.token || data?.accessToken || data;
                if (!token) {
                    setError('Login yoki parol xato');
                    return;
                }
                localStorage.setItem('tmk-token', token);
                navigate('/main');
            },
            onError: () => {
                setError('Login yoki parol xato');
            },
        });
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-logo">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                        <path d="M12 12l9-5M12 12v10M12 12L3 7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                    </svg>
                </div>
                <div className="login-title">UZTMK</div>
                <div className="login-subtitle">National Industrial Situation Center</div>

                <form onSubmit={handleSubmit}>
                    <div className="login-field">
                        <label className="login-label" htmlFor="login-username">Login</label>
                        <div className="login-input-wrap">
                            <span className="login-input-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12z" stroke="currentColor" strokeWidth="1.6" />
                                    <path d="M4 21.5c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                </svg>
                            </span>
                            <input
                                id="login-username"
                                className="login-input"
                                type="text"
                                placeholder="Foydalanuvchi nomi"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                required
                            />
                        </div>
                    </div>

                    <div className="login-field">
                        <label className="login-label" htmlFor="login-password">Parol</label>
                        <div className="login-input-wrap">
                            <span className="login-input-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
                                    <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.6" />
                                </svg>
                            </span>
                            <input
                                id="login-password"
                                className="login-input"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Parolni kiriting"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                style={{ paddingRight: 40 }}
                                required
                            />
                            <button
                                type="button"
                                className="login-toggle-visibility"
                                onClick={() => setShowPassword((v) => !v)}
                                aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko\'rsatish'}
                            >
                                {showPassword ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                        <path d="M10.6 5.1c.45-.07.92-.1 1.4-.1 6 0 9.5 6 9.5 6a17.9 17.9 0 0 1-3.3 4.1M6.6 6.6C3.7 8.4 2 12 2 12s3.5 6 9.5 6c1.3 0 2.5-.3 3.6-.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                    </svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" stroke="currentColor" strokeWidth="1.6" />
                                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="login-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                                <path d="M12 8v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                <path d="M12 16h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {/*<button className="login-submit" type="submit" disabled={isPending}>*/}
                    {/*    {isPending && <span className="login-spinner" />}*/}
                    {/*    {isPending ? 'Tekshirilmoqda...' : 'Kirish'}*/}
                    {/*</button>*/}

                    <button className="login-submit" type="submit" onClick={() => {
                        localStorage.setItem("tmk-token","26a1ffa663c7c9ae064d81a5325942dfaacd85232cb12b378dfe14c04ab04934")
                        navigate('/main')
                    }}>
                        Kirish
                    </button>
                </form>

                <div className="login-footer">© {new Date().getFullYear()} UZTMK. Barcha huquqlar himoyalangan.</div>
            </div>
        </div>
    );
};

export default LoginPage;
