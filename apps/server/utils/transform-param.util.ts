export const transformParam = (param: string) => {
  return param
    .split('-')
    .map((param) => {
      console.log('current param', param);
      const upperCase = param.at(0)?.toUpperCase() + param.slice(1);
      console.log('uppercase', upperCase);
      console.log('');
      return upperCase;
    })
    .join(' ');
};