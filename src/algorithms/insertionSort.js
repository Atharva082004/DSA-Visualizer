export class InsertionSortAlgorithm {
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

    const arr = [...this.array];

    this.steps.push({
      type: "start",
      array: [...arr],
      message: "Starting Insertion Sort - first element is considered sorted",
    });

    for (let i = 1; i < arr.length; i++) {
      const key = arr[i];
      let j = i - 1;

      this.steps.push({
        type: "select_key",
        keyIndex: i,
        key,
        array: [...arr],
        message: `Selected key: ${key} at index ${i}`,
      });

      // Move elements that are greater than key one position ahead
      while (j >= 0) {
        this.comparisons++;

        this.steps.push({
          type: "compare",
          comparing: [j, i],
          key,
          array: [...arr],
          message: `Comparing ${arr[j]} with key ${key}`,
        });

        if (arr[j] > key) {
          arr[j + 1] = arr[j];
          this.swaps++;

          this.steps.push({
            type: "shift",
            from: j,
            to: j + 1,
            array: [...arr],
            message: `Shifted ${arr[j + 1]} from position ${j} to ${j + 1}`,
          });

          j--;
        } else {
          break;
        }
      }

      // Place key in its correct position
      if (j + 1 !== i) {
        arr[j + 1] = key;

        this.steps.push({
          type: "insert",
          position: j + 1,
          key,
          array: [...arr],
          message: `Inserted key ${key} at position ${j + 1}`,
        });
      }

      this.steps.push({
        type: "iteration_complete",
        sortedUntil: i,
        array: [...arr],
        message: `Completed iteration ${i}. Elements 0 to ${i} are now sorted`,
      });
    }

    this.steps.push({
      type: "complete",
      array: [...arr],
      message: "Insertion Sort completed!",
    });

    return {
      steps: this.steps,
      comparisons: this.comparisons,
      swaps: this.swaps,
      sortedArray: arr,
    };
  }
}
