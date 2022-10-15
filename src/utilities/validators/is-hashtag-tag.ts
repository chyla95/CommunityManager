export const isHashtagTag = (value: string) => /^.{3,32}#[0-9]{3,9}$/i.test(value);
