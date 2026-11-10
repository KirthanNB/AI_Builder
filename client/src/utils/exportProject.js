import { detectDependencies } from "./sandpackUtils";

// Pure JavaScript ZIP file generator (PKZIP 2.0 format) - works anywhere with 0 external dependencies
function generateZipBlob(fileEntries) {
  const encoder = new TextEncoder();
  const fileRecords = [];
  let offset = 0;

  // CRC32 table
  const crcTable = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[i] = c;
  }

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  const parts = [];

  for (const { name, content } of fileEntries) {
    const nameBytes = encoder.encode(name);
    const dataBytes = typeof content === "string" ? encoder.encode(content) : new Uint8Array(content);
    const crc = crc32(dataBytes);
    const size = dataBytes.length;

    // Local file header (30 bytes + name length)
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const view = new DataView(localHeader.buffer);

    view.setUint32(0, 0x04034b50, true); // Local header signature
    view.setUint16(4, 20, true);         // Version needed
    view.setUint16(6, 0, true);          // General flag
    view.setUint16(8, 0, true);          // Compression (0 = store)
    view.setUint16(10, 0, true);         // Time
    view.setUint16(12, 0, true);         // Date
    view.setUint32(14, crc, true);       // CRC32
    view.setUint32(18, size, true);      // Compressed size
    view.setUint32(22, size, true);      // Uncompressed size
    view.setUint16(26, nameBytes.length, true); // Filename length
    view.setUint16(28, 0, true);         // Extra field length
    localHeader.set(nameBytes, 30);

    parts.push(localHeader);
    parts.push(dataBytes);

    fileRecords.push({
      nameBytes,
      crc,
      size,
      offset,
    });

    offset += localHeader.length + dataBytes.length;
  }

  // Central directory
  const centralDirStart = offset;
  let centralDirSize = 0;

  for (const rec of fileRecords) {
    const cdHeader = new Uint8Array(46 + rec.nameBytes.length);
    const view = new DataView(cdHeader.buffer);

    view.setUint32(0, 0x02014b50, true); // Central directory header signature
    view.setUint16(4, 20, true);         // Version made by
    view.setUint16(6, 20, true);         // Version needed
    view.setUint16(8, 0, true);          // General flag
    view.setUint16(10, 0, true);         // Compression (0 = store)
    view.setUint16(12, 0, true);         // Time
    view.setUint16(14, 0, true);         // Date
    view.setUint32(16, rec.crc, true);   // CRC32
    view.setUint32(20, rec.size, true);  // Compressed size
    view.setUint32(24, rec.size, true);  // Uncompressed size
    view.setUint16(28, rec.nameBytes.length, true); // Filename length
    view.setUint16(30, 0, true);         // Extra field length
    view.setUint16(32, 0, true);         // File comment length
    view.setUint16(34, 0, true);         // Disk number start
    view.setUint16(36, 0, true);         // Internal file attributes
    view.setUint32(38, 0, true);         // External file attributes
    view.setUint32(42, rec.offset, true);// Relative offset of local header
    cdHeader.set(rec.nameBytes, 46);

    parts.push(cdHeader);
    centralDirSize += cdHeader.length;
  }

  // End of central directory record (22 bytes)
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054b50, true); // EOCD signature
  eocdView.setUint16(4, 0, true);          // Disk number
  eocdView.setUint16(6, 0, true);          // Start disk
  eocdView.setUint16(8, fileRecords.length, true);  // Total entries on this disk
  eocdView.setUint16(10, fileRecords.length, true); // Total entries
  eocdView.setUint32(12, centralDirSize, true);     // Size of central directory
  eocdView.setUint32(16, centralDirStart, true);    // Offset of central directory
  eocdView.setUint16(20, 0, true);                  // Comment length

  parts.push(eocd);

  return new Blob(parts, { type: "application/zip" });
}

export async function exportProjectZip(project) {
  if (!project || !project.files) return;

  try {
    const fileMap = {};
    for (const [path, content] of Object.entries(project.files)) {
      const fileCode = typeof content === "string" ? content : content?.content || "";
      fileMap[path] = fileCode;
    }

    const detectedDeps = detectDependencies(fileMap);
    const projectName = (project.name || "my-website").toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const packageJsonContent = JSON.stringify(
      {
        name: projectName,
        private: true,
        version: "0.1.0",
        type: "module",
        scripts: {
          dev: "vite",
          build: "vite build",
          preview: "vite preview",
        },
        dependencies: {
          react: "^18.2.0",
          "react-dom": "^18.2.0",
          "lucide-react": "^0.475.0",
          ...detectedDeps,
        },
        devDependencies: {
          "@vitejs/plugin-react": "^4.2.0",
          vite: "^5.0.0",
          tailwindcss: "^3.4.0",
          autoprefixer: "^10.4.0",
          postcss: "^8.4.0",
        },
      },
      null,
      2
    );

    const viteConfigContent = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /src\\/.*\\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
});
`;

    const indexHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${project.name || "My Website"}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/index.jsx"></script>
</body>
</html>
`;

    const indexJsxContent = `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')).render(<App />);
`;

    const entries = [
      { name: "package.json", content: packageJsonContent },
      { name: "vite.config.js", content: viteConfigContent },
      { name: "index.html", content: indexHtmlContent },
      { name: "src/index.jsx", content: indexJsxContent },
    ];

    for (const [path, content] of Object.entries(fileMap)) {
      const cleanPath = path.startsWith("/") ? path.slice(1) : path;
      entries.push({ name: `src/${cleanPath}`, content });
    }

    const zipBlob = generateZipBlob(entries);
    const downloadUrl = URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${projectName}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
  } catch (error) {
    console.error("Export project error:", error);
  }
}
