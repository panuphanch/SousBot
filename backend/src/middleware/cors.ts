import { Request, Response, NextFunction } from 'express';

// Apply this as the first middleware
const allowCors = (req: Request, res: Response, next: NextFunction) => {
  // Always log the incoming request method before anything else
  console.log(`CORS middleware handling: ${req.method} ${req.url}`);

  // Allow requests from any origin
  const origin = req.headers.origin;
  console.log('Origin:', origin);
  
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // If no origin is provided, allow any origin
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  // Allow credentials
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Allow these methods
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  
  // Allow these headers
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
};

export default allowCors;