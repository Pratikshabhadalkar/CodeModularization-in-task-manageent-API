import { parse } from 'url';

export function decodeUrl(req) {
  if (!req.url) {
    return { parsedUrl: {}, pathname: '', urlSegment: [] };
  }

  const parsedUrl = parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const urlSegment = pathname.split("/").filter(segment => !!segment);
  
  return {
    parsedUrl,
    pathname,
    urlSegment
  };
}
