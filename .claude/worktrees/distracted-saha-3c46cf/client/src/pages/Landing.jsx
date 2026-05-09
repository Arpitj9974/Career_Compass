import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Sparkles, Map, MousePointer2, ChevronRight } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="landing-container min-h-screen relative overflow-x-hidden">

            {/* Background Texture Overlay */}
            <div className="bg-grain" />

            {/* Quiet Header - No Gradients */}
            <header className={`top-bar ${scrolled ? 'top-bar-scrolled' : ''}`}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#8B7CFF]/10 border border-[#8B7CFF]/20">
                        <Compass className="text-[#8B7CFF]" size={16} />
                    </div>
                    <span className="text-sm font-bold tracking-tight text-white/90 uppercase">Career Compass</span>
                </div>
                <button
                    onClick={() => navigate('/login')}
                    className="login-btn"
                >
                    Log In
                </button>
            </header>

            <main className="relative z-10">

                {/* ZONE 1: QUIET INTRO */}
                <section className="hero">
                    <h1 className="animate-reveal [animation-delay:100ms]">
                        Navigate your <span>future path.</span>
                    </h1>

                    <p className="animate-reveal [animation-delay:200ms]">
                        Stop jumping between random advice. Explore career paths visually
                        and understand exactly where each choice leads.
                    </p>

                    <div className="cta-group animate-reveal [animation-delay:350ms]">
                        <button
                            onClick={() => navigate('/explore')}
                            className="cta-primary"
                        >
                            Start Exploring →
                        </button>

                        <button
                            onClick={() => navigate('/saved-paths')}
                            className="cta-secondary"
                        >
                            Resume Saved Paths
                        </button>
                    </div>
                </section>

                {/* ZONE 2: CANVAS PREVIEW (Dominant) */}
                <section className="canvas-wrapper">
                    <div
                        className="canvas-frame group cursor-pointer"
                        onClick={() => navigate('/explore')}
                    >
                        {/* Overlay that fades on hover */}
                        <div className="canvas-blur-overlay">
                            <div className="canvas-badge flex items-center gap-3">
                                <MousePointer2 size={16} />
                                Click to Enter Canvas
                            </div>
                        </div>

                        {/* High-Fidelity Simulator Background */}
                        <div className="w-full h-full p-20 flex items-center justify-center gap-14 opacity-40 group-hover:opacity-60 transition-opacity duration-1000 grayscale group-hover:grayscale-0">
                            {/* Root */}
                            <div className="node-root shadow-xl">
                                Engineering & Tech <span className="expand-btn">›</span>
                            </div>

                            {/* Level 1 Generation */}
                            <div className="flex flex-col gap-6">
                                <div className="node-primary">CS & AI <span className="expand-btn">›</span></div>
                                <div className="node-primary">Robotics <span className="expand-btn">›</span></div>
                                <div className="node-primary">Web Design <span className="expand-btn">›</span></div>
                            </div>

                            {/* Decorative Lines */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                                <path d="M 180 300 C 300 300, 300 150, 420 150" className="edge" />
                                <path d="M 180 300 C 300 300, 300 300, 420 300" className="edge" />
                                <path d="M 180 300 C 300 300, 300 450, 420 450" className="edge" />
                            </svg>

                            {/* Visual Glow */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#8B7CFF]/5 blur-[150px] pointer-events-none" />
                        </div>
                    </div>
                </section>

            </main>

            {/* Minimal Footer */}
            <footer className="relative z-10 px-10 py-12 flex justify-between items-center opacity-40 border-t border-white/5 mx-10">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Built for Students by Students</span>
                <span className="text-[10px] font-medium opacity-50 uppercase tracking-widest">© 2026 CAREER COMPASS</span>
            </footer>

        </div>
    );
};

export default LandingPage;
