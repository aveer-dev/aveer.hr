![Frame 43](https://github.com/user-attachments/assets/ee618f4f-044b-4722-b0c1-07638060154f)

<div align="center">  
    <h3 style="font-size: '2rem';">aveer.hr</h1>
    <p>A simple employee management tool for everyone.</p>
</div>

<br />
<br />
<br />
<br />
<br />

## About
aveer.hr is an employee management tool for founders and employees; with focus on design and simplicity.

![Screen Recording 2025-02-04 at 2 58 29 AM](https://github.com/user-attachments/assets/7f2f6ed9-b852-41c2-9a8c-7e2011e0c2aa)


## Built with
- [Next js](https://nextjs.org/docs/app/getting-started/installation)
- [Supabase](https://supabase.com/docs/guides/local-development)
- [Shadcn](https://ui.shadcn.com/docs/installation/next) / [Tailwind 3](https://v3.tailwindcss.com/docs/guides/nextjs)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)


## Setup
### Prerequisites
Here is what you need to be able to run aveer.hr

- Node.js (Version: >=18.x)
- Supabase cloud or local setup (Postgress)
- Pnpm (recommended)


### Development
1. Clone the repo

```
https://github.com/aveer-dev/aveer.hr.git
```

2. Go to the project folder

```bash
cd aveer.hr
```

3. Set up your .env file

- Duplicate .env.example to .env
- Fill with tokens necessary information as required

4. Install packages with pnpm

```bash
pnpm i
```

5. Run db migration

- Follow instructions [here](https://supabase.com/docs/guides/local-development/cli/getting-started) to install Supabase CLI
- Run the following command

```bash
# supabase init
# supabase start
# supabase migrate up
```

6. Run the local server:

```bash
pnpm dev
```

7. Open [http://localhost:3000](http://localhost:3000) with your browser to create an account and continue.
