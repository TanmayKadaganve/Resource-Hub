# Deployment guide

The frontend is a Vite single-page app, the API runs as an Express web service, and MongoDB is hosted in Atlas.

## 1. Configure MongoDB Atlas

1. Create an Atlas cluster and a database user with access to the app database.
2. In **Network Access**, allow the outbound IP ranges shown for the Render API service. Render shows these under the service's **Connect → Outbound** panel. If the service does not exist yet, create it first and return to this step.
3. Copy the Atlas application's `mongodb+srv://` connection string. Replace its username, password, cluster host, and database name. URL-encode reserved characters in the password.

Keep the database password private. Do not commit it or put it in a `VITE_` variable.

## 2. Deploy the API to Render

Connect this repository to Render and create the service from the root `render.yaml` Blueprint. It sets `backend` as the service root, runs `npm ci` and `npm start`, and checks `/api/health`.

Set `MONGODB` to the Atlas connection string in the Render service's environment. The Blueprint generates `JWT_SECRET`. After deploying the frontend, change `FRONTEND_URL` to the Vercel production origin, for example `https://resource-hub.vercel.app` (no trailing slash). Multiple allowed origins can be comma-separated. Redeploy after changing environment variables.

To create the faculty credentials, set the six `*_FACULTY_PASSWORD` variables from `backend/.env.example` in your local `backend/.env`, then run `npm run seed:faculty` from the `backend` directory while connected to Atlas. The script inserts a branch credential only if it does not already exist. To change an existing password, update that Faculty record or delete it before reseeding.

## 3. Deploy the frontend to Vercel

Import the same repository as a Vercel project. Set **Root Directory** to `frontend`, use the Vite framework preset, and keep the default build command (`npm run build`) and output directory (`dist`). `frontend/vercel.json` rewrites client-side routes to the app entry point.

In Vercel's project environment variables, set `VITE_API_URL` to the Render service URL followed by `/api`, for example `https://resource-hub-api.onrender.com/api`. Set it for Production and any Preview environments you use, then redeploy; Vite embeds this value at build time.

Finally, update Render's `FRONTEND_URL` to the exact Vercel production origin. If preview deployments also need API access, add their exact origins as comma-separated values in Render.

## Local environment files

Copy `backend/.env.example` to `backend/.env` and `frontend/.env.example` to `frontend/.env.local` for local development. The API URL defaults to `http://localhost:5000/api` when `VITE_API_URL` is not set.
