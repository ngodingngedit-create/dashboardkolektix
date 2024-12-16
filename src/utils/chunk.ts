export default function chunk<T>(array: T[], size: number): T[][] {
    const result: T[][] = [];
    
    for (let i = 0; i < array.length; i += size) {
        const chunk = array.slice(i, i + size);
        result.push(chunk);
    }
    
    return result;
}