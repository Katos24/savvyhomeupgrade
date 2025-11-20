export function safeJSONParse(data: any) {
  if (!data) return null;
  if (typeof data === 'object') return data;
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse JSON:', data);
    return null;
  }
}

export function parseNotes(notesData: any) {
  if (!notesData) return [];
  
  if (Array.isArray(notesData)) return notesData;
  
  if (typeof notesData === 'string') {
    try {
      const parsed = JSON.parse(notesData);
      if (Array.isArray(parsed)) return parsed;
      return [{ text: notesData, timestamp: new Date().toISOString() }];
    } catch (e) {
      return [{ text: notesData, timestamp: new Date().toISOString() }];
    }
  }
  
  return [];
}
