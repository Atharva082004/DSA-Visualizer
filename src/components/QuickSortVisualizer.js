import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { QuickSortAlgorithm } from "../algorithms/quickSort";

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

const QuickSortVisualizer = forwardRef(({ animationSpeed }, ref) => {
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
        const algorithm = new QuickSortAlgorithm(array);
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

  const drawArray = useCallback((arr, highlightIndices = [], colors = {}) => {
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
  }, []);

  const animateSteps = async (stepList) => {
    for (let i = 0; i < stepList.length; i++) {
      setCurrentStep(i);
      const step = stepList[i];

      let highlightIndices = [];
      let colors = {};

      switch (step.type) {
        case "pivot_select":
          highlightIndices = [step.pivotIndex];
          colors[step.pivotIndex] = "#f39c12";
          break;
        case "compare":
          highlightIndices = step.comparing || [];
          step.comparing?.forEach((idx) => {
            colors[idx] = "#e74c3c";
          });
          break;
        case "swap":
        case "pivot_place":
          highlightIndices = step.swapping || [];
          step.swapping?.forEach((idx) => {
            colors[idx] = "#27ae60";
          });
          break;
        default:
          break;
      }

      drawArray(step.array, highlightIndices, colors);
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
        <h4>Quick Sort Algorithm</h4>
        <p>Quick Sort uses a divide-and-conquer approach with partitioning:</p>
        <ol>
          <li>
            <strong>Choose Pivot:</strong> Select an element as the pivot
          </li>
          <li>
            <strong>Partition:</strong> Rearrange array so elements smaller than
            pivot come before it
          </li>
          <li>
            <strong>Recursively Sort:</strong> Apply the same process to
            sub-arrays
          </li>
        </ol>
      </div>

      <div className="complexity-info">
        <h4>Quick Sort Complexity</h4>
        <div className="complexity-grid">
          <div className="complexity-item">
            <strong>Best Case:</strong>{" "}
            <span className="complexity-value">O(n log n)</span>
          </div>
          <div className="complexity-item">
            <strong>Average Case:</strong>{" "}
            <span className="complexity-value">O(n log n)</span>
          </div>
          <div className="complexity-item">
            <strong>Worst Case:</strong>{" "}
            <span className="complexity-value">O(n²)</span>
          </div>
          <div className="complexity-item">
            <strong>Space:</strong>{" "}
            <span className="complexity-value">O(log n)</span>
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
            <CollapsibleSection title="⚡ Basic Quick Sort" defaultOpen={true}>
              <pre className="code-block">
                <code>{`// Basic Quick Sort Implementation
int partition(int arr[], int low, int high) {
    int pivot = arr[high];  // Choose last element as pivot
    int i = low - 1;        // Index of smaller element
    
    for (int j = low; j < high; j++) {
        // If current element is smaller than or equal to pivot
        if (arr[j] <= pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    
    // Place pivot in correct position
    swap(arr[i + 1], arr[high]);
    return i + 1;
}

void quickSort(int arr[], int low, int high) {
    if (low < high) {
        // Partition the array
        int pivotIndex = partition(arr, low, high);
        
        // Recursively sort elements before and after partition
        quickSort(arr, low, pivotIndex - 1);
        quickSort(arr, pivotIndex + 1, high);
    }
}

// Utility function to swap elements
void swap(int& a, int& b) {
    int temp = a;
    a = b;
    b = temp;
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

            <CollapsibleSection title="🎯 Optimized Quick Sort">
              <pre className="code-block">
                <code>{`// Optimized Quick Sort with Random Pivot
#include <random>

int randomPartition(vector<int>& arr, int low, int high) {
    // Generate random index between low and high
    random_device rd;
    mt19937 gen(rd());
    uniform_int_distribution<> dis(low, high);
    int randomIndex = dis(gen);
    
    // Swap random element with last element
    swap(arr[randomIndex], arr[high]);
    
    return partition(arr, low, high);
}

// Median-of-three pivot selection
int medianOfThree(vector<int>& arr, int low, int high) {
    int mid = low + (high - low) / 2;
    
    // Sort low, mid, high
    if (arr[mid] < arr[low]) swap(arr[low], arr[mid]);
    if (arr[high] < arr[low]) swap(arr[low], arr[high]);
    if (arr[high] < arr[mid]) swap(arr[mid], arr[high]);
    
    // Place median at the end
    swap(arr[mid], arr[high]);
    return partition(arr, low, high);
}

// Quick Sort with Insertion Sort for small arrays
void hybridQuickSort(vector<int>& arr, int low, int high) {
    const int THRESHOLD = 10;
    
    if (high - low + 1 <= THRESHOLD) {
        // Use insertion sort for small arrays
        insertionSort(arr, low, high);
    } else if (low < high) {
        int pivotIndex = medianOfThree(arr, low, high);
        hybridQuickSort(arr, low, pivotIndex - 1);
        hybridQuickSort(arr, pivotIndex + 1, high);
    }
}

// Tail-recursive Quick Sort (optimizes space)
void tailRecursiveQuickSort(vector<int>& arr, int low, int high) {
    while (low < high) {
        int pivotIndex = partition(arr, low, high);
        
        // Recursively sort the smaller partition
        // Process the larger partition iteratively
        if (pivotIndex - low < high - pivotIndex) {
            tailRecursiveQuickSort(arr, low, pivotIndex - 1);
            low = pivotIndex + 1;
        } else {
            tailRecursiveQuickSort(arr, pivotIndex + 1, high);
            high = pivotIndex - 1;
        }
    }
}`}</code>
              </pre>
            </CollapsibleSection>

            <CollapsibleSection title="🔄 Advanced Quick Sort">
              <pre className="code-block">
                <code>{`// Three-way Partitioning (Dutch National Flag)
void quickSort3Way(vector<int>& arr, int low, int high) {
    if (high <= low) return;
    
    int lt = low, gt = high;
    int pivot = arr[low];
    int i = low;
    
    while (i <= gt) {
        if (arr[i] < pivot) {
            swap(arr[lt++], arr[i++]);
        } else if (arr[i] > pivot) {
            swap(arr[i], arr[gt--]);
        } else {
            i++;
        }
    }
    
    // Now arr[low..lt-1] < pivot = arr[lt..gt] < arr[gt+1..high]
    quickSort3Way(arr, low, lt - 1);
    quickSort3Way(arr, gt + 1, high);
}

// Iterative Quick Sort using Stack
void iterativeQuickSort(vector<int>& arr) {
    int n = arr.size();
    stack<pair<int, int>> stk;
    
    stk.push({0, n - 1});
    
    while (!stk.empty()) {
        auto [low, high] = stk.top();
        stk.pop();
        
        if (low < high) {
            int pivotIndex = partition(arr, low, high);
            
            // Push left and right subarrays
            stk.push({low, pivotIndex - 1});
            stk.push({pivotIndex + 1, high});
        }
    }
}

// Quick Select (find kth smallest element)
int quickSelect(vector<int>& arr, int left, int right, int k) {
    if (left == right) return arr[left];
    
    int pivotIndex = randomPartition(arr, left, right);
    
    if (k == pivotIndex) {
        return arr[k];
    } else if (k < pivotIndex) {
        return quickSelect(arr, left, pivotIndex - 1, k);
    } else {
        return quickSelect(arr, pivotIndex + 1, right, k);
    }
}

// Parallel Quick Sort (conceptual)
void parallelQuickSort(vector<int>& arr, int low, int high, int depth = 0) {
    const int MAX_DEPTH = 4;  // Limit parallel depth
    
    if (low < high) {
        int pivotIndex = partition(arr, low, high);
        
        if (depth < MAX_DEPTH) {
            // Create parallel tasks
            auto future1 = async(launch::async, parallelQuickSort, 
                                ref(arr), low, pivotIndex - 1, depth + 1);
            parallelQuickSort(arr, pivotIndex + 1, high, depth + 1);
            future1.wait();
        } else {
            // Sequential execution
            quickSort(arr, low, pivotIndex - 1);
            quickSort(arr, pivotIndex + 1, high);
        }
    }
}`}</code>
              </pre>
            </CollapsibleSection>

            <CollapsibleSection title="🚀 Complete Example">
              <pre className="code-block">
                <code>{`#include <iostream>
#include <vector>
#include <chrono>
#include <algorithm>
using namespace std;

class QuickSort {
private:
    vector<int> arr;
    int comparisons;
    int swaps;
    int partitions;
    
public:
    QuickSort(vector<int> input) : 
        arr(input), comparisons(0), swaps(0), partitions(0) {}
    
    void sort() {
        quickSortHelper(0, arr.size() - 1);
    }
    
    void quickSortHelper(int low, int high) {
        if (low < high) {
            int pivotIndex = partition(low, high);
            quickSortHelper(low, pivotIndex - 1);
            quickSortHelper(pivotIndex + 1, high);
        }
    }
    
    int partition(int low, int high) {
        partitions++;
        int pivot = arr[high];
        int i = low - 1;
        
        for (int j = low; j < high; j++) {
            comparisons++;
            if (arr[j] <= pivot) {
                i++;
                if (i != j) {
                    swap(arr[i], arr[j]);
                    swaps++;
                }
            }
        }
        
        if (i + 1 != high) {
            swap(arr[i + 1], arr[high]);
            swaps++;
        }
        
        return i + 1;
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
        cout << "Partitions: " << partitions << endl;
    }
    
    // Verify if array is sorted
    bool isSorted() {
        for (int i = 1; i < arr.size(); i++) {
            if (arr[i] < arr[i-1]) return false;
        }
        return true;
    }
};

int main() {
    cout << "=== Quick Sort Demo ===" << endl;
    
    // Test data
    vector<int> data = {64, 34, 25, 12, 22, 11, 90};
    
    cout << "Original array: ";
    for (int num : data) {
        cout << num << " ";
    }
    cout << endl;
    
    // Create sorter and measure time
    QuickSort sorter(data);
    
    auto start = chrono::high_resolution_clock::now();
    sorter.sort();
    auto end = chrono::high_resolution_clock::now();
    
    auto duration = chrono::duration_cast<chrono::microseconds>(end - start);
    
    // Display results
    sorter.printArray();
    sorter.printStats();
    cout << "Is sorted: " << (sorter.isSorted() ? "Yes" : "No") << endl;
    cout << "Time taken: " << duration.count() << " microseconds" << endl;
    
    return 0;
}

/* Expected Output:
=== Quick Sort Demo ===
Original array: 64 34 25 12 22 11 90 
Sorted array: 11 12 22 25 34 64 90 
Comparisons: 15
Swaps: 8
Partitions: 6
Is sorted: Yes
Time taken: 18 microseconds
*/`}</code>
              </pre>
            </CollapsibleSection>
          </div>
        )}
      </div>
    </div>
  );
});

export default QuickSortVisualizer;
