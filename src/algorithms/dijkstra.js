export function dijkstra(graph, start) {
  const distances = { [start]: 0 };
  const visited = new Set();
  const unvisited = new Set(Object.keys(graph.adjacencyList));
  const steps = [];

  // Initialize distances
  Object.keys(graph.adjacencyList).forEach((node) => {
    if (node !== start) distances[node] = Infinity;
  });

  while (unvisited.size > 0) {
    // Find unvisited node with minimum distance
    let current = null;
    let minDistance = Infinity;

    for (const node of unvisited) {
      if (distances[node] < minDistance) {
        minDistance = distances[node];
        current = node;
      }
    }

    if (current === null || distances[current] === Infinity) break;

    // Record this step
    steps.push({
      current,
      distances: { ...distances },
      visited: new Set(visited),
      activeEdges: [],
    });

    // Update distances to neighbors
    const neighbors = graph.adjacencyList[current] || [];
    const activeEdges = [];

    neighbors.forEach((neighbor) => {
      if (!visited.has(neighbor.node)) {
        const newDistance = distances[current] + neighbor.weight;
        if (newDistance < distances[neighbor.node]) {
          distances[neighbor.node] = newDistance;
        }
        activeEdges.push(`${current}-${neighbor.node}`);
      }
    });

    // Add step with active edges
    steps.push({
      current,
      distances: { ...distances },
      visited: new Set(visited),
      activeEdges,
    });

    visited.add(current);
    unvisited.delete(current);
  }

  return steps;
}
