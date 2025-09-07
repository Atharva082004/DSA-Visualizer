import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";

const GraphVisualizer = forwardRef(({ animationSpeed }, ref) => {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([
    { id: "A", x: 150, y: 150, visited: false },
    { id: "B", x: 350, y: 100, visited: false },
    { id: "C", x: 550, y: 150, visited: false },
    { id: "D", x: 250, y: 280, visited: false },
    { id: "E", x: 450, y: 280, visited: false },
  ]);

  const [edges, setEdges] = useState([
    { from: "A", to: "B", active: false },
    { from: "A", to: "D", active: false },
    { from: "B", to: "C", active: false },
    { from: "B", to: "E", active: false },
    { from: "C", to: "E", active: false },
    { from: "D", to: "E", active: false },
  ]);

  const [visitedNodes, setVisitedNodes] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [isTraversing, setIsTraversing] = useState(false);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    addNode: (nodeId) => {
      if (!nodeId || nodeId.length === 0) {
        alert("Please enter a valid node ID");
        return;
      }

      const upperNodeId = nodeId.toUpperCase();
      if (nodes.find((n) => n.id === upperNodeId)) {
        alert(`Node ${upperNodeId} already exists!`);
        return;
      }

      // Find a good position that doesn't overlap
      let x, y;
      let attempts = 0;
      do {
        x = 100 + Math.random() * 500;
        y = 100 + Math.random() * 250;
        attempts++;
      } while (
        attempts < 20 &&
        nodes.some(
          (node) => Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2) < 80
        )
      );

      const newNode = {
        id: upperNodeId,
        x: x,
        y: y,
        visited: false,
      };
      setNodes((prev) => [...prev, newNode]);
      alert(`Node ${upperNodeId} added successfully!`);
    },

    addEdge: (edgeString) => {
      if (!edgeString || edgeString.trim().length === 0) {
        alert("Please enter edge in format: A,B");
        return;
      }

      const parts = edgeString.split(",");
      if (parts.length !== 2) {
        alert("Edge format: From,To (e.g., A,B)");
        return;
      }

      const [from, to] = parts.map((s) => s.trim().toUpperCase());

      if (from === to) {
        alert("Cannot create self-loop edge");
        return;
      }

      if (!nodes.find((n) => n.id === from)) {
        alert(`Node ${from} does not exist`);
        return;
      }

      if (!nodes.find((n) => n.id === to)) {
        alert(`Node ${to} does not exist`);
        return;
      }

      if (
        edges.find(
          (e) =>
            (e.from === from && e.to === to) || (e.from === to && e.to === from)
        )
      ) {
        alert("Edge already exists");
        return;
      }

      setEdges((prev) => [...prev, { from, to, active: false }]);
      alert(`Edge ${from}-${to} added successfully!`);
    },

    startDFS: () => {
      if (!isTraversing && nodes.length > 0) {
        dfsTraversal();
      }
    },

    startBFS: () => {
      if (!isTraversing && nodes.length > 0) {
        bfsTraversal();
      }
    },

    reset: () => {
      setVisitedNodes([]);
      setCurrentNode(null);
      setIsTraversing(false);
      setEdges((prev) => prev.map((edge) => ({ ...edge, active: false })));
    },

    generateRandomData: () => {
      // Generate 4-7 nodes
      const nodeCount = 4 + Math.floor(Math.random() * 4);
      const nodeIds = "ABCDEFGHIJK".split("").slice(0, nodeCount);

      const randomNodes = nodeIds.map((id, index) => ({
        id,
        x: 120 + (index % 3) * 200 + Math.random() * 50,
        y: 120 + Math.floor(index / 3) * 150 + Math.random() * 50,
        visited: false,
      }));

      // Generate meaningful edges to ensure connectivity
      const randomEdges = [];

      // First, create a spanning tree to ensure connectivity
      for (let i = 1; i < randomNodes.length; i++) {
        const fromIndex = Math.floor(Math.random() * i);
        randomEdges.push({
          from: randomNodes[fromIndex].id,
          to: randomNodes[i].id,
          active: false,
        });
      }

      // Add some additional random edges
      const additionalEdges = Math.floor(Math.random() * 3) + 1;
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
          randomEdges.push({
            from: from.id,
            to: to.id,
            active: false,
          });
        }
      }

      setNodes(randomNodes);
      setEdges(randomEdges);
      setVisitedNodes([]);
      setCurrentNode(null);
      setIsTraversing(false);
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
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.strokeStyle = edge.active ? "#e74c3c" : "#7f8c8d";
        ctx.lineWidth = edge.active ? 4 : 2;
        ctx.stroke();
      }
    });

    // Draw nodes
    nodes.forEach((node) => {
      const radius = 25;
      let fillColor = "#3498db";

      if (visitedNodes.includes(node.id)) fillColor = "#27ae60";
      if (currentNode === node.id) fillColor = "#e74c3c";

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
      ctx.fillText(node.id, node.x, node.y);
    });
  }, [nodes, edges, visitedNodes, currentNode]);

  useEffect(() => {
    drawGraph();
  }, [drawGraph]);

  const dfsTraversal = async () => {
    if (nodes.length === 0) {
      alert("No nodes to traverse!");
      return;
    }

    setIsTraversing(true);
    const visited = [];
    const stack = [nodes[0].id];

    while (stack.length > 0) {
      const current = stack.pop();

      if (!visited.includes(current)) {
        setCurrentNode(current);

        // Highlight active edges
        const activeEdges = edges.filter(
          (edge) =>
            (edge.from === current && !visited.includes(edge.to)) ||
            (edge.to === current && !visited.includes(edge.from))
        );

        setEdges((prev) =>
          prev.map((edge) => ({
            ...edge,
            active: activeEdges.includes(edge),
          }))
        );

        await new Promise((resolve) => setTimeout(resolve, animationSpeed));

        visited.push(current);
        setVisitedNodes([...visited]);

        // Add neighbors to stack
        const neighbors = edges
          .filter((edge) => edge.from === current || edge.to === current)
          .map((edge) => (edge.from === current ? edge.to : edge.from))
          .filter((neighbor) => !visited.includes(neighbor));

        stack.push(...neighbors.reverse());
      }
    }

    setCurrentNode(null);
    setEdges((prev) => prev.map((edge) => ({ ...edge, active: false })));
    setIsTraversing(false);
  };

  const bfsTraversal = async () => {
    if (nodes.length === 0) {
      alert("No nodes to traverse!");
      return;
    }

    setIsTraversing(true);
    const visited = [];
    const queue = [nodes[0].id];

    while (queue.length > 0) {
      const current = queue.shift();

      if (!visited.includes(current)) {
        setCurrentNode(current);

        // Highlight active edges
        const activeEdges = edges.filter(
          (edge) =>
            (edge.from === current && !visited.includes(edge.to)) ||
            (edge.to === current && !visited.includes(edge.from))
        );

        setEdges((prev) =>
          prev.map((edge) => ({
            ...edge,
            active: activeEdges.includes(edge),
          }))
        );

        await new Promise((resolve) => setTimeout(resolve, animationSpeed));

        visited.push(current);
        setVisitedNodes([...visited]);

        // Add neighbors to queue
        const neighbors = edges
          .filter((edge) => edge.from === current || edge.to === current)
          .map((edge) => (edge.from === current ? edge.to : edge.from))
          .filter((neighbor) => !visited.includes(neighbor));

        queue.push(...neighbors);
      }
    }

    setCurrentNode(null);
    setEdges((prev) => prev.map((edge) => ({ ...edge, active: false })));
    setIsTraversing(false);
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

      <div className="graph-info">
        <div className="info-grid">
          <div className="info-item">
            <strong>Nodes:</strong> {nodes.length}
          </div>
          <div className="info-item">
            <strong>Edges:</strong> {edges.length}
          </div>
          <div className="info-item">
            <strong>Visited:</strong> {visitedNodes.join(", ") || "None"}
          </div>
          <div className="info-item">
            <strong>Current:</strong> {currentNode || "None"}
          </div>
        </div>

        {isTraversing && (
          <div className="traversal-status">
            <p>
              <strong>🔄 Traversal in progress...</strong>
            </p>
          </div>
        )}
      </div>

      <div className="complexity-info">
        <h4>Graph Traversal Complexity</h4>
        <div className="complexity-grid">
          <div className="complexity-item">
            <strong>DFS Time:</strong>{" "}
            <span className="complexity-value">O(V + E)</span>
          </div>
          <div className="complexity-item">
            <strong>BFS Time:</strong>{" "}
            <span className="complexity-value">O(V + E)</span>
          </div>
          <div className="complexity-item">
            <strong>Space:</strong>{" "}
            <span className="complexity-value">O(V)</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default GraphVisualizer;
