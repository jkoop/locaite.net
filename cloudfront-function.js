function handler(event) {
  const request = event.request;
  request.querystring = {};
  request.cookies = {};

  const hostPieces = request.headers.host.value.split(".");

  // if host doesn't match "static.*.*"
  if (hostPieces.length != 3 || hostPieces[0] != "static") {
    request.uri = "/index.min.html";
  }

  return request;
}
