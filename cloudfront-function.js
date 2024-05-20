function handler(event) {
  const request = event.request;
  request.querystring = {};
  request.cookies = {};

  const hostPieces = request.headers.host.value.split(".");

  if (hostPieces.length == 2 && request.uri == "/") {
    request.uri = "/home.min.html";
  } else if (hostPieces.length > 2) {
    request.uri = "/redirect.min.html";
  }

  return request;
}
