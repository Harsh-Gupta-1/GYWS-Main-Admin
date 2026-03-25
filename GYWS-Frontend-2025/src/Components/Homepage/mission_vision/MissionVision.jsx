import cssfile from './missionvision.module.css';
import missionlogo from './images/mission.png';
import visionlogo from './images/vision.png';


export default function MissionVision() {
    return (
        <>
            <div className={cssfile.container}>
                <div className={cssfile.box1} id={cssfile.missionlogo}>
                    <img src={missionlogo} alt="" />
                </div>
                <div className={cssfile.box2}>
                    <h2 className={cssfile.heading}>MISSION </h2>
                    <div id={cssfile.mission}>
                        <p>We exist to improve the social and economic condition in and around Kharagpur and inspire and guide the youth to replicate our learnings across the nation.</p>
                    </div>
                </div>
                <div className={cssfile.box3}>
                    <h2 className={cssfile.heading}>VISION </h2>
                    <div id={cssfile.vision}>
                        <p>We aim to develop an ecosystem for the youth to provide them with skills, resources, and motivation to achieve sustainable development goals.</p>
                    </div>
                </div >
                <div className={cssfile.box4} id={cssfile.visionlogo}>
                    <img src={visionlogo} alt="" />
                </div>
            </div >
        </>
    )
}

