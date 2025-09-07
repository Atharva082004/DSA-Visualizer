export function drawLinkedList(canvas, nodes, highlightIndex) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const startX = 50;
  const startY = canvas.height / 2;
  const nodeWidth = 60;
  const nodeHeight = 40;
  const spacing = 100;

  nodes.forEach((node, index) => {
    const x = startX + index * spacing;
    const y = startY - nodeHeight / 2;

    // Draw node
    ctx.fillStyle = index === highlightIndex ? "#ff6b6b" : "#4ecdc4";
    ctx.fillRect(x, y, nodeWidth, nodeHeight);

    // Draw border
    ctx.strokeStyle = "#2c3e50";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, nodeWidth, nodeHeight);

    // Draw value
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(node.value, x + nodeWidth / 2, y + nodeHeight / 2 + 5);

    // Draw arrow to next node
    if (index < nodes.length - 1) {
      drawArrow(ctx, x + nodeWidth, startY, x + spacing, startY);
    }
  });
}

export function drawGraph(canvas, nodes, edges, currentNode) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw edges
  edges.forEach((edge) => {
    const fromNode = nodes.find((n) => n.id === edge.from);
    const toNode = nodes.find((n) => n.id === edge.to);

    if (fromNode && toNode) {
      ctx.strokeStyle = edge.active ? "#e74c3c" : "#bdc3c7";
      ctx.lineWidth = edge.active ? 3 : 2;

      drawLine(ctx, fromNode.x, fromNode.y, toNode.x, toNode.y);

      // Draw weight
      const midX = (fromNode.x + toNode.x) / 2;
      const midY = (fromNode.y + toNode.y) / 2;

      ctx.fillStyle = "#2c3e50";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.fillText(edge.weight, midX, midY - 10);
    }
  });

  // Draw nodes
  nodes.forEach((node) => {
    const radius = 25;

    // Node color based on state
    let fillColor = "#3498db";
    if (node.visited) fillColor = "#27ae60";
    if (node.id === currentNode) fillColor = "#e74c3c";

    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.strokeStyle = "#2c3e50";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw node label
    ctx.fillStyle = "white";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(node.id, node.x, node.y + 5);

    // Draw distance
    if (node.distance !== Infinity) {
      ctx.fillStyle = "#2c3e50";
      ctx.font = "12px Arial";
      ctx.fillText(`d: ${node.distance}`, node.x, node.y + 40);
    }
  });
}

function drawArrow(ctx, fromX, fromY, toX, toY) {
  const headlen = 10;
  const angle = Math.atan2(toY - fromY, toX - fromX);

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX - 20, toY);

  // Arrow head
  ctx.lineTo(
    toX - 20 - headlen * Math.cos(angle - Math.PI / 6),
    toY - headlen * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(toX - 20, toY);
  ctx.lineTo(
    toX - 20 - headlen * Math.cos(angle + Math.PI / 6),
    toY - headlen * Math.sin(angle + Math.PI / 6)
  );

  ctx.strokeStyle = "#2c3e50";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawLine(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
