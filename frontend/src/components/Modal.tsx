import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import './Modal.css'; // Optional: Add your styles here

// Define the props type for the Modal component
interface ModalProps {
    isOpen: boolean; // Whether the modal is open
    onClose: () => void; // Function to close the modal
    children: React.ReactNode; // Content to be displayed inside the modal
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    useEffect(() => {
        // Check if modal-root exists
        const modalRoot = document.getElementById('modal-root');
        if (!modalRoot) {
            console.error("Modal root does not exist");
        }
    }, []);

    if (!isOpen) return null; // Don't render anything if not open

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>
                    <img src="/icon/return.png" style={{width:'30px', height:'20px'}} />
                </button>
                {children}
            </div>
        </div>,
        document.getElementById('modal-root') as HTMLElement // Ensure this ID matches your HTML
    );
};

export default Modal;