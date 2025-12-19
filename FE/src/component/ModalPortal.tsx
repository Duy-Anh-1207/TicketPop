import React from "react";
import { createPortal } from "react-dom";

interface ModalPortalProps {
  children: React.ReactNode;
  onBackdropClick?: () => void;
}

const ModalPortal: React.FC<ModalPortalProps> = ({ children, onBackdropClick }) => {
  return createPortal(
    <>
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040 }}
        onClick={onBackdropClick} 
      ></div>

      <div
        className="modal d-block fade show"
        style={{ zIndex: 1050 }}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </>,
    document.body 
  );
};

export default ModalPortal;