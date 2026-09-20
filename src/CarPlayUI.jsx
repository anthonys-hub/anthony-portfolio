import CarPlayBG from './assets/CarPlayBG.jpg';
import { FaSignal } from "react-icons/fa";
import { FaBatteryThreeQuarters } from "react-icons/fa";
import { BsGithub } from "react-icons/bs";
import { FaLinkedin } from "react-icons/fa";
import { FaIdCard } from "react-icons/fa";
import { IoIosBriefcase } from "react-icons/io";
import { FaFolder } from "react-icons/fa";
import { IoIosCall } from "react-icons/io";
import { FaFileLines } from "react-icons/fa6";
import { useEffect } from 'react';
import { useState } from 'react';
import Sage from './assets/sc2.png';
import Dossier from './assets/dossier.jpeg'
import GMC from './assets/input.png'
import Spotify from './assets/dashboard.png'
import Swal from 'sweetalert2'
import Resume from './assets/Anthony Resume 2026.pdf'
import { FaSpotify } from "react-icons/fa";
import SelfiePic from './assets/SelfiePic.jpeg';




function CarPlayUI({ ref, setPanelOpen, isMobile }) {
    const [activeApp, setActiveApp] = useState('home')

    const [time, setTime] = useState(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace(/ ?[AP]M/g, '')
    );

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(
                new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace(/ ?[AP]M/g, '')
            );
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const openGitHub = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const openLinkedIn = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };


    const openSage = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const openDossier = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const openGMC = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const openSpotifyApp = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const tiles = [
        { label: 'About Me', color: 'bg-blue-500', Icon: FaIdCard, action: () => setActiveApp('About Me') },
        { label: 'Experience', color: 'bg-orange-500', Icon: IoIosBriefcase, action: () => setActiveApp('Experience') },
        { label: 'Projects', color: 'bg-indigo-600', Icon: FaFolder, action: () => setActiveApp('Projects') },
        { label: 'Contact Me', color: 'bg-green-500', Icon: IoIosCall, action: () => setActiveApp('Contact Me') },
        { label: 'GitHub', color: 'bg-zinc-800', Icon: BsGithub, action: () => openGitHub('https://github.com/anthonys-hub') },
        { label: 'LinkedIn', color: 'bg-sky-600', Icon: FaLinkedin, action: () => openLinkedIn('https://www.linkedin.com/in/anthonycolellacodes/') },
        { label: 'Resume CV', color: 'bg-red-500', Icon: FaFileLines, action: () => window.open(Resume, '_blank') },
        { label: 'Spotify', color: 'bg-black', Icon: FaSpotify, iconColor: 'text-[#1DB954]', action: () => openSpotifyApp('https://spotify-clone-jade-eight-19.vercel.app/') },
    ]

    const rowCls = isMobile ? 'flex flex-col' : 'flex flex-row justify-between'
    const cardCls = isMobile ? 'w-full max-w-sm pb-2' : 'w-100 h-80'
    const imgCls = isMobile ? 'h-50 w-full rounded-t-xl overflow-hidden object-cover' : 'h-50 w-full rounded-t-xl overflow-hidden'



    const onSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);

        formData.append("access_key", "81396016-5f06-4cda-9221-c0e996689c84");

        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        const res = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body: json
        }).then((res) => res.json());

        if (res.success) {
            Swal.fire({
                title: "Your message has been sent :)",
                text: "I will reply back to you shortly!",
                icon: "success",
                iconColor: 'Green',
                confirmButtonText: 'Keep exploring!',
                confirmButtonColor: 'Black'

            });
        }
    };




    return (
        <div>
            <div
                ref={ref}
                data-dialog="modal-xxl"
                className="fixed bg-black/60 inset-0 shadow-sm  flex items-center justify-center"
            >
                {!isMobile && activeApp === 'home' && (
                    <div className='absolute top-6 right-10'>
                        <h1 onClick={setPanelOpen} className='text-white text-5xl'>x</h1>
                    </div>
                )}

                {isMobile && (
                    <div className='relative h-full w-full overflow-y-auto'>
                        <img src={CarPlayBG} className='fixed inset-0 h-full w-full object-cover' />
                        <div className='relative'>
                            <div className='bg-[#3c8ed5] flex items-center justify-between px-5 py-3 text-white font-semibold'>
                                <span>{time}</span>
                                <span className='flex items-center gap-2'>
                                    <FaSignal /> LTE <FaBatteryThreeQuarters className='text-2xl' />
                                </span>
                            </div>
                            <div className='grid grid-cols-3 gap-6 p-6'>
                                {tiles.map(({ label, color, Icon, iconColor, action }) => (
                                    <div key={label} onClick={action} className='flex flex-col items-center'>
                                        <div className={`${color} w-20 h-20 rounded-2xl flex items-center justify-center`}>
                                            <Icon className={`w-12 h-12 ${iconColor || 'text-white'}`} />
                                        </div>
                                        <h1 className='text-white text-sm mt-1 whitespace-nowrap'>{label}</h1>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ clipPath: "path('M 90,0 L 1110,0 A 30,30 0 0 1 1132.27,28.99 L 1148.92,438.08 A 12,12 0 0 1 1140,450 L 60,450 A 12,12 0 0 1 51.08,438.08 L 67.73,28.99 A 30,30 0 0 1 90,0 Z')" }} className={`bg-zinc-800 px-15 py-10 h-112.5 w-300 ${isMobile ? 'hidden' : ''}`}>
                    <div style={{ clipPath: "path('M 60,0 L 1020,0 A 30,30 0 0 1 1042,29 L 1045.92,357.64 A 12,12 0 0 1 1036,370 L 44,370 A 12,12 0 0 1 34.08,357.64 L 38,29 A 30,30 0 0 1 60,0 Z')" }} className="h-full w-full relative">
                        <img src={CarPlayBG} className='h-full w-full object-cover ' />

                        <div className='absolute inset-0  gap-22 flex flex-row'>
                            <div className='w-27 bg-[#3c8ed5]'>
                                <h1 className='ml-13 mt-2 text-white font-semibold'>{time}</h1>
                                <div className='flex ml-12 flex-row items-center gap-2'>
                                    <FaSignal className='text-white ' />
                                    <p className='text-white font-semibold'> LTE</p>
                                </div>

                                <div>
                                    <FaBatteryThreeQuarters className='text-white ml-15 text-2xl' />
                                </div>

                                <div className='flex flex-col gap-4 items-center ml-9 mt-5'>
                                    <div className='bg-blue-500 w-12 h-12 items-center justify-center  flex rounded-md'>
                                        <FaIdCard onClick={() => setActiveApp('About Me')} className='w-10 h-10 text-white' />
                                    </div>

                                    <div className='bg-green-500 w-12 h-12 items-center justify-center flex rounded-md'>
                                        <IoIosCall onClick={() => setActiveApp('Contact Me')} className='w-10 text-white h-10' />
                                    </div>
                                    <div className='bg-red-500 w-12 h-12 items-center justify-center flex rounded-md'>
                                        <FaFileLines onClick={() => window.open(Resume, '_blank')} className='w-10 text-white h-10' />
                                    </div>
                                </div>
                            </div>

                            <div className='grid items-center justify-center flex-1 grid-cols-4 ' >
                                <div className='flex flex-col justify-center items-center w-20'>
                                    <div onClick={() => setActiveApp('About Me')} className='bg-blue-500 w-20 h-20 rounded-2xl items-center justify-center gap-10 flex flex-col'>
                                        <FaIdCard className='w-15 h-15 text-white' />
                                    </div>
                                    <h1 className='text-white'>About Me</h1>
                                </div>
                                <div className='flex flex-col justify-center items-center w-20'>
                                    <div onClick={() => setActiveApp('Experience')} className=' bg-orange-500 w-20 h-20 rounded-2xl items-center justify-center gap-10 flex flex-col'>
                                        <IoIosBriefcase className='w-15 h-15 text-white' />
                                    </div>
                                    <h1 className='text-white'>Experience</h1>
                                </div>
                                <div className='flex flex-col justify-center items-center w-20'>
                                    <div onClick={() => setActiveApp('Projects')} className='bg-indigo-600 w-20 h-20 rounded-2xl items-center justify-center gap-10 flex flex-col'>
                                        <FaFolder className='w-15 h-15 text-white' />
                                    </div>
                                    <h1 className='text-white'>Projects</h1>
                                </div>
                                <div className='flex flex-col justify-center items-center w-20'>
                                    <div onClick={() => setActiveApp('Contact Me')} className='bg-green-500 w-20 h-20 rounded-2xl items-center justify-center gap-10 flex flex-col'>
                                        <IoIosCall className='w-15 h-15 text-white' />
                                    </div>
                                    <h1 className='text-white whitespace-nowrap'>Contact Me</h1>
                                </div>
                                <div className='flex flex-col justify-center items-center w-20'>
                                    <div className='bg-zinc-800 w-20 h-20 rounded-2xl items-center justify-center gap-10 flex flex-col'>
                                        <BsGithub onClick={() => openGitHub('https://github.com/anthonys-hub')} className='text-white w-15 h-15' />
                                    </div>
                                    <h1 className='text-white'>GitHub</h1>
                                </div>
                                <div className='flex flex-col justify-center items-center w-20'>
                                    <div onClick={() => openLinkedIn('https://www.linkedin.com/in/anthonycolellacodes/')} className='bg-sky-600 w-20 h-20 rounded-2xl items-center justify-center gap-10 flex flex-col'>
                                        <FaLinkedin className='text-white w-15 h-15' />
                                    </div>
                                    <h1 className='text-white'>LinkedIn</h1>
                                </div>
                                <div className='flex flex-col justify-center items-center w-20'>
                                    <div onClick={() => window.open(Resume, '_blank')} className='bg-red-500 w-20 h-20 rounded-2xl items-center justify-center gap-10 flex flex-col'>
                                        <FaFileLines className='text-white w-15 h-15' />
                                    </div>
                                    <h1 className='text-white whitespace-nowrap'>Resume CV</h1>
                                </div>
                                <div className='flex flex-col justify-center items-center w-20'>
                                    <div className='bg-black w-20 h-20 rounded-2xl items-center justify-center gap-10 flex flex-col'>
                                        <FaSpotify onClick={() => openSpotifyApp('https://spotify-clone-jade-eight-19.vercel.app/')} className='text-[#1DB954] w-15 h-15' />
                                    </div>
                                    <h1 className='text-white'>Spotify</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {activeApp !== 'home' && (
                    <div className='fixed inset-0 bg-black/70 flex items-center justify-center'>
                        <div className={`bg-white rounded-2xl relative ${isMobile ? 'w-[92vw] h-[85vh] p-5' : activeApp === 'About Me' ? 'w-250 h-150' : 'w-328 p-8  h-150'}`}>
                            <h1
                                onClick={() => setActiveApp('home')}
                                className='absolute top-4 right-6 text-black text-3xl cursor-pointer z-10'
                            >
                                x
                            </h1>

                            <div className={isMobile ? 'h-full overflow-y-auto pt-6' : 'h-full'}>

                                {activeApp === 'About Me' && (
                                    <div className={isMobile ? 'flex flex-col items-center gap-4' : 'flex flex-row items-center gap-5 h-full'}>
                                        <img src={SelfiePic} className={isMobile ? 'w-40 h-40 rounded-full object-cover' : 'w-80 h-full object-cover rounded-l-2xl'}></img>


                                        <div className={isMobile ? 'flex flex-col w-full items-center text-center' : 'flex flex-col h-full w-full mt-15 px-8 items-center '}>
                                            <h1 className={`${isMobile ? 'text-4xl' : 'text-5xl'} font-["Instrument_Serif"] font-bold`}>Hi, I'm <span className='text-[#4d7657] italic'>Anthony </span>👋</h1>                                            <p className='text-3xl font-["Instrument_Serif"] italic font-semibold'>Connecticut, US</p>
                                            <div />

                                            <div className={isMobile ? 'flex items-center mt-4' : 'flex items-center h-full'}>
                                                <p className={`${isMobile ? 'w-full text-sm leading-relaxed' : 'w-full leading-loose'} text-[#777] font-["Courier_Prime"] monospace`}>I am a Software Engineer located in Connecticut, US. I am a final year Computer Information Systems student at Post University, graduating May 2027. Alongside working towards my degree, I am interning at Health Genie as a Software Engineer and building side projects, with a focus of React, Javascript, Python, PostgreSQL. Outside of work, I enjoy going to the gym, playing games, listening to music, and learning technical skills and new technologies. I am currently exploring opportunities where I can improve my skills and gain more experience in software development. Always happy to connect, feel free to reach out!</p>
                                            </div>
                                        </div>
                                    </div>

                                )}
                                {activeApp === 'Experience' && (
                                    <div className='flex flex-col gap-2'>
                                        <div>
                                            <h1 className='text-black text-2xl font-["Courier_Prime"]'>Education</h1>
                                            <div className="border-b-2 border-b-gray-800"></div>
                                            <div className={`${rowCls}`}>
                                                <p className='font-bold text-[20px] '>Post University</p>
                                                <p className='text-[20px]'>  Waterbury, CT</p>
                                            </div>
                                            <div className={rowCls}>
                                                <p className='italic'>Bachelor of Science, Computer Information Systems</p>
                                                <p>Aug. 2023 - May 2027</p>
                                            </div>
                                            <div>
                                                <p className='text-[20px] font-bold'>Colt Steele's Full Stack Web Development Bootcamp </p>
                                                <div className={rowCls}>
                                                    <p className='italic'>Udemy</p>
                                                    <p>Jan. 2026 - Mar. 2026</p>
                                                </div>
                                            </div>

                                        </div>
                                        <div>
                                            <h1 className='text-black text-2xl font-["Courier_Prime"]' >Work</h1>
                                            <div className="border-b-2 border-b-gray-800"></div>
                                            <div className={`${rowCls} `}>
                                                <p className='font-bold italic text-[20px]'>Software Engineer Intern</p>
                                                <p className='text-[20px]'>Remote</p>
                                            </div>
                                            <div className={rowCls}>
                                                <p className='italic font-semibold'>Health Genie LLC</p>
                                                <p>June 2026 - Present</p></div>
                                            <ul className='list-disc leading-8 ml-5'>
                                                <li> Researched food insecurity and childhood obesity trends to ground platform design in real community need                                        </li>
                                                <li>Designed the UI/UX and logo in Figma (color schematics, full prototype) to give the team a validated design direction before writing code, preventing rework</li>
                                                <li>Built the frontend in React to translate the Figma prototype into a working, responsive web app for families accessing nutrition resources</li>
                                                <li>Developed a Python-based API to power the platform’s data layer, connecting the frontend to the underlying nutrition/food-access data</li>
                                                <li>Evaluated web hosting options to determine the right deployment path for a nonprofit-facing platform, balancing cost and    reliability</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h1 className='text-black text-2xl font-["Courier_Prime"]'>Skills</h1>
                                            <div className="border-b-2 border-b-gray-800"></div>
                                            <p><span className='font-bold'>Languages:</span> Python, JavaScript, SQL, HTML, CSS
                                                <br /><span className='font-bold'>Frameworks:</span> React, Node.js, Express.js, TailwindCSS
                                                <br /><span className='font-bold'> Databases:</span> PostgreSQL
                                                <br /><span className='font-bold'> Cloud/DevOps:</span> AWS (EC2, S3, CloudFront, Security Groups), PM2, Linux CLI, Git
                                                <br /> <span className='font-bold'>Tools:</span> VS Code, PythonAnywhere, Postman, Vite, Recharts, GitHub</p>
                                        </div>

                                    </div>
                                )}

                                {activeApp === 'Projects' && (
                                    <div>
                                        <div className='justify-center flex'>
                                            <h1 className={`${isMobile ? 'text-4xl text-center' : 'text-[60px]'} font-bold font-["Instrument_Serif"]`}>Some things I've built.</h1>
                                        </div>

                                        <div className={isMobile ? 'flex flex-col mt-5 gap-6 items-center' : 'flex flex-row  mt-5 gap-8 h-full justify-center items-center'}>

                                            <div className={`${cardCls} border-gray-300 relative border rounded-xl`}>
                                                <div>
                                                    <img className={imgCls} src={Sage} alt="" />
                                                </div>
                                                <div onClick={() => openSage('https://sage-emr.vercel.app/login')} className='absolute inset-0 bg-green-800 opacity-0 hover:opacity-100 hover:scale-105 rounded-xl transition-all duration-300'>
                                                    <h1 className='text-white font-["Courier_Prime"]  h-60 p-3 w-full text-[18px]'>Full-stack EMR platform built solo to solve real scheduling and patient-tracking gaps I've seen working in healthcare. Live scheduling, patient case tracking, and role-based auth modeled on real clinic access.</h1>
                                                    <div className='p-4 flex justify-center items-center mt-5'>
                                                        <p className='text-white font-["Instrument_Serif"]  font-bold italic'>Click to view the project!</p>

                                                    </div>

                                                </div>

                                                <div className=''>
                                                    <h1 className='px-1 font-["Instrument_Serif"]  italic text-[20px] justify-center flex py-2 font-bold'>Sage EMR</h1>
                                                    <div className="border-b-2  border-b-gray-200">
                                                    </div>

                                                    <div className='mt-1'>
                                                        <p className='px-2 h-full w-full flex justify-center text-center font-["Courier_Prime"] text-gray-400'>React Node.js Express PostgreSQL JWT TailwindCSS</p>
                                                    </div>
                                                </div>

                                            </div>

                                            <div className={`${cardCls} border-gray-300 relative border rounded-xl`}>
                                                <div className='flex justify-center  font-bold'>
                                                    <img className={imgCls} src={Dossier} alt="" />
                                                    <div onClick={() => openDossier('http://dossier-frontend.s3-website-us-east-1.amazonaws.com/')} className='absolute inset-0 bg-blue-400 opacity-0 hover:opacity-100 hover:scale-105 rounded-xl transition-all duration-300'>
                                                        <h1 className='text-white font-["Courier_Prime"] h-60 p-3 w-full text-[18px]'>A full-stack tracker for job seekers to log applications, track status, and monitor progress from one dashboard. Secured with JWT auth.</h1>
                                                        <div className='p-4 flex justify-center items-center mt-5'>
                                                            <p className='text-white font-["Instrument_Serif"]  font-bold italic'>Click to view the project!</p>

                                                        </div>

                                                    </div>

                                                </div>

                                                <div className=''>
                                                    <h1 className='px-1 font-["Instrument_Serif"]  italic text-[20px] justify-center flex py-2 font-bold'>Dossier - Job Application Tracker</h1>
                                                </div>

                                                <div className="border-b-2  border-b-gray-200">
                                                </div>

                                                <div className='mt-1'>
                                                    <p className='px-2 h-full w-full flex justify-center text-center font-["Courier_Prime"] text-gray-400'>AWS React Javascript Node.js PostgreSQL TailwindCSS</p>
                                                </div>

                                            </div>


                                            <div className={`${cardCls} border-gray-300 relative border rounded-xl`}>
                                                <div className='flex justify-center  font-bold'>
                                                    <img className={imgCls} src={GMC} alt="" />
                                                </div>
                                                <div onClick={() => openGMC('https://gas-mileage-calculator-eight.vercel.app/')} className='absolute inset-0 bg-gray-400 opacity-0 hover:opacity-100 hover:scale-105 rounded-xl transition-all duration-300'>
                                                    <h1 className='text-white font-["Courier_Prime"] h-60 p-3 w-full text-[18px]'>Calculates real trip costs using live driving distance, elevation, and national fuel price data; just enter an origin, destination, and vehicle.</h1>
                                                    <div className='p-4 flex justify-center items-center mt-5'>
                                                        <p className='text-white font-["Instrument_Serif"]  font-bold italic'>Click to view the project!</p>

                                                    </div>

                                                </div>
                                                <div className=''>
                                                    <h1 className='px-1 font-["Instrument_Serif"]  italic text-[20px] justify-center flex py-2 font-bold'>Gas Mileage Calculator</h1>
                                                </div>
                                                <div className="border-b-2  border-b-gray-200">
                                                </div>

                                                <div className='mt-1'>
                                                    <p className='px-2 h-full w-full flex justify-center text-center font-["Courier_Prime"] text-gray-400'>React Javascript RestAPIs Recharts TailwindCSS</p>
                                                </div>

                                            </div>


                                            <div className={`${cardCls} border-gray-300 relative border rounded-xl`}>
                                                <div className='flex justify-center  font-bold'>
                                                    <img className={imgCls} src={Spotify} alt="" />
                                                </div>
                                                <div onClick={() => openSpotifyApp('https://spotify-clone-jade-eight-19.vercel.app/')} className='absolute inset-0 bg-[#1DB954] opacity-0 hover:opacity-100 hover:scale-105 rounded-xl transition-all duration-300'>
                                                    <h1 className='text-white font-["Courier_Prime"] h-60 p-3 w-full text-[18px]'>Replicates the core Spotify experience using the real Spotify Web API — your actual playlists, recently played, and top artists. OAuth 2.0 with PKCE</h1>
                                                    <div className='p-4 flex justify-center items-center mt-5'>
                                                        <p className='text-white font-["Instrument_Serif"]  font-bold italic'>Click to view the project!</p>

                                                    </div>

                                                </div>
                                                <div className=''>
                                                    <h1 className='px-1 font-["Instrument_Serif"]  italic text-[20px] justify-center flex py-2 font-bold'>Spotify Clone</h1>
                                                </div>

                                                <div className="border-b-2  border-b-gray-200">
                                                </div>

                                                <div className='mt-1'>
                                                    <p className='px-2 h-full w-full flex justify-center text-center font-["Courier_Prime"] text-gray-400'>React Javascript PKCE OAuth TailwindCSS</p>
                                                </div>
                                            </div>


                                        </div>

                                    </div>
                                )}


                                {activeApp === 'Contact Me' && (
                                    <div className='flex flex-col items-center justify-center'>

                                        <div className={`shadow-lg bg-gray-100 flex rounded-xl ${isMobile ? 'w-full pb-4' : 'w-150 h-130'}`}>

                                            <div className='flex h-full w-full justify-center '>


                                                <form onSubmit={onSubmit} className={isMobile ? 'w-11/12' : 'w-3/4'}>
                                                    <div className='flex justify-center '>
                                                        <h1 className={`font-["Instrument_Serif"]  italic font-bold ${isMobile ? 'text-3xl text-center py-2' : 'text-[50px]'}`}>Let's get in <span className='text-green-700'>touch</span>.</h1>
                                                    </div>


                                                    <div className='flex  flex-col'>
                                                        <label className='py-1 font-["Courier_Prime"]'>Name</label>

                                                        <input className='bg-white shadow-sm rounded-2xl focus:outline-black  px-2 h-12 border border-gray-300' type="text" name='name' required />
                                                    </div>

                                                    <div className='flex mt-2 flex-col'>
                                                        <label className='py-1 font-["Courier_Prime"]'>Email Address</label>
                                                        <input className='bg-white shadow-sm rounded-2xl focus:outline-black px-2 h-12 border border-gray-300' type="text" name='email' required />
                                                    </div>

                                                    <div className='flex mt-2 flex-col'>
                                                        <label className='py-1 font-["Courier_Prime"]'>Your Message</label>
                                                        <textarea className='bg-white resize-none focus:outline-black shadow-sm rounded-2xl px-2 py-1 h-25 border border-gray-300' type="text" name='message' required />
                                                    </div>

                                                    <div className='flex justify-center mt-5'>


                                                        <button className={`bg-black hover:cursor-pointer hover:scale-105 transition-all duration-250 ease-out hover:bg-green-700 mt-3 font-["Instrument_Serif"] italic text-white font-bold w-full rounded-2xl ${isMobile ? 'text-2xl h-14' : 'text-[40px] h-20'}`}>Send Message</button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>

                                    </div>
                                )}

                            </div>

                        </div>
                    </div>
                )
                }
            </div >
        </div >
    )
}

export default CarPlayUI