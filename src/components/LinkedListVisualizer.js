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

const LinkedListVisualizer = forwardRef(({ animationSpeed }, ref) => {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([10, 20, 30]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [showCode, setShowCode] = useState(false);
  const [showOperations, setShowOperations] = useState(true); // 🔥 NEW: Toggle for operations

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

      {/* 🔥 NEW: Collapsible Operations Section */}
      <div className="operations-section">
        <div className="section-header">
          <button
            className="section-toggle-btn"
            onClick={() => setShowOperations(!showOperations)}
          >
            📊 Complexity & Operations Analysis
            <span className={`arrow ${showOperations ? "up" : "down"}`}>▼</span>
          </button>
        </div>
        {showOperations && (
          <div className="operations-content">
            <div className="complexity-info">
              <h4>Time Complexity Analysis</h4>
              <div className="complexity-grid">
                <div className="complexity-item">
                  <strong>Insert at end:</strong>{" "}
                  <span className="complexity-value">O(n)</span>
                  <p className="complexity-explanation">
                    Must traverse to the end of the list
                  </p>
                </div>
                <div className="complexity-item">
                  <strong>Insert at head:</strong>{" "}
                  <span className="complexity-value">O(1)</span>
                  <p className="complexity-explanation">
                    Direct access to head pointer
                  </p>
                </div>
                <div className="complexity-item">
                  <strong>Delete by value:</strong>{" "}
                  <span className="complexity-value">O(n)</span>
                  <p className="complexity-explanation">
                    May need to search entire list
                  </p>
                </div>
                <div className="complexity-item">
                  <strong>Search:</strong>{" "}
                  <span className="complexity-value">O(n)</span>
                  <p className="complexity-explanation">
                    Linear search through nodes
                  </p>
                </div>
              </div>
            </div>
            <div className="comparison-section">
              <h4>⚖️ Linked List vs Array</h4>
              <div className="comparison-table">
                <table>
                  <thead>
                    <tr>
                      <th>Operation</th>
                      <th>Linked List</th>
                      <th>Array</th>
                      <th>Winner</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Access by Index</td>
                      <td>O(n)</td>
                      <td>O(1)</td>
                      <td>🏆 Array</td>
                    </tr>
                    <tr>
                      <td>Insert at Beginning</td>
                      <td>O(1)</td>
                      <td>O(n)</td>
                      <td>🏆 Linked List</td>
                    </tr>
                    <tr>
                      <td>Insert at End</td>
                      <td>O(n)</td>
                      <td>O(1)*</td>
                      <td>🏆 Array*</td>
                    </tr>
                    <tr>
                      <td>Memory Usage</td>
                      <td>Higher</td>
                      <td>Lower</td>
                      <td>🏆 Array</td>
                    </tr>
                  </tbody>
                </table>
                <small>
                  *Array insert at end is O(1) amortized with dynamic arrays
                </small>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🔥 C++ Code Implementation Section (Already Collapsible) */}
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
            {/* Node Structure - Collapsible */}
            <CollapsibleSection
              title="📋 Node Structure & Initialization"
              defaultOpen={true}
            >
              <pre className="code-block">
                <code>{`// Node structure definition
struct ListNode {
    int data;
    ListNode* next;
    
    // Constructor
    ListNode(int val) : data(val), next(nullptr) {}
};

class LinkedList {
private:
    ListNode* head;
    
public:
    // Initialize empty list
    LinkedList() : head(nullptr) {}
    
    // Destructor to free memory
    ~LinkedList() {
        while (head) {
            ListNode* temp = head;
            head = head->next;
            delete temp;
        }
    }
};`}</code>
              </pre>
            </CollapsibleSection>

            {/* Insert Operation - Collapsible */}
            <CollapsibleSection title="➕ Insert Operations">
              <pre className="code-block">
                <code>{`// Insert at the end of the list
void insertAtEnd(int value) {
    ListNode* newNode = new ListNode(value);
    
    // If list is empty, make new node the head
    if (!head) {
        head = newNode;
        return;
    }
    
    // Traverse to the last node
    ListNode* current = head;
    while (current->next) {
        current = current->next;
    }
    
    // Link the new node
    current->next = newNode;
}

// Insert at the beginning (O(1) operation)
void insertAtHead(int value) {
    ListNode* newNode = new ListNode(value);
    newNode->next = head;
    head = newNode;
}

// Insert at specific position
void insertAtPosition(int value, int position) {
    if (position == 0) {
        insertAtHead(value);
        return;
    }
    
    ListNode* newNode = new ListNode(value);
    ListNode* current = head;
    
    // Traverse to position-1
    for (int i = 0; i < position - 1 && current; i++) {
        current = current->next;
    }
    
    if (current) {
        newNode->next = current->next;
        current->next = newNode;
    }
}`}</code>
              </pre>
            </CollapsibleSection>

            {/* Delete Operation - Collapsible */}
            <CollapsibleSection title="🗑️ Delete Operations">
              <pre className="code-block">
                <code>{`// Delete a node by value
bool deleteByValue(int value) {
    // If list is empty
    if (!head) return false;
    
    // If head node contains the value
    if (head->data == value) {
        ListNode* temp = head;
        head = head->next;
        delete temp;
        return true;
    }
    
    // Search for the node to delete
    ListNode* current = head;
    while (current->next && current->next->data != value) {
        current = current->next;
    }
    
    // If value not found
    if (!current->next) return false;
    
    // Delete the node
    ListNode* nodeToDelete = current->next;
    current->next = current->next->next;
    delete nodeToDelete;
    return true;
}

// Delete at specific position
bool deleteAtPosition(int position) {
    if (!head || position < 0) return false;
    
    // Delete head
    if (position == 0) {
        ListNode* temp = head;
        head = head->next;
        delete temp;
        return true;
    }
    
    // Find node before position
    ListNode* current = head;
    for (int i = 0; i < position - 1 && current->next; i++) {
        current = current->next;
    }
    
    if (current->next) {
        ListNode* nodeToDelete = current->next;
        current->next = current->next->next;
        delete nodeToDelete;
        return true;
    }
    
    return false;
}`}</code>
              </pre>
            </CollapsibleSection>

            {/* Search Operation - Collapsible */}
            <CollapsibleSection title="🔍 Search Operations">
              <pre className="code-block">
                <code>{`// Search for a value in the list
int search(int value) {
    ListNode* current = head;
    int position = 0;
    
    while (current) {
        if (current->data == value) {
            return position;  // Return position if found
        }
        current = current->next;
        position++;
    }
    
    return -1;  // Return -1 if not found
}

// Check if value exists
bool contains(int value) {
    return search(value) != -1;
}

// Get value at specific position
int getValueAt(int position) {
    ListNode* current = head;
    int currentPos = 0;
    
    while (current && currentPos < position) {
        current = current->next;
        currentPos++;
    }
    
    if (current) {
        return current->data;
    }
    
    throw out_of_range("Position out of bounds");
}`}</code>
              </pre>
            </CollapsibleSection>

            {/* Display Operations - Collapsible */}
            <CollapsibleSection title="📺 Display & Utility Operations">
              <pre className="code-block">
                <code>{`// Display the entire list
void display() {
    if (!head) {
        cout << "List is empty" << endl;
        return;
    }
    
    ListNode* current = head;
    cout << "List: ";
    
    while (current) {
        cout << current->data;
        if (current->next) cout << " -> ";
        current = current->next;
    }
    
    cout << " -> NULL" << endl;
}

// Get list size
int size() {
    int count = 0;
    ListNode* current = head;
    
    while (current) {
        count++;
        current = current->next;
    }
    
    return count;
}

// Check if list is empty
bool isEmpty() {
    return head == nullptr;
}

// Clear entire list
void clear() {
    while (head) {
        ListNode* temp = head;
        head = head->next;
        delete temp;
    }
}

// Reverse the list
void reverse() {
    ListNode* prev = nullptr;
    ListNode* current = head;
    ListNode* next = nullptr;
    
    while (current) {
        next = current->next;
        current->next = prev;
        prev = current;
        current = next;
    }
    
    head = prev;
}`}</code>
              </pre>
            </CollapsibleSection>

            {/* Complete Example - Collapsible */}
            <CollapsibleSection title="🚀 Complete Usage Example">
              <pre className="code-block">
                <code>{`#include <iostream>
#include <stdexcept>
using namespace std;

int main() {
    LinkedList list;
    
    cout << "=== Linked List Demo ===" << endl;
    
    // Test insertions
    cout << "\\n1. Inserting elements..." << endl;
    list.insertAtEnd(10);
    list.insertAtEnd(20);
    list.insertAtHead(5);
    list.insertAtPosition(15, 2);
    
    list.display();  // 5 -> 10 -> 15 -> 20 -> NULL
    cout << "Size: " << list.size() << endl;
    
    // Test search
    cout << "\\n2. Searching..." << endl;
    int pos = list.search(15);
    if (pos != -1) {
        cout << "Found 15 at position " << pos << endl;
    }
    
    // Test deletion
    cout << "\\n3. Deleting elements..." << endl;
    if (list.deleteByValue(15)) {
        cout << "Deleted 15 successfully" << endl;
    }
    
    list.display();  // 5 -> 10 -> 20 -> NULL
    
    // Test reverse
    cout << "\\n4. Reversing list..." << endl;
    list.reverse();
    list.display();  // 20 -> 10 -> 5 -> NULL
    
    // Test utility functions
    cout << "\\n5. Utility operations..." << endl;
    cout << "Is empty: " << (list.isEmpty() ? "Yes" : "No") << endl;
    cout << "Value at position 1: " << list.getValueAt(1) << endl;
    
    // Clean up
    list.clear();
    cout << "\\nAfter clearing..." << endl;
    list.display();  // List is empty
    
    return 0;
}

/* Expected Output:
=== Linked List Demo ===

1. Inserting elements...
List: 5 -> 10 -> 15 -> 20 -> NULL
Size: 4

2. Searching...
Found 15 at position 2

3. Deleting elements...
Deleted 15 successfully
List: 5 -> 10 -> 20 -> NULL

4. Reversing list...
List: 20 -> 10 -> 5 -> NULL

5. Utility operations...
Is empty: No
Value at position 1: 10

After clearing...
List is empty
*/`}</code>
              </pre>
            </CollapsibleSection>
          </div>
        )}
      </div>
    </div>
  );
});

export default LinkedListVisualizer;
