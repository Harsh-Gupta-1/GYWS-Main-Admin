import { useEffect } from 'react';
import './LightDonate.css';
import lightDonateData from './lightDonateData';
import RazorpayButton from './RazorpayButton';


export default function LightDonate() {

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "Light Donate | GYWS";

    }, [])

    return (
        <>
            <div className="light-donate-container">
                {
                    lightDonateData.map((data, index) => {
                        return (
                            <div className="light-donate-card" key={index}>
                                <div className='light-donate-card-title'>{data.title}</div>
                                <div className='light-donate-card-centre'><a href={data.link} target='_blank'  rel="noreferrer">{data.centre}</a></div>
                                <div className='light-donate-card-description'>{data.description}</div>
                                <div className="text-center pay-btn">
                                    <RazorpayButton btnLink={data.btnLink} btnId={data.btnId} index={index} />
                                </div>
                            </div>
                        )
                    }
                    )
                }
                <div className="light-donate-card">
                    <div className='light-donate-card-title'>Fundraiser for sports kit</div>
                    <div className='light-donate-card-centre'><a href='https://light.gyws.org/center_gwalior_thatipur' target='_blank'  rel="noreferrer">LiGHT Gwalior Thatipur</a></div>
                    <div className='light-donate-card-description'>
                        There are many among us who are born with some disabilities and we LiGHT GWALIOR THATIPUR is trying to make those faces happy. We are planning to provide sports kit and organise our flagship event KHELE EHSAAS. By conducting a 'Sport's day' in the campus of Gwalior's only disability school EHSAAS for these special kids.So let's donate with all our hearts and come together in our initiative. Be the part of a CHANGE with us.
                    </div>
                    <div className="text-center pay-btn">
                        <a href='https://gopali-youth-welfare-society.danamojo.org/dm/khel-ehsas-7108?utm_source=danamojo&utm_medium=share&utm_campaign=dmMicroSite' target='_blank'  rel="noreferrer"><img src="/images/donate.png" width={174} alt="" /></a>
                    </div>
                </div>
            </div>
        </>
    );
}