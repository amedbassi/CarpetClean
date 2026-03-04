'use client';

import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Eraser } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

interface SignaturePadProps {
    onEnd: (signatureData: string | null) => void;
}

export default function SignaturePad({ onEnd }: SignaturePadProps) {
    const { t } = useLanguage();
    const sigCanvas = useRef<SignatureCanvas>(null);

    const clear = () => {
        sigCanvas.current?.clear();
        onEnd(null);
    };

    const handleEnd = () => {
        if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
            onEnd(sigCanvas.current.toDataURL());
        } else {
            onEnd(null);
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{t.intake.signature}</label>
            <div className="border rounded-md shadow-sm bg-white">
                <SignatureCanvas
                    ref={sigCanvas}
                    penColor="black"
                    canvasProps={{
                        className: 'w-full h-48 sm:h-40 rounded-md touch-none',
                    }}
                    onEnd={handleEnd}
                />
            </div>
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={clear}
                    className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <Eraser className="h-4 w-4 mr-1" />
                    {t.intake.clear_signature}
                </button>
            </div>
        </div>
    );
}
