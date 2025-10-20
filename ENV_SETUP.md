# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in your project root with the following variable:

```bash
NEXT_PUBLIC_API_URL=https://pingsociety.liara.run
```

## Environment Variables Explained

### `NEXT_PUBLIC_API_URL`
- **Purpose**: Base URL for your backend API
- **Default**: `https://pingsociety.liara.run`
- **Usage**: Used in all API calls to your backend
- **Note**: Must start with `NEXT_PUBLIC_` to be accessible in client-side code

## Setup Instructions

1. Copy the example above to `.env.local`
2. Modify the URL according to your environment
3. Restart your development server: `npm run dev`

## Production Deployment

For production, set this environment variable in your hosting platform:

- **Vercel**: Add in Project Settings > Environment Variables
- **Netlify**: Add in Site Settings > Environment Variables
- **Railway**: Add in Project Settings > Variables

## Security Notes

- Never commit `.env.local` to version control
- Use different API URLs for development and production