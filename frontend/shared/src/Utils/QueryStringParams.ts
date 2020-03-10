export type QueryStringParams = Record<string, string>;

export function getQueryStringParams(locationSearch: string): QueryStringParams {
  const urlSearchParams = new URLSearchParams(locationSearch.slice(1));
  const params: QueryStringParams = {};

  urlSearchParams.forEach((value: string, key: string) => {
    params[key] = value;
  });

  return params;
}
