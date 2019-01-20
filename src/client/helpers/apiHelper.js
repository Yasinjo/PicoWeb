const API_HOST = `http://${window.location.host}`;


function addTokenToHeader(headersParam, token) {
  const headers = { ...headersParam };
  headers.Authorization = token;
  return headers;
}
const createPuttingRequest = (data, isJSON, token, options) => {
  const request = { ...options };

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

const puttingRequest = (data, isJSON, token, options, path) => new Promise((reslove, reject) => {
  const request = createPuttingRequest(data, isJSON, token, options);
  fetch(API_HOST + path, request).then((response) => {
    if (!response.ok) {
      return reject(response);
    }

    return reslove(response);
  });
});

const POSTData = (path, data, isJSON, token) => puttingRequest(data, isJSON, token, { method: 'POST' }, path);
const PATCHData = (path, data, isJSON, token) => puttingRequest(data, isJSON, token, { method: 'PATCH' }, path);
const DELETEData = (path, data, isJSON, token) => puttingRequest(data, isJSON, token, { method: 'DELETE' }, path);


export {
  GETData, POSTData, PATCHData, DELETEData
};
