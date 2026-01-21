import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import '../css/Sidebar.css';

import logoIcon from '../../../assets/logo2.png';
import logoText from '../../../assets/textlogowhite.png';
import iconLawAI from '../../../assets/chatbotWhite.png';
import iconNews from '../../../assets/newsWhite.png';
import iconLawyer from '../../../assets/hammerwhite.png';
import iconPdf from '../../../assets/pdfweb.png';
import iconSettings from '../../../assets/settings.png';
import iconReport from '../../../assets/warning.png';
import iconHelp from '../../../assets/faq.png';
import iconUser from '../../../assets/user.png';
import arrowUp from '../../../assets/up.png';
import arrowDown from '../../../assets/down.png';
import bookingLogo from '../../../assets/bookingicon.png';
import listLawyer from '../../../assets/listaslawyer.png';

const Sidebar = ({ onSectionChange, onReportClick }) => {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [showUserInfo, setShowUserInfo] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('lawyerup_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const toggleCollapse = () => setCollapsed(!collapsed);
    const toggleUserInfo = () => setShowUserInfo(!showUserInfo);

    const menuItems = [
        { icon: iconLawAI, label: 'LawAi' },
        { icon: iconNews, label: 'News' },
        { icon: iconLawyer, label: 'LawyerUp' },
        ...(user?.role === 'lawyer'
            ? [{ icon: listLawyer, label: 'Join as a Lawyer' }]
            : []),
        { icon: iconPdf, label: 'Pdf Library' },
        { icon: bookingLogo, label: 'Bookings' },
        { divider: true },
        { icon: iconSettings, label: 'Settings' },
        { icon: iconReport, label: 'Report', onClick: onReportClick },
        { icon: iconHelp, label: 'Help&FAQ' },
    ];


    return (
        <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            {/* ✅ Sidebar header */}
            <div className="sidebar-header">
                <img
                    src={logoIcon}
                    alt="Logo"
                    className="logo-icon"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/')}
                />
                {!collapsed && (
                    <img
                        src={logoText}
                        alt="LawyerUp"
                        className="logo-text"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate('/')}
                    />
                )}
            </div> {/* ✅ ← This line was missing */}

            {/* Sidebar menu */}
            <div className="sidebar-menu">
                {menuItems.map((item, idx) =>
                    item.divider ? (
                        <hr key={idx} className="menu-divider" />
                    ) : (
                        <div
                            key={idx}
                            className="menu-item"
                            onClick={() => {
                                if (item.label === 'Report') {
                                    item.onClick?.();
                                } else {
                                    onSectionChange(item.label);
                                }
                            }}
                        >
                            <img src={item.icon} alt={item.label} className="menu-icon" />
                            {!collapsed && <span>{item.label}</span>}
                        </div>
                    )
                )}
            </div>

            {/* Footer */}
            <div className="sidebar-footer">
                <div className="user-toggle" onClick={toggleUserInfo}>
                    <img src={iconUser} alt="User" className="user-icon" />
                    {!collapsed && <span className="username">{user?.fullName || 'Guest'}</span>}
                    {!collapsed && (
                        <img
                            src={showUserInfo ? arrowDown : arrowUp}
                            alt="Toggle"
                            className="arrow-toggle"
                        />
                    )}
                </div>

                {!collapsed && showUserInfo && user && (
                    <div className="user-details">
                        <p><strong>Plan:</strong> {user.plan}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <button
                            className="logout-btn"
                            onClick={() => {
                                localStorage.clear();
                                sessionStorage.clear();
                                navigate('/');
                            }}
                        >
                            Logout
                        </button>
                    </div>
                )}

                <button className="collapse-btn" onClick={toggleCollapse}>
                    {collapsed ? '→' : '←'}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;