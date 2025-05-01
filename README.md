This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started
1. Make sure you have Node.js installed
2. Install dependencies:
    ```npm install```
3. Run the development server:
    ```npm run dev```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Component Used in this Project
- shadcn

## Database Used in this Project
- Firebase

## Project Structure
```
Daily_Planer_App/
├── app/                          # Next.js App Router directory
│   ├── planner/                  # Planner route
│   │   └── page.tsx              # Planner page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Root (home)
├── components/                   # Reusable UI components
│   ├── ui/
│   └── CustomCalendar.tsx    # Custom calendar component
├── firebase.ts                   # Firebase configuration
```
