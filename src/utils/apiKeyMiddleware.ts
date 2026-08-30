import { Request, Response, NextFunction } from 'express';

/**
 * API Key middleware for external partner system integrations.
 * Validates the `X-API-Key` header against the value stored in
 * the EXTERNAL_PARTNER_API_KEY environment variable.
 *
 * Responds with 401 Unauthorized if the key is missing or invalid.
 */
export const validateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const providedKey = req.headers['x-api-key'];
  const expectedKey = process.env.EXTERNAL_PARTNER_API_KEY;

  if (!expectedKey) {
    console.error('[apiKeyMiddleware] EXTERNAL_PARTNER_API_KEY environment variable is not set.');
    res.status(500).json({
      status: false,
      msg: 'Server configuration error: API key is not configured.',
    });
    return;
  }

  if (!providedKey || providedKey !== expectedKey) {
    res.status(401).json({
      status: false,
      msg: 'Unauthorized: Invalid or missing API key.',
    });
    return;
  }

  next();
};
