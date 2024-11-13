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
    className={`relative overflow-hidden ${className}`}
    style={{
      background: 'linear-gradient(170deg, #75FBFD 0%, #07FFFF 15%, #2CCFFF 20%,  #6F5BFF 75%, #7916F3 100%)',
      padding: '2px',
    }}
  >
    <div className="flex flex-col w-full h-full">
      <div className="pl-2 flex items-center justify-between w-full bg-transparent">
        <div className="text-med font-bold flex items-center text-black">
          <span className="inline-block w-3.5 h-3.5 bg-black mr-2" />
          {title}
        </div>
        <button onClick={onClose} className="text-black hover:text-gray-500">
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-auto bg-black m-[2px]">{children}</div>
    </div>
  </motion.div>
);