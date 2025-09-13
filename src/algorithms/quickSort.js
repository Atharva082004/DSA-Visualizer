export class QuickSortAlgorithm {
  constructor(array) {
    this.array = [...array];
    this.steps = [];
    this.comparisons = 0;
    this.swaps = 0;
  }

  async sort() {
    this.steps = [];
    this.comparisons = 0;
    this.swaps = 0;

    await this.quickSort(this.array, 0, this.array.length - 1);
    return {
      steps: this.steps,
      comparisons: this.comparisons,
      swaps: this.swaps,
      sortedArray: this.array,
    };
  }

  async quickSort(arr, low, high) {
    if (low < high) {
      // Add step to show current subarray
      this.steps.push({
        type: "subarray",
        low,
        high,
        array: [...arr],
        message: `Sorting subarray from index ${low} to ${high}`,
      });

      const pivotIndex = await this.partition(arr, low, high);

      await this.quickSort(arr, low, pivotIndex - 1);
      await this.quickSort(arr, pivotIndex + 1, high);
    }
  }

  async partition(arr, low, high) {
    const pivot = arr[high]; // Choose last element as pivot

    this.steps.push({
      type: "pivot_select",
      pivotIndex: high,
      pivot,
      array: [...arr],
      message: `Selected pivot: ${pivot} at index ${high}`,
    });

    let i = low - 1;

    for (let j = low; j < high; j++) {
      this.comparisons++;

      this.steps.push({
        type: "compare",
        comparing: [j, high],
        array: [...arr],
        message: `Comparing ${arr[j]} with pivot ${pivot}`,
      });

      if (arr[j] < pivot) {
        i++;

        if (i !== j) {
          // Swap elements
          [arr[i], arr[j]] = [arr[j], arr[i]];
          this.swaps++;

          this.steps.push({
            type: "swap",
            swapping: [i, j],
            array: [...arr],
            message: `Swapped ${arr[i]} and ${arr[j]}`,
          });
        }
      }
    }

    // Place pivot in correct position
    if (i + 1 !== high) {
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      this.swaps++;

      this.steps.push({
        type: "pivot_place",
        swapping: [i + 1, high],
        pivotFinalIndex: i + 1,
        array: [...arr],
        message: `Placed pivot ${pivot} in correct position ${i + 1}`,
      });
    }

    return i + 1;
  }
}
