export async function getTopics(models) {
  return models.Topic.findAll();
}
