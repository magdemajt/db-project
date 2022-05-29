export const apiURL = 'http://localhost:8080';

export function generateURL(url: string) {
  return apiURL + url;
}

export function generateRequestConfig(data: Partial<RequestInit>): RequestInit {
  return {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    mode: 'cors',
    ...data,

  };
}
