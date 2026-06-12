export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent);
}

function isIOS(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function launchZoomMeeting(options: {
  mobileLink: string;
  webLink: string;
  androidIntent?: string;
}): void {
  const { mobileLink, webLink, androidIntent } = options;

  if (!isMobileDevice()) {
    window.open(webLink, '_blank', 'noopener,noreferrer');
    return;
  }

  if (isAndroid() && androidIntent) {
    window.location.assign(androidIntent);
    return;
  }

  let cancelled = false;
  const fallbackTimer = window.setTimeout(() => {
    if (!cancelled && document.visibilityState === 'visible') {
      window.location.assign(webLink);
    }
  }, 1500);

  const cancelFallback = () => {
    if (cancelled) return;
    cancelled = true;
    window.clearTimeout(fallbackTimer);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('pagehide', cancelFallback);
  };

  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      cancelFallback();
    }
  };

  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('pagehide', cancelFallback);

  if (isIOS()) {
    window.location.assign(mobileLink);
    return;
  }

  window.location.assign(mobileLink);
}
