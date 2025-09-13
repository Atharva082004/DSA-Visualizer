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
  const [traversalResult, setTraversalResult] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [showOperations, setShowOperations] = useState(true);

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
    },

    startDFS: async () => {
      if (isTraversing || nodes.length === 0) return;

      setIsTraversing(true);
      const visited = new Set();
      const result = [];

      const dfs = async (nodeId) => {
        visited.add(nodeId);
        result.push(nodeId);
        setCurrentNode(nodeId);
        setVisitedNodes([...visited]);

        await new Promise((resolve) => setTimeout(resolve, animationSpeed));

        // Find neighbors
        const neighbors = edges
          .filter((e) => e.from === nodeId || e.to === nodeId)
          .map((e) => (e.from === nodeId ? e.to : e.from))
          .filter((neighbor) => !visited.has(neighbor));

        for (const neighbor of neighbors) {
          // Highlight edge
          setEdges((prev) =>
            prev.map((e) => ({
              ...e,
              active:
                (e.from === nodeId && e.to === neighbor) ||
                (e.from === neighbor && e.to === nodeId),
            }))
          );

          await new Promise((resolve) =>
            setTimeout(resolve, animationSpeed / 2)
          );

          if (!visited.has(neighbor)) {
            await dfs(neighbor);
          }
        }
      };

      // Start DFS from first node
      await dfs(nodes[0].id);

      setTraversalResult(`DFS: ${result.join(" → ")}`);
      setCurrentNode(null);
      setIsTraversing(false);

      // Reset edges
      setEdges((prev) => prev.map((e) => ({ ...e, active: false })));
    },

    startBFS: async () => {
      if (isTraversing || nodes.length === 0) return;

      setIsTraversing(true);
      const visited = new Set();
      const queue = [nodes[0].id];
      const result = [];

      visited.add(nodes[0].id);

      while (queue.length > 0) {
        const nodeId = queue.shift();
        result.push(nodeId);

        setCurrentNode(nodeId);
        setVisitedNodes([...visited]);

        await new Promise((resolve) => setTimeout(resolve, animationSpeed));

        // Find unvisited neighbors
        const neighbors = edges
          .filter((e) => e.from === nodeId || e.to === nodeId)
          .map((e) => (e.from === nodeId ? e.to : e.from))
          .filter((neighbor) => !visited.has(neighbor));

        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);

            // Highlight edge
            setEdges((prev) =>
              prev.map((e) => ({
                ...e,
                active:
                  (e.from === nodeId && e.to === neighbor) ||
                  (e.from === neighbor && e.to === nodeId),
              }))
            );

            await new Promise((resolve) =>
              setTimeout(resolve, animationSpeed / 2)
            );
          }
        }
      }

      setTraversalResult(`BFS: ${result.join(" → ")}`);
      setCurrentNode(null);
      setIsTraversing(false);

      // Reset edges
      setEdges((prev) => prev.map((e) => ({ ...e, active: false })));
    },

    reset: () => {
      setNodes((prev) => prev.map((node) => ({ ...node, visited: false })));
      setEdges((prev) => prev.map((edge) => ({ ...edge, active: false })));
      setVisitedNodes([]);
      setCurrentNode(null);
      setIsTraversing(false);
      setTraversalResult("");
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
          visited: false,
        };
      });

      // Generate connected edges
      const randomEdges = [];
      for (let i = 1; i < randomNodes.length; i++) {
        const fromIndex = Math.floor(Math.random() * i);
        randomEdges.push({
          from: randomNodes[fromIndex].id,
          to: randomNodes[i].id,
          active: false,
        });
      }

      // Add some additional edges
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
      setTraversalResult("");
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
        ctx.strokeStyle = edge.active ? "#e74c3c" : "#95a5a6";
        ctx.lineWidth = edge.active ? 4 : 2;
        ctx.stroke();
      }
    });

    // Draw nodes
    nodes.forEach((node) => {
      const radius = 25;
      let fillColor = "#3498db";

      if (visitedNodes.includes(node.id)) {
        fillColor = "#95a5a6";
      }
      if (node.id === currentNode) {
        fillColor = "#e74c3c";
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
      ctx.fillText(node.id, node.x, node.y);
    });
  }, [nodes, edges, visitedNodes, currentNode]);

  useEffect(() => {
    drawGraph();
  }, [drawGraph]);

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

      <div className="status-info">
        <div className="info-grid">
          <div className="info-item">
            <strong>Nodes:</strong> {nodes.length}
          </div>
          <div className="info-item">
            <strong>Edges:</strong> {edges.length}
          </div>
          <div className="info-item">
            <strong>Status:</strong> {isTraversing ? "Traversing..." : "Ready"}
          </div>
        </div>

        {traversalResult && (
          <div className="traversal-result">
            <p>
              <strong>🔄 Result:</strong> {traversalResult}
            </p>
          </div>
        )}
      </div>

      {/* Collapsible Operations Section */}
      <div className="operations-section">
        <div className="section-header">
          <button
            className="section-toggle-btn"
            onClick={() => setShowOperations(!showOperations)}
          >
            🕸️ Graph Traversal Analysis
            <span className={`arrow ${showOperations ? "up" : "down"}`}>▼</span>
          </button>
        </div>

        {showOperations && (
          <div className="operations-content">
            <div className="complexity-info">
              <h4>Time & Space Complexity</h4>
              <div className="complexity-grid">
                <div className="complexity-item">
                  <strong>DFS Time:</strong>{" "}
                  <span className="complexity-value">O(V + E)</span>
                  <p className="complexity-explanation">
                    Visit each vertex and edge once
                  </p>
                </div>
                <div className="complexity-item">
                  <strong>BFS Time:</strong>{" "}
                  <span className="complexity-value">O(V + E)</span>
                  <p className="complexity-explanation">
                    Same as DFS for time complexity
                  </p>
                </div>
                <div className="complexity-item">
                  <strong>DFS Space:</strong>{" "}
                  <span className="complexity-value">O(V)</span>
                  <p className="complexity-explanation">
                    Recursion stack depth
                  </p>
                </div>
                <div className="complexity-item">
                  <strong>BFS Space:</strong>{" "}
                  <span className="complexity-value">O(V)</span>
                  <p className="complexity-explanation">
                    Queue storage requirement
                  </p>
                </div>
              </div>
            </div>

            <div className="traversal-comparison">
              <h4>🔄 DFS vs BFS Comparison</h4>
              <div className="operation-grid">
                <div className="operation-card">
                  <h5>📊 Depth-First Search (DFS)</h5>
                  <ul>
                    <li>Uses stack (recursion)</li>
                    <li>Goes deep before wide</li>
                    <li>Good for pathfinding</li>
                    <li>Detects cycles</li>
                  </ul>
                </div>
                <div className="operation-card">
                  <h5>📋 Breadth-First Search (BFS)</h5>
                  <ul>
                    <li>Uses queue</li>
                    <li>Level-by-level exploration</li>
                    <li>Shortest path (unweighted)</li>
                    <li>Connected components</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="applications-section">
              <h4>🎯 Real-World Applications</h4>
              <div className="comparison-table">
                <table>
                  <thead>
                    <tr>
                      <th>Algorithm</th>
                      <th>Best For</th>
                      <th>Examples</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <strong>DFS</strong>
                      </td>
                      <td>Path existence, Cycle detection</td>
                      <td>Maze solving, Topological sort</td>
                    </tr>
                    <tr>
                      <td>
                        <strong>BFS</strong>
                      </td>
                      <td>Shortest paths, Level exploration</td>
                      <td>Social networks, GPS navigation</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* C++ Code Implementation Section */}
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
              title="🕸️ Graph Representation"
              defaultOpen={true}
            >
              <pre className="code-block">
                <code>{`// Graph representation using adjacency list
#include <vector>
#include <list>
#include <unordered_set>
#include <queue>
#include <stack>
#include <iostream>
using namespace std;

class Graph {
private:
    int vertices;
    vector<list<int>> adjList;
    
public:
    // Constructor
    Graph(int V) : vertices(V) {
        adjList.resize(V);
    }
    
    // Add edge (undirected graph)
    void addEdge(int u, int v) {
        adjList[u].push_back(v);
        adjList[v].push_back(u);  // For undirected graph
    }
    
    // Add directed edge
    void addDirectedEdge(int u, int v) {
        adjList[u].push_back(v);
    }
    
    // Print adjacency list
    void printGraph() {
        for (int i = 0; i < vertices; i++) {
            cout << "Vertex " << i << ": ";
            for (int neighbor : adjList[i]) {
                cout << neighbor << " ";
            }
            cout << endl;
        }
    }
    
    // Get neighbors of a vertex
    list<int>& getNeighbors(int vertex) {
        return adjList[vertex];
    }
    
    int getVertexCount() const {
        return vertices;
    }
};`}</code>
              </pre>
            </CollapsibleSection>

            <CollapsibleSection title="📊 Depth-First Search (DFS)">
              <pre className="code-block">
                <code>{`// DFS Implementation - Recursive
void DFSRecursive(Graph& graph, int startVertex, vector<bool>& visited) {
    visited[startVertex] = true;
    cout << startVertex << " ";
    
    // Visit all unvisited neighbors
    for (int neighbor : graph.getNeighbors(startVertex)) {
        if (!visited[neighbor]) {
            DFSRecursive(graph, neighbor, visited);
        }
    }
}

// DFS Wrapper function
void DFS(Graph& graph, int startVertex) {
    vector<bool> visited(graph.getVertexCount(), false);
    cout << "DFS traversal starting from vertex " << startVertex << ": ";
    DFSRecursive(graph, startVertex, visited);
    cout << endl;
}

// DFS Implementation - Iterative using Stack
void DFSIterative(Graph& graph, int startVertex) {
    vector<bool> visited(graph.getVertexCount(), false);
    stack<int> s;
    
    s.push(startVertex);
    cout << "DFS Iterative traversal: ";
    
    while (!s.empty()) {
        int vertex = s.top();
        s.pop();
        
        if (!visited[vertex]) {
            visited[vertex] = true;
            cout << vertex << " ";
            
            // Add all unvisited neighbors to stack
            for (int neighbor : graph.getNeighbors(vertex)) {
                if (!visited[neighbor]) {
                    s.push(neighbor);
                }
            }
        }
    }
    cout << endl;
}

// DFS to detect cycle in undirected graph
bool hasCycleDFS(Graph& graph, int vertex, vector<bool>& visited, int parent) {
    visited[vertex] = true;
    
    for (int neighbor : graph.getNeighbors(vertex)) {
        if (!visited[neighbor]) {
            if (hasCycleDFS(graph, neighbor, visited, vertex)) {
                return true;
            }
        }
        else if (neighbor != parent) {
            return true;  // Back edge found, cycle detected
        }
    }
    return false;
}

// Check if graph has cycle
bool detectCycle(Graph& graph) {
    vector<bool> visited(graph.getVertexCount(), false);
    
    for (int i = 0; i < graph.getVertexCount(); i++) {
        if (!visited[i]) {
            if (hasCycleDFS(graph, i, visited, -1)) {
                return true;
            }
        }
    }
    return false;
}`}</code>
              </pre>
            </CollapsibleSection>

            <CollapsibleSection title="📋 Breadth-First Search (BFS)">
              <pre className="code-block">
                <code>{`// BFS Implementation using Queue
void BFS(Graph& graph, int startVertex) {
    vector<bool> visited(graph.getVertexCount(), false);
    queue<int> q;
    
    visited[startVertex] = true;
    q.push(startVertex);
    
    cout << "BFS traversal starting from vertex " << startVertex << ": ";
    
    while (!q.empty()) {
        int vertex = q.front();
        q.pop();
        cout << vertex << " ";
        
        // Visit all unvisited neighbors
        for (int neighbor : graph.getNeighbors(vertex)) {
            if (!visited[neighbor]) {
                visited[neighbor] = true;
                q.push(neighbor);
            }
        }
    }
    cout << endl;
}

// BFS to find shortest path (unweighted graph)
vector<int> shortestPathBFS(Graph& graph, int start, int target) {
    vector<bool> visited(graph.getVertexCount(), false);
    vector<int> parent(graph.getVertexCount(), -1);
    queue<int> q;
    
    visited[start] = true;
    q.push(start);
    
    while (!q.empty()) {
        int vertex = q.front();
        q.pop();
        
        if (vertex == target) {
            // Reconstruct path
            vector<int> path;
            int current = target;
            
            while (current != -1) {
                path.push_back(current);
                current = parent[current];
            }
            
            reverse(path.begin(), path.end());
            return path;
        }
        
        for (int neighbor : graph.getNeighbors(vertex)) {
            if (!visited[neighbor]) {
                visited[neighbor] = true;
                parent[neighbor] = vertex;
                q.push(neighbor);
            }
        }
    }
    
    return {};  // No path found
}

// BFS to find all vertices at distance k
vector<int> verticesAtDistanceK(Graph& graph, int start, int k) {
    vector<bool> visited(graph.getVertexCount(), false);
    queue<pair<int, int>> q;  // {vertex, distance}
    vector<int> result;
    
    visited[start] = true;
    q.push({start, 0});
    
    while (!q.empty()) {
        int vertex = q.front().first;
        int distance = q.front().second;
        q.pop();
        
        if (distance == k) {
            result.push_back(vertex);
            continue;  // Don't explore further
        }
        
        if (distance < k) {
            for (int neighbor : graph.getNeighbors(vertex)) {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    q.push({neighbor, distance + 1});
                }
            }
        }
    }
    
    return result;
}`}</code>
              </pre>
            </CollapsibleSection>

            <CollapsibleSection title="🔧 Graph Utilities">
              <pre className="code-block">
                <code>{`// Check if graph is connected
bool isConnected(Graph& graph) {
    vector<bool> visited(graph.getVertexCount(), false);
    
    // Start DFS from vertex 0
    DFSRecursive(graph, 0, visited);
    
    // Check if all vertices were visited
    for (bool v : visited) {
        if (!v) return false;
    }
    return true;
}

// Find connected components
void findConnectedComponents(Graph& graph) {
    vector<bool> visited(graph.getVertexCount(), false);
    int componentCount = 0;
    
    for (int i = 0; i < graph.getVertexCount(); i++) {
        if (!visited[i]) {
            cout << "Component " << ++componentCount << ": ";
            DFSRecursive(graph, i, visited);
            cout << endl;
        }
    }
}

// Check if there's a path between two vertices
bool hasPath(Graph& graph, int start, int target) {
    if (start == target) return true;
    
    vector<bool> visited(graph.getVertexCount(), false);
    queue<int> q;
    
    visited[start] = true;
    q.push(start);
    
    while (!q.empty()) {
        int vertex = q.front();
        q.pop();
        
        for (int neighbor : graph.getNeighbors(vertex)) {
            if (neighbor == target) return true;
            
            if (!visited[neighbor]) {
                visited[neighbor] = true;
                q.push(neighbor);
            }
        }
    }
    
    return false;
}

// Calculate graph density
double graphDensity(Graph& graph) {
    int V = graph.getVertexCount();
    int E = 0;
    
    // Count edges
    for (int i = 0; i < V; i++) {
        E += graph.getNeighbors(i).size();
    }
    E /= 2;  // Each edge counted twice in undirected graph
    
    int maxPossibleEdges = V * (V - 1) / 2;
    return maxPossibleEdges > 0 ? (double)E / maxPossibleEdges : 0.0;
}`}</code>
              </pre>
            </CollapsibleSection>

            <CollapsibleSection title="🚀 Complete Graph Example">
              <pre className="code-block">
                <code>{`#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    // Create a graph with 6 vertices (0 to 5)
    Graph graph(6);
    
    cout << "=== Graph Traversal Demo ===" << endl;
    
    // Add edges to create the graph
    //     0 --- 1 --- 2
    //     |     |     |
    //     3 --- 4 --- 5
    graph.addEdge(0, 1);
    graph.addEdge(0, 3);
    graph.addEdge(1, 2);
    graph.addEdge(1, 4);
    graph.addEdge(2, 5);
    graph.addEdge(3, 4);
    graph.addEdge(4, 5);
    
    cout << "\\n1. Graph Structure:" << endl;
    graph.printGraph();
    
    cout << "\\n2. Traversal Algorithms:" << endl;
    DFS(graph, 0);
    BFS(graph, 0);
    
    cout << "\\n3. Path Finding:" << endl;
    vector<int> path = shortestPathBFS(graph, 0, 5);
    if (!path.empty()) {
        cout << "Shortest path from 0 to 5: ";
        for (int i = 0; i < path.size(); i++) {
            cout << path[i];
            if (i < path.size() - 1) cout << " -> ";
        }
        cout << endl;
    }
    
    cout << "\\n4. Graph Properties:" << endl;
    cout << "Is connected: " << (isConnected(graph) ? "Yes" : "No") << endl;
    cout << "Graph density: " << graphDensity(graph) << endl;
    cout << "Has cycle: " << (detectCycle(graph) ? "Yes" : "No") << endl;
    
    cout << "\\n5. Vertices at distance 2 from vertex 0:" << endl;
    vector<int> distanceK = verticesAtDistanceK(graph, 0, 2);
    for (int vertex : distanceK) {
        cout << vertex << " ";
    }
    cout << endl;
    
    return 0;
}

/* Expected Output:
=== Graph Traversal Demo ===

1. Graph Structure:
Vertex 0: 1 3 
Vertex 1: 0 2 4 
Vertex 2: 1 5 
Vertex 3: 0 4 
Vertex 4: 1 3 5 
Vertex 5: 2 4 

2. Traversal Algorithms:
DFS traversal starting from vertex 0: 0 1 2 5 4 3 
BFS traversal starting from vertex 0: 0 1 3 2 4 5 

3. Path Finding:
Shortest path from 0 to 5: 0 -> 1 -> 2 -> 5

4. Graph Properties:
Is connected: Yes
Graph density: 0.466667
Has cycle: Yes

5. Vertices at distance 2 from vertex 0:
2 4 
*/`}</code>
              </pre>
            </CollapsibleSection>
          </div>
        )}
      </div>
    </div>
  );
});

export default GraphVisualizer;
