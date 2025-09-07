import React, { useState, useRef, createContext, useContext } from "react";
import LinkedListVisualizer from "./components/LinkedListVisualizer";
import TreeVisualizer from "./components/TreeVisualizer";
import GraphVisualizer from "./components/GraphVisualizer";
import DijkstraVisualizer from "./components/DijkstraVisualizer";
import ControlPanel from "./components/ControlPanel";
import AnimationControls from "./components/AnimationControls";
import AnalysisPanel from "./components/AnalysisPanel";
import GithubButton from "./components/GithubButtons";
import GlitchText from "./styles/GlitchText";
import "./styles/App.css";

// Context for global state management
const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

function App() {
  const [activeView, setActiveView] = useState("linkedlist");
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepMode, setStepMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  // Refs to communicate with visualizers
  const visualizerRefs = {
    linkedlist: useRef(),
    tree: useRef(),
    graph: useRef(),
    dijkstra: useRef(),
  };

  const tabs = [
    { id: "linkedlist", label: "Linked List", icon: "🔗" },
    { id: "tree", label: "Binary Tree", icon: "🌳" },
    { id: "graph", label: "Graph", icon: "🕸️" },
    { id: "dijkstra", label: "Dijkstra", icon: "🎯" },
  ];

  const contextValue = {
    activeView,
    animationSpeed,
    isPlaying,
    setIsPlaying,
    stepMode,
    setStepMode,
    currentStep,
    setCurrentStep,
    darkMode,
    visualizerRefs,
  };

  const renderVisualizer = () => {
    const commonProps = {
      ref: visualizerRefs[activeView],
      animationSpeed,
      isPlaying,
      setIsPlaying,
      stepMode,
      currentStep,
      setCurrentStep,
    };

    switch (activeView) {
      case "linkedlist":
        return <LinkedListVisualizer {...commonProps} />;
      case "tree":
        return <TreeVisualizer {...commonProps} />;
      case "graph":
        return <GraphVisualizer {...commonProps} />;
      case "dijkstra":
        return <DijkstraVisualizer {...commonProps} />;
      default:
        return <LinkedListVisualizer {...commonProps} />;
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className={`app ${darkMode ? "dark-mode" : ""}`}>
        <header className="app-header">
          <div className="header-content">
            <div className="title-section">
              <GlitchText
                speed={2}
                enableShadows={true}
                enableOnHover={true}
                className="custom-class"
              >
                Advanced DSA Visualizer
              </GlitchText>
              <p className="subtitle">
                Interactive Data Structures & Algorithms Learning Platform
              </p>
            </div>
            <nav className="nav-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`nav-tab ${activeView === tab.id ? "active" : ""}`}
                  onClick={() => setActiveView(tab.id)}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  <span className="tab-label">{tab.label}</span>
                </button>
              ))}
            </nav>
            <div className="header-actions">
              <GithubButton darkMode={darkMode} />
              <button
                className="dark-mode-toggle"
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
              >
                {darkMode ? "☀️" : "🌙"}
              </button>
            </div>
          </div>
        </header>

        <div className="main-content">
          <div className="visualizer-section">
            <div className="visualizer-header">
              <h2>{tabs.find((tab) => tab.id === activeView)?.label}</h2>
            </div>

            {renderVisualizer()}
          </div>

          <div className="control-section">
            <AnimationControls
              speed={animationSpeed}
              setSpeed={setAnimationSpeed}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              stepMode={stepMode}
              setStepMode={setStepMode}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
            />

            <ControlPanel activeView={activeView} />

            <AnalysisPanel
              activeView={activeView}
              stepMode={stepMode}
              currentStep={currentStep}
            />
          </div>
        </div>

        <footer className="app-footer">
          <div className="footer-content">
            <p>Built with ❤️ By Atharva © 2025 DSA Visualizer</p>
            <div className="footer-links">
              <GithubButton darkMode={darkMode} />
              <span className="separator">•</span>
              <a
                href="mailto:atharvalandge2004@gmail.com"
                className="footer-link"
                aria-label="Contact Email"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill={darkMode ? "#ffffff" : "#EA4335"}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.887.732-1.636 1.636-1.636a1.636 1.636 0 0 1 .732.173L12 9.544l9.632-5.55a1.636 1.636 0 0 1 .732-.173c.904 0 1.636.749 1.636 1.636z" />
                </svg>
              </a>
              <span className="separator">•</span>
              <a
                href="https://www.linkedin.com/in/atharval2004"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
                aria-label="LinkedIn Profile"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill={darkMode ? "#ffffff" : "#0077b5"}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </AppContext.Provider>
  );
}

export default App;
