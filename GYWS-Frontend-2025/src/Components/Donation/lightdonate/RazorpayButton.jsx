import React, { useEffect } from 'react';

function RazorpayButton({ btnLink, btnId, index }) {
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const form = document.getElementsByClassName('formId');
            const script = document.createElement("script");

            script.src = btnLink;
            script.setAttribute("data-payment_button_id", btnId);
            script.async = true;

            form[index].appendChild(script);

            return () => {
                form[index].removeChild(script);
            };
        }, 1);

        return () => clearTimeout(timeoutId);
    }, [btnLink, btnId, index]);

    return (
        <form className='formId'>
        </form>
    );
}

export default RazorpayButton;
