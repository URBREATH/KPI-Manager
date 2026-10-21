export function interpretJsonPath(obj: any, path: string): any {
  const cleanPath = path.startsWith('$.') ? path.slice(2) : path;

  if (cleanPath === '') {
    return obj;
  }

  const segments = cleanPath.split('.').reduce(
    (acc, segment) => {
      if (segment === '[*]') {
        acc.push('*');
      } else if (segment.includes('[') && segment.includes(']')) {
        const [arrayName, indexStr] = segment.split('[');
        const index =
          indexStr.replace(']', '') === '*'
            ? '*'
            : parseInt(indexStr.replace(']', ''), 10);
        if (arrayName) acc.push(arrayName);
        acc.push(index);
      } else {
        acc.push(segment);
      }
      return acc;
    },
    [] as (string | number | '*')[]
  );

  function traverse(
    current: any,
    remainingSegments: (string | number | '*')[]
  ): any {
    if (remainingSegments.length === 0) return current;
    if (current === undefined || current === null) return undefined;

    const [segment, ...rest] = remainingSegments;

    if (segment === '*' && Array.isArray(current)) {
      return current
        .map(item => traverse(item, rest))
        .filter(item => item !== undefined);
    } else if (
      typeof current === 'object' &&
      Object.prototype.hasOwnProperty.call(current, segment)
    ) {
      return traverse(current[segment], rest);
    } else {
      return undefined;
    }
  }

  return traverse(obj, segments);
}
