const API_HOST = `http://${window.location.host}`;
const POST_OPTIONS = {
  method: 'POST'
};

console.log('API_HOST');
console.log(API_HOST);

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
    request.headers.Authorization = token;
  }

  return request;
};

const GETData = (path, params) => {
  const url = new URL(API_HOST + path);
  if (params) {
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  }
  return fetch(url);
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
