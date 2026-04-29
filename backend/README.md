# Google Apps Script Backend Setup

To enable the database synchronization (saving profiles, files, and research to Google Sheets), you need to update your Google Apps Script backend.

## Instructions

1. Open your Google Sheet that you want to use as a database.
2. Go to **Extensions > Apps Script**.
3. Replace the existing code in `Code.gs` with the code provided in `backend/Code.gs` in this repository.
4. Run the `setup()` function once from the Apps Script editor. This will automatically create the necessary sheets (`Users`, `Profiles`, `Files`, `Research`) and set up the headers.
5. Click **Deploy > New deployment**.
6. Select **Web app** as the deployment type.
7. Set **Execute as** to `Me`.
8. Set **Who has access** to `Anyone`.
9. Click **Deploy** and authorize the script if prompted.
10. Copy the **Web app URL**.
11. If the URL is different from the one currently in `src/services/api.ts` (or `services/api.ts`), update the `GAS_URL` constant in that file.

Your app will now successfully sync user registration, profile data (including children and spouse info), files, and research directly to your Google Sheet!
