import React from "react";

const AnimationControls = ({ speed, setSpeed }) => {
  return (
    <div className="animation-controls">
      <h4>Animation Speed</h4>

      <div className="speed-control">
        <label>Speed: </label>
        <input
          type="range"
          min="100"
          max="2000"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="speed-slider"
        />
        <span className="speed-value">{speed}ms</span>
      </div>

      <div className="control-info">
        <small>🎯 Adjust animation speed for better visualization</small>
      </div>
    </div>
  );
};

export default AnimationControls;
