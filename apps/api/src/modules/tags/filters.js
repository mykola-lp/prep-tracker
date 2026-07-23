export function buildTagFilterInclude(models, tagId) {
  if (!tagId) return [];

  return [
    {
      model: models.Tag,
      as: 'tags',
      where: { id: tagId },
      through: { attributes: [] },
    },
  ];
}
