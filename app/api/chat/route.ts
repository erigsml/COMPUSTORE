import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { message, sessionId } = body;

        console.log('[Chat API] Received request:', { message, sessionId });

        // The N8N Production Webhook URL
        const N8N_WEBHOOK_URL = 'https://n8n.mediclick.us/webhook/chatbot';

        console.log('[Chat API] Calling N8N webhook:', N8N_WEBHOOK_URL);

        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chatInput: message,
                sessionId: sessionId
            }),
        });

        console.log('[Chat API] N8N response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Chat API] N8N error response:', errorText);
            throw new Error(`N8N responded with status: ${response.status}`);
        }

        const data = await response.json();
        console.log('[Chat API] N8N response data:', data);

        return NextResponse.json(data);

    } catch (error) {
        console.error('[Chat API] Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to communicate with the chatbot service.',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
