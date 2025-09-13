import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { MergeSortAlgorithm } from "../algorithms/mergeSort";

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

const MergeSortVisualizer = forwardRef(({ animationSpeed }, ref) => {
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
        const algorithm = new MergeSortAlgorithm(array);
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
        case "divide":
          highlightIndices = [step.left, step.mid, step.right];
          colors[step.left] = "#27ae60";
          colors[step.mid] = "#f39c12";
          colors[step.right] = "#27ae60";
          break;
        case "compare":
          highlightIndices = step.comparing || [];
          step.comparing?.forEach((idx) => {
            colors[idx] = "#e74c3c";
          });
          break;
        case "merge_complete":
          for (let j = step.left; j <= step.right; j++) {
            highlightIndices.push(j);
            colors[j] = "#27ae60";
          }
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
        <h4>Merge Sort Algorithm</h4>
        <p>Merge Sort uses a divide-and-conquer approach:</p>
        <ol>
          <li>
            <strong>Divide:</strong> Split the array into two halves
          </li>
          <li>
            <strong>Conquer:</strong> Recursively sort both halves
          </li>
          <li>
            <strong>Combine:</strong> Merge the sorted halves back together
          </li>
        </ol>
      </div>

      <div className="complexity-info">
        <h4>Merge Sort Complexity</h4>
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
            <span className="complexity-value">O(n log n)</span>
          </div>
          <div className="complexity-item">
            <strong>Space:</strong>{" "}
            <span className="complexity-value">O(n)</span>
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
            <CollapsibleSection title="🔀 Basic Merge Sort" defaultOpen={true}>
              <pre className="code-block">
                <code>{`// Basic Merge Sort Implementation
void merge(int arr[], int left, int mid, int right) {
    int n1 = mid - left + 1;
    int n2 = right - mid;
    
    // Create temporary arrays
    int* leftArr = new int[n1];
    int* rightArr = new int[n2];
    
    // Copy data to temporary arrays
    for (int i = 0; i < n1; i++)
        leftArr[i] = arr[left + i];
    for (int j = 0; j < n2; j++)
        rightArr[j] = arr[mid + 1 + j];
    
    // Merge the temporary arrays back
    int i = 0, j = 0, k = left;
    
    while (i < n1 && j < n2) {
        if (leftArr[i] <= rightArr[j]) {
            arr[k] = leftArr[i];
            i++;
        } else {
            arr[k] = rightArr[j];
            j++;
        }
        k++;
    }
    
    // Copy remaining elements
    while (i < n1) {
        arr[k] = leftArr[i];
        i++;
        k++;
    }
    
    while (j < n2) {
        arr[k] = rightArr[j];
        j++;
        k++;
    }
    
    // Clean up memory
    delete[] leftArr;
    delete[] rightArr;
}

void mergeSort(int arr[], int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        
        // Recursively sort first and second halves
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        
        // Merge the sorted halves
        merge(arr, left, mid, right);
    }
}`}</code>
              </pre>
            </CollapsibleSection>

            <CollapsibleSection title="📈 Optimized Merge Sort">
              <pre className="code-block">
                <code>{`// Optimized Merge Sort with Vector
#include <vector>
#include <algorithm>

void merge(vector<int>& arr, int left, int mid, int right) {
    vector<int> temp(right - left + 1);
    int i = left, j = mid + 1, k = 0;
    
    // Merge process
    while (i <= mid && j <= right) {
        if (arr[i] <= arr[j]) {
            temp[k++] = arr[i++];
        } else {
            temp[k++] = arr[j++];
        }
    }
    
    // Copy remaining elements
    while (i <= mid) temp[k++] = arr[i++];
    while (j <= right) temp[k++] = arr[j++];
    
    // Copy back to original array
    for (i = left; i <= right; i++) {
        arr[i] = temp[i - left];
    }
}

void mergeSort(vector<int>& arr, int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}

// Iterative Merge Sort (Bottom-up approach)
void mergeSortIterative(vector<int>& arr) {
    int n = arr.size();
    
    // Start with subarrays of size 1, double each iteration
    for (int size = 1; size < n; size *= 2) {
        for (int left = 0; left < n - 1; left += 2 * size) {
            int mid = min(left + size - 1, n - 1);
            int right = min(left + 2 * size - 1, n - 1);
            
            if (mid < right) {
                merge(arr, left, mid, right);
            }
        }
    }
}`}</code>
              </pre>
            </CollapsibleSection>

            <CollapsibleSection title="🔄 Advanced Merge Sort">
              <pre className="code-block">
                <code>{`// Merge Sort with Custom Comparator
template<typename T, typename Compare>
void mergeSort(vector<T>& arr, Compare comp) {
    mergeSortHelper(arr, 0, arr.size() - 1, comp);
}

template<typename T, typename Compare>
void mergeSortHelper(vector<T>& arr, int left, int right, Compare comp) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        mergeSortHelper(arr, left, mid, comp);
        mergeSortHelper(arr, mid + 1, right, comp);
        mergeWithComparator(arr, left, mid, right, comp);
    }
}

// Natural Merge Sort (for partially sorted arrays)
void naturalMergeSort(vector<int>& arr) {
    int n = arr.size();
    if (n <= 1) return;
    
    vector<int> temp(n);
    bool sorted = false;
    
    while (!sorted) {
        sorted = true;
        int i = 0;
        
        while (i < n - 1) {
            // Find end of first run
            int j = i;
            while (j < n - 1 && arr[j] <= arr[j + 1]) j++;
            
            if (j < n - 1) {
                sorted = false;
                
                // Find end of second run
                int k = j + 1;
                while (k < n - 1 && arr[k] <= arr[k + 1]) k++;
                
                // Merge runs [i...j] and [j+1...k]
                mergeRuns(arr, temp, i, j, k);
                i = k + 1;
            } else {
                break;
            }
        }
    }
}

// Merge Sort for Linked List
struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
};

ListNode* mergeSortList(ListNode* head) {
    if (!head || !head->next) return head;
    
    // Split the list into two halves
    ListNode* mid = getMiddle(head);
    ListNode* left = head;
    ListNode* right = mid->next;
    mid->next = nullptr;
    
    // Recursively sort both halves
    left = mergeSortList(left);
    right = mergeSortList(right);
    
    // Merge sorted halves
    return mergeLists(left, right);
}`}</code>
              </pre>
            </CollapsibleSection>

            <CollapsibleSection title="🚀 Complete Example">
              <pre className="code-block">
                <code>{`#include <iostream>
#include <vector>
#include <chrono>
#include <random>
using namespace std;

class MergeSort {
private:
    vector<int> arr;
    int comparisons;
    int merges;
    
public:
    MergeSort(vector<int> input) : arr(input), comparisons(0), merges(0) {}
    
    void sort() {
        mergeSortHelper(0, arr.size() - 1);
    }
    
    void mergeSortHelper(int left, int right) {
        if (left < right) {
            int mid = left + (right - left) / 2;
            mergeSortHelper(left, mid);
            mergeSortHelper(mid + 1, right);
            merge(left, mid, right);
        }
    }
    
    void merge(int left, int mid, int right) {
        merges++;
        vector<int> temp(right - left + 1);
        int i = left, j = mid + 1, k = 0;
        
        while (i <= mid && j <= right) {
            comparisons++;
            if (arr[i] <= arr[j]) {
                temp[k++] = arr[i++];
            } else {
                temp[k++] = arr[j++];
            }
        }
        
        while (i <= mid) temp[k++] = arr[i++];
        while (j <= right) temp[k++] = arr[j++];
        
        for (i = left; i <= right; i++) {
            arr[i] = temp[i - left];
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
        cout << "Merge operations: " << merges << endl;
    }
};

int main() {
    cout << "=== Merge Sort Demo ===" << endl;
    
    // Generate test data
    vector<int> data = {64, 34, 25, 12, 22, 11, 90};
    
    cout << "Original array: ";
    for (int num : data) {
        cout << num << " ";
    }
    cout << endl;
    
    // Create sorter and measure time
    MergeSort sorter(data);
    
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
=== Merge Sort Demo ===
Original array: 64 34 25 12 22 11 90 
Sorted array: 11 12 22 25 34 64 90 
Comparisons: 11
Merge operations: 6
Time taken: 23 microseconds
*/`}</code>
              </pre>
            </CollapsibleSection>
          </div>
        )}
      </div>
    </div>
  );
});

export default MergeSortVisualizer;
