import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";

const DijkstraVisualizer = forwardRef(({ animationSpeed }, ref) => {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([
    { id: "A", x: 120, y: 120, distance: 0, visited: false, previous: null },
    {
      id: "B",
      x: 320,
      y: 120,
      distance: Infinity,
      visited: false,
      previous: null,
    },
    {
      id: "C",
      x: 520,
      y: 120,
      distance: Infinity,
      visited: false,
      previous: null,
    },
    {
      id: "D",
      x: 220,
      y: 280,
      distance: Infinity,
      visited: false,
      previous: null,
    },
    {
      id: "E",
      x: 420,
      y: 280,
      distance: Infinity,
      visited: false,
      previous: null,
    },
  ]);

  const [edges, setEdges] = useState([
    { from: "A", to: "B", weight: 4, active: false },
    { from: "A", to: "D", weight: 2, active: false },
    { from: "B", to: "C", weight: 3, active: false },
    { from: "B", to: "D", weight: 1, active: false },
    { from: "B", to: "E", weight: 7, active: false },
    { from: "C", to: "E", weight: 2, active: false },
    { from: "D", to: "E", weight: 5, active: false },
  ]);

  const [currentNode, setCurrentNode] = useState(null);
  const [startNode, setStartNode] = useState("A");
  const [targetNode, setTargetNode] = useState("E");
  const [isRunning, setIsRunning] = useState(false);
  const [shortestPath, setShortestPath] = useState([]);
  const [pathFound, setPathFound] = useState(false);
  const [pathSequence, setPathSequence] = useState("");

  // 🔥 KEY FIX: Use refs to always access latest state values
  const startNodeRef = useRef(startNode);
  const targetNodeRef = useRef(targetNode);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);

  // Keep refs updated with latest state values
  useEffect(() => {
    startNodeRef.current = startNode;
  }, [startNode]);

  useEffect(() => {
    targetNodeRef.current = targetNode;
  }, [targetNode]);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  // Auto-reset when start or target changes
  useEffect(() => {
    resetAlgorithmToNewStart();
  }, [startNode, targetNode]);

  const resetAlgorithmToNewStart = useCallback(() => {
    const currentStartNode = startNodeRef.current;
    setNodes((prevNodes) =>
      prevNodes.map((node) => ({
        ...node,
        distance: node.id === currentStartNode ? 0 : Infinity,
        visited: false,
        previous: null,
      }))
    );
    setCurrentNode(null);
    setIsRunning(false);
    setShortestPath([]);
    setPathFound(false);
    setPathSequence("");
    setEdges((prev) => prev.map((edge) => ({ ...edge, active: false })));
  }, []);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    addNode: (nodeId) => {
      if (!nodeId || nodeId.length === 0) {
        alert("Please enter a valid node ID");
        return;
      }

      const upperNodeId = nodeId.toUpperCase();
      if (nodesRef.current.find((n) => n.id === upperNodeId)) {
        alert(`Node ${upperNodeId} already exists!`);
        return;
      }

      let x, y;
      let attempts = 0;
      do {
        x = 120 + Math.random() * 400;
        y = 120 + Math.random() * 200;
        attempts++;
      } while (
        attempts < 30 &&
        nodesRef.current.some(
          (node) => Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2) < 90
        )
      );

      const currentStartNode = startNodeRef.current;
      const newNode = {
        id: upperNodeId,
        x: x,
        y: y,
        distance: upperNodeId === currentStartNode ? 0 : Infinity,
        visited: false,
        previous: null,
      };
      setNodes((prev) => [...prev, newNode]);
      alert(`Node ${upperNodeId} added successfully!`);
    },

    addEdge: (edgeString) => {
      if (!edgeString || edgeString.trim().length === 0) {
        alert("Please enter edge in format: A,B,5");
        return;
      }

      const parts = edgeString.split(",");
      if (parts.length !== 3) {
        alert("Edge format: From,To,Weight (e.g., A,B,5)");
        return;
      }

      const [from, to, weight] = parts.map((s) => s.trim());
      const weightNum = parseInt(weight);

      if (isNaN(weightNum) || weightNum <= 0) {
        alert("Weight must be a positive number");
        return;
      }

      const fromUpper = from.toUpperCase();
      const toUpper = to.toUpperCase();

      if (fromUpper === toUpper) {
        alert("Cannot create self-loop edge");
        return;
      }

      if (!nodesRef.current.find((n) => n.id === fromUpper)) {
        alert(`Node ${fromUpper} does not exist`);
        return;
      }

      if (!nodesRef.current.find((n) => n.id === toUpper)) {
        alert(`Node ${toUpper} does not exist`);
        return;
      }

      if (
        edgesRef.current.find(
          (e) =>
            (e.from === fromUpper && e.to === toUpper) ||
            (e.from === toUpper && e.to === fromUpper)
        )
      ) {
        alert("Edge already exists");
        return;
      }

      setEdges((prev) => [
        ...prev,
        { from: fromUpper, to: toUpper, weight: weightNum, active: false },
      ]);
      alert(
        `Edge ${fromUpper}-${toUpper} with weight ${weightNum} added successfully!`
      );
    },

    // 🔥 KEY FIX: Always use current ref values
    runDijkstra: () => {
      if (!isRunning && nodesRef.current.length > 0) {
        const currentStartNode = startNodeRef.current;
        const currentTargetNode = targetNodeRef.current;

        console.log(
          `🚀 Running Dijkstra from ${currentStartNode} to ${currentTargetNode}`
        );

        const startExists = nodesRef.current.find(
          (n) => n.id === currentStartNode
        );
        const targetExists = nodesRef.current.find(
          (n) => n.id === currentTargetNode
        );

        if (!startExists) {
          alert(`Start node ${currentStartNode} does not exist`);
          return;
        }

        if (!targetExists) {
          alert(`Target node ${currentTargetNode} does not exist`);
          return;
        }

        dijkstraAlgorithm();
      }
    },

    changeStartNode: (nodeId) => {
      const upperNodeId = nodeId.toUpperCase();
      const node = nodesRef.current.find((n) => n.id === upperNodeId);
      if (node) {
        setStartNode(upperNodeId);
        alert(`Start node changed to ${upperNodeId}`);
      } else {
        alert("Node does not exist");
      }
    },

    changeTargetNode: (nodeId) => {
      const upperNodeId = nodeId.toUpperCase();
      const node = nodesRef.current.find((n) => n.id === upperNodeId);
      if (node) {
        setTargetNode(upperNodeId);
        alert(`Target node changed to ${upperNodeId}`);
      } else {
        alert("Node does not exist");
      }
    },

    reset: () => {
      resetAlgorithmToNewStart();
    },

    generateRandomData: () => {
      const nodeCount = 5 + Math.floor(Math.random() * 4);
      const nodeIds = "ABCDEFGHIJ".split("").slice(0, nodeCount);

      const randomNodes = nodeIds.map((id, index) => {
        const angle = (index / nodeCount) * 2 * Math.PI;
        const radius = 150;
        const centerX = 350;
        const centerY = 200;

        return {
          id,
          x: centerX + radius * Math.cos(angle) + Math.random() * 40 - 20,
          y: centerY + radius * Math.sin(angle) + Math.random() * 40 - 20,
          distance: Infinity,
          visited: false,
          previous: null,
        };
      });

      const randomEdges = [];

      for (let i = 1; i < randomNodes.length; i++) {
        const fromIndex = Math.floor(Math.random() * i);
        const weight = Math.floor(Math.random() * 9) + 1;
        randomEdges.push({
          from: randomNodes[fromIndex].id,
          to: randomNodes[i].id,
          weight: weight,
          active: false,
        });
      }

      const additionalEdges = Math.floor(Math.random() * 4) + 2;
      for (let i = 0; i < additionalEdges; i++) {
        const from =
          randomNodes[Math.floor(Math.random() * randomNodes.length)];
        const to = randomNodes[Math.floor(Math.random() * randomNodes.length)];

        if (
          from.id !== to.id &&
          !randomEdges.find(
            (e) =>
              (e.from === from.id && e.to === to.id) ||
              (e.from === to.id && e.to === from.id)
          )
        ) {
          const weight = Math.floor(Math.random() * 9) + 1;
          randomEdges.push({
            from: from.id,
            to: to.id,
            weight: weight,
            active: false,
          });
        }
      }

      setNodes(randomNodes);
      setEdges(randomEdges);
      const newStart = randomNodes.id;
      const newTarget = randomNodes[randomNodes.length - 1].id;
      setStartNode(newStart);
      setTargetNode(newTarget);
    },
  }));

  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    edges.forEach((edge) => {
      const fromNode = nodes.find((n) => n.id === edge.from);
      const toNode = nodes.find((n) => n.id === edge.to);

      if (fromNode && toNode) {
        const isShortestPath = shortestPath.some(
          (pathEdge) =>
            (pathEdge.from === edge.from && pathEdge.to === edge.to) ||
            (pathEdge.from === edge.to && pathEdge.to === edge.from)
        );

        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);

        if (isShortestPath) {
          ctx.strokeStyle = "#f39c12";
          ctx.lineWidth = 6;
        } else if (edge.active) {
          ctx.strokeStyle = "#e74c3c";
          ctx.lineWidth = 4;
        } else {
          ctx.strokeStyle = "#95a5a6";
          ctx.lineWidth = 2;
        }
        ctx.stroke();

        // Draw weight
        const midX = (fromNode.x + toNode.x) / 2;
        const midY = (fromNode.y + toNode.y) / 2;

        ctx.fillStyle = "#fff";
        ctx.fillRect(midX - 15, midY - 12, 30, 24);
        ctx.strokeStyle = "#2c3e50";
        ctx.lineWidth = 1;
        ctx.strokeRect(midX - 15, midY - 12, 30, 24);

        ctx.fillStyle = "#2c3e50";
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(edge.weight, midX, midY + 4);
      }
    });

    // Draw nodes
    nodes.forEach((node) => {
      const radius = 30;
      let fillColor = "#3498db";

      if (node.id === startNode) {
        fillColor = "#27ae60";
      } else if (node.id === targetNode) {
        fillColor = "#e74c3c";
      } else if (node.visited) {
        fillColor = "#95a5a6";
      } else if (node.id === currentNode) {
        fillColor = "#f39c12";
      }

      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.fill();

      ctx.strokeStyle = "#2c3e50";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw node label
      ctx.fillStyle = "white";
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.id, node.x, node.y - 5);

      // Draw distance
      ctx.fillStyle = "white";
      ctx.font = "bold 11px Arial";
      const distanceText =
        node.distance === Infinity ? "∞" : node.distance.toString();
      ctx.fillText(distanceText, node.x, node.y + 10);
    });
  }, [nodes, edges, currentNode, startNode, targetNode, shortestPath]);

  useEffect(() => {
    drawGraph();
  }, [drawGraph]);

  // 🔥 KEY FIX: Always use ref values for latest state
  const dijkstraAlgorithm = async () => {
    const algorithmStartNode = startNodeRef.current;
    const algorithmTargetNode = targetNodeRef.current;
    const algorithmNodes = [...nodesRef.current];
    const algorithmEdges = [...edgesRef.current];

    console.log(
      `🚀 Algorithm starting from ${algorithmStartNode} to ${algorithmTargetNode}`
    );

    setIsRunning(true);
    setShortestPath([]);
    setPathFound(false);
    setPathSequence("");

    // Initialize distances with correct start node
    const workingNodes = algorithmNodes.map((node) => ({
      ...node,
      distance: node.id === algorithmStartNode ? 0 : Infinity,
      visited: false,
      previous: null,
    }));

    setNodes(workingNodes);

    const unvisited = [...workingNodes];

    while (unvisited.length > 0) {
      const currentNodeObj = unvisited.reduce((min, node) =>
        node.distance < min.distance ? node : min
      );

      if (currentNodeObj.distance === Infinity) break;

      setCurrentNode(currentNodeObj.id);
      await new Promise((resolve) => setTimeout(resolve, animationSpeed));

      currentNodeObj.visited = true;
      const index = unvisited.findIndex((n) => n.id === currentNodeObj.id);
      unvisited.splice(index, 1);

      const neighborEdges = algorithmEdges.filter(
        (edge) =>
          edge.from === currentNodeObj.id || edge.to === currentNodeObj.id
      );

      for (const edge of neighborEdges) {
        const neighborId =
          edge.from === currentNodeObj.id ? edge.to : edge.from;
        const neighbor = unvisited.find((n) => n.id === neighborId);

        if (neighbor) {
          const newDistance = currentNodeObj.distance + edge.weight;

          if (newDistance < neighbor.distance) {
            neighbor.distance = newDistance;
            neighbor.previous = currentNodeObj.id;

            setEdges((prev) =>
              prev.map((e) => ({
                ...e,
                active: e === edge,
              }))
            );

            await new Promise((resolve) =>
              setTimeout(resolve, animationSpeed / 2)
            );
          }
        }
      }

      setNodes([...workingNodes]);
      setEdges((prev) => prev.map((e) => ({ ...e, active: false })));
    }

    setCurrentNode(null);
    setIsRunning(false);

    buildShortestPath(workingNodes, algorithmStartNode, algorithmTargetNode);
  };

  const buildShortestPath = (
    finalNodes,
    algorithmStartNode,
    algorithmTargetNode
  ) => {
    const pathNodes = [];
    const pathEdges = [];
    let current = algorithmTargetNode;

    while (current) {
      const currentNode = finalNodes.find((n) => n.id === current);
      if (!currentNode) break;

      pathNodes.push(current);

      if (currentNode.previous) {
        pathEdges.push({
          from: currentNode.previous,
          to: current,
        });
        current = currentNode.previous;
      } else {
        break;
      }
    }

    pathNodes.reverse();
    pathEdges.reverse();

    setShortestPath(pathEdges);

    const correctPathSequence = pathNodes.join(" → ");
    setPathSequence(correctPathSequence);

    if (pathEdges.length > 0) {
      const targetNodeObj = finalNodes.find(
        (n) => n.id === algorithmTargetNode
      );
      const distance = targetNodeObj ? targetNodeObj.distance : Infinity;

      setTimeout(() => {
        alert(
          `Shortest path found!\nFrom: ${algorithmStartNode} To: ${algorithmTargetNode}\nPath: ${correctPathSequence}\nTotal Distance: ${
            distance === Infinity ? "No path" : distance
          }`
        );
      }, 500);
      setPathFound(true);
    } else {
      setTimeout(() => {
        alert(
          `No path exists from ${algorithmStartNode} to ${algorithmTargetNode}`
        );
      }, 500);
    }
  };

  return (
    <div className="visualizer">
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={700}
          height={400}
          className="visualization-canvas"
        />
      </div>

      <div className="dijkstra-info">
        <div className="info-grid">
          <div className="info-item">
            <strong>Start:</strong>{" "}
            <span style={{ color: "#27ae60", fontWeight: "bold" }}>
              {startNode}
            </span>
          </div>
          <div className="info-item">
            <strong>Target:</strong>{" "}
            <span style={{ color: "#e74c3c", fontWeight: "bold" }}>
              {targetNode}
            </span>
          </div>
          <div className="info-item">
            <strong>Current:</strong> {currentNode || "None"}
          </div>
          <div className="info-item">
            <strong>Status:</strong>{" "}
            {isRunning
              ? "🔄 Running..."
              : pathFound
              ? "✅ Path Found"
              : "⏸️ Ready"}
          </div>
        </div>

        {pathSequence && (
          <div className="path-info">
            <h5>🎯 Shortest Path Found:</h5>
            <p
              className="path-display"
              style={{
                background: "#f39c12",
                color: "white",
                padding: "0.5rem",
                borderRadius: "4px",
                fontWeight: "bold",
              }}
            >
              {pathSequence}
            </p>
            <p>
              <strong>Total Distance:</strong>{" "}
              {nodes.find((n) => n.id === targetNode)?.distance || "N/A"}
            </p>
          </div>
        )}

        <div className="legend">
          <h5>Legend:</h5>
          <div className="legend-items">
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: "#27ae60" }}
              ></div>
              <span>Start Node</span>
            </div>
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: "#e74c3c" }}
              ></div>
              <span>Target Node</span>
            </div>
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: "#f39c12" }}
              ></div>
              <span>Current/Path</span>
            </div>
            <div className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: "#95a5a6" }}
              ></div>
              <span>Visited</span>
            </div>
          </div>
        </div>
      </div>

      <div className="complexity-info">
        <h4>Dijkstra's Algorithm</h4>
        <div className="complexity-grid">
          <div className="complexity-item">
            <strong>Time:</strong>{" "}
            <span className="complexity-value">O(V² + E)</span>
          </div>
          <div className="complexity-item">
            <strong>Space:</strong>{" "}
            <span className="complexity-value">O(V)</span>
          </div>
          <div className="complexity-item">
            <strong>Type:</strong>{" "}
            <span className="complexity-value">Greedy</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default DijkstraVisualizer;
