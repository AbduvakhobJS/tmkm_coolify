import React from 'react';
import NewNavbar from './NewNavbar';
import './NavbarOverlay.css';

interface NavbarOverlayProps {
    children: React.ReactNode;
    /** Route parametridan hisoblangan faol menyu id'si (masalan `/main/iframe/:key` sahifasida). */
    defaultActive?: string;
    onSelect?: (id: string) => void;
}

/** Sahifa dizaynini o'zgartirmasdan NewNavbar'ni tepaga qattiq (fixed) qo'yib beradi. */
const NavbarOverlay: React.FC<NavbarOverlayProps> = ({ children, defaultActive, onSelect }) => (
    <>
        <div className="navbar-overlay">
            <NewNavbar defaultActive={defaultActive} onSelect={onSelect} />
        </div>
        <div className="navbar-overlay-content">
            {children}
        </div>
    </>
);

export default NavbarOverlay;
