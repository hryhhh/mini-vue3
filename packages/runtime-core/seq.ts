export default function getSequence(arr) {
    const result = [0];
    let start;
    let end;
    let mid;
  const len = arr.length;

  for (let i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      let last = result[result.length - 1];
      if (arr[last] < arrI) {
        result.push(i);
        continue;
      }
    }
    start = 0;
    end = result.length - 1;
    while (start <= end) {
      mid = (start + end) >> 1;
      if (arr[result[mid]] < arrI) {
        start = mid + 1;
      } else {
        end = mid - 1;
      }
    }
    if (arrI < arr[result[mid]]) {
      result[start] = i;
    }
  }
  return result;
}

// console.log(getSequence([2, 3, 1, 5, 6, 8, 7, 9, 4]));
