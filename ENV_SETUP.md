# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://pingsociety.liara.run
NEXT_PUBLIC_API_TIMEOUT=10000

# Development settings
NODE_ENV=development
```

## Environment Variables Explained

### `NEXT_PUBLIC_API_BASE_URL`
- **Purpose**: Base URL for your backend API
- **Default**: `https://pingsociety.liara.run`
- **Usage**: Used in all API calls to your backend
- **Note**: Must start with `NEXT_PUBLIC_` to be accessible in client-side code

### `NEXT_PUBLIC_API_TIMEOUT`
- **Purpose**: Request timeout in milliseconds
- **Default**: `10000` (10 seconds)
- **Usage**: Applied to all API requests

### `NODE_ENV`
- **Purpose**: Environment mode
- **Values**: `development`, `production`, `test`
- **Usage**: Determines build optimizations and logging levels

## Setup Instructions

1. Copy the example above to `.env.local`
2. Modify the values according to your environment
3. Restart your development server: `npm run dev`

## Production Deployment

For production, set these environment variables in your hosting platform:

- **Vercel**: Add in Project Settings > Environment Variables
- **Netlify**: Add in Site Settings > Environment Variables
- **Railway**: Add in Project Settings > Variables

## Security Notes

- Never commit `.env.local` to version control
- Use different API URLs for development and production
- Consider using environment-specific configurations
