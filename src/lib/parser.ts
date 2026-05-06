import { TaskMode } from './firestore';

export function parseModelOutput(mode: TaskMode, text: string): any {
  if (!text) return null;
  
  try {
    switch (mode) {
      case 'refine':
        return parseRefine(text);
      case 'split':
        return parseSplit(text);
      case 'kanban':
        return parseKanban(text);
      case 'audit':
        return parseAudit(text);
      default:
        return { raw: text };
    }
  } catch (err) {
    console.error('Parser error', err);
    return { error: 'Failed to parse', raw: text };
  }
}

function parseRefine(text: string) {
  // Regex parsing based on expected 1-9 list items.
  const fields = ['title', 'goal', 'object', 'artifact', 'done', 'mvp', 'notIncluded', 'metric', 'nextTask'];
  const result: any = {};
  
  // A simple heuristic parser looking for "1.", "2.", etc. at the start of a line.
  const lines = text.split('\n');
  let currentFieldIndex = -1;
  let currentBuffer: string[] = [];

  const saveField = () => {
    if (currentFieldIndex >= 0 && currentFieldIndex < fields.length) {
      const fieldName = fields[currentFieldIndex];
      // remove bullet points like 1. Название: ...
      let val = currentBuffer.join('\n').trim();
      val = val.replace(/^\d+\.\s*(?:.*?\:)?\s*/i, '').trim();
      result[fieldName] = val;
    }
  };

  for (const line of lines) {
    const match = line.match(/^(\d+)\./);
    if (match) {
      saveField();
      currentFieldIndex = parseInt(match[1], 10) - 1;
      currentBuffer = [line];
    } else {
      currentBuffer.push(line);
    }
  }
  saveField();
  
  // Fallback for failed parsing
  if (Object.keys(result).length < 5) {
      return { raw: text };
  }
  return result;
}

function parseSplit(text: string) {
  // Parsing a list of tasks. Each task has title, result, done, duration, needed
  // Usually the model returns lists like:
  // 1. Анализ...
  // - Результат: ...
  const tasks: any[] = [];
  const taskBlocks = text.split(/^\d+\.\s/m).filter(b => b.trim().length > 0);
  
  taskBlocks.forEach((block, index) => {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length > 0) {
      // Re-attach the number if it was stripped
      // But wait! If we split by /^\d+\.\s/m, the number is gone!
      // But we can approximate.
      const titleLine = `${index + 1}. ` + lines[0];
      const resultObj: any = { title: titleLine };
      lines.slice(1).forEach(l => {
        if (l.toLowerCase().includes('результат')) resultObj.result = l.split(':').slice(1).join(':').trim();
        if (l.toLowerCase().includes('done')) resultObj.done = l.split(':').slice(1).join(':').trim();
        if (l.toLowerCase().includes('длительность')) resultObj.duration = l.split(':').slice(1).join(':').trim();
        if (l.toLowerCase().includes('нужна ли')) resultObj.needed = l.split(':').slice(1).join(':').trim();
      });
      tasks.push(resultObj);
    }
  });

  if (tasks.length === 0) return { raw: text };
  return { tasks };
}

function parseKanban(text: string) {
    const lines = text.split('\n');
    let title = '';
    let description = '';
    let isDesc = false;

    for (const line of lines) {
        if (line.startsWith('Название:')) {
            title = line.replace('Название:', '').trim();
        } else if (line.startsWith('Описание:')) {
            isDesc = true;
        } else if (isDesc) {
            description += line + '\n';
        } else if (!title && !isDesc && line.trim().length > 0) {
            title = line;
        }
    }
    return { title, description: description.trim(), raw: text };
}

function parseAudit(text: string) {
    const result: any = {};
    const criteria = [
        { key: 'hasAction', label: '1.' },
        { key: 'hasObject', label: '2.' },
        { key: 'hasArtifact', label: '3.' },
        { key: 'hasDone', label: '4.' },
        { key: 'isTooBig', label: '5.' },
        { key: 'needsMvp', label: '6.' },
        { key: 'blurred', label: '7.' },
        { key: 'rewritten', label: '8.' },
    ];
    
    let currentKey = '';
    let currentBuffer = '';

    const lines = text.split('\n');
    for (const line of lines) {
        const match = line.match(/^(\d+)\./);
        if (match) {
            if (currentKey) {
                result[currentKey] = currentBuffer.trim();
            }
            const idx = parseInt(match[1]) - 1;
            if (idx >= 0 && idx < criteria.length) {
                currentKey = criteria[idx].key;
                currentBuffer = line.replace(/^\d+\.\s*/i, '') + '\n';
            }
        } else if (currentKey) {
            currentBuffer += line + '\n';
        }
    }
    if (currentKey) {
        result[currentKey] = currentBuffer.trim();
    }
    
    if (Object.keys(result).length < 4) {
        return { raw: text };
    }
    return result;
}
