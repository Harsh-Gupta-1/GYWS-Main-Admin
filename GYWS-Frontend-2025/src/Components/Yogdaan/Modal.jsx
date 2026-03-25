import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router';

const Modal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
  if (!isOpen) return null;
  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center mt-10">
      <div className="bg-white rounded-lg shadow-lg w-full lg:w-1/2 p-6 relative">
        <button 
          className="relative left-2 text-gray-600 text-2xl font-semibold z-50 hover:text-gray-900 hover:bg-gray-100 p-2 py-0 rounded-lg" 
          onClick={onClose}
        >
          x {  }
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Yogdaan 2025</h2>
          <img 
            src="/images/Yogdaan1.png" 
            alt="Sample" 
            className="w-full h-full object-cover rounded-md mb-4"
          />
          <button 
            className="bg-blue-500 text-white py-2 w-full px-4 rounded-md hover:bg-blue-600"
            onClick={() => navigate('/yogdaan')}
          >
            More
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const ModalApp = () => {
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // Open modal when the page is reloaded
    setModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">My React App</h1>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default ModalApp;
