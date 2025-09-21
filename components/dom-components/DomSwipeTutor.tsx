"use dom";
import "../../global.css";

import React from "react";

interface DomSwipeTutorProps {
    show?: boolean;
    bottomOffset?: number; // px from bottom
}

const DomSwipeTutor: React.FC<DomSwipeTutorProps> = ({ show = true, bottomOffset = 10 }) => {
    if (!show) return null;

    return (
        <div className="pointer-events-none" style={{ position: "absolute", left: 0, right: 0, bottom: bottomOffset, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
            <div className="bg-theme-notification rounded-full w-4 h-4 path" style={{ marginRight: 8 }}>
                <div className="text-7xl pt-4">👆🏽</div>
            </div>
            <style>{`
        .path { animation: swipe-dot 2s 0.5s infinite; }
        @keyframes swipe-dot {
          12% { visibility: visible; width: 40px; }
          25% { visibility: visible; transform: translate(-65px); width: 20px; }
          26% { visibility: hidden; }
        }
      `}</style>
        </div>
    );
};

export default DomSwipeTutor;
