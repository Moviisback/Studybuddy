import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import crypto from 'crypto';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const access = promisify(fs.access);

// Directory to store uploaded files
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await access(UPLOAD_DIR);
  } catch (error) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export interface FileMetadata {
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  filename: string;
  content: string;
}

export class FileProcessor {
  /**
   * Save a file to disk and return file metadata
   */
  async saveFile(fileBuffer: Buffer, originalName: string, mimetype: string): Promise<FileMetadata> {
    await ensureUploadDir();
    
    // Generate a unique filename
    const hash = crypto.createHash('md5').update(originalName + Date.now()).digest('hex');
    const ext = path.extname(originalName);
    const filename = `${hash}${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);
    
    // Write the file to disk
    await writeFile(filePath, fileBuffer);
    
    // Extract text content based on file type
    const content = await this.extractContent(filePath, mimetype);
    
    return {
      originalName,
      mimetype,
      size: fileBuffer.length,
      path: filePath,
      filename,
      content
    };
  }
  
  /**
   * Extract text content from supported file types
   */
  async extractContent(filePath: string, mimetype: string): Promise<string> {
    try {
      // Handle different file types
      if (mimetype === 'text/plain') {
        const buffer = await readFile(filePath, 'utf8');
        return buffer.toString();
      }
      
      // For PDF files, we'd normally use a library like pdf-parse
      // But for simplicity, we'll just read as text for this example
      if (mimetype === 'application/pdf') {
        // In a real implementation, we would use a PDF parsing library
        const buffer = await readFile(filePath);
        return `PDF content extraction would happen here for "${path.basename(filePath)}"`;
      }
      
      // Unsupported file type
      return `Content extraction not supported for mimetype: ${mimetype}`;
    } catch (error) {
      console.error('Error extracting content:', error);
      return 'Error extracting content from file';
    }
  }
  
  /**
   * Delete a file from disk
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      await fs.promises.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
}

export const fileProcessor = new FileProcessor();
