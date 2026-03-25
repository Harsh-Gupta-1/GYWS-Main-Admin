import "./Modal.css";

const DashBoardModal = (props) => {
    const notCloseModal = (e) => {
        e.stopPropagation();
    };

    return (
        <>
            <div
                className="dashboard-modal"
                onClick={props.modalToggleFunction}
            >
                <div className="dashboard-modal-box" onClick={notCloseModal}>
                    <svg
                        className="dashboard-modal-box__close"
                        style={{ color: "white", cursor: "pointer" }}
                        onClick={props.modalToggleFunction} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">
                        <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                    </svg>
                    <div className="dashboard-modal-box__content">
                        {props.children}
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashBoardModal;