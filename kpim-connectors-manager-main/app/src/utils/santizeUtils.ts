import validator from 'validator';

export function parseHeaders(headerString: string): Record<string, string> {
  const headers: Record<string, string> = {};

  headerString.split(',').forEach(header => {
    const [key, value] = header.split(':').map(part => part.trim());
    if (key && value) {
      headers[key] = value;
    }
  });

  return headers;
}

export function sanitizeAndValidateHeaders(
  headers: Record<string, string>
): Record<string, string> {
  const sanitizedHeaders: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers)) {
    if (validator.isAlphanumeric(key, 'en-US', {ignore: '-_'})) {
      sanitizedHeaders[key] = validator.escape(value);
    }
  }
  console.log('Sanitized Headers:', sanitizedHeaders);
  return sanitizedHeaders;
}

export function sanitizeAndValidateQuery(
  query: Record<string, any>
): Record<string, string> {
  const sanitizedQuery: Record<string, string> = {};

  for (const [key, value] of Object.entries(query)) {
    if (validator.isAlphanumeric(key, 'en-US', {ignore: '-_'})) {
      sanitizedQuery[key] = encodeURIComponent(validator.escape(String(value))); // Sanifica il valore
    }
  }

  return sanitizedQuery;
}
