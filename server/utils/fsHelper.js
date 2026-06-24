const fs = require('fs').promises;
const path = require('path');

async function readJSON(filePath) {
  try {
    // check existence
    await fs.access(filePath);
  } catch (err) {
    // file does not exist
    return [];
  }

  const data = await fs.readFile(filePath, 'utf8');
  if (!data) return [];
  return JSON.parse(data);
}

async function writeJSON(filePath, data) {
  const dir = path.dirname(filePath);
  // ensure directory exists
  await fs.mkdir(dir, { recursive: true });
  const serialized = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, serialized, 'utf8');
}

module.exports = { readJSON, writeJSON };
