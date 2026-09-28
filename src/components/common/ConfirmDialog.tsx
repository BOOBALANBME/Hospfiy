import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'danger' | 'warning' | 'success' | 'info';
  confirmVariant?: string;
  confirmId?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  type = 'warning',
  confirmVariant,
  confirmId = 'confirm-action-btn',
}) => {
  const handleClose = () => {
    if (onCancel) onCancel();
    else if (onClose) onClose();
  };

  const resolvedType = (confirmVariant === 'danger' || confirmVariant === 'destructive')
    ? 'danger'
    : (confirmVariant === 'primary' || confirmVariant === 'info')
    ? 'info'
    : type;

  const iconConfig = {
    danger: { icon: AlertTriangle, bg: 'bg-rose-100 text-rose-600', btn: 'bg-rose-600 hover:bg-rose-700 text-white' },
    warning: { icon: AlertCircle, bg: 'bg-amber-100 text-amber-600', btn: 'bg-amber-600 hover:bg-amber-700 text-white' },
    success: { icon: CheckCircle, bg: 'bg-emerald-100 text-emerald-600', btn: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
    info: { icon: Info, bg: 'bg-blue-100 text-blue-600', btn: 'bg-blue-600 hover:bg-blue-700 text-white' },
  }[resolvedType];

  const Icon = iconConfig.icon;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} maxWidth="md" id="confirmation-dialog">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full shrink-0 ${iconConfig.bg}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={handleClose}
          className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
        >
          {cancelLabel}
        </button>
        <button
          id={confirmId}
          type="button"
          onClick={() => {
            onConfirm();
            handleClose();
          }}
          className={`px-4 py-2 text-sm font-medium rounded-lg shadow-xs transition-colors ${iconConfig.btn}`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
};
