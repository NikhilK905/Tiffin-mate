# DabbaDost: Monthly Tiffin Subscription for Students

## 1. Introduction

DabbaDost is a web application where students subscribe to a monthly tiffin (meal) plan from local home kitchens. This is a college project; all names, contact details and testimonials are fictional.

## 2. Features

- Browse veg and non-veg plans, filter them, and compare them in a table
- Weekly menu page
- User sign-up / login and a personal dashboard
- Subscribe to a plan and skip days when away
- Admin login (demo)
- Contact form with validation and FAQ
- Light and dark mode, responsive layout
- Toast notifications

## 3. Tech Stack

| Area | Technology |
| --- | --- |
| UI | React 19, Vite |
| State | Redux Toolkit |
| Routing | react-router |
| HTTP | axios (loads `public/data/*.json`) |
| Styling | Tailwind CSS v4 |
| Notifications | react-toastify |
| Theme | React Context (`ThemeContext`) |

## 4. Folder Structure

```
public/data/     plans.json, menu.json (catalog data)
src/components/  Navbar, Footer, PlanCard
src/context/     ThemeContext (dark mode)
src/lib/         subscription logic and tests
src/pages/       Home, Plans, Menu, About, Contact, Auth, Subscribe, Dashboard
src/store/       Redux slices (auth, catalog, subscription)
```

## 5. Setup

```bash
npm install     # install dependencies
npm run dev     # start the dev server
npm test        # run unit tests
npm run build   # production build
```

## 6. Demo Admin Login

- Email: `admin@dabbadost.in`
- Password: `admin123`

## 7. Data Storage

There is no backend. Users, subscriptions and contact messages (`tiffin-messages`) are stored in the browser's **localStorage**; plans and menu are read from static JSON files. Clearing browser data resets the app.
