import fs from 'fs';
import path from 'path';

export default function Page() {
  let html = '';
  try {
    const filePath = path.join(process.cwd(), 'prototype', 'prototype.html');
    if (fs.existsSync(filePath)) {
      html = fs.readFileSync(filePath, 'utf-8');
    }
  } catch (e) {
    html = '<div style="padding:40px;font-family:sans-serif;"><h1>Agent Skills Hub</h1><p>Loading prototype...</p></div>';
  }

  return (
    <div dangerouslySetInnerHTML={{ __html: html }} />
  );
}
