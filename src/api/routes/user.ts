import { createApiContext, handleCors, parseBody } from '../middleware';
import { createDatabase, type Env } from '../../db';
import { ReadingHistoryService, UserPreferencesService } from '../../lib/services';
import { successResponse, errorResponse } from '../../lib/errors';

export async function handleReadingHistory(request: Request, env: Env): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const db = createDatabase(env);
    const ctx = await createApiContext(request, db);
    const readingHistoryService = new ReadingHistoryService(db);

    if (request.method === 'POST') {
      const body = await parseBody<{
        articleSlug: string;
        progress: number;
        readTime?: number;
      }>(request);

      const result = await readingHistoryService.updateProgress(
        body.articleSlug,
        ctx.sessionId,
        body.progress,
        body.readTime
      );

      return successResponse(result);
    }

    if (request.method === 'GET') {
      const action = ctx.url.searchParams.get('action');

      if (action === 'continue') {
        const continueReading = await readingHistoryService.getContinueReading(ctx.sessionId);
        return successResponse(continueReading);
      }

      const slug = ctx.url.searchParams.get('slug');
      if (slug) {
        const progress = await readingHistoryService.getProgress(slug, ctx.sessionId);
        return successResponse(progress);
      }

      const recent = await readingHistoryService.getRecent(ctx.sessionId);
      return successResponse(recent);
    }

    return errorResponse(new Error('Method not allowed'));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function handleUserPreferences(request: Request, env: Env): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const db = createDatabase(env);
    const ctx = await createApiContext(request, db);
    const preferencesService = new UserPreferencesService(db);

    if (request.method === 'POST' || request.method === 'PUT') {
      const body = await parseBody<{
        theme?: 'light' | 'dark' | 'system';
        fontSize?: number;
        contentWidth?: number;
        lineHeight?: number;
        readingMode?: 'default' | 'reader' | 'focused';
      }>(request);

      // Validate font size
      if (body.fontSize !== undefined && (body.fontSize < 12 || body.fontSize > 24)) {
        return errorResponse(new Error('Font size must be between 12 and 24'));
      }

      // Validate content width
      if (
        body.contentWidth !== undefined &&
        (body.contentWidth < 480 || body.contentWidth > 1200)
      ) {
        return errorResponse(new Error('Content width must be between 480 and 1200'));
      }

      // Validate line height
      if (body.lineHeight !== undefined && (body.lineHeight < 1.0 || body.lineHeight > 3.0)) {
        return errorResponse(new Error('Line height must be between 1.0 and 3.0'));
      }

      const result = await preferencesService.update(ctx.sessionId, body);
      return successResponse(result, 'Preferences updated');
    }

    if (request.method === 'GET') {
      const preferences = await preferencesService.get(ctx.sessionId);
      return successResponse(preferences);
    }

    return errorResponse(new Error('Method not allowed'));
  } catch (error) {
    return errorResponse(error);
  }
}
