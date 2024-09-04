export const capitalize = (word: string): string => {
  return (word[0].toLocaleUpperCase() + word.slice(1)).replace("_", " ").replace("-", " ")
}