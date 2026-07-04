import { motion, AnimatePresence } from 'motion/react';

interface ConfirmationDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmationDialog({
    isOpen,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel
}: ConfirmationDialogProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
                        onClick={onCancel}
                    />

                    {/* Dialog Container */}
                    <div className="fixed inset-0 flex items-center justify-center p-4 z-[101] pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: "spring", duration: 0.4 }}
                            className="bg-white border-2 border-slate-900 rounded-[2rem] max-w-sm w-full p-6 shadow-[6px_6px_0_0_rgba(15,23,42,1)] pointer-events-auto"
                        >
                            <h3 className="text-lg font-black text-slate-900 mb-2">{title}</h3>
                            <p className="text-xs font-semibold text-slate-600 leading-relaxed mb-6">{message}</p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={onCancel}
                                    className="px-4 py-2 border-2 border-slate-900 rounded-full text-xs font-black text-slate-800 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className="px-4 py-2 bg-[#FF6B6B] border-2 border-slate-900 rounded-full text-xs font-black text-white hover:bg-red-500 active:scale-95 transition-all cursor-pointer shadow-[2px_2px_0_0_rgba(15,23,42,1)] active:shadow-none"
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
