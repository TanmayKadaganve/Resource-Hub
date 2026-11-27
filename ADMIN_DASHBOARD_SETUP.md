# Admin Dashboard setup

1. In `backend/.env`, set `ADMIN_EMAIL` and choose a unique `ADMIN_PASSWORD` with at least 12 characters. Keep it private and keep `.env` out of Git.
2. From the `backend` folder, run `npm run seed:admin` once. It creates or updates the hashed admin account in the configured MongoDB database.
3. Start the backend and frontend, then open `/admin/login`. The website footer also has an Admin Login link.
4. For Render, set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `MONGODB`, and `JWT_SECRET` in the backend environment. Run `npm run seed:admin` once against the same database before logging in.

The dashboard supports cross-branch resource listing, searching, uploads and deletion; faculty account listing and password resets; lab link management; branch coverage; notice publishing/unpublishing/deletion; academic-link management; and recent faculty/admin activity. Public notices and academic links appear at `/notices`.

Faculty activity is recorded from the time this feature is deployed; existing historical uploads do not have actor history. Branches remain the project's configured set; academic links can be assigned to a branch or all branches.
