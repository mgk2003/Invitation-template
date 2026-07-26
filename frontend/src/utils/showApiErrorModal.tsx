import React from 'react';
import { Modal } from 'antd';

export function showApiErrorModal(title: string, err: any, onClose?: () => void) {
  let errorMessages: string[] = [];

  const apiMessage = err?.data?.message || err?.response?.data?.message || err?.message;

  if (Array.isArray(apiMessage)) {
    errorMessages = apiMessage;
  } else if (typeof apiMessage === 'string') {
    errorMessages = [apiMessage];
  } else if (err?.error) {
    errorMessages = [String(err.error)];
  } else if (err?.errorFields && Array.isArray(err.errorFields)) {
    errorMessages = err.errorFields.map(
      (f: any) => `${Array.isArray(f.name) ? f.name.join(' › ') : f.name}: ${f.errors.join(', ')}`
    );
  } else {
    errorMessages = ['An unexpected error occurred. Please check your network connection or try again.'];
  }

  Modal.error({
    title: (
      <span className="font-serif font-bold text-lg text-red-400 flex items-center gap-2">
        <span>⚠️</span>
        <span>{title}</span>
      </span>
    ),
    width: 560,
    centered: true,
    maskClosable: true,
    onOk() {
      if (onClose) onClose();
    },
    onCancel() {
      if (onClose) onClose();
    },
    content: (
      <div className="mt-3 space-y-3">
        <p className="text-xs text-gray-300 font-medium">
          The system encountered the following error(s). Please review and correct:
        </p>
        <div className="p-3 bg-[#0d0e15] border border-red-500/40 rounded-xl max-h-64 overflow-y-auto shadow-inner">
          <ul className="list-disc pl-4 space-y-1.5 text-xs text-red-300 font-mono">
            {errorMessages.map((msg, idx) => (
              <li key={idx} className="leading-relaxed">
                {msg}
              </li>
            ))}
          </ul>
        </div>
      </div>
    ),
    okText: 'Understood & Close',
    okButtonProps: {
      className: 'bg-red-600 hover:bg-red-500 text-white font-semibold border-none shadow-lg',
    },
  });
}
