import React from 'react';
import NewNavbar from './NewNavbar';
import './NavbarOverlay.css';

interface NavbarOverlayProps {
    children: React.ReactNode;
}

/** Sahifa dizaynini o'zgartirmasdan NewNavbar'ni tepaga qattiq (fixed) qo'yib beradi. */
const NavbarOverlay: React.FC<NavbarOverlayProps> = ({ children }) => (
    <>
        <div className="navbar-overlay">
            <NewNavbar />
        </div>
        <div className="navbar-overlay-content">
            {children}
        </div>
    </>
);

export default NavbarOverlay;
