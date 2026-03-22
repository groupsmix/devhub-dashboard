/**
 * Cloudflare Pages Function — Proxy for Google Apps Script
 *
 * This runs server-side on Cloudflare, so there are no CORS issues.
 * The frontend calls /api/sheets (same origin) and this function
 * forwards requests to the Google Apps Script web app.
 *
 * Set the SHEETS_API_URL environment variable in your Cloudflare Pages
 * dashboard (Settings > Environment variables).
 */

export async function onRequestGet(context) {
  const url = context.env.SHEETS_API_URL;

  if (!url) {
    return Response.json(
      { success: false, error: 'SHEETS_API_URL not configured in Cloudflare Pages environment' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(url, { redirect: 'follow' });
    const text = await response.text();

    return new Response(text, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    return Response.json(
      { success: false, error: `Proxy error: ${err.message}` },
      { status: 502 }
    );
  }
}

export async function onRequestPost(context) {
  const url = context.env.SHEETS_API_URL;

  if (!url) {
    return Response.json(
      { success: false, error: 'SHEETS_API_URL not configured in Cloudflare Pages environment' },
      { status: 500 }
    );
  }

  try {
    const body = await context.request.text();

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: body,
      redirect: 'follow',
    });

    const text = await response.text();

    return new Response(text, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    return Response.json(
      { success: false, error: `Proxy error: ${err.message}` },
      { status: 502 }
    );
  }
}
