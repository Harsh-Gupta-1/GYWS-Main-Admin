import './Newsletter.css'
import Card from './Card'
import data from './newsletterData'
import HCard from '../../HeaderCard/HCard'
export default function Newsletter() {
    
    return (
        <>
            <div className="newsletter_container">
                <HCard head={"Recent Newsletters"}></HCard>
                <div className="newsletter_card_container">
                    {data.map((data, index) => (
                        <Card key={index} title={data.title} description={data.description} link={data.link} imageUrl={data.imageUrl} />
                    ))}

                </div>
            </div>
        </>
    )
}