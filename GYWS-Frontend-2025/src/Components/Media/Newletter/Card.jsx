


export default function Card (props) {
    return (
        <>
            <div className="newsletter_card">
                <div className="newsletter_card_image">
                    <img src={props.imageUrl} alt="newsletter" />
                </div>
                <div className="newsletter_card_content">
                    <h2>{props.title}</h2>
                    <p>{props.description}</p> 
                    <a href={props.link} target="_blank" rel="noreferrer">Read More</a>
                </div>
            </div>
        </>
    )
}