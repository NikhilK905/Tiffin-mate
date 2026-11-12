import { useState } from 'react';

// Photo with lazy loading and a gradient + emoji fallback, so a broken image never shows.
export default function Photo({ image, emoji = '🍛', className = '', eager = false }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div role="img" aria-label={image.alt} className={`flex items-center justify-center bg-gradient-to-br from-orange-200 via-turmeric-100 to-green-100 text-6xl dark:from-orange-900/50 dark:via-stone-800 dark:to-green-900/40 ${className}`}>
        <span aria-hidden="true">{emoji}</span>
      </div>
    );
  }
  return (
    <img
      src={image.src}
      alt={image.alt}
      loading={eager ? 'eager' : 'lazy'}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
