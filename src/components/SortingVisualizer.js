import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import MergeSortVisualizer from "./MergeSortVisualizer";
import QuickSortVisualizer from "./QuickSortVisualizer";
import InsertionSortVisualizer from "./InsertionSortVisualizer";

const SortingVisualizer = forwardRef(({ animationSpeed }, ref) => {
  const [activeSort, setActiveSort] = useState("merge");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const visualizerRefs = {
    merge: useRef(),
    quick: useRef(),
    insertion: useRef(),
  };

  const sortingOptions = [
    { id: "merge", label: "Merge Sort", icon: "🔀" },
    { id: "quick", label: "Quick Sort", icon: "⚡" },
    { id: "insertion", label: "Insertion Sort", icon: "📝" },
  ];

  // 🔥 KEY FIX: Expose methods to parent ControlPanel
  useImperativeHandle(ref, () => ({
    handleInsert: (value) => {
      const currentVisualizer = visualizerRefs[activeSort]?.current;
      if (currentVisualizer && currentVisualizer.handleInsert) {
        currentVisualizer.handleInsert(value);
      }
    },

    generateRandomData: () => {
      const currentVisualizer = visualizerRefs[activeSort]?.current;
      if (currentVisualizer && currentVisualizer.generateRandomData) {
        currentVisualizer.generateRandomData();
      }
    },
  }));

  const renderActiveVisualizer = () => {
    const commonProps = {
      animationSpeed,
      ref: visualizerRefs[activeSort],
    };

    switch (activeSort) {
      case "merge":
        return <MergeSortVisualizer {...commonProps} />;
      case "quick":
        return <QuickSortVisualizer {...commonProps} />;
      case "insertion":
        return <InsertionSortVisualizer {...commonProps} />;
      default:
        return <MergeSortVisualizer {...commonProps} />;
    }
  };

  const handleSortChange = (sortType) => {
    setActiveSort(sortType);
    setDropdownOpen(false);
  };

  return (
    <div className="sorting-visualizer">
      <div className="sorting-header">
        <div className="sorting-selector">
          <div className="dropdown">
            <button
              className="dropdown-toggle"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {sortingOptions.find((opt) => opt.id === activeSort)?.icon}{" "}
              {sortingOptions.find((opt) => opt.id === activeSort)?.label}
              <span className={`dropdown-arrow ${dropdownOpen ? "open" : ""}`}>
                ▼
              </span>
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu">
                {sortingOptions.map((option) => (
                  <button
                    key={option.id}
                    className={`dropdown-item ${
                      activeSort === option.id ? "active" : ""
                    }`}
                    onClick={() => handleSortChange(option.id)}
                  >
                    {option.icon} {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="sorting-controls">
          <button
            className="btn btn-primary"
            onClick={() => {
              const currentVisualizer = visualizerRefs[activeSort]?.current;
              if (currentVisualizer && currentVisualizer.startSort) {
                currentVisualizer.startSort();
              }
            }}
          >
            🚀 Start Sort
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              const currentVisualizer = visualizerRefs[activeSort]?.current;
              if (currentVisualizer && currentVisualizer.reset) {
                currentVisualizer.reset();
              }
            }}
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {renderActiveVisualizer()}
    </div>
  );
});

export default SortingVisualizer;
