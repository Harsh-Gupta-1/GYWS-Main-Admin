import React, { useState } from 'react';

const DonateModal = (props) => {
    const [showModal, setShowModal] = useState(false);
    const handleClose = () => setShowModal(false);
    const handleShow = () => setShowModal(true);


    return (
        <div className=''>
            <button onClick={handleShow} className='bg-red-800 text-white py-2 px-3 sm:px-6 rounded-md shadow-lg z-10 hover:opacity-95 disabled:opacity-80'>Submit Quiz</button>
            {showModal && (
                <div className="font-sans fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
                    <div className="absolute w-full h-full bg-gray-900 opacity-50" onClick={handleClose}></div>
                    <div className="bg-white rounded-lg z-50">
                        <div className="flex justify-between items-center border-b p-3">
                            <h3 className="text-xl font-semibold">Submit Quiz?</h3>
                            <button className="text-gray-500 hover:text-gray-700" onClick={handleClose}>
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5.293 6.707a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414L11.414 12l3.293 3.293a1 1 0 01-1.414 1.414L10 13.414l-3.293 3.293a1 1 0 01-1.414-1.414L8.586 12 5.293 8.707a1 1 0 010-1.414z" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-3">
                            {props.children}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DonateModal