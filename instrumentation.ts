/** Launches the shared export browser at server boot, not on the first click. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { getBrowser } = await import("@/lib/server/browser");
  // Not awaited: the server should come up even if Chrome is slow or fails.
  // The export route retries the launch on its next request.
  getBrowser().catch((error: unknown) => {
    console.error("Could not launch the export browser at startup", error);
  });
}
