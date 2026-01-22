import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { message, sessionId } = body;

        // The N8N Production Webhook URL
        const N8N_WEBHOOK_URL = 'https://n8n.mediclick.us/webhook/chatbot';

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

        if (!response.ok) {
            throw new Error(`N8N responded with status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Error proxying to N8N:', error);
        return NextResponse.json(
            { error: 'Failed to communicate with the chatbot service.' },
            { status: 500 }
        );
    }
}
