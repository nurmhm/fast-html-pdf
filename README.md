# fast-html-pdf
>  High-performance HTML to PDF converter using Playwright. Simple API with full CSS support, perfect for generating reports, invoices, and documents.

[![npm version](https://img.shields.io/npm/v/fast-html-pdf.svg)](https://www.npmjs.com/package/fast-html-pdf)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js >= 18](https://img.shields.io/badge/node-%3E%3D%2018-brightgreen)](https://nodejs.org/)

## Features

 **Easy to Use** - Simple, intuitive API  
 **Full CSS Support** - Style PDFs with complete CSS capabilities  
 **Responsive Design** - Works with modern web technologies  
 **High Performance** - Fast conversion with reliable output  
 **Production Ready** - Error handling, type safety, and comprehensive documentation  
 **No Dependencies** - Minimal footprint (Playwright only)  
 **Batch Processing** - Convert multiple documents efficiently  

## Installation

```bash
npm install fast-html-pdf
```

**Requirements:**
- Node.js >= 18.0.0
- ~300MB disk space for Playwright browsers (downloaded on first use)

## Quick Start

### Basic Usage

```typescript
import { htmlToPdfFile } from 'fast-html-pdf';

const html = `
  <h1>Hello World</h1>
  <p>This is a PDF generated from HTML!</p>
`;

const path = await htmlToPdfFile(html, './output.pdf');
console.log(`PDF saved to: ${path}`);
```

### Get PDF as Buffer

```typescript
import { htmlToPdfBuffer } from 'fast-html-pdf';

const html = '<h1>Hello World</h1>';
const pdfBuffer = await htmlToPdfBuffer(html);

// Use the buffer directly (e.g., for API responses)
response.setHeader('Content-Type', 'application/pdf');
response.send(pdfBuffer);
```

### With Custom Styling

```typescript
import { htmlToPdfFile } from 'fast-html-pdf';

const html = `
  <div class="invoice">
    <h1>Invoice #12345</h1>
    <p>Amount: $99.99</p>
  </div>
`;

const css = `
  .invoice {
    font-family: Arial, sans-serif;
    padding: 20px;
    background: #f5f5f5;
  }
`;

await htmlToPdfFile(html, './invoice.pdf', {
  additionalStyles: css,
  format: 'A4',
  margin: { top: 10, right: 10, bottom: 10, left: 10 }
});
```

### Batch Processing

```typescript
import { htmlToPdfBatch } from 'fast-html-pdf';

const documents = [
  ['<h1>Report 1</h1>', './report1.pdf'],
  ['<h1>Report 2</h1>', './report2.pdf'],
  ['<h1>Report 3</h1>', './report3.pdf']
];

const paths = await htmlToPdfBatch(documents, {
  format: 'A4'
});

console.log('Generated:', paths);
```

## API Reference

### `htmlToPdfFile(html, outputPath, options?)`

Convert HTML to PDF and save to disk.

**Parameters:**
- `html` (string) - HTML content
- `outputPath` (string) - Path where to save the PDF
- `options` (FastHtmlPdfOptions, optional) - Conversion options

**Returns:** `Promise<string>` - Absolute path to the saved PDF

**Throws:** `FastHtmlPdfError` - If conversion or file write fails

### `htmlToPdfBuffer(html, options?)`

Convert HTML to PDF and return as Buffer.

**Parameters:**
- `html` (string) - HTML content
- `options` (FastHtmlPdfOptions, optional) - Conversion options

**Returns:** `Promise<Buffer>` - PDF content as Buffer

**Throws:** `FastHtmlPdfError` - If conversion fails

### `htmlToPdfBatch(htmlArray, options?)`

Convert multiple HTML documents efficiently.

**Parameters:**
- `htmlArray` (Array<[html, path]>) - Array of [HTML, output path] tuples
- `options` (FastHtmlPdfOptions, optional) - Conversion options

**Returns:** `Promise<string[]>` - Array of saved file paths

**Throws:** `FastHtmlPdfError` - If any conversion fails

## Options

Extended Playwright PDF options with additional configuration:

```typescript
interface FastHtmlPdfOptions {
  // Playwright PDF options (all supported)
  format?: 'Letter' | 'Legal' | 'Tabloid' | 'Ledger' | 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6';
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  width?: string | number;
  height?: string | number;
  scale?: number;
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
  preferCSSPageSize?: boolean;
  printBackground?: boolean;
  
  // fast-html-pdf specific options
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle'; // default: 'networkidle'
  additionalStyles?: string; // CSS to inject into the HTML
  viewport?: { width: number; height: number };
}
```

## Advanced Examples

### Generate Invoice with Dynamic Data

```typescript
import { htmlToPdfFile } from 'fast-html-pdf';

function generateInvoiceHTML(invoiceData) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .invoice-container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .items { margin: 30px 0; }
        .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .total { font-weight: bold; font-size: 18px; text-align: right; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <h1>INVOICE</h1>
          <p>Invoice #${invoiceData.id}</p>
          <p>Date: ${new Date().toLocaleDateString()}</p>
        </div>
        <div class="items">
          ${invoiceData.items.map(item => `
            <div class="item">
              <span>${item.description}</span>
              <span>$${item.amount.toFixed(2)}</span>
            </div>
          `).join('')}
        </div>
        <div class="total">
          Total: $${invoiceData.items.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
        </div>
      </div>
    </body>
    </html>
  `;
}

const invoiceData = {
  id: '001',
  items: [
    { description: 'Web Development', amount: 500 },
    { description: 'UI Design', amount: 300 }
  ]
};

await htmlToPdfFile(
  generateInvoiceHTML(invoiceData),
  './invoice.pdf',
  { format: 'A4', margin: { top: 20, bottom: 20 } }
);
```

### Express.js Integration

```typescript
import { htmlToPdfBuffer } from 'fast-html-pdf';
import express from 'express';

const app = express();

app.get('/api/report/pdf', async (req, res) => {
  try {
    const html = `<h1>Monthly Report</h1><p>Generated on ${new Date().toISOString()}</p>`;
    const pdf = await htmlToPdfBuffer(html, { format: 'A4' });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');
    res.send(pdf);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

app.listen(3000);
```

### Error Handling

```typescript
import { htmlToPdfFile, FastHtmlPdfError } from 'fast-html-pdf';

try {
  await htmlToPdfFile('<h1>Test</h1>', './output.pdf');
} catch (error) {
  if (error instanceof FastHtmlPdfError) {
    console.error('PDF conversion failed:', error.message);
    console.error('Original error:', error.originalError);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Perfect For

 **Reports & Analytics** - Generate business reports dynamically  
 **Invoices & Receipts** - Create professional billing documents  
 **Certificates** - Design and generate certificates  
 **Tickets & Passes** - Generate event tickets and boarding passes  
 **Data Export** - Export data as formatted PDFs  
 **Email Attachments** - Generate PDFs for email distribution  

## Performance Tips

1. **Reuse HTML templates** - Pre-compile templates when possible
2. **Batch processing** - Use `htmlToPdfBatch()` for multiple documents
3. **Optimize HTML** - Remove unnecessary styles and scripts
4. **Set viewport explicitly** - Helps with consistent layout rendering
5. **Use appropriate wait conditions** - `networkidle` is safest but slower

## Troubleshooting

### "Cannot find module 'playwright'"
Ensure playwright is installed: `npm install playwright`

### PDF has blank content
- Check if HTML is valid
- Verify images/resources are accessible
- Try different `waitUntil` option: `'load'` or `'domcontentloaded'`
- Increase timeout if needed

### Memory issues with large batches
Process in smaller batches and use `htmlToPdfBatch()` for optimal resource management.

### Styling not applied
- Use inline styles or `<style>` tags
- Avoid external CSS files
- Use `additionalStyles` option for global CSS

## Browser Support

- ✅ Chromium (default, used by Playwright)
- Node.js only (server-side PDF generation)

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT © Nur

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and updates.

## Support

-  [Report Issues](https://github.com/nurmhm/fast-html-pdf/issues)
-  [Discussions](https://github.com/nurmhm/fast-html-pdf/issues/discussions)
-  [Documentation](https://github.com/nurmhm/fast-html-pdf/#readme)

---

Made with ❤️ by Nur Mohammad Akash
