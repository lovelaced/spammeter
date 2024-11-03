import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface PopupWindowProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
}

export const PopupWindow: React.FC<PopupWindowProps> = ({ title, children, onClose, className }) => (
  <motion.div
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.95, opacity: 0 }}
    className={`bg-white border-4 border-black overflow-hidden flex flex-col w-full ${className}`}
    style={{ boxShadow: '8px 8px 0 0 rgba(0,0,0,1)' }}
  >
    <div className="bg-black text-white p-1 flex items-center justify-between w-full">
      <div className="text-sm font-bold flex items-center">
        <span className="inline-block w-3 h-3 bg-white mr-2"></span>
        {title}
      </div>
      <button onClick={onClose} className="text-white hover:text-gray-300">
        <X size={16} />
      </button>
    </div>
    <div className="flex-1 overflow-auto">{children}</div>
  </motion.div>
);
