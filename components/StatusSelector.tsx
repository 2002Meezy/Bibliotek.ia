
import React, { useState } from 'react';

const StatusSelector = ({ status, onUpdate }: { status?: 'unread' | 'reading' | 'read', onUpdate: (s: 'unread' | 'reading' | 'read') => void }) => {
    const [isOpen, setIsOpen] = useState(false);

    const colors = {
        unread: 'bg-red-500',
        reading: 'bg-yellow-400',
        read: 'bg-green-500'
    };

    const labels = {
        unread: 'Não Lido',
        reading: 'Lendo',
        read: 'Lido'
    };

    const currentStatus = status || 'unread';

    return (
        <div className="relative" onClick={e => e.stopPropagation()}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md hover:scale-105 transition-all"
            >
                <div className={`w-2.5 h-2.5 rounded-full ${colors[currentStatus]}`}></div>
                <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider">{labels[currentStatus]}</span>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-stone-100 overflow-hidden z-50 animate-dropdown-pop flex flex-col">
                    {(['unread', 'reading', 'read'] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => {
                                onUpdate(s);
                                setIsOpen(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-stone-50 transition-colors text-left"
                        >
                            <div className={`w-2 h-2 rounded-full ${colors[s]}`}></div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${currentStatus === s ? 'text-stone-900' : 'text-stone-400'}`}>
                                {labels[s]}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StatusSelector;
