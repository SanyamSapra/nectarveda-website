'use client';

import { Toaster } from 'sonner';
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { CheckCircle2, XCircle, Info } from 'lucide-react';

function SuccessIcon() {
    return (
        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CheckCircle2 size={16} color="#10b981" strokeWidth={2.2} />
        </div>
    );
}

function ErrorIcon() {
    return (
        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <XCircle size={16} color="#ef4444" strokeWidth={2.2} />
        </div>
    );
}

function InfoIcon() {
    return (
        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Info size={16} color="#6366f1" strokeWidth={2.2} />
        </div>
    );
}

export default function Providers({ children }) {
    return (
        <AuthProvider>
            <CartProvider>
                {children}
                <Toaster
                    position="top-right"
                    closeButton
                    duration={3000}
                    icons={{
                        success: <SuccessIcon />,
                        error: <ErrorIcon />,
                        info: <InfoIcon />,
                    }}
                    toastOptions={{
                        style: {
                            borderRadius: '14px',
                            border: '0.5px solid #e2e8f0',
                            padding: '12px 14px',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)',
                            gap: '8px',
                            fontSize: '13.5px',
                            fontFamily: 'inherit',
                        },
                        classNames: {
                            toast: 'nv-toast',
                            title: 'nv-toast-title',
                            description: 'nv-toast-desc',
                            success: 'nv-toast-success',
                            error: 'nv-toast-error',
                            info: 'nv-toast-info',
                        },
                    }}
                />

                <style>{`
                    .nv-toast {
                        gap: 8px !important;
                        align-items: center !important;
                    }
                    .nv-toast [data-icon] {
                        margin: 0 !important;
                        width: 28px !important;
                    }
                    .nv-toast-title {
                        font-weight: 500 !important;
                        font-size: 13.5px !important;
                        color: #0f172a !important;
                        line-height: 1.35 !important;
                    }
                    .nv-toast-desc {
                        font-size: 12px !important;
                        color: #94a3b8 !important;
                        margin-top: 1px !important;
                        line-height: 1.4 !important;
                    }
                    .nv-toast-success { border-left: 3px solid #10b981 !important; }
                    .nv-toast-error   { border-left: 3px solid #ef4444 !important; }
                    .nv-toast-info    { border-left: 3px solid #6366f1 !important; }
                `}</style>
            </CartProvider>
        </AuthProvider>
    );
}
