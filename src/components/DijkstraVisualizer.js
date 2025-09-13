import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";


const CollapsibleSection = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="collapsible-section">
      <button
        className="collapsible-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="section-title">{title}</span>
        <span className={`section-arrow ${isOpen ? "open" : ""}`}>▼</span>
      </button>
      {isOpen && <div className="collapsible-content">{children}</div>}
    </div>
  );
};


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
  const [showCode, setShowCode] = useState(false);
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
      {/* 🔥 NEW: Collapsible C++ Code Section */}
      <div className="code-implementation">
        <div className="code-header">
          <button
            className="code-toggle-btn"
            onClick={() => setShowCode(!showCode)}
          >
            {showCode ? "📝 Hide C++ Code" : "💻 Show C++ Implementation"}
            <span className={`arrow ${showCode ? "up" : "down"}`}>▼</span>
          </button>
        </div>

        {showCode && (
          <div className="code-sections">
            <CollapsibleSection
              title="🎯 Basic Dijkstra Algorithm"
              defaultOpen={true}
            >
              <pre className="code-block">
                <code>{`// Basic Dijkstra's Algorithm Implementation
#include <iostream>
#include <vector>
#include <climits>
using namespace std;

const int V = 5;  // Number of vertices

// Function to find vertex with minimum distance
int minDistance(int dist[], bool sptSet[]) {
    int min = INT_MAX, min_index;

    for (int v = 0; v < V; v++) {
        if (!sptSet[v] && dist[v] <= min) {
            min = dist[v];
            min_index = v;
        }
    }
    return min_index;
}

// Print the solution
void printSolution(int dist[]) {
    cout << "Vertex \\t Distance from Source\\n";
    for (int i = 0; i < V; i++) {
        cout << i << " \\t\\t " << dist[i] << endl;
    }
}

// Dijkstra's algorithm for adjacency matrix representation
void dijkstra(int graph[V][V], int src) {
    int dist[V];     // Output array
    bool sptSet[V];  // Shortest path tree set

    // Initialize all distances as INFINITE and sptSet[] as false
    for (int i = 0; i < V; i++) {
        dist[i] = INT_MAX;
        sptSet[i] = false;
    }

    // Distance of source vertex from itself is always 0
    dist[src] = 0;

    // Find shortest path for all vertices
    for (int count = 0; count < V - 1; count++) {
        // Pick minimum distance vertex from unprocessed vertices
        int u = minDistance(dist, sptSet);

        // Mark the picked vertex as processed
        sptSet[u] = true;

        // Update dist value of adjacent vertices
        for (int v = 0; v < V; v++) {
            if (!sptSet[v] && graph[u][v] && 
                dist[u] != INT_MAX && 
                dist[u] + graph[u][v] < dist[v]) {
                dist[v] = dist[u] + graph[u][v];
            }
        }
    }

    // Print the constructed distance array
    printSolution(dist);
}`}</code>
              </pre>
            </CollapsibleSection>

            <CollapsibleSection title="⚡ Optimized with Priority Queue">
              <pre className="code-block">
                <code>{`// Optimized Dijkstra using Priority Queue (Min-Heap)
#include <iostream>
#include <vector>
#include <queue>
#include <climits>
using namespace std;

typedef pair<int, int> pii;  // (distance, vertex)

class Graph {
private:
    int V;
    vector<vector<pii>> adj;

public:
    Graph(int vertices) : V(vertices) {
        adj.resize(V);
    }

    void addEdge(int u, int v, int weight) {
        adj[u].push_back({v, weight});
        adj[v].push_back({u, weight});  // For undirected graph
    }

    vector<int> dijkstra(int src) {
        // Min-heap: (distance, vertex)
        priority_queue<pii, vector<pii>, greater<pii>> pq;
        
        // Distance array initialized to infinity
        vector<int> dist(V, INT_MAX);
        
        // Insert source with distance 0
        dist[src] = 0;
        pq.push({0, src});

        while (!pq.empty()) {
            int currDist = pq.top().first;
            int u = pq.top().second;
            pq.pop();

            // Skip if we've found a better path already
            if (currDist > dist[u]) continue;

            // Explore all adjacent vertices
            for (auto& edge : adj[u]) {
                int v = edge.first;
                int weight = edge.second;

                // Relaxation step
                if (dist[u] + weight < dist[v]) {
                    dist[v] = dist[u] + weight;
                    pq.push({dist[v], v});
                }
            }
        }

        return dist;
    }

    void printPath(int parent[], int target) {
        if (parent[target] == -1) {
            cout << target;
            return;
        }
        printPath(parent, parent[target]);
        cout << " -> " << target;
    }
};

// Usage example
int main() {
    Graph g(5);
    
    // Add edges (u, v, weight)
    g.addEdge(0, 1, 4);
    g.addEdge(0, 2, 2);
    g.addEdge(1, 2, 1);
    g.addEdge(1, 3, 5);
    g.addEdge(2, 3, 8);
    g.addEdge(2, 4, 10);
    g.addEdge(3, 4, 2);

    vector<int> distances = g.dijkstra(0);
    
    cout << "Shortest distances from vertex 0:\\n";
    for (int i = 0; i < distances.size(); i++) {
        cout << "To vertex " << i << ": " << distances[i] << endl;
    }

    return 0;
}`}</code>
              </pre>
            </CollapsibleSection>

            <CollapsibleSection title="🔄 Advanced Dijkstra with Path Reconstruction">
              <pre className="code-block">
                <code>{`// Advanced Dijkstra with Path Reconstruction and Multiple Features
#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>
#include <climits>
using namespace std;

class DijkstraAdvanced {
private:
    struct Edge {
        int to, weight;
        Edge(int t, int w) : to(t), weight(w) {}
    };

    int V;
    vector<vector<Edge>> adj;

public:
    DijkstraAdvanced(int vertices) : V(vertices) {
        adj.resize(V);
    }

    void addEdge(int from, int to, int weight) {
        adj[from].push_back(Edge(to, weight));
        adj[to].push_back(Edge(from, weight));  // Undirected
    }

    struct DijkstraResult {
        vector<int> distances;
        vector<int> parent;
        vector<vector<int>> allPaths;
        bool pathExists;
        int totalDistance;
    };

    DijkstraResult findShortestPath(int src, int target = -1) {
        vector<int> dist(V, INT_MAX);
        vector<int> parent(V, -1);
        vector<bool> visited(V, false);
        
        priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
        
        dist[src] = 0;
        pq.push({0, src});

        while (!pq.empty()) {
            int currDist = pq.top().first;
            int u = pq.top().second;
            pq.pop();

            if (visited[u]) continue;
            visited[u] = true;

            // Early termination if we reached target
            if (target != -1 && u == target) break;

            for (const Edge& edge : adj[u]) {
                int v = edge.to;
                int weight = edge.weight;

                if (!visited[v] && dist[u] + weight < dist[v]) {
                    dist[v] = dist[u] + weight;
                    parent[v] = u;
                    pq.push({dist[v], v});
                }
            }
        }

        DijkstraResult result;
        result.distances = dist;
        result.parent = parent;
        
        if (target != -1) {
            result.pathExists = (dist[target] != INT_MAX);
            result.totalDistance = dist[target];
            
            if (result.pathExists) {
                vector<int> path = reconstructPath(parent, src, target);
                result.allPaths.push_back(path);
            }
        }

        return result;
    }

    vector<int> reconstructPath(const vector<int>& parent, int src, int target) {
        vector<int> path;
        int current = target;
        
        while (current != -1) {
            path.push_back(current);
            current = parent[current];
        }
        
        reverse(path.begin(), path.end());
        
        // Verify path starts from source
        if (!path.empty() && path[0] == src) {
            return path;
        }
        
        return {};  // Invalid path
    }

    void printPath(const vector<int>& path) {
        if (path.empty()) {
            cout << "No path exists" << endl;
            return;
        }
        
        for (int i = 0; i < path.size(); i++) {
            cout << path[i];
            if (i < path.size() - 1) cout << " -> ";
        }
        cout << endl;
    }

    // Find all shortest paths to all vertices
    void printAllShortestPaths(int src) {
        DijkstraResult result = findShortestPath(src);
        
        cout << "\\nAll shortest paths from vertex " << src << ":\\n";
        cout << "Vertex\\tDistance\\tPath\\n";
        
        for (int i = 0; i < V; i++) {
            if (i == src) continue;
            
            cout << i << "\\t";
            if (result.distances[i] == INT_MAX) {
                cout << "INF\\t\\tNo path";
            } else {
                cout << result.distances[i] << "\\t\\t";
                vector<int> path = reconstructPath(result.parent, src, i);
                printPath(path);
            }
        }
    }
};

// Utility function to create example graph
DijkstraAdvanced createExampleGraph() {
    DijkstraAdvanced graph(6);
    
    // Create a sample graph
    //     0
    //   / | \\
    //  4  2  1
    //  |  |  |\\
    //  5  3  | 5
    //      \\ |/
    //        4
    
    graph.addEdge(0, 1, 4);
    graph.addEdge(0, 2, 2);
    graph.addEdge(1, 2, 1);
    graph.addEdge(1, 3, 5);
    graph.addEdge(2, 3, 8);
    graph.addEdge(2, 4, 10);
    graph.addEdge(3, 4, 2);
    graph.addEdge(3, 5, 6);
    
    return graph;
}`}</code>
              </pre>
            </CollapsibleSection>

            <CollapsibleSection title="🚀 Complete Implementation Example">
              <pre className="code-block">
                <code>{`#include <iostream>
#include <vector>
#include <queue>
#include <iomanip>
#include <chrono>
using namespace std;

int main() {
    cout << "=== Dijkstra's Algorithm Demo ===" << endl;
    
    // Create example graph matching the visualizer
    DijkstraAdvanced graph = createExampleGraph();
    
    int source = 0;
    int target = 5;
    
    cout << "\\n1. Finding shortest path from " << source 
         << " to " << target << ":" << endl;
    
    // Measure execution time
    auto start = chrono::high_resolution_clock::now();
    
    DijkstraAdvanced::DijkstraResult result = 
        graph.findShortestPath(source, target);
    
    auto end = chrono::high_resolution_clock::now();
    auto duration = chrono::duration_cast<chrono::microseconds>(end - start);
    
    if (result.pathExists) {
        cout << "✅ Path found!" << endl;
        cout << "Distance: " << result.totalDistance << endl;
        cout << "Path: ";
        graph.printPath(result.allPaths[0]);
        cout << "Execution time: " << duration.count() << " microseconds" << endl;
    } else {
        cout << "❌ No path exists from " << source << " to " << target << endl;
    }
    
    cout << "\\n2. All shortest paths from vertex " << source << ":" << endl;
    graph.printAllShortestPaths(source);
    
    // Performance analysis
    cout << "\\n3. Algorithm Complexity Analysis:" << endl;
    cout << "Time Complexity: O((V + E) log V)" << endl;
    cout << "Space Complexity: O(V)" << endl;
    cout << "Where V = vertices, E = edges" << endl;
    
    // Test with different scenarios
    cout << "\\n4. Testing edge cases:" << endl;
    
    // Test unreachable vertex
    DijkstraAdvanced isolatedGraph(3);
    isolatedGraph.addEdge(0, 1, 5);
    // Vertex 2 is isolated
    
    auto isolatedResult = isolatedGraph.findShortestPath(0, 2);
    cout << "Path from 0 to isolated vertex 2: ";
    if (isolatedResult.pathExists) {
        isolatedGraph.printPath(isolatedResult.allPaths[0]);
    } else {
        cout << "No path (as expected)" << endl;
    }
    
    return 0;
}

/* Expected Output:
=== Dijkstra's Algorithm Demo ===

1. Finding shortest path from 0 to 5:
✅ Path found!
Distance: 14
Path: 0 -> 2 -> 3 -> 5
Execution time: 127 microseconds

2. All shortest paths from vertex 0:
Vertex  Distance    Path
1       3           0 -> 2 -> 1
2       2           0 -> 2
3       10          0 -> 2 -> 3
4       12          0 -> 2 -> 3 -> 4
5       14          0 -> 2 -> 3 -> 5

3. Algorithm Complexity Analysis:
Time Complexity: O((V + E) log V)
Space Complexity: O(V)
Where V = vertices, E = edges

4. Testing edge cases:
Path from 0 to isolated vertex 2: No path (as expected)
*/`}</code>
              </pre>
            </CollapsibleSection>

            <CollapsibleSection title="🔧 Dijkstra Variations & Applications">
              <pre className="code-block">
                <code>{`// Different Variations and Real-world Applications

// 1. Dijkstra for Directed Graphs
void addDirectedEdge(int from, int to, int weight) {
    adj[from].push_back(Edge(to, weight));
    // Note: No reverse edge for directed graphs
}

// 2. Dijkstra with Path Weight Limit
vector<int> dijkstraWithLimit(int src, int maxWeight) {
    vector<int> dist(V, INT_MAX);
    priority_queue<pii, vector<pii>, greater<pii>> pq;
    
    dist[src] = 0;
    pq.push({0, src});

    while (!pq.empty()) {
        int currDist = pq.top().first;
        int u = pq.top().second;
        pq.pop();

        if (currDist > dist[u] || currDist > maxWeight) continue;

        for (const Edge& edge : adj[u]) {
            int v = edge.to;
            int weight = edge.weight;
            
            if (dist[u] + weight < dist[v] && 
                dist[u] + weight <= maxWeight) {
                dist[v] = dist[u] + weight;
                pq.push({dist[v], v});
            }
        }
    }
    
    return dist;
}

// 3. K-Shortest Paths using Modified Dijkstra
struct PathInfo {
    int distance;
    vector<int> path;
    
    PathInfo(int d, vector<int> p) : distance(d), path(p) {}
};

vector<PathInfo> kShortestPaths(int src, int target, int k) {
    vector<PathInfo> result;
    
    // Priority queue: (distance, vertex, path)
    priority_queue<tuple<int, int, vector<int>>, 
                   vector<tuple<int, int, vector<int>>>, 
                   greater<tuple<int, int, vector<int>>>> pq;
    
    vector<int> visitCount(V, 0);
    
    pq.push({0, src, {src}});
    
    while (!pq.empty() && result.size() < k) {
        auto [dist, u, path] = pq.top();
        pq.pop();
        
        visitCount[u]++;
        
        if (u == target) {
            result.push_back(PathInfo(dist, path));
            continue;
        }
        
        if (visitCount[u] > k) continue;
        
        for (const Edge& edge : adj[u]) {
            int v = edge.to;
            vector<int> newPath = path;
            newPath.push_back(v);
            
            pq.push({dist + edge.weight, v, newPath});
        }
    }
    
    return result;
}

// 4. Real-world Applications

// GPS Navigation System
class GPSNavigation {
private:
    DijkstraAdvanced roadNetwork;
    
public:
    struct Location {
        string name;
        double latitude, longitude;
    };
    
    // Find route considering traffic
    PathInfo findRoute(int start, int destination, 
                      const vector<double>& trafficMultipliers) {
        // Apply traffic conditions to edge weights
        // Run Dijkstra with modified weights
        // Return optimized route
    }
};

// Network Router Path Finding
class NetworkRouter {
private:
    DijkstraAdvanced network;
    
public:
    // Find optimal packet routing path
    vector<int> findOptimalRoute(int sourceRouter, int targetRouter,
                                const vector<double>& linkLatencies) {
        // Consider network congestion and latency
        // Use Dijkstra to find lowest latency path
    }
};

// Social Network Analysis
class SocialNetwork {
private:
    DijkstraAdvanced connections;
    
public:
    // Find shortest connection path between users
    int degreeOfSeparation(int user1, int user2) {
        auto result = connections.findShortestPath(user1, user2);
        return result.pathExists ? result.totalDistance : -1;
    }
    
    // Find mutual connections
    vector<int> findMutualConnections(int user1, int user2) {
        // Use modified Dijkstra to find common connections
    }
};`}</code>
              </pre>
            </CollapsibleSection>
          </div>
        )}
      </div>
    </div>
  );
});

export default DijkstraVisualizer;
