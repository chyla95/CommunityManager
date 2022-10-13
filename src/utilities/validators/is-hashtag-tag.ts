export const isHashtagTag = (value: string) => /^.{3,32}#[0-9]{4}$/i.test(value);
