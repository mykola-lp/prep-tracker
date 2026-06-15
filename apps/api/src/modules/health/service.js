export async function getDatabaseStatus(sequelize) {
  if (!sequelize) {
    return 'not_configured';
  }

  try {
    await sequelize.authenticate();
    return 'ok';
  } catch {
    return 'error';
  }
}
