// Fallback composable for environments where @nuxt/image auto-imports
// are not resolved by unimport at runtime.
// This returns an identity builder so existing consumers don't crash.
export function useImage() {
  return function $img(src: string, _modifiers?: Record<string, any>) {
    return src;
  };
}
