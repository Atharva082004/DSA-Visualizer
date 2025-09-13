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

const TreeVisualizer = forwardRef(({ animationSpeed }, ref) => {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([50, 30, 70, 20, 40, 60, 80]);
  const [highlightedNodes, setHighlightedNodes] = useState([]);
  const [traversalResult, setTraversalResult] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [showOperations, setShowOperations] = useState(true);

  // Binary Search Tree implementation
  class TreeNode {
    constructor(value) {
      this.value = value;
      this.left = null;
      this.right = null;
    }
  }

  const buildTree = (values) => {
    if (!values.length) return null;

    let root = null;
    values.forEach((value) => {
      root = insertNode(root, value);
    });
    return root;
  };

  const insertNode = (root, value) => {
    if (!root) return new TreeNode(value);

    if (value < root.value) {
      root.left = insertNode(root.left, value);
    } else if (value > root.value) {
      root.right = insertNode(root.right, value);
    }
    return root;
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    handleInsert: (value) => {
      if (!nodes.includes(value)) {
        const newNodes = [...nodes, value];
        setNodes(newNodes);
        setHighlightedNodes([value]);
        setTimeout(() => setHighlightedNodes([]), animationSpeed);
      } else {
        alert(`Value ${value} already exists!`);
      }
    },

    handleDelete: (value) => {
      const index = nodes.findIndex((node) => node === value);
      if (index !== -1) {
        setHighlightedNodes([value]);
        setTimeout(() => {
          const newNodes = nodes.filter((node) => node !== value);
          setNodes(newNodes);
          setHighlightedNodes([]);
        }, animationSpeed);
      } else {
        alert(`Value ${value} not found!`);
      }
    },

    handleSearch: async (value) => {
      const tree = buildTree(nodes);
      let current = tree;
      const searchPath = [];

      while (current) {
        searchPath.push(current.value);
        setHighlightedNodes([current.value]);
        await new Promise((resolve) => setTimeout(resolve, animationSpeed));

        if (current.value === value) {
          alert(`Found ${value}!`);
          setTraversalResult(`Search path: ${searchPath.join(" → ")}`);
          return;
        }

        current = value < current.value ? current.left : current.right;
      }

      alert(`Value ${value} not found!`);
      setTraversalResult(`Search path: ${searchPath.join(" → ")} (not found)`);
      setHighlightedNodes([]);
    },

    inorderTraversal: async () => {
      const result = [];
      const tree = buildTree(nodes);

      const inorder = async (node) => {
        if (node) {
          await inorder(node.left);
          result.push(node.value);
          setHighlightedNodes([node.value]);
          await new Promise((resolve) => setTimeout(resolve, animationSpeed));
          await inorder(node.right);
        }
      };

      await inorder(tree);
      setTraversalResult(`Inorder: ${result.join(", ")}`);
      setHighlightedNodes([]);
    },

    preorderTraversal: async () => {
      const result = [];
      const tree = buildTree(nodes);

      const preorder = async (node) => {
        if (node) {
          result.push(node.value);
          setHighlightedNodes([node.value]);
          await new Promise((resolve) => setTimeout(resolve, animationSpeed));
          await preorder(node.left);
          await preorder(node.right);
        }
      };

      await preorder(tree);
      setTraversalResult(`Preorder: ${result.join(", ")}`);
      setHighlightedNodes([]);
    },

    postorderTraversal: async () => {
      const result = [];
      const tree = buildTree(nodes);

      const postorder = async (node) => {
        if (node) {
          await postorder(node.left);
          await postorder(node.right);
          result.push(node.value);
          setHighlightedNodes([node.value]);
          await new Promise((resolve) => setTimeout(resolve, animationSpeed));
        }
      };

      await postorder(tree);
      setTraversalResult(`Postorder: ${result.join(", ")}`);
      setHighlightedNodes([]);
    },

    handleClear: () => {
      setNodes([]);
      setHighlightedNodes([]);
      setTraversalResult("");
    },

    generateRandomData: () => {
      const count = 5 + Math.floor(Math.random() * 6);
      const randomNodes = [];
      for (let i = 0; i < count; i++) {
        let value;
        do {
          value = Math.floor(Math.random() * 100) + 1;
        } while (randomNodes.includes(value));
        randomNodes.push(value);
      }
      setNodes(randomNodes);
      setHighlightedNodes([]);
      setTraversalResult("");
    },
  }));

  const drawTree = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (nodes.length === 0) {
      ctx.fillStyle = "#7f8c8d";
      ctx.font = "18px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Empty Tree", canvas.width / 2, canvas.height / 2);
      return;
    }

    const tree = buildTree(nodes);
    const positions = new Map();

    // Calculate positions
    const calculatePositions = (node, x, y, xOffset) => {
      if (!node) return;

      positions.set(node.value, { x, y });

      if (node.left) {
        calculatePositions(node.left, x - xOffset, y + 80, xOffset / 2);
      }
      if (node.right) {
        calculatePositions(node.right, x + xOffset, y + 80, xOffset / 2);
      }
    };

    calculatePositions(tree, canvas.width / 2, 50, 150);

    // Draw edges
    const drawEdges = (node) => {
      if (!node) return;

      const pos = positions.get(node.value);

      if (node.left) {
        const leftPos = positions.get(node.left.value);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y + 20);
        ctx.lineTo(leftPos.x, leftPos.y - 20);
        ctx.strokeStyle = "#2c3e50";
        ctx.lineWidth = 2;
        ctx.stroke();
        drawEdges(node.left);
      }

      if (node.right) {
        const rightPos = positions.get(node.right.value);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y + 20);
        ctx.lineTo(rightPos.x, rightPos.y - 20);
        ctx.strokeStyle = "#2c3e50";
        ctx.lineWidth = 2;
        ctx.stroke();
        drawEdges(node.right);
      }
    };

    // Draw nodes
    const drawNodes = (node) => {
      if (!node) return;

      const pos = positions.get(node.value);
      const isHighlighted = highlightedNodes.includes(node.value);

      // Draw node circle
      ctx.fillStyle = isHighlighted ? "#e74c3c" : "#3498db";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 20, 0, 2 * Math.PI);
      ctx.fill();

      // Draw border
      ctx.strokeStyle = "#2c3e50";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw value
      ctx.fillStyle = "white";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.value, pos.x, pos.y);

      drawNodes(node.left);
      drawNodes(node.right);
    };

    drawEdges(tree);
    drawNodes(tree);
  }, [nodes, highlightedNodes]);

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

      <div className="status-info">
        <div className="info-grid">
          <div className="info-item">
            <strong>Nodes:</strong> {nodes.length}
          </div>
          <div className="info-item">
            <strong>Height:</strong>{" "}
            {nodes.length > 0 ? Math.ceil(Math.log2(nodes.length + 1)) : 0}
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
            🌳 BST Complexity & Operations Analysis
            <span className={`arrow ${showOperations ? "up" : "down"}`}>▼</span>
          </button>
        </div>

        {showOperations && (
          <div className="operations-content">
            <div className="complexity-info">
              <h4>Time Complexity Analysis</h4>
              <div className="complexity-grid">
                <div className="complexity-item">
                  <strong>Search:</strong>{" "}
                  <span className="complexity-value">
                    O(log n) avg, O(n) worst
                  </span>
                  <p className="complexity-explanation">
                    Depends on tree balance
                  </p>
                </div>
                <div className="complexity-item">
                  <strong>Insert:</strong>{" "}
                  <span className="complexity-value">
                    O(log n) avg, O(n) worst
                  </span>
                  <p className="complexity-explanation">
                    Similar to search path
                  </p>
                </div>
                <div className="complexity-item">
                  <strong>Delete:</strong>{" "}
                  <span className="complexity-value">
                    O(log n) avg, O(n) worst
                  </span>
                  <p className="complexity-explanation">
                    Find + restructure operations
                  </p>
                </div>
                <div className="complexity-item">
                  <strong>Traversals:</strong>{" "}
                  <span className="complexity-value">O(n)</span>
                  <p className="complexity-explanation">
                    Must visit every node
                  </p>
                </div>
              </div>
            </div>

            <div className="traversal-info">
              <h4>🔄 Traversal Methods</h4>
              <div className="operation-grid">
                <div className="operation-card">
                  <h5>📋 Inorder (Left-Root-Right)</h5>
                  <ul>
                    <li>Produces sorted sequence</li>
                    <li>Most commonly used</li>
                    <li>Perfect for BST validation</li>
                  </ul>
                </div>
                <div className="operation-card">
                  <h5>📝 Preorder (Root-Left-Right)</h5>
                  <ul>
                    <li>Root processed first</li>
                    <li>Good for tree copying</li>
                    <li>Expression tree evaluation</li>
                  </ul>
                </div>
                <div className="operation-card">
                  <h5>📊 Postorder (Left-Right-Root)</h5>
                  <ul>
                    <li>Root processed last</li>
                    <li>Good for tree deletion</li>
                    <li>Directory size calculation</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="comparison-section">
              <h4>⚖️ BST vs Other Data Structures</h4>
              <div className="comparison-table">
                <table>
                  <thead>
                    <tr>
                      <th>Operation</th>
                      <th>BST (Balanced)</th>
                      <th>Array (Sorted)</th>
                      <th>Linked List</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Search</td>
                      <td>O(log n)</td>
                      <td>O(log n)</td>
                      <td>O(n)</td>
                    </tr>
                    <tr>
                      <td>Insert</td>
                      <td>O(log n)</td>
                      <td>O(n)</td>
                      <td>O(1)*</td>
                    </tr>
                    <tr>
                      <td>Delete</td>
                      <td>O(log n)</td>
                      <td>O(n)</td>
                      <td>O(n)</td>
                    </tr>
                    <tr>
                      <td>Sorted Output</td>
                      <td>O(n)</td>
                      <td>O(n)</td>
                      <td>O(n log n)</td>
                    </tr>
                  </tbody>
                </table>
                <small>
                  *Linked List insert is O(1) at head, O(n) for sorted insertion
                </small>
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
              title="🌳 Tree Node Structure"
              defaultOpen={true}
            >
              <pre className="code-block">
                <code>{`// Binary Search Tree Node Structure
struct TreeNode {
    int data;
    TreeNode* left;
    TreeNode* right;
    
    // Constructor
    TreeNode(int val) : data(val), left(nullptr), right(nullptr) {}
};

class BinarySearchTree {
private:
    TreeNode* root;
    
public:
    // Initialize empty tree
    BinarySearchTree() : root(nullptr) {}
    
    // Destructor to free memory
    ~BinarySearchTree() {
        destroyTree(root);
    }
    
private:
    // Helper function to destroy tree
    void destroyTree(TreeNode* node) {
        if (node) {
            destroyTree(node->left);
            destroyTree(node->right);
            delete node;
        }
    }
};`}</code>
              </pre>
            </CollapsibleSection>

            <CollapsibleSection title="➕ Insert Operations">
              <pre className="code-block">
                <code>{`// Public insert function
void insert(int value) {
    root = insertHelper(root, value);
}

// Private recursive insert helper
TreeNode* insertHelper(TreeNode* node, int value) {
    // Base case: create new node
    if (!node) {
        return new TreeNode(value);
    }
    
    // Recursive case: find correct position
    if (value < node->data) {
        node->left = insertHelper(node->left, value);
    }
    else if (value > node->data) {
        node->right = insertHelper(node->right, value);
    }
    // If value already exists, do nothing
    
    return node;
}

// Iterative insert (alternative approach)
void insertIterative(int value) {
    if (!root) {
        root = new TreeNode(value);
        return;
    }
    
    TreeNode* current = root;
    TreeNode* parent = nullptr;
    
    while (current) {
        parent = current;
        if (value < current->data) {
            current = current->left;
        }
        else if (value > current->data) {
            current = current->right;
        }
        else {
            return; // Value already exists
        }
    }
    
    // Insert as child of parent
    if (value < parent->data) {
        parent->left = new TreeNode(value);
    }
    else {
        parent->right = new TreeNode(value);
    }
}`}</code>
              </pre>
            </CollapsibleSection>

            <CollapsibleSection title="🔍 Search Operations">
              <pre className="code-block">
                <code>{`// Public search function
bool search(int value) {
    return searchHelper(root, value);
}

// Private recursive search helper
bool searchHelper(TreeNode* node, int value) {
    // Base case: node not found
    if (!node) return false;
    
    // Base case: value found
    if (node->data == value) return true;
    
    // Recursive case: search appropriate subtree
    if (value < node->data) {
        return searchHelper(node->left, value);
    }
    else {
        return searchHelper(node->right, value);
    }
}

// Iterative search (more efficient)
bool searchIterative(int value) {
    TreeNode* current = root;
    
    while (current) {
        if (value == current->data) {
            return true;
        }
        else if (value < current->data) {
            current = current->left;
        }
        else {
            current = current->right;
        }
    }
    
    return false;
}

// Find minimum value in tree
TreeNode* findMin(TreeNode* node) {
    while (node && node->left) {
        node = node->left;
    }
    return node;
}

// Find maximum value in tree
TreeNode* findMax(TreeNode* node) {
    while (node && node->right) {
        node = node->right;
    }
    return node;
}`}</code>
              </pre>
            </CollapsibleSection>

            <CollapsibleSection title="🗑️ Delete Operations">
              <pre className="code-block">
                <code>{`// Public delete function
void remove(int value) {
    root = deleteHelper(root, value);
}

// Private recursive delete helper
TreeNode* deleteHelper(TreeNode* node, int value) {
    // Base case: node not found
    if (!node) return node;
    
    // Find the node to delete
    if (value < node->data) {
        node->left = deleteHelper(node->left, value);
    }
    else if (value > node->data) {
        node->right = deleteHelper(node->right, value);
    }
    else {
        // Node to delete found
        
        // Case 1: Node has no children (leaf node)
        if (!node->left && !node->right) {
            delete node;
            return nullptr;
        }
        
        // Case 2: Node has only one child
        if (!node->left) {
            TreeNode* temp = node->right;
            delete node;
            return temp;
        }
        if (!node->right) {
            TreeNode* temp = node->left;
            delete node;
            return temp;
        }
        
        // Case 3: Node has two children
        // Find inorder successor (smallest node in right subtree)
        TreeNode* successor = findMin(node->right);
        
        // Replace node's data with successor's data
        node->data = successor->data;
        
        // Delete the successor
        node->right = deleteHelper(node->right, successor->data);
    }
    
    return node;
}`}</code>
              </pre>
            </CollapsibleSection>

            <CollapsibleSection title="🔄 Traversal Operations">
              <pre className="code-block">
                <code>{`// Inorder Traversal (Left-Root-Right)
void inorderTraversal(TreeNode* node) {
    if (node) {
        inorderTraversal(node->left);
        cout << node->data << " ";
        inorderTraversal(node->right);
    }
}

// Preorder Traversal (Root-Left-Right)
void preorderTraversal(TreeNode* node) {
    if (node) {
        cout << node->data << " ";
        preorderTraversal(node->left);
        preorderTraversal(node->right);
    }
}

// Postorder Traversal (Left-Right-Root)
void postorderTraversal(TreeNode* node) {
    if (node) {
        postorderTraversal(node->left);
        postorderTraversal(node->right);
        cout << node->data << " ";
    }
}

// Level Order Traversal (Breadth-First)
void levelOrderTraversal() {
    if (!root) return;
    
    queue<TreeNode*> q;
    q.push(root);
    
    while (!q.empty()) {
        TreeNode* current = q.front();
        q.pop();
        
        cout << current->data << " ";
        
        if (current->left) q.push(current->left);
        if (current->right) q.push(current->right);
    }
}

// Public traversal wrappers
void printInorder() {
    cout << "Inorder: ";
    inorderTraversal(root);
    cout << endl;
}

void printPreorder() {
    cout << "Preorder: ";
    preorderTraversal(root);
    cout << endl;
}

void printPostorder() {
    cout << "Postorder: ";
    postorderTraversal(root);
    cout << endl;
}`}</code>
              </pre>
            </CollapsibleSection>

            <CollapsibleSection title="🚀 Complete BST Example">
              <pre className="code-block">
                <code>{`#include <iostream>
#include <queue>
using namespace std;

int main() {
    BinarySearchTree bst;
    
    cout << "=== Binary Search Tree Demo ===" << endl;
    
    // Insert elements
    cout << "\\n1. Inserting elements: 50, 30, 70, 20, 40, 60, 80" << endl;
    bst.insert(50);
    bst.insert(30);
    bst.insert(70);
    bst.insert(20);
    bst.insert(40);
    bst.insert(60);
    bst.insert(80);
    
    // Traversals
    cout << "\\n2. Tree Traversals:" << endl;
    bst.printInorder();    // 20 30 40 50 60 70 80 (sorted!)
    bst.printPreorder();   // 50 30 20 40 70 60 80
    bst.printPostorder();  // 20 40 30 60 80 70 50
    
    // Search operations
    cout << "\\n3. Search Operations:" << endl;
    cout << "Search 40: " << (bst.search(40) ? "Found" : "Not Found") << endl;
    cout << "Search 25: " << (bst.search(25) ? "Found" : "Not Found") << endl;
    
    // Delete operations
    cout << "\\n4. Delete Operations:" << endl;
    cout << "Deleting 20 (leaf node)" << endl;
    bst.remove(20);
    bst.printInorder();
    
    cout << "Deleting 30 (node with two children)" << endl;
    bst.remove(30);
    bst.printInorder();
    
    cout << "Deleting 50 (root with two children)" << endl;
    bst.remove(50);
    bst.printInorder();
    
    return 0;
}

/* Expected Output:
=== Binary Search Tree Demo ===

1. Inserting elements: 50, 30, 70, 20, 40, 60, 80

2. Tree Traversals:
Inorder: 20 30 40 50 60 70 80
Preorder: 50 30 20 40 70 60 80
Postorder: 20 40 30 60 80 70 50

3. Search Operations:
Search 40: Found
Search 25: Not Found

4. Delete Operations:
Deleting 20 (leaf node)
Inorder: 30 40 50 60 70 80
Deleting 30 (node with two children)
Inorder: 40 50 60 70 80
Deleting 50 (root with two children)
Inorder: 40 60 70 80
*/`}</code>
              </pre>
            </CollapsibleSection>
          </div>
        )}
      </div>
    </div>
  );
});

export default TreeVisualizer;
