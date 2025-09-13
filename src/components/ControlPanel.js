import React, { useState } from "react";
import { useAppContext } from "../App";

const ControlPanel = ({ activeView }) => {
  const [inputValue, setInputValue] = useState("");
  const [operation, setOperation] = useState("insert");
  const [startNode, setStartNode] = useState("A");
  const [targetNode, setTargetNode] = useState("E");
  const { visualizerRefs } = useAppContext();

  const getOperations = () => {
    switch (activeView) {
      case "linkedlist":
        return [
          { value: "insert", label: "Insert" },
          { value: "delete", label: "Delete" },
          { value: "search", label: "Search" },
          { value: "clear", label: "Clear All" },
        ];
      case "tree":
        return [
          { value: "insert", label: "Insert" },
          { value: "delete", label: "Delete" },
          { value: "search", label: "Search" },
          { value: "inorder", label: "Inorder Traversal" },
          { value: "preorder", label: "Preorder Traversal" },
          { value: "postorder", label: "Postorder Traversal" },
        ];
      case "graph":
        return [
          { value: "addNode", label: "Add Node" },
          { value: "addEdge", label: "Add Edge" },
          { value: "dfs", label: "DFS Traversal" },
          { value: "bfs", label: "BFS Traversal" },
          { value: "reset", label: "Reset Graph" },
        ];
      case "dijkstra":
        return [
          { value: "addNode", label: "Add Node" },
          { value: "addEdge", label: "Add Weighted Edge" },
          { value: "run", label: "Run Dijkstra" },
          { value: "changeStart", label: "Change Start Node" },
          { value: "changeTarget", label: "Change Target Node" },
          { value: "reset", label: "Reset Algorithm" },
        ];
      case "sorting":
        return [
          { value: "insert", label: "Add Element" },
          { value: "generateRandom", label: "Random Data" },
        ];
      default:
        return [{ value: "insert", label: "Insert" }];
    }
  };

  const executeOperation = () => {
    console.log("Executing operation:", operation, "for view:", activeView);
    console.log("Input value:", inputValue);

    const visualizer = visualizerRefs[activeView]?.current;
    console.log("Visualizer found:", !!visualizer);

    if (!visualizer) {
      console.error("No visualizer found for", activeView);
      return;
    }

    switch (operation) {
      case "insert":
        if (activeView === "sorting") {
          // For sorting, we need a valid number
          if (inputValue && !isNaN(inputValue)) {
            const value = parseInt(inputValue);
            if (value > 0 && value <= 100) {
              console.log("Adding element to sorting:", value);
              visualizer.handleInsert(value);
            } else {
              alert("Please enter a number between 1 and 100");
            }
          } else {
            alert("Please enter a valid number");
          }
        } else if (inputValue && visualizer.handleInsert) {
          visualizer.handleInsert(parseInt(inputValue));
        }
        break;

      case "generateRandom":
        console.log("Generating random data for:", activeView);
        if (visualizer.generateRandomData) {
          visualizer.generateRandomData();
        } else {
          console.error("generateRandomData method not found on visualizer");
        }
        break;

      case "delete":
        if (inputValue && visualizer.handleDelete) {
          visualizer.handleDelete(parseInt(inputValue));
        }
        break;
      case "search":
        if (inputValue && visualizer.handleSearch) {
          visualizer.handleSearch(parseInt(inputValue));
        }
        break;
      case "clear":
        if (visualizer.handleClear) {
          visualizer.handleClear();
        }
        break;
      case "addNode":
        if (inputValue && visualizer.addNode) {
          visualizer.addNode(inputValue);
        }
        break;
      case "addEdge":
        if (inputValue && visualizer.addEdge) {
          visualizer.addEdge(inputValue);
        }
        break;
      case "dfs":
        if (visualizer.startDFS) {
          visualizer.startDFS();
        }
        break;
      case "bfs":
        if (visualizer.startBFS) {
          visualizer.startBFS();
        }
        break;
      case "run":
        if (visualizer.runDijkstra) {
          visualizer.runDijkstra(startNode);
        }
        break;
      case "changeStart":
        if (inputValue && visualizer.changeStartNode) {
          visualizer.changeStartNode(inputValue);
        }
        break;
      case "changeTarget":
        if (inputValue && visualizer.changeTargetNode) {
          visualizer.changeTargetNode(inputValue);
        }
        break;
      case "reset":
        if (visualizer.reset) {
          visualizer.reset();
        }
        break;
      case "inorder":
      case "preorder":
      case "postorder":
        if (visualizer[operation + "Traversal"]) {
          visualizer[operation + "Traversal"]();
        }
        break;
      default:
        console.log("Unknown operation:", operation);
        break;
    }

    setInputValue("");
  };

  const needsInput = [
    "insert",
    "delete",
    "search",
    "addNode",
    "addEdge",
    "changeStart",
    "changeTarget",
  ].includes(operation);

  const isDisabled = needsInput && !inputValue;

  return (
    <div className="control-panel">
      <h4>🎛️ Operations</h4>

      <div className="operation-selector">
        <label>Operation:</label>
        <select
          value={operation}
          onChange={(e) => setOperation(e.target.value)}
          className="operation-select"
        >
          {getOperations().map((op) => (
            <option key={op.value} value={op.value}>
              {op.label}
            </option>
          ))}
        </select>
      </div>

      {needsInput && (
        <div className="value-input-group">
          <label>
            {operation === "addNode"
              ? "Node ID:"
              : operation === "addEdge"
              ? activeView === "graph"
                ? "From,To:"
                : "From,To,Weight:"
              : operation === "changeStart"
              ? "Start Node:"
              : operation === "changeTarget"
              ? "Target Node:"
              : activeView === "sorting"
              ? "Number (1-100):"
              : "Value:"}
          </label>
          <input
            type={
              operation === "addEdge"
                ? "text"
                : ["addNode", "changeStart", "changeTarget"].includes(operation)
                ? "text"
                : "number"
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              operation === "addEdge"
                ? activeView === "graph"
                  ? "A,B"
                  : "A,B,5"
                : operation === "addNode"
                ? "F"
                : operation === "changeStart"
                ? "A"
                : operation === "changeTarget"
                ? "E"
                : activeView === "sorting"
                ? "e.g. 42"
                : "Enter value"
            }
            className="value-input"
          />
        </div>
      )}

      <button
        onClick={executeOperation}
        className="btn btn-primary execute-btn"
        disabled={isDisabled}
      >
        Execute {getOperations().find((op) => op.value === operation)?.label}🚀
      </button>

      <div className="quick-actions">
        <h5>Quick Actions:</h5>
        <div className="quick-buttons">
          <button
            className="btn btn-sm btn-outline"
            onClick={() => {
              console.log("Quick action: generating random data");
              const visualizer = visualizerRefs[activeView]?.current;
              if (visualizer && visualizer.generateRandomData) {
                visualizer.generateRandomData();
              } else {
                console.error("generateRandomData not available on visualizer");
              }
            }}
          >
            🎲 Random Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
