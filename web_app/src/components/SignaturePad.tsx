'use client';

import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Eraser } from 'lucide-react';

interface SignaturePadProps {
    onEnd: (signatureData: string | null) => void;
}

export default function SignaturePad({ onEnd }: SignaturePadProps) {
    const sigCanvas = useRef<SignatureCanvas>(null);
    const [isEmpty, setIsEmpty] = useState(true);

    const clear = () => {
        sigCanvas.current?.clear();
        setIsEmpty(true);
        onEnd(null);
    };

    const handleEnd = () => {
        if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
            setIsEmpty(false);
            onEnd(sigCanvas.current.toDataURL());
        } else {
            setIsEmpty(true);
            onEnd(null);
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Customer Signature</label>
            <div className="border rounded-md shadow-sm bg-white touch-none">
                <SignatureCanvas
                    ref={sigCanvas}
                    penColor="black"
                    canvasProps={{
                        className: 'w-full h-40 rounded-md',
                    }}
                    onEnd={handleEnd}
                />
            </div>
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={clear}
                    className="flex items-center text-sm text-red-600 hover:text-red-800"
                >
                    <Eraser className="h-4 w-4 mr-1" />
                    Clear Signature
                </button>
            </div>
        </div>
    );
}
