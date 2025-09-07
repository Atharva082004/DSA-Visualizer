import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";

const TreeVisualizer = forwardRef(({ animationSpeed }, ref) => {
  const canvasRef = useRef(null);
  const [tree, setTree] = useState({
    value: 50,
    left: { value: 30, left: { value: 20 }, right: { value: 40 } },
    right: { value: 70, left: { value: 60 }, right: { value: 80 } },
  });
  const [highlightNode, setHighlightNode] = useState(null);
  const [traversalOrder, setTraversalOrder] = useState([]);
  const [isTraversing, setIsTraversing] = useState(false);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    handleInsert: (value) => {
      const insert = (node, val) => {
        if (!node) return { value: val };
        if (val < node.value) {
          node.left = insert(node.left, val);
        } else if (val > node.value) {
          node.right = insert(node.right, val);
        } else {
          alert(`Value ${val} already exists in tree!`);
          return node;
        }
        return node;
      };

      setTree((prev) => ({
        ...insert(JSON.parse(JSON.stringify(prev)), value),
      }));
    },

    handleDelete: (value) => {
      const deleteNode = (node, val) => {
        if (!node) {
          alert(`Value ${val} not found in tree!`);
          return null;
        }

        if (val < node.value) {
          node.left = deleteNode(node.left, val);
        } else if (val > node.value) {
          node.right = deleteNode(node.right, val);
        } else {
          // Node to be deleted found
          if (!node.left) return node.right;
          if (!node.right) return node.left;

          // Node with two children
          let minNode = node.right;
          while (minNode.left) minNode = minNode.left;
          node.value = minNode.value;
          node.right = deleteNode(node.right, minNode.value);
        }
        return node;
      };

      setTree((prev) => deleteNode(JSON.parse(JSON.stringify(prev)), value));
    },

    handleSearch: async (value) => {
      setIsTraversing(true);
      const search = async (node, val) => {
        if (!node) {
          alert(`Value ${val} not found in tree!`);
          return false;
        }

        setHighlightNode(node.value);
        await new Promise((resolve) => setTimeout(resolve, animationSpeed));

        if (val === node.value) {
          alert(`Value ${val} found in tree!`);
          return true;
        } else if (val < node.value) {
          return await search(node.left, val);
        } else {
          return await search(node.right, val);
        }
      };

      await search(tree, value);
      setHighlightNode(null);
      setIsTraversing(false);
    },

    inorderTraversal: async () => {
      if (isTraversing) return;

      setIsTraversing(true);
      const result = [];
      const traverse = async (node) => {
        if (!node) return;

        await traverse(node.left);

        setHighlightNode(node.value);
        result.push(node.value);
        await new Promise((resolve) => setTimeout(resolve, animationSpeed));

        await traverse(node.right);
      };

      await traverse(tree);
      setTraversalOrder(result);
      setHighlightNode(null);
      setIsTraversing(false);
    },

    preorderTraversal: async () => {
      if (isTraversing) return;

      setIsTraversing(true);
      const result = [];
      const traverse = async (node) => {
        if (!node) return;

        setHighlightNode(node.value);
        result.push(node.value);
        await new Promise((resolve) => setTimeout(resolve, animationSpeed));

        await traverse(node.left);
        await traverse(node.right);
      };

      await traverse(tree);
      setTraversalOrder(result);
      setHighlightNode(null);
      setIsTraversing(false);
    },

    postorderTraversal: async () => {
      if (isTraversing) return;

      setIsTraversing(true);
      const result = [];
      const traverse = async (node) => {
        if (!node) return;

        await traverse(node.left);
        await traverse(node.right);

        setHighlightNode(node.value);
        result.push(node.value);
        await new Promise((resolve) => setTimeout(resolve, animationSpeed));
      };

      await traverse(tree);
      setTraversalOrder(result);
      setHighlightNode(null);
      setIsTraversing(false);
    },

    generateRandomData: () => {
      const values = [];
      const count = 7 + Math.floor(Math.random() * 6);

      for (let i = 0; i < count; i++) {
        let value;
        do {
          value = Math.floor(Math.random() * 100) + 1;
        } while (values.includes(value));
        values.push(value);
      }

      let newTree = null;
      const insert = (node, val) => {
        if (!node) return { value: val };
        if (val < node.value) {
          node.left = insert(node.left, val);
        } else if (val > node.value) {
          node.right = insert(node.right, val);
        }
        return node;
      };

      values.forEach((val) => {
        newTree = insert(newTree, val);
      });

      setTree(newTree);
      setHighlightNode(null);
      setTraversalOrder([]);
      setIsTraversing(false);
    },
  }));

  const drawTree = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!tree) {
      ctx.fillStyle = "#7f8c8d";
      ctx.font = "18px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Empty Tree", canvas.width / 2, canvas.height / 2);
      return;
    }

    const drawNode = (node, x, y, offset) => {
      if (!node) return;

      // Draw connections first
      if (node.left) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - offset, y + 80);
        ctx.strokeStyle = "#34495e";
        ctx.lineWidth = 2;
        ctx.stroke();
        drawNode(node.left, x - offset, y + 80, offset / 2);
      }

      if (node.right) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + offset, y + 80);
        ctx.strokeStyle = "#34495e";
        ctx.lineWidth = 2;
        ctx.stroke();
        drawNode(node.right, x + offset, y + 80, offset / 2);
      }

      // Draw node
      const radius = 25;
      ctx.fillStyle = highlightNode === node.value ? "#e74c3c" : "#3498db";
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();

      ctx.strokeStyle = "#2c3e50";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw value
      ctx.fillStyle = "white";
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.value, x, y);
    };

    drawNode(tree, 400, 50, 150);
  }, [tree, highlightNode]);

  useEffect(() => {
    drawTree();
  }, [drawTree]);

  return (
    <div className="visualizer">
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="visualization-canvas"
        />
      </div>

      <div className="tree-info">
        {traversalOrder.length > 0 && (
          <div className="traversal-result">
            <h5>Last Traversal Result:</h5>
            <p>{traversalOrder.join(" → ")}</p>
          </div>
        )}

        {isTraversing && (
          <div className="traversal-status">
            <p>
              <strong>🔄 Traversal in progress...</strong>
            </p>
          </div>
        )}
      </div>

      <div className="complexity-info">
        <h4>Binary Search Tree Complexity</h4>
        <div className="complexity-grid">
          <div className="complexity-item">
            <strong>Insert:</strong>{" "}
            <span className="complexity-value">O(log n) avg, O(n) worst</span>
          </div>
          <div className="complexity-item">
            <strong>Delete:</strong>{" "}
            <span className="complexity-value">O(log n) avg, O(n) worst</span>
          </div>
          <div className="complexity-item">
            <strong>Search:</strong>{" "}
            <span className="complexity-value">O(log n) avg, O(n) worst</span>
          </div>
          <div className="complexity-item">
            <strong>Traversal:</strong>{" "}
            <span className="complexity-value">O(n)</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default TreeVisualizer;
