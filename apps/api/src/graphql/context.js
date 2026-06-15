export function createContext({ req, models, sequelize, user = null }) {
  return {
    req,
    models,
    sequelize,
    user,
  };
}
