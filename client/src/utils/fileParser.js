
async function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsArrayBuffer(file);
  });
}

async function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = reject;
    fr.readAsText(file, 'utf-8');
  });
}

export const parseTXT = async (file) => {
  const text = await readFileAsText(file);
  return { content: text, source: file.name, success: true };
};

export const parseJSON = async (file) => {
  const text = await readFileAsText(file);
  try {
    const obj = JSON.parse(text);
    const content = JSON.stringify(obj, null, 2);
    return { content, source: file.name, success: true };
  } catch (err) {
    throw new Error('File JSON không hợp lệ');
  }
};

export const parseCSV = async (file) => {
  try {
    const Papa = (await import('papaparse')).default || (await import('papaparse'));
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        complete: (results) => {
          const rows = results.data || [];
          const lines = rows.map(r => r.join(' | '));
          resolve({ content: lines.join('\n'), source: file.name, success: true });
        },
        error: () => reject(new Error('Lỗi đọc CSV')),
      });
    });
  } catch (e) {
    const text = await readFileAsText(file);
    const lines = text.split('\n').map(l => l.split(',').join(' | ')).join('\n');
    return { content: lines, source: file.name, success: true };
  }
};

export const parsePDF = async (file) => {
  try {
    const pdfjs = await import('pdfjs-dist');
    
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.mjs',
      import.meta.url
    ).toString();
    
    const ab = await readFileAsArrayBuffer(file);
    const loadingTask = pdfjs.getDocument({ data: ab });
    const doc = await loadingTask.promise;
    
    const texts = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      texts.push(`[Trang ${i}]\n${pageText}`);
    }
    return { content: texts.join('\n\n'), source: file.name, success: true };
  } catch (e) {
    throw new Error(`Lỗi đọc PDF: ${e.message}`);
  }
};

export const parseDOCX = async (file) => {
  try {
    const mammoth = (await import('mammoth')).default || (await import('mammoth'));
    const ab = await readFileAsArrayBuffer(file);
    const result = await mammoth.extractRawText({ arrayBuffer: ab });
    return { content: result.value || '', source: file.name, success: true };
  } catch (e) {
    throw new Error(`Lỗi đọc DOCX: ${e.message}`);
  }
};

export const parseXLSX = async (file) => {
  try {
    const XLSX = (await import('xlsx')).default || (await import('xlsx'));
    const ab = await readFileAsArrayBuffer(file);
    const workbook = XLSX.read(ab, { type: 'array' });
    
    const out = [];
    workbook.SheetNames.forEach((s) => {
      const ws = workbook.Sheets[s];
      const csv = XLSX.utils.sheet_to_csv(ws);
      out.push(`[Sheet: ${s}]\n` + csv.split('\n').map(l => l.split(',').join(' | ')).join('\n'));
    });
    return { content: out.join('\n\n'), source: file.name, success: true };
  } catch (e) {
    throw new Error(`Lỗi đọc XLSX: ${e.message}`);
  }
};

export const parseFile = async (file) => {
  if (!file) throw new Error("Không tìm thấy file");

  const maxSize = 20 * 1024 * 1024; // Giới hạn 20MB
  if (file.size > maxSize) {
    throw new Error(`File quá lớn (Tối đa 20MB). File của bạn: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
  }

  const name = file.name || '';
  const ext = name.split('.').pop().toLowerCase();
  const type = file.type || '';

  if (type.startsWith('text/') || ext === 'txt' || ext === 'md') return await parseTXT(file);
  if (ext === 'json' || type === 'application/json') return await parseJSON(file);
  if (ext === 'csv') return await parseCSV(file);
  if (ext === 'pdf' || type === 'application/pdf') return await parsePDF(file);
  if (ext === 'docx' || ext === 'doc') return await parseDOCX(file);
  if (ext === 'xlsx' || ext === 'xls') return await parseXLSX(file);

  try { 
    return await parseTXT(file); 
  } catch { 
    throw new Error(`Không hỗ trợ định dạng: .${ext}`); 
  }
};

export default parseFile;