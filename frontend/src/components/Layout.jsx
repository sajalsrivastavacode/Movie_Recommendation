import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Home, Compass, User } from 'lucide-react';

function Layout() {
    return (
        <>
            <nav style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '2rem',
                padding: '1rem',
                background: 'rgba(30, 41, 59, 0.8)',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid var(--glass-border)',
                marginBottom: '1rem'
            }}>
                <Link to="/" style={linkStyle}><Home size={20} /> Home</Link>
                <Link to="/explore" style={linkStyle}><Compass size={20} /> Explore</Link>
                {/* Simple Profile Link placeholder */}
                <Link to="#" style={{ ...linkStyle, opacity: 0.5, cursor: 'not-allowed' }}><User size={20} /> Profile</Link>
            </nav>

            <div style={{ paddingBottom: '2rem' }}>
                <Outlet />
            </div>
        </>
    );
}

const linkStyle = {
    color: 'var(--text-primary)',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: 500,
    transition: '0.2s',
};

export default Layout;
