# BillSplit

Split bills fairly, fast, and free. No account needed.

## Features

- Add people and items
- Assign people to items
- Calculate tax, service charge, and discounts
- Support for multiple currencies
- Share results via link
- Mobile-first design
- No login required

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Supabase

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Supabase Setup

1. Create a new Supabase project
2. Run the SQL schema in `supabase/schema.sql`
3. Get your project URL and anon key from the Supabase dashboard
4. Add them to your `.env` file:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## License

MIT 