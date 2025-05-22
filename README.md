This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

### Prerequisites

- Node.js (v14.6.0 or later)
- Vercel CLI (install with `npm install -g vercel`)
- A Vercel account (sign up at [vercel.com](https://vercel.com))

### Deployment Steps

1. **Install Vercel CLI** (if not already installed):

   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:

   ```bash
   vercel login
   ```

   Follow the prompts to authenticate with your Vercel account.

3. **Deploy to Production**:

   ```bash
   vercel --prod
   ```

   This will deploy your application to production. The first time you run this command, it will guide you through the setup process.

4. **For Subsequent Deployments**:
   ```bash
   vercel --prod
   ```

### Environment Variables

Make sure to set up the following environment variables in your Vercel project settings:

1. Go to your project in the Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Add the following variables:
   ```
   RESEND_API_KEY=your_resend_api_key_here
   ```

### Manual Deployment via Vercel Dashboard

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your repository in the Vercel dashboard
3. Configure the project settings (if needed) and deploy

### Preview Deployments

Vercel automatically creates preview deployments for pull/merge requests. To create a preview deployment:

```bash
vercel
```

### Additional Commands

- View deployment logs:

  ```bash
  vercel logs
  ```

- List all deployments:

  ```bash
  vercel ls
  ```

- Open the project in your browser:
  ```bash
  vercel open
  ```

For more information, check out the [Vercel CLI documentation](https://vercel.com/docs/cli).
