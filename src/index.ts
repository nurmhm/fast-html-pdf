
import { writeFile } from 'fs/promises';
import { resolve } from 'path/win32';
import { chromium, type Page } from 'playwright';


// Export types for users to use in options from playwright page.pdf() options
type PDFOptions = Parameters<Page["pdf"]>[0];

export type FastHtmlPdfOptions = PDFOptions & {
    /**
        * Wait condition before rendering PDF.
        * - "load": Page load event fired
        * - "domcontentloaded": DOM is fully loaded
        * - "networkidle": No network requests for 500ms (default, most reliable)   
     * @default 'networkidle'
     */

    waitUntil?: "load" | "domcontentloaded" | "networkidle";

    /**
     * Additional CSS to inject into the HTML.
     * Useful for global styles or overrides.
     */
    additionalStyles?: string;
    /**
     * Viewport size for rendering.
     * Some layouts depend on viewport dimensions.
     
     */
    viewport?: {
        width: number;
        height: number;
    };
};

/**
 * Error thrown during PDF conversion process.
 */
export class FastHtmlPdfError extends Error {
    constructor(
        message: string,
        public readonly originalError?: Error
    ){
        super(message);
        this.name = "FastHtmlPdfError";
        Object.setPrototypeOf(this, FastHtmlPdfError.prototype);
    }
}


/**
 * Internal utility to manage browser lifecycle.
 * Ensures browser is properly closed even if an error occurs.
 * @internal
 * @param fn - Async function to execute with a Playwright page instance
 * @returns Result of the provided function
 * @throws {FastHtmlPdfError} If browser creation or page operation fails
 */

async function withBrowser<T>(
    fn: (page: import("playwright").Page) => Promise<T>
): Promise<T> {
    let browser;
    try {
        browser = await chromium.launch();
        const page = await browser.newPage();
        try {
            return await fn(page);
        }finally {
            await page.close();
        }
    } catch (error) {
        throw new FastHtmlPdfError(
            "Failed to convert HTML to PDF",
            error instanceof Error ? error : new Error(String(error))
        );
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}
 
/**
 * Convert an HTML string to a PDF Buffer.
 *
 * @param html - HTML content as string
 * @param options - Conversion options (optional)
 * @returns Promise resolving to a Buffer containing the PDF data
 *
 * @example
 * ```ts
 * import { htmlToPdfBuffer } from 'html-string-to-pdf';
 *
 * const html = '<h1>Hello World</h1>';
 * const pdfBuffer = await htmlToPdfBuffer(html, {
 *   format: 'A4',
 *   margin: { top: 10, bottom: 10 }
 * });
 * ```
 *
 * @throws {HtmlToPdfError} If conversion fails
 */

export async function htmlToPdfBuffer(
  html: string,
  options: FastHtmlPdfOptions = {}
): Promise<Buffer> {
  if (!html || typeof html !== "string") {
    throw new FastHtmlPdfError("HTML content must be a non-empty string");
  }

  const {
    waitUntil = "networkidle",
    additionalStyles,
    viewport,
    ...pdfOptions
  } = options;

  return withBrowser(async (page) => {
    // Set viewport if provided
    if (viewport) {
      await page.setViewportSize(viewport);
    }

    // Prepare HTML with additional styles
    let finalHtml = html;
    if (additionalStyles) {
      finalHtml = html.replace(
        /(<\/head>)/i,
        `<style>${additionalStyles}</style>$1`
      );
    }

    // Set content with proper wait condition
    await page.setContent(finalHtml, { waitUntil });

    // Generate PDF with sensible defaults
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      ...pdfOptions,
    });

    return Buffer.from(pdf);
  });
}

/**
 * Convert an HTML string to a PDF file and save to disk.
 *
 * @param html - HTML content as string
 * @param outputPath - Path where to save the PDF file
 * @param options - Conversion options (optional)
 * @returns Promise resolving to the absolute path of the saved PDF
 *
 * @example
 * ```ts
 * import { htmlToPdfFile } from 'html-string-to-pdf';
 *
 * const html = '<h1>Invoice #123</h1><p>Amount: $99.99</p>';
 * const path = await htmlToPdfFile(html, './invoice.pdf', {
 *   format: 'A4'
 * });
 * console.log(`PDF saved to: ${path}`);
 * ```
 *
 * @throws {HtmlToPdfError} If conversion or file write fails
 */

export async function htmlToPdfFile(
  html: string,
  outputPath: string,
  options: FastHtmlPdfOptions = {}
): Promise<string> {
  if (!outputPath || typeof outputPath !== "string") {
    throw new FastHtmlPdfError("Output path must be a non-empty string");
  }

  try {
    const buf = await htmlToPdfBuffer(html, options);
    const absolutePath = resolve(outputPath);
    await writeFile(absolutePath, buf);
    return absolutePath;
  } catch (error) {
    if (error instanceof FastHtmlPdfError) {
      throw error;
    }
    throw new FastHtmlPdfError(
      `Failed to save PDF to ${outputPath}`,
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Convert multiple HTML strings to separate PDF files in batch.
 *
 * @param htmlArray - Array of tuples containing [html, outputPath]
 * @param options - Conversion options applied to all conversions
 * @returns Promise resolving to array of saved file paths
 *
 * @example
 * ```ts
 * import { htmlToPdfBatch } from 'html-string-to-pdf';
 *
 * const batch = [
 *   ['<h1>Report 1</h1>', './report1.pdf'],
 *   ['<h1>Report 2</h1>', './report2.pdf']
 * ];
 * const paths = await htmlToPdfBatch(batch);
 * ```
 */
export async function htmlToPdfBatch(
  htmlArray: Array<[html: string, outputPath: string]>,
  options: FastHtmlPdfOptions = {}
): Promise<string[]> {
  if (!Array.isArray(htmlArray) || htmlArray.length === 0) {
    throw new FastHtmlPdfError("Input must be a non-empty array of [html, path] tuples");
  }

  return Promise.all(
    htmlArray.map(([html, path]) => htmlToPdfFile(html, path, options))
  );
}

// Export types for users
export type { Page } from "playwright";