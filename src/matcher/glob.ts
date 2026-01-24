import picomatch from 'picomatch'

/**
 * Tests if a path matches a glob pattern (gitignore-style)
 */
export function matchGlob(pattern: string, filePath: string): boolean {
  // Normalize path separators
  const normalizedPath = filePath.replace(/\\/g, '/')
  const normalizedPattern = pattern.replace(/\\/g, '/')

  // Create matcher with gitignore-like options
  const isMatch = picomatch(normalizedPattern, {
    dot: true, // Match dotfiles
    bash: true, // Enable bash-like globbing
    nobrace: false, // Enable brace expansion
    noglobstar: false, // Enable **
  })

  return isMatch(normalizedPath)
}
