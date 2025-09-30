/**
 * Copy text to the clipboard.
 *
 * Uses the modern Clipboard API when available in secure contexts,
 * with a fallback to the legacy execCommand method for older browsers.
 *
 * @param text - The text to copy to the clipboard
 * @returns Promise that resolves to true if successful, false otherwise
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-999999px';
      textarea.style.top = '-999999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand('copy');
      textarea.remove();
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}
