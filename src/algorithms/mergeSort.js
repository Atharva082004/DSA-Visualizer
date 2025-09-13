export class MergeSortAlgorithm {
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

    await this.mergeSort(this.array, 0, this.array.length - 1);
    return {
      steps: this.steps,
      comparisons: this.comparisons,
      swaps: this.swaps,
      sortedArray: this.array,
    };
  }

  async mergeSort(arr, left, right) {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);

      // Add step to show current division
      this.steps.push({
        type: "divide",
        left,
        mid,
        right,
        array: [...arr],
        message: `Dividing array from index ${left} to ${right}`,
      });

      await this.mergeSort(arr, left, mid);
      await this.mergeSort(arr, mid + 1, right);
      await this.merge(arr, left, mid, right);
    }
  }

  async merge(arr, left, mid, right) {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);

    let i = 0,
      j = 0,
      k = left;

    // Add step to show merging process
    this.steps.push({
      type: "merge_start",
      left,
      mid,
      right,
      leftArr: [...leftArr],
      rightArr: [...rightArr],
      array: [...arr],
      message: `Merging arrays from ${left} to ${mid} and ${
        mid + 1
      } to ${right}`,
    });

    while (i < leftArr.length && j < rightArr.length) {
      this.comparisons++;

      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i];
        i++;
      } else {
        arr[k] = rightArr[j];
        j++;
      }

      this.steps.push({
        type: "compare",
        comparing: [
          left + i - (leftArr[i] === arr[k] ? 1 : 0),
          mid + 1 + j - (rightArr[j] === arr[k] ? 1 : 0),
        ],
        array: [...arr],
        position: k,
        message: `Comparing and placing element at position ${k}`,
      });

      k++;
      this.swaps++;
    }

    // Copy remaining elements
    while (i < leftArr.length) {
      arr[k] = leftArr[i];
      this.steps.push({
        type: "copy",
        array: [...arr],
        position: k,
        value: leftArr[i],
        message: `Copying remaining element ${leftArr[i]} to position ${k}`,
      });
      i++;
      k++;
    }

    while (j < rightArr.length) {
      arr[k] = rightArr[j];
      this.steps.push({
        type: "copy",
        array: [...arr],
        position: k,
        value: rightArr[j],
        message: `Copying remaining element ${rightArr[j]} to position ${k}`,
      });
      j++;
      k++;
    }

    // Add final merge step
    this.steps.push({
      type: "merge_complete",
      left,
      right,
      array: [...arr],
      message: `Completed merging from ${left} to ${right}`,
    });
  }
}
