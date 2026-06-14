export function createContext({ req, models }) {
  return {
    req,
    models,
    user: null,
  };
}
