export function buildRoute(path: string, searchParameters: URLSearchParams): string {
  const parameters = searchParameters.toString();
  return parameters ? `${path}?${parameters}` : path;
}
