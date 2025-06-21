// Server-side function to check available OAuth providers
export function getAvailableProviders() {
  return {
    google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    github: !!(process.env.GITHUB_ID && process.env.GITHUB_SECRET),
  }
}
