import React from 'react';

function Header({ onMenuOpen }) {
    return (
        <header className="fixed top-0 w-full bg-[#1e3a8a]/90 backdrop-blur-sm z-50 border-b border-white/10">
            <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">월하사주</h1>
                <button
                    onClick={onMenuOpen}
                    className="text-white text-2xl"
                >
                    ☰
                </button>
            </div>
        </header>
    );
}

export default Header;