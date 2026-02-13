import "./App.css";
import flowerImg from "/assets/flower.png";
import networking from "/assets/networking.png";
import graph from "/assets/graph.png";
import account from "/assets/account.png";
import water from "/assets/water.png";
import camera from "/assets/camera.png";
import light from "/assets/idea.png";
import plant from "/assets/plant.png";
import tea from "/assets/tea.png";
import seed from "/assets/seed.png";
import code from "/assets/code.png";
import chip from "/assets/chip.png";
import operational from "/assets/operational.png";
import ui from "/assets/ui-design.png";
import threeD from "/assets/3d.png";
import sensorImg from "/assets/sensor_img.png";
import piCamera from "/assets/picamera.png";
import housing from "/assets/housing.png";
import lighting from "/assets/lighting.png";
import harshConditions from "/assets/harsh_conditions.png";
import website from "/assets/website.mp4";
import sensorReadings from "/assets/sensor_readings.png";
import architecture from "/assets/architecture.png";
import React from "react";

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 navbar-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <img src={flowerImg} alt="HANA" className="w-6 h-6" />
            <span className="text-xl font-bold text-glass-bright">HANA 花</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-glass hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#highlights"
              className="text-glass hover:text-white transition-colors"
            >
              Highlights
            </a>
            <a
              href="#how-it-works"
              className="text-glass hover:text-white transition-colors"
            >
              How It Works
            </a>
            <a
              href="#specs"
              className="text-glass hover:text-white transition-colors"
            >
              Specifications
            </a>
            <a
              href="#team"
              className="text-glass hover:text-white transition-colors"
            >
              Team
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="min-h-screen flex items-center pt-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-4 py-2 glass-panel rounded-full text-sm font-medium mb-6 text-glass">
              Team Dream Project
            </div>
            <h1 className="title-main mb-6 leading-tight">HANA 花</h1>
            <p className="text-xl text-glass mb-2">
              Intelligent Plant Care, Powered by AI.
            </p>
            <p className="text-lg text-glass-dim mb-8 leading-relaxed">
              Precision botany powered by AI. Our advanced computer vision recognises your plant and uses real-time sensor data to adjust hydration and lighting for automated care. Engineered for performance, from a single pot to a full greenhouse, manage it all seamlessly.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#highlights"
                className="glass-btn px-6 py-3 text-glass-bright font-medium rounded-lg"
              >
                Highlights
              </a>
              <a
                href="#features"
                className="glass-btn px-6 py-3 text-glass-bright font-medium rounded-lg"
              >
                Explore Features
              </a>
              <a
                href="#specs"
                className="glass-btn px-6 py-3 text-glass font-medium rounded-lg"
              >
                View Specs
              </a>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-72 h-72 glass-panel rounded-full flex items-center justify-center animate-float">
                <img src={flowerImg} alt="HANA" className="w-32 h-32" />
              </div>
              <div className="absolute -top-4 -right-4 w-16 h-16 icon-glow rounded-full flex items-center justify-center">
                <img src={water} alt="Water" className="w-6 h-6 absolute -top+2" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-20 h-20 icon-glow rounded-full flex items-center justify-center">
                <img src={camera} alt="Camera" className="w-10 h-10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Video() {
  return (
    <section className="py-28 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-2xl p-8">
          <div className="aspect-video rounded-xl overflow-hidden">
            <iframe
              className="w-full h-full"
              src={website}
              title="HANA Demo Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function HighlightPanels() {
  const panels = [
    {
      kicker: "Effortless automation",
      title: "Hands-Off Care",
      description:
        "HANA creates a fully autonomous growing environment, intelligently identifying your plant and continuously optimising hydration and lighting. No schedules, no guesswork — just consistent, precision care.",
      image: housing,
      bullets: [
        "Fully autonomous plant management",
        "Continuous environmental optimisation",
        "No manual scheduling required",
        "Precision care powered by AI",
      ],
    },
    {
      kicker: "AI Plant Recognition",
      title: "Computer Vision Plant Identification",
      description:
        "HANA uses advanced computer vision to recognise your plant and automatically configure its core care profile. Users can then refine growth parameters, such as development stage, for precise, plant-specific optimisation.",
      image: piCamera,
      bullets: [
        "Automatic species recognition",
        "Intelligent baseline configuration",
        "User-adjustable development stages",
        "Precision care customisation",
      ],
    },
    {
      kicker: "Precision Hydration",
      title: "Smart Watering",
      description:
        "HANA continuously monitors soil moisture and delivers precisely controlled hydration using its integrated peristaltic pumping system. By incorporating ambient light sensing, the system intelligently avoids watering during dark periods, helping prevent excess moisture conditions that can promote mould growth.",
      image: sensorImg,
      bullets: [
        "Real-time moisture sensing",
        "Precision-controlled water delivery",
        "Pump capable of 100ml/min flow rate",
        "Ambient light-aware watering control",
        "Reduced mould-risk hydration strategy",
        "Quiet, low-noise operation",
        "Plant-specific watering optimisation",
      ],
    },
    {
      kicker: "Adaptive Illumination",
      title: "Smart Lighting",
      description:
        "HANA dynamically adjusts light colour and intensity based on your plant’s maturity, ensuring optimal illumination throughout each growth stage. The system guarantees a balanced 12-hour daily illumination cycle, while dedicated dark periods support natural plant recovery and overall wellbeing. When sufficient ambient brightness is detected, illumination is intelligently reduced to conserve energy.",
      image: lighting,
      bullets: [
        "Growth-stage adaptive light colour",
        "Guaranteed 12-hour daily illumination cycle",
        "Circadian-friendly light/dark balancing",
        "Dynamic intensity regulation",
        "Ambient light-aware power saving",
        "Energy-efficient illumination control",
      ],
    },
    {
      kicker: "Efficient System Intelligence",
      title: "Real-Time Monitoring",
      description:
        "HANA captures environmental sensor data at biologically optimised intervals, with the Pi polling readings every 10 minutes. This intelligent sampling strategy reduces system overhead and network traffic while maintaining precise environmental awareness.",
      image: sensorReadings,
      bullets: [
        "Biologically optimised sampling intervals",
        "Reduced network and processing overhead",
        "Continuous environmental awareness",
        "Efficient data-driven monitoring",
      ],
    },
    {
      kicker: "Graceful System Resilience",
      title: "Reliable and Robust",
      description:
        "HANA is engineered for stability, seamlessly recovering from connectivity and power interruptions. The system intelligently manages device reconnections, while onboard configuration persistence ensures uninterrupted operation after restart. Operating in autonomous daemon mode, HANA begins functioning immediately when powered — no command-line interaction or manual intervention required.",
      image: harshConditions,
      bullets: [
        "Automatic recovery from connectivity interruptions",
        "Intelligent device reconnection handling",
        "Persistent configuration memory",
        "Seamless restart and state restoration",
        "Autonomous daemon-mode operation",
        "True plug-and-play behaviour",
      ],
    },

  ];

  const scrollerRef = React.useRef(null);

  const scrollByCard = (dir = 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector("[data-card='true']");
    const step = card ? card.getBoundingClientRect().width + 32 : 600;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section id="highlights"className="py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <div className="inline-block px-4 py-2 glass-panel rounded-full text-sm font-medium mb-4 text-glass">
              Best of HANA
            </div>
            <h2 className="title-section text-3xl font-bold mb-2">
              Key Highlights
            </h2>
            <p className="text-lg text-glass max-w-2xl">
              A quick tour of the features that make HANA feel truly autonomous.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              className="glass-btn px-4 py-3 text-glass font-medium rounded-lg"
              aria-label="Scroll highlights left"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              className="glass-btn px-4 py-3 text-glass font-medium rounded-lg"
              aria-label="Scroll highlights right"
            >
              →
            </button>
          </div>
        </div>

        {/* Sliding panel scroller */}
        <div
          ref={scrollerRef}
          className="hide-scrollbar flex gap-8 overflow-x-auto py-10 snap-x snap-mandatory px-[4vw]"
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
          }}
        >
          {panels.map((p, idx) => (
            <div
              key={idx}
              data-card="true"
              className="snap-center shrink-0 w-[96%] lg:w-[86%]"
            >
              <div
                className="relative rounded-3xl overflow-hidden min-h-[82vh] sm:min-h-[86vh] lg:min-h-[88vh]"
                style={{
                  backgroundImage: `url(${p.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* dark readability overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />

                {/* content */}
                <div className="relative z-10 p-10 sm:p-14 h-full flex flex-col justify-end">
                  <div className="flex items-start justify-between gap-6 mb-6">
                    <div>
                      <div className="image-panel-text text-white/70 text-sm font-semibold mb-2">
                        {p.kicker}
                      </div>
                      <h3 className="image-panel-text text-4xl sm:text-5xl font-bold tracking-tight text-white">
                        {p.title}
                      </h3>
                    </div>
                  </div>

                  <p className="image-panel-text text-white/85 text-lg sm:text-xl leading-relaxed max-w-2xl mb-7">
                    {p.description}
                  </p>

                  <ul className="image-panel-text space-y-3 max-w-2xl">
                    {p.bullets.map((b, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-white/75 text-base sm:text-lg"
                      >
                        <span className="w-2 h-2 rounded-full bg-white/70 inline-block" />
                        {b}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-10 flex items-center justify-between">
                    <span className="text-white/60 text-xs">
                      {idx + 1} / {panels.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: flowerImg,
      title: "AI Plant Identification",
      description:
        "HANA monitors sensor data and device status in real-time, seamlessly adjusting the environment to maintain perfect conditions.",
    },
    {
      icon: light,
      title: "Adaptive Light Control",
      description:
        "HANA dynamically adjusts light colour and intensity based on plant maturity, while integrated ambient light sensing enables intelligent power-saving when sufficient room brightness is detected.",
    },
    {
      icon: water,
      title: "Smart Watering",
      description:
        "With soil moisture sensors, HANA delivers precise watering tailored to each plant's needs.",
    },
    {
      icon: networking,
      title: "Multi-Device Support",
      description:
        "Manage multiple HANA devices from one UI, designed to scale with your garden.",
    },
    {
      icon: graph,
      title: "Real-Time Monitoring",
      description:
        "HANA monitors sensor data and device status in real-time, seamlessly adjusting the environment to maintain perfect conditions.",
    },
    {
      icon: account,
      title: "Secure Design",
      description:
        "HANA is engineered with native security protocols that actively shield the device from unauthorized access, keeping your ecosystem safe and private.",
    },
    {
      icon: ui,
      title: "Intellligent UI",
      description:
        "Control your plant care with just a few clicks, and enjoy live updates of your plant's environment. Easy to use interface with a modern and intuitive design suitable for all devices. ",
    },
    {
      icon: threeD,
      title: "Sleek Aesthetic",
      description:
        "HANA's multi-tone design and hidden electronics create a sleek look guaranteed to get compliments. Style and substance in one design.",
    },
    {
      icon: operational,
      title: "Robust System",
      description:
        "HANA is built with reliability in mind. Any breaks in connectivity or power are gracefully handled with automatic recovery of your recent settings.",
    },
  ];

  return (
    <section id="features" className="py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="title-section text-3xl font-bold mb-4">
            Intelligent Features
          </h2>
          <p className="text-lg text-glass max-w-2xl mx-auto">
            AI-powered plant care that adapts to each plant's unique needs.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="glass-card rounded-xl p-6">
              <div className="w-12 h-12 icon-glow rounded-lg flex items-center justify-center mb-4">
                <img 
                  src={feature.icon} 
                  alt={feature.title} 
                  className="w-8 h-8 object-contain" 
                />
              </div>
              <h3 className="title-section text-lg mb-2">{feature.title}</h3>
              <p className="text-glass text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Setup",
      description:
        "Get your HANA device and place your plant inside. The built-in camera recognises your plant automating the environment before you even leave the room.",
      icon: seed,
    },
    {
      number: "02",
      title: "Relax",
      description:
        "Relax and let HANA do the rest. Advanced sensors regulate soil moisture and light levels, maintaining the perfect environment for your plant.",
      icon: tea,
    },
    {
      number: "03",
      title: "Thrive",
      description:
        "Enjoy a thriving indoor garden with getting scientifically perfect hydration and lighting cycles. No expertise required.",
      icon: plant,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="title-section text-3xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-lg text-glass max-w-2xl mx-auto">
            Set it up once, then let HANA handle everything. Plant care has
            never been easier.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="glass-card rounded-xl p-6 text-center">
                <div className="w-16 h-16 icon-glow rounded-full flex items-center justify-center mx-auto mb-4">
                  <img 
                    src={step.icon} 
                    alt={step.title} 
                    className="w-8 h-8 object-contain" 
                  />
                </div>
                <div className="text-glass-dim font-bold text-sm mb-2">
                  {step.number}
                </div>
                <h3 className="title-section text-lg mb-2">{step.title}</h3>
                <p className="text-glass text-sm">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 step-connector"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Specifications() {
  const specs = {
    hardware: [
      { label: "Microprocessor", value: "Raspberry Pi Zero 2" },
      {
        label: "Soil Moisture Sensor",
        value: "Capacitive Soil Moisture Sensor v1.0",
      },
      {
        label: "Water Pump",
        value: "In-House Peristaltic Pump with NEMA17 Stepper Motor",
      },
      { label: "Light Source", value: "WS2812 5050 RGB LED 8×8 Matrix Module" },
      { label: "Camera", value: "Raspberry Pi Camera v2.1 (8MP, 1080p)" },
      {
        label: "Spectrometer",
        value: "Adafruit AS7341 10-Channel Spectral Sensor",
      },
    ],
    software: [
      { label: "Firmware", value: "Python" },
      { label: "Communication", value: "I2C" },
      { label: "Protocol", value: "WebSockets" },
      { label: "Dashboard", value: "React" },
      { label: "Cloud Platform", value: "Render" },
      { label: "Data Storage", value: "CSV File" },
    ],
  };

  return (
    <section id="specs" className="py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="title-section text-3xl font-bold mb-4">
            Technical Specifications
          </h2>
          <p className="text-lg text-glass max-w-2xl mx-auto">
            Built with industry-standard components for reliability and
            performance.
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-xl p-6">
            <h3 className="title-section text-xl mb-6 flex items-center gap-3">
              <img src={chip} alt="Chip" className="w-6 h-6" /> Hardware
            </h3>
            <div className="space-y-3">
              {specs.hardware.map((spec, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-white/10"
                >
                  <span className="text-glass-dim text-sm">{spec.label}</span>
                  <span className="text-glass-bright text-sm font-medium">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card rounded-xl p-6">
            <h3 className="title-section text-xl mb-6 flex items-center gap-3">
              <img src={code} alt="Code" className="w-6 h-6" /> Software
            </h3>
            <div className="space-y-3">
              {specs.software.map((spec, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-white/10"
                >
                  <span className="text-glass-dim text-sm">{spec.label}</span>
                  <span className="text-glass-bright text-sm font-medium">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 glass-card rounded-xl p-6 flex justify-center items-center">
          <img 
            src={architecture} 
            alt="System Architecture" 
            className="w-full h-auto max-h-[500px] object-contain rounded-lg" 
          />
        </div>
      </div>
    </section>
  );
}

function Team() {
  const teamMembers = [
    { name: "Jeremy Tan", role: "Mechanical Engineer" },
    { name: "Kayvan Faghani", role: "Embedded Engineer" },
    { name: "Charlotte Gibson", role: "Machine Learning Engineer" },
  ];

  return (
    <section id="team" className="py-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="title-section text-3xl font-bold mb-4">Our Team</h2>
          <p className="text-lg text-glass max-w-2xl mx-auto">
            Imperial College London - Embedded Systems Module 2025/26
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {teamMembers.map((member, index) => (
            <div key={index} className="glass-card rounded-xl p-6 text-center">
              <h3 className="title-section text-lg">{member.name}</h3>
              <p className="text-glass-dim text-sm">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer-glass py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={flowerImg} alt="HANA" className="w-6 h-6" />
              <span className="text-xl font-bold text-glass-bright">
                HANA 花
              </span>
            </div>
            <p className="text-glass-dim text-sm">
              An AI-powered plant care system using computer vision and
              integrated sensors, developed for the Embedded Systems module at
              Imperial College London.
            </p>
          </div>
          <div>
            <h4 className="text-glass-bright font-semibold mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-glass-dim text-sm">
              <li>
                <a
                  href="#features"
                  className="hover:text-white transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-white transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a href="#specs" className="hover:text-white transition-colors">
                  Specifications
                </a>
              </li>
              <li>
                <a href="#team" className="hover:text-white transition-colors">
                  Team
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-glass-bright font-semibold mb-4">
              Project Resources
            </h4>
            <ul className="space-y-2 text-glass-dim text-sm">
              <li>
                <a
                  href="https://github.com/kayvan-faghani/EmbeddedPiCode"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Backend & Hardware Code
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/C-Gibson20/Embedded-Systems-UI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Frontend UI Repository
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-12 pt-8 text-center text-glass-dim text-sm">
          <p>
            &copy; 2025 HANA 花. Imperial College London - Embedded Systems
            Project.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="min-h-screen relative">
      <div
        className="bg-overlay"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1920&q=80')`,
        }}
      />
      <Navbar />
      <Hero />
      <Video />
      <HighlightPanels />
      <Features />
      <HowItWorks />
      <Specifications />
      <Team />
      <Footer />
    </div>
  );
}
