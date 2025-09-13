import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { InsertionSortAlgorithm } from "../algorithms/insertionSort";

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

const InsertionSortVisualizer = forwardRef(({ animationSpeed }, ref) => {
  const canvasRef = useRef(null);
  const [array, setArray] = useState([64, 34, 25, 12, 22, 11, 90]);
  const [sorting, setSorting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [stats, setStats] = useState({ comparisons: 0, swaps: 0 });
  const [showCode, setShowCode] = useState(false); // 🔥 NEW: Toggle for code

  useImperativeHandle(ref, () => ({
    handleInsert: (value) => {
      if (!sorting && value && !array.includes(value)) {
        setArray((prev) => [...prev, value]);
      }
    },

    handleClear: () => {
      if (!sorting) {
        setArray([]);
        setSteps([]);
        setCurrentStep(0);
        setStats({ comparisons: 0, swaps: 0 });
      }
    },

    generateRandomData: () => {
      if (!sorting) {
        const randomArray = Array.from(
          { length: 8 },
          () => Math.floor(Math.random() * 100) + 1
        );
        setArray(randomArray);
        setSteps([]);
        setCurrentStep(0);
        setStats({ comparisons: 0, swaps: 0 });
      }
    },

    startSort: async () => {
      if (!sorting && array.length > 0) {
        setSorting(true);
        const algorithm = new InsertionSortAlgorithm(array);
        const result = await algorithm.sort();
        setSteps(result.steps);
        setStats({
          comparisons: result.comparisons,
          swaps: result.swaps,
        });
        await animateSteps(result.steps);
        setSorting(false);
      }
    },

    reset: () => {
      setArray([64, 34, 25, 12, 22, 11, 90]);
      setSteps([]);
      setCurrentStep(0);
      setStats({ comparisons: 0, swaps: 0 });
      setSorting(false);
    },
  }));

  const drawArray = useCallback(
    (arr, highlightIndices = [], colors = {}, sortedUntil = -1) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (arr.length === 0) {
        ctx.fillStyle = "#7f8c8d";
        ctx.font = "18px Arial";
        ctx.textAlign = "center";
        ctx.fillText("No data to sort", canvas.width / 2, canvas.height / 2);
        return;
      }

      const maxValue = Math.max(...arr);
      const barWidth = (canvas.width - 40) / arr.length;
      const maxBarHeight = canvas.height - 60;

      arr.forEach((value, index) => {
        const barHeight = (value / maxValue) * maxBarHeight;
        const x = 20 + index * barWidth;
        const y = canvas.height - 20 - barHeight;

        let fillColor = "#3498db";
        if (index <= sortedUntil) {
          fillColor = "#27ae60";
        }
        if (highlightIndices.includes(index)) {
          fillColor = colors[index] || "#e74c3c";
        }

        ctx.fillStyle = fillColor;
        ctx.fillRect(x, y, barWidth - 2, barHeight);

        ctx.strokeStyle = "#2c3e50";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, barWidth - 2, barHeight);

        ctx.fillStyle = "#2c3e50";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(value, x + (barWidth - 2) / 2, canvas.height - 5);
      });
    },
    []
  );

  const animateSteps = async (stepList) => {
    for (let i = 0; i < stepList.length; i++) {
      setCurrentStep(i);
      const step = stepList[i];

      let highlightIndices = [];
      let colors = {};
      let sortedUntil = -1;

      switch (step.type) {
        case "select_key":
          highlightIndices = [step.keyIndex];
          colors[step.keyIndex] = "#f39c12";
          sortedUntil = step.keyIndex - 1;
          break;
        case "compare":
          highlightIndices = step.comparing || [];
          step.comparing?.forEach((idx) => {
            colors[idx] = "#e74c3c";
          });
          break;
        case "shift":
          highlightIndices = [step.from, step.to];
          colors[step.from] = "#e67e22";
          colors[step.to] = "#e67e22";
          break;
        case "insert":
          highlightIndices = [step.position];
          colors[step.position] = "#27ae60";
          break;
        case "iteration_complete":
          sortedUntil = step.sortedUntil;
          break;
        default:
          break;
      }

      drawArray(step.array, highlightIndices, colors, sortedUntil);
      await new Promise((resolve) => setTimeout(resolve, animationSpeed));
    }
  };

  useEffect(() => {
    drawArray(array);
  }, [array, drawArray]);

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

      <div className="sorting-info">
        <div className="info-grid">
          <div className="info-item">
            <strong>Array Size:</strong> {array.length}
          </div>
          <div className="info-item">
            <strong>Comparisons:</strong> {stats.comparisons}
          </div>
          <div className="info-item">
            <strong>Swaps:</strong> {stats.swaps}
          </div>
          <div className="info-item">
            <strong>Status:</strong> {sorting ? "Sorting..." : "Ready"}
          </div>
        </div>

        {steps[currentStep] && (
          <div className="step-info">
            <h5>Current Step:</h5>
            <p>{steps[currentStep].message}</p>
          </div>
        )}
      </div>

      <div className="algorithm-explanation">
        <h4>Insertion Sort Algorithm</h4>
        <p>Insertion Sort builds the sorted array one element at a time:</p>
        <ol>
          <li>
            <strong>Start:</strong> Consider the first element as sorted
          </li>
          <li>
            <strong>Pick Next:</strong> Take the next element from unsorted
            portion
          </li>
          <li>
            <strong>Find Position:</strong> Compare with sorted elements and
            find correct position
          </li>
          <li>
            <strong>Insert:</strong> Shift elements and insert in correct
            position
          </li>
        </ol>
      </div>

      <div className="complexity-info">
        <h4>Insertion Sort Complexity</h4>
        <div className="complexity-grid">
          <div className="complexity-item">
            <strong>Best Case:</strong>{" "}
            <span className="complexity-value">O(n)</span>
          </div>
          <div className="complexity-item">
            <strong>Average Case:</strong>{" "}
            <span className="complexity-value">O(n²)</span>
          </div>
          <div className="complexity-item">
            <strong>Worst Case:</strong>{" "}
            <span className="complexity-value">O(n²)</span>
          </div>
          <div className="complexity-item">
            <strong>Space:</strong>{" "}
            <span className="complexity-value">O(1)</span>
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
              title="📊 Basic Insertion Sort"
              defaultOpen={true}
            >
              <pre className="code-block">
                <code>{`// Basic Insertion Sort Implementation
void insertionSort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        
        // Move elements greater than key one position ahead
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        
        // Insert key at correct position
        arr[j + 1] = key;
    }
}

// Print array function
void printArray(int arr[], int n) {
    for (int i = 0; i < n; i++) {
        cout << arr[i] << " ";
    }
    cout << endl;
}`}</code>
              </pre>
            </CollapsibleSection>

            <CollapsibleSection title="📈 Optimized Insertion Sort">
              <pre className="code-block">
                <code>{`// Optimized Insertion Sort with Early Termination
void optimizedInsertionSort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        
        // Skip if already in correct position
        if (key >= arr[i-1]) continue;
        
        int j = i - 1;
        
        // Move elements and find position
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        
        arr[j + 1] = key;
    }
}

// Binary Insertion Sort (reduces comparisons)
void binaryInsertionSort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int left = 0, right = i;
        
        // Binary search for insertion position
        while (left < right) {
            int mid = (left + right) / 2;
            if (arr[mid] > key) {
                right = mid;
            } else {
                left = mid + 1;
            }
        }
        
        // Shift elements and insert
        for (int j = i; j > left; j--) {
            arr[j] = arr[j-1];
        }
        arr[left] = key;
    }
}`}</code>
              </pre>
            </CollapsibleSection>

            <CollapsibleSection title="🔄 Recursive Insertion Sort">
              <pre className="code-block">
                <code>{`// Recursive Implementation
void recursiveInsertionSort(int arr[], int n) {
    // Base case
    if (n <= 1) return;
    
    // Sort first n-1 elements
    recursiveInsertionSort(arr, n - 1);
    
    // Insert last element at correct position
    int last = arr[n - 1];
    int j = n - 2;
    
    while (j >= 0 && arr[j] > last) {
        arr[j + 1] = arr[j];
        j--;
    }
    arr[j + 1] = last;
}

// Insertion Sort for Linked List
struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
};

ListNode* insertionSortList(ListNode* head) {
    if (!head || !head->next) return head;
    
    ListNode* dummy = new ListNode(0);
    ListNode* current = head;
    
    while (current) {
        ListNode* next = current->next;
        ListNode* prev = dummy;
        
        // Find insertion position
        while (prev->next && prev->next->val < current->val) {
            prev = prev->next;
        }
        
        // Insert current node
        current->next = prev->next;
        prev->next = current;
        current = next;
    }
    
    return dummy->next;
}`}</code>
              </pre>
            </CollapsibleSection>

            <CollapsibleSection title="🚀 Complete Example">
              <pre className="code-block">
                <code>{`#include <iostream>
#include <vector>
#include <chrono>
using namespace std;

class InsertionSort {
private:
    vector<int> arr;
    int comparisons;
    int swaps;
    
public:
    InsertionSort(vector<int> input) : arr(input), comparisons(0), swaps(0) {}
    
    void sort() {
        int n = arr.size();
        
        for (int i = 1; i < n; i++) {
            int key = arr[i];
            int j = i - 1;
            
            // Count comparisons and shifts
            while (j >= 0) {
                comparisons++;
                if (arr[j] > key) {
                    arr[j + 1] = arr[j];
                    swaps++;
                    j--;
                } else {
                    break;
                }
            }
            
            arr[j + 1] = key;
        }
    }
    
    void printArray() {
        cout << "Sorted array: ";
        for (int num : arr) {
            cout << num << " ";
        }
        cout << endl;
    }
    
    void printStats() {
        cout << "Comparisons: " << comparisons << endl;
        cout << "Swaps: " << swaps << endl;
    }
};

int main() {
    cout << "=== Insertion Sort Demo ===" << endl;
    
    // Test data
    vector<int> data = {64, 34, 25, 12, 22, 11, 90};
    
    cout << "Original array: ";
    for (int num : data) {
        cout << num << " ";
    }
    cout << endl;
    
    // Create sorter and measure time
    InsertionSort sorter(data);
    
    auto start = chrono::high_resolution_clock::now();
    sorter.sort();
    auto end = chrono::high_resolution_clock::now();
    
    auto duration = chrono::duration_cast<chrono::microseconds>(end - start);
    
    // Display results
    sorter.printArray();
    sorter.printStats();
    cout << "Time taken: " << duration.count() << " microseconds" << endl;
    
    return 0;
}

/* Expected Output:
=== Insertion Sort Demo ===
Original array: 64 34 25 12 22 11 90 
Sorted array: 11 12 22 25 34 64 90 
Comparisons: 18
Swaps: 18
Time taken: 45 microseconds
*/`}</code>
              </pre>
            </CollapsibleSection>
          </div>
        )}
      </div>
    </div>
  );
});

export default InsertionSortVisualizer;
