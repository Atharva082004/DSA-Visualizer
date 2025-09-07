import React from "react";

const AnalysisPanel = ({ activeView, stepMode, currentStep }) => {
  const getAnalysis = () => {
    switch (activeView) {
      case "linkedlist":
        return {
          name: "Linked List",
          timeComplexity: {
            "Insert at end": "O(n)",
            "Insert at head": "O(1)",
            "Delete by value": "O(n)",
            Search: "O(n)",
            "Access by index": "O(n)",
          },
          spaceComplexity: "O(1) auxiliary",
          description:
            "Dynamic linear data structure with nodes connected via pointers",
          useCases: ["Dynamic arrays", "Undo functionality", "Music playlists"],
          advantages: ["Dynamic size", "Efficient insertion/deletion at head"],
          disadvantages: ["No random access", "Extra memory for pointers"],
        };

      case "tree":
        return {
          name: "Binary Search Tree",
          timeComplexity: {
            Insert: "O(log n) avg, O(n) worst",
            Delete: "O(log n) avg, O(n) worst",
            Search: "O(log n) avg, O(n) worst",
            Traversal: "O(n)",
          },
          spaceComplexity: "O(log n) avg, O(n) worst",
          description:
            "Hierarchical structure with left < parent < right property",
          useCases: ["Database indexing", "Expression parsing", "File systems"],
          advantages: ["Fast search", "Ordered traversal", "Dynamic size"],
          disadvantages: ["Can become unbalanced", "Complex deletion"],
        };

      case "graph":
        return {
          name: "Graph Traversal",
          timeComplexity: {
            DFS: "O(V + E)",
            BFS: "O(V + E)",
            "Space (DFS)": "O(V)",
            "Space (BFS)": "O(V)",
          },
          spaceComplexity: "O(V) for visited array",
          description: "Systematic exploration of graph vertices and edges",
          useCases: [
            "Path finding",
            "Connected components",
            "Topological sorting",
          ],
          advantages: [
            "Complete exploration",
            "Cycle detection",
            "Component analysis",
          ],
          disadvantages: [
            "Memory intensive",
            "Not optimal for weighted graphs",
          ],
        };

      case "dijkstra":
        return {
          name: "Dijkstra's Algorithm",
          timeComplexity: {
            "Basic implementation": "O(V²)",
            "With binary heap": "O((V + E) log V)",
            "With Fibonacci heap": "O(E + V log V)",
          },
          spaceComplexity: "O(V)",
          description:
            "Finds shortest path from source to all vertices in weighted graph",
          useCases: ["GPS navigation", "Network routing", "Social networks"],
          advantages: ["Optimal solution", "Works with positive weights"],
          disadvantages: ["Cannot handle negative weights", "Memory intensive"],
        };

      default:
        return {
          name: "Select Algorithm",
          timeComplexity: {},
          spaceComplexity: "N/A",
          description: "Choose a data structure or algorithm to view analysis",
        };
    }
  };

  const analysis = getAnalysis();

  return (
    <div className="analysis-panel">
      <h3>📊 {analysis.name} Analysis</h3>

      {/* 🔥 ONLY SHOW TIME COMPLEXITY FOR DIJKSTRA */}
      {activeView === "dijkstra" && (
        <div className="complexity-section">
          <h4>⏱️ Time Complexity</h4>
          <div className="complexity-grid">
            {Object.entries(analysis.timeComplexity).map(
              ([operation, complexity]) => (
                <div key={operation} className="complexity-item">
                  <strong>{operation}:</strong>
                  <span className="complexity-value">{complexity}</span>
                </div>
              )
            )}
          </div>
        </div>
      )}

      <div className="complexity-section">
        <h4>💾 Space Complexity</h4>
        <p
          className="space-complexity"
          style={{
            paddingLeft: "10px",
            margin: "0.1rem 0",
          }}
        >
          {analysis.spaceComplexity}
        </p>
      </div>

      <div className="description-section">
        <h4>📝 Description</h4>
        <p
          style={{
            paddingLeft: "10px",
            margin: "0.1rem 0",
          }}
        >
          {analysis.description}
        </p>
      </div>

      {analysis.useCases && (
        <div className="use-cases-section">
          <h4>🎯 Use Cases</h4>
          <ul
            style={{
              listStylePosition: "inside",
              paddingLeft: "10px",
              margin: "0.5rem 0",
            }}
          >
            {analysis.useCases.map((useCase, index) => (
              <li
                key={index}
                style={{
                  paddingLeft: "0",
                  marginBottom: "0.5rem",
                  lineHeight: "1.4",
                }}
              >
                {useCase}
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.advantages && (
        <div
          className="pros-cons-section"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.5rem",
            marginTop: "1.4rem",
          }}
        >
          <div className="advantages">
            <h5>✅ Advantages</h5>
            <ul
              style={{
                listStylePosition: "inside",
                paddingLeft: "10px",
                margin: "0.75rem 0",
              }}
            >
              {analysis.advantages.map((advantage, index) => (
                <li
                  key={index}
                  style={{
                    paddingLeft: "0",
                    marginBottom: "0.5rem",
                    lineHeight: "1.4",
                  }}
                >
                  {advantage}
                </li>
              ))}
            </ul>
          </div>

          {analysis.disadvantages && (
            <div className="disadvantages">
              <h5>❌ Disadvantages</h5>
              <ul
                style={{
                  listStylePosition: "inside",
                  paddingLeft: "10px",
                  margin: "0.75rem 0",
                }}
              >
                {analysis.disadvantages.map((disadvantage, index) => (
                  <li
                    key={index}
                    style={{
                      paddingLeft: "0",
                      marginBottom: "0.5rem",
                      lineHeight: "1.4",
                    }}
                  >
                    {disadvantage}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {stepMode && (
        <div className="step-analysis">
          <h4>🔍 Step {currentStep} Analysis</h4>
          <p>Detailed step-by-step breakdown would appear here</p>
        </div>
      )}
    </div>
  );
};

export default AnalysisPanel;
