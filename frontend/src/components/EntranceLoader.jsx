import React from 'react';
import './EntranceLoader.css';

const EntranceLoader = () => {
    return (
        <div className="entrance-root">
            <div className="entrance-content">
                <div className="loader-logo">
                    <span className="logo-font">gira</span>
                    <div className="logo-dot"></div>
                </div>
                <div className="loader-orbit">
                    <div className="orbit-circle"></div>
                    <div className="orbit-glind"></div>
                </div>
                <p className="loader-text">Securing Command Center...</p>
            </div>
        </div>
    );
};

export default EntranceLoader;
