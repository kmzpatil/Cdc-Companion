export interface ReviewEmailOptions {
  to: string;
  userName: string;
  reviewComments: string[];
  aiSuggestions?: string;
}

const getFrontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:3000';
const getSecret = () => process.env.MAILER_SECRET || 'dev_secret';

export async function sendReviewEmail(options: ReviewEmailOptions): Promise<void> {
  const res = await fetch(`${getFrontendUrl()}/api/mailer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getSecret()}`
    },
    body: JSON.stringify({
      action: 'REVIEW',
      payload: options
    })
  });
  if (!res.ok) {
    throw new Error(`Failed to send review email: ${await res.text()}`);
  }
}

export async function sendRegistrationEmail(to: string, userName: string, password: string, cvLink: string, profile: string): Promise<void> {
  const res = await fetch(`${getFrontendUrl()}/api/mailer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getSecret()}`
    },
    body: JSON.stringify({
      action: 'REGISTRATION',
      payload: { to, userName, password, cvLink, profile }
    })
  });
  if (!res.ok) {
    throw new Error(`Failed to send registration email: ${await res.text()}`);
  }
}