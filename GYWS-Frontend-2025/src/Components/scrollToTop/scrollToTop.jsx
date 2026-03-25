import { ArrowUp } from 'react-bootstrap-icons';
import './scrollToTop.css'

export default function ScrollToTop() {
    // Hide the button when the page is at the top
    window.onscroll = function () { scrollFunction() };

    // Hide the button when the page loads

    const scrollToTop = () => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    };


    function scrollFunction() {

        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            document.querySelector(".scroll_btn").style.display = "block";
        } else {
            document.querySelector(".scroll_btn").style.display = "none";
        }
    }

    return (
        <div className="scroll_btn" onClick={() => scrollToTop()}>
            <div className="scroll_button">
                <ArrowUp />
            </div>
        </div>
    )
}
