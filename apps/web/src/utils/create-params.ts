export const createParams = (category: string, value: string) => {
  const params = new URLSearchParams({[category]: value});
  return params.toString();
}