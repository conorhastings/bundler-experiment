import two from './two';
export default function one(arg) {
  return two[arg] || "arg not found";
}