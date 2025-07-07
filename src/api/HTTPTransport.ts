type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface Options {
  method?: HTTPMethod;
  headers?: Record<string, string>;
  data?: Record<string, unknown> | FormData;
  timeout?: number;
}

interface RequestOptions extends Options {
  method: HTTPMethod;
}

export class HTTPTransport {
  private baseUrl: string;

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  public get(
    url: string,
    options: { headers?: Record<string, string>; data?: Record<string, unknown> } = {}
  ): Promise<unknown> {
    let requestUrl = url;
    if (options.data) {
      const queryString = this.queryStringify(options.data);
      requestUrl += queryString ? `?${queryString}` : '';
    }
    return this.request(requestUrl, { method: 'GET', headers: options.headers });
  }

  public post(url: string, options: Options = {}): Promise<unknown> {
    return this.request(url, { ...options, method: 'POST' });
  }

  public put(url: string, options: Options = {}): Promise<unknown> {
    return this.request(url, { ...options, method: 'PUT' });
  }

  public delete(url: string, options: Options = {}): Promise<unknown> {
    return this.request(url, { ...options, method: 'DELETE' });
  }

  private request(url: string, options: RequestOptions): Promise<unknown> {
    const { method, headers = {}, data, timeout = 5000 } = options;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, this.baseUrl + url, true);
      xhr.timeout = timeout;

      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.onload = () => {
        const { status, statusText, responseText } = xhr;

        if (status >= 200 && status < 300) {
          try {
            const json = JSON.parse(responseText);
            resolve(json);
          } catch {
            resolve(responseText); 
          }
        } else {
          reject({ status, statusText, response: responseText });
        }
      };

      xhr.onerror = () => reject({ status: xhr.status, statusText: xhr.statusText });
      xhr.ontimeout = () => reject({ status: xhr.status, statusText: 'Timeout' });

      if (method === 'GET' || !data) {
        xhr.send();
      } else if (data instanceof FormData) {
        xhr.send(data);
      } else {
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.send(JSON.stringify(data));
      }
    });
  }

  private queryStringify(data: Record<string, unknown>): string {
    return Object.entries(data)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');
  }
}
