export const transformParam = (param: string) => {
  return param
    .split('-')
    .map((param) => {
      const upperCase = param.at(0)?.toUpperCase() + param.slice(1);
      return upperCase;
    })
    .join(' ');
};