# TagReview – Peer Review for Online Learning

TagReview is a single-page web app where learners post their work, peers review it, and everyone tracks their course progress together. Built by **The Tag Team**.

It is built with plain HTML, CSS and JavaScript. No framework, build step or server is required.

## Features

- Sign up and log in (Learner or Admin role)
- Courses: search, category filter, enroll and leave
- Submissions: post your work (title plus 30+ characters) and filter by status (Waiting for reviewers / In review / Reviewed)
- Review queue: rate peers' work on Clarity, Accuracy and Depth (1–5) and add written feedback (10+ characters)
- Dashboard: enrolled courses, submissions, reviews given and received, and progress bars
- Notifications: alerts for new submissions and reviews, with "Mark all as read"
- Profile editing and log out
- Admin panel: usage stats and adding or deleting courses
- Light and dark mode (follows the system setting), responsive layout and keyboard-friendly focus styles

## Project Structure

```
TagReview/
├── index.html   # page structure
├── style.css    # styling (light and dark theme)
├── script.js    # app logic, seed data and rendering
└── README.md
```

## How to Run

1. Extract the zip.
2. Open `index.html` in any modern browser.

That's it. An internet connection is only needed for the Google Font (Bricolage Grotesque). Offline, the app falls back to the system font.

## Demo Accounts

| Role    | Email          | Password |
|---------|----------------|----------|
| Learner | ansh@tag.edu   | learn123 |
| Learner | riya@tag.edu   | learn123 |
| Learner | dev@tag.edu    | learn123 |
| Admin   | admin@tag.edu  | admin123 |

## Course Completion Rule

Progress in each course requires 1 submission and 2 peer reviews (`REQ_SUB` and `REQ_REV` in `script.js`). A submission is marked "Reviewed" once it has received 2 reviews (`NEED`).

## Data Storage

All data is saved in the browser's `localStorage` under the key `tagreview-v1`. This means:

- Data stays only in that browser on that device. Nothing is sent to a server.
- To reset the app, open DevTools → Application → Local Storage, delete `tagreview-v1`, and reload the page.

## Important Note

This is a demo and prototype. Passwords are stored in plain text in localStorage and there is no real authentication, so do not use it in production or with real user data. A real deployment would need a backend and proper password hashing.

## Customization

- Courses, users and seed data: the `seed()` function in `script.js`
- Review criteria: the `CRIT` array in `script.js`
- Colors and theme: the CSS variables under `:root` in `style.css`
