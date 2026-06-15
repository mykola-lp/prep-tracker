export async function getTopics(Topic) {
  return Topic.findAll();
}
