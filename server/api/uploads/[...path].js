import { join } from 'path';
import { createReadStream, statSync } from 'fs';
import { sendStream } from 'h3';

export default defineEventHandler(async (event) => {
  const path = event.context.params.path;
  const filePath = join(process.cwd(), '../uploads', path);
  
  try {
    const stat = statSync(filePath);
    if (stat.isFile()) {
      const stream = createReadStream(filePath);
      return sendStream(event, stream);
    }
  } catch (error) {
    throw createError({
      statusCode: 404,
      statusMessage: 'File not found'
    });
  }
});