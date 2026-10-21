export function medianCalculation(data: number[]): number {
    let sortedData = data.slice().sort((a, b) => a - b);
    let middle = Math.floor(sortedData.length / 2);
    if (sortedData.length % 2 === 0) {
        return (sortedData[middle - 1] + sortedData[middle]) / 2;
    }
    return sortedData[middle];
}
