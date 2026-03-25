
import Timeline from '../../Components/aboutUs/timeline/Timeline';
import Accordion from '../../Components/aboutUs/accordion/Accordion';
import HowWeStarted from '../../Components/aboutUs/HowWeStarted/howWeStarted';
import Foundersmsg from '../../Components/aboutUs/FounderMessage/Foundersmsg';
import { useEffect } from 'react';

export default function About() {

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "About Us | GYWS";

    }, [])

    return (
        <>
            <HowWeStarted />
            <Timeline />
            <Foundersmsg />
            
            <Accordion />
        </>
    );
};