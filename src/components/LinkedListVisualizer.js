import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";

const LinkedListVisualizer = forwardRef(({ animationSpeed }, ref) => {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([10, 20, 30]);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    handleInsert: (value) => {
      const newNodes = [...nodes, value];
      setNodes(newNodes);
      setHighlightIndex(newNodes.length - 1);
      setTimeout(() => setHighlightIndex(-1), animationSpeed);
    },

    handleDelete: (value) => {
      const index = nodes.findIndex((node) => node === value);
      if (index !== -1) {
        setHighlightIndex(index);
        setTimeout(() => {
          const newNodes = nodes.filter((_, i) => i !== index);
          setNodes(newNodes);
          setHighlightIndex(-1);
        }, animationSpeed);
      } else {
        alert(`Value ${value} not found!`);
      }
    },

    handleSearch: async (value) => {
      let found = false;
      for (let i = 0; i < nodes.length; i++) {
        setHighlightIndex(i);
        await new Promise((resolve) => setTimeout(resolve, animationSpeed));

        if (nodes[i] === value) {
          found = true;
          setTimeout(() => alert(`Found ${value} at position ${i}`), 100);
          break;
        }
      }

      if (!found) {
        alert(`Value ${value} not found!`);
      }

      setTimeout(() => setHighlightIndex(-1), animationSpeed);
    },

    handleClear: () => {
      setNodes([]);
      setHighlightIndex(-1);
    },

    generateRandomData: () => {
      const count = 4 + Math.floor(Math.random() * 5);
      const randomNodes = [];
      for (let i = 0; i < count; i++) {
        let value;
        do {
          value = Math.floor(Math.random() * 100) + 1;
        } while (randomNodes.includes(value));
        randomNodes.push(value);
      }
      setNodes(randomNodes);
      setHighlightIndex(-1);
    },
  }));

  const drawLinkedList = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (nodes.length === 0) {
      ctx.fillStyle = "#7f8c8d";
      ctx.font = "18px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Empty List", canvas.width / 2, canvas.height / 2);
      return;
    }

    const startX = 50;
    const startY = 100;
    const nodeWidth = 60;
    const nodeHeight = 40;
    const spacing = 100;

    nodes.forEach((value, index) => {
      const x = startX + index * spacing;
      const y = startY;

      // Draw node background
      ctx.fillStyle = index === highlightIndex ? "#e74c3c" : "#3498db";
      ctx.fillRect(x, y, nodeWidth, nodeHeight);

      // Draw node border
      ctx.strokeStyle = "#2c3e50";
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, nodeWidth, nodeHeight);

      // Draw value text
      ctx.fillStyle = "white";
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(value, x + nodeWidth / 2, y + nodeHeight / 2);

      // Draw arrow to next node or null
      if (index < nodes.length - 1) {
        const arrowStartX = x + nodeWidth;
        const arrowEndX = x + spacing - 10;
        const arrowY = y + nodeHeight / 2;

        // Arrow line
        ctx.beginPath();
        ctx.moveTo(arrowStartX, arrowY);
        ctx.lineTo(arrowEndX, arrowY);
        ctx.strokeStyle = "#2c3e50";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Arrow head
        ctx.beginPath();
        ctx.moveTo(arrowEndX, arrowY);
        ctx.lineTo(arrowEndX - 15, arrowY - 8);
        ctx.moveTo(arrowEndX, arrowY);
        ctx.lineTo(arrowEndX - 15, arrowY + 8);
        ctx.stroke();
      } else {
        // Draw "null" pointer for last node
        ctx.fillStyle = "#7f8c8d";
        ctx.font = "14px Arial";
        ctx.textAlign = "left";
        ctx.fillText("null", x + nodeWidth + 10, y + nodeHeight / 2 + 5);
      }
    });
  }, [nodes, highlightIndex]);

  useEffect(() => {
    const timer = setTimeout(() => {
      drawLinkedList();
    }, 50);
    return () => clearTimeout(timer);
  }, [drawLinkedList]);

  return (
    <div className="visualizer">
      <div className="canvas-container">
        
          <canvas
            ref={canvasRef}
            width={800}
            height={200}
            className="visualization-canvas"
          />
      </div>

      <div className="status-info">
        <div className="info-grid">
          <div className="info-item">
            <strong>Length:</strong> {nodes.length}
          </div>
          <div className="info-item">
            <strong>Elements:</strong>{" "}
            {nodes.length > 0 ? nodes.join(", ") : "Empty"}
          </div>
        </div>

        {highlightIndex !== -1 && (
          <div className="highlight-info">
            <p>
              <strong>🔍 Highlighting:</strong> Position {highlightIndex}{" "}
              (Value: {nodes[highlightIndex]})
            </p>
          </div>
        )}
      </div>

      <div className="complexity-info">
        <h4>Linked List Complexity</h4>
        <div className="complexity-grid">
          <div className="complexity-item">
            <strong>Insert at end:</strong>{" "}
            <span className="complexity-value">O(n)</span>
          </div>
          <div className="complexity-item">
            <strong>Delete by value:</strong>{" "}
            <span className="complexity-value">O(n)</span>
          </div>
          <div className="complexity-item">
            <strong>Search:</strong>{" "}
            <span className="complexity-value">O(n)</span>
          </div>
          <div className="complexity-item">
            <strong>Insert at head:</strong>{" "}
            <span className="complexity-value">O(1)</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default LinkedListVisualizer;
