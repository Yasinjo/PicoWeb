const API_HOST = `http://${window.location.host}`;
const POST_OPTIONS = {
  method: 'POST'
};

console.log('API_HOST');
console.log(API_HOST);

function addTokenToHeader(headersParam, token) {
  const headers = { ...headersParam };
  headers.Authorization = token;
  return headers;
}
const createPostRequest = (data, isJSON, token) => {
  const request = { ...POST_OPTIONS };

  if (isJSON) {
    request.body = JSON.stringify(data);
    request.headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };
  } else {
    request.headers = {};
    request.body = data;
  }

  if (token) {
    request.headers = addTokenToHeader(request.headers, token);
  }

  return request;
};

const GETData = (path, params, token) => {
  const url = new URL(API_HOST + path);
  let headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (params) {
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  }

  if (token) {
    headers = addTokenToHeader(headers, token);
  }

  return fetch(url, { method: 'GET', headers });
};

const POSTData = (path, data, isJSON, token) => {
  const request = createPostRequest(data, isJSON, token);
  return new Promise((reslove, reject) => {
    fetch(API_HOST + path, request).then((response) => {
      if (!response.ok) {
        // response.json().then((jsonResponse) => {
        //   reject(jsonResponse);
        // });
        return reject(response);
      }

      return reslove(response);
    });
  });
};

export { GETData, POSTData };
