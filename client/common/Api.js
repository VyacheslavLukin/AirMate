import * as Xhr from "./Xhr";

export const makeApiGet = (url, data) => {
  let d = "";

  if (data) {
    d = Object.keys(data)
      .map(key => `${key}=${data[key]}`)
      .join("&");
  }

  return new Promise(resolve => {
    const xhr = Xhr.get(url, [], d);

    xhr.then(data => {
      const result = JSON.parse(data.text);
      resolve(result);
    });
  }, err => console.log);
};

export const makeApiPost = (
  url,
  object,
  headers = [new Xhr.Header("Content-Type", "application/json")],
) =>
  new Promise(resolve => {
    const xhr = Xhr.post(url, object, headers);

    xhr.then(data => {
      const result = JSON.parse(data.text);
      resolve(result);
    });
  }, err => console.log);
