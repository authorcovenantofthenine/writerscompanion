import React, { useState } from 'react';
import { Copy, CheckCheck } from 'lucide-react';

export default function InviteLink({ circleId, inviteUrl }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback: select the text
    }
  };

  return (
    <div className="parchment-scroll max-w-2xl mx-auto p-6 sm:p-8 text-center">
      <h3 className="font-display text-2xl sm:text-3xl text-[var(--gold-accent)] mb-2">
        Summon Your Circle
      </h3>
      <p className="font-serif-display italic text-[var(--parchment-text)]/80 mb-6 text-base sm:text-lg leading-relaxed">
        Share this link with two others. The circle cannot begin until all three have answered the call.
      </p>

      <div
        className="invite-link-display mb-4 cursor-pointer"
        onClick={handleCopy}
        role="button"
        aria-label="Click to copy invite link"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleCopy()}
      >
        {inviteUrl}
      </div>

      <button
        onClick={handleCopy}
        className="copy-button"
        aria-label="Copy invite link"
      >
        {copied ? (
          <>
            <CheckCheck size={16} />
            Copied!
          </>
        ) : (
          <>
            <Copy size={16} />
            Copy Invite Link
          </>
        )}
      </button>
    </div>
  );
}
