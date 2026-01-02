export function getWelcomeEmailHtml(name: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to PressurePlay</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h1 style="color: #2563eb; margin-bottom: 24px;">Welcome to PressurePlay!</h1>

    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      Hi ${name || "there"},
    </p>

    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      You've taken the first step toward mastering your next raise or promotion conversation.
      With PressurePlay, you'll practice real negotiation scenarios in just 3-5 minutes and get
      personalized scripts you can actually use.
    </p>

    <h2 style="color: #1f2937; font-size: 18px; margin-top: 32px;">Here's what's next:</h2>

    <ol style="color: #374151; font-size: 16px; line-height: 1.8;">
      <li><strong>Complete your profile</strong> - This helps us personalize your experience</li>
      <li><strong>Try your first scenario</strong> - The weekly free scenario is available now</li>
      <li><strong>Get your playbook</strong> - Use the scripts in your real conversation</li>
    </ol>

    <div style="margin-top: 32px; text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/onboarding"
         style="display: inline-block; background-color: #2563eb; color: white; padding: 14px 28px;
                text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Get Started
      </a>
    </div>

    <p style="color: #6b7280; font-size: 14px; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
      Questions? Just reply to this email - we're here to help.
    </p>

    <p style="color: #6b7280; font-size: 14px;">
      — The PressurePlay Team
    </p>
  </div>
</body>
</html>
`;
}

export function getSubscriptionActivatedEmailHtml(name: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to PressurePlay Pro</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h1 style="color: #2563eb; margin-bottom: 24px;">You're now a Pro! 🎉</h1>

    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      Hi ${name || "there"},
    </p>

    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      Your PressurePlay Pro subscription is now active. You have full access to everything:
    </p>

    <ul style="color: #374151; font-size: 16px; line-height: 1.8;">
      <li><strong>All scenarios</strong> - The complete library of negotiation simulations</li>
      <li><strong>Personalized playbooks</strong> - Scripts tailored to your role and situation</li>
      <li><strong>ROI estimates</strong> - See the potential $ impact of your decisions</li>
      <li><strong>Action tracking</strong> - Plan and track your preparation steps</li>
      <li><strong>Export & copy</strong> - Take your scripts anywhere</li>
    </ul>

    <div style="margin-top: 32px; text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/library"
         style="display: inline-block; background-color: #2563eb; color: white; padding: 14px 28px;
                text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Explore All Scenarios
      </a>
    </div>

    <p style="color: #6b7280; font-size: 14px; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
      Manage your subscription anytime from your <a href="${process.env.NEXT_PUBLIC_APP_URL}/account" style="color: #2563eb;">account settings</a>.
    </p>

    <p style="color: #6b7280; font-size: 14px;">
      — The PressurePlay Team
    </p>
  </div>
</body>
</html>
`;
}

export function getMeetingReminderEmailHtml(
  name: string,
  meetingDate: string,
  scenarioTitle: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your meeting is coming up</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  <div style="background: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h1 style="color: #2563eb; margin-bottom: 24px;">Your meeting is in 2 days</h1>

    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      Hi ${name || "there"},
    </p>

    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      Just a reminder: your compensation conversation is scheduled for <strong>${meetingDate}</strong>.
    </p>

    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      Here's what we suggest:
    </p>

    <ol style="color: #374151; font-size: 16px; line-height: 1.8;">
      <li>Run through the "${scenarioTitle}" scenario one more time</li>
      <li>Review your playbook and talking points</li>
      <li>Check off your action items</li>
    </ol>

    <div style="margin-top: 32px; text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
         style="display: inline-block; background-color: #2563eb; color: white; padding: 14px 28px;
                text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Final Prep
      </a>
    </div>

    <p style="color: #6b7280; font-size: 14px; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
      You've got this. Trust your preparation.
    </p>

    <p style="color: #6b7280; font-size: 14px;">
      — The PressurePlay Team
    </p>
  </div>
</body>
</html>
`;
}
