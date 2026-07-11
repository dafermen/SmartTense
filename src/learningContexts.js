export const ALL_CONTEXTS = "all";

export function getUnitContexts(unit, contentContexts = []) {
  if (!unit?.contextTags?.length) return [];

  return unit.contextTags.map((contextId) => {
    const context = contentContexts.find((entry) => entry.id === contextId);
    return context || { id: contextId, title: contextId, description: "" };
  });
}

export function filterByContext(items = [], selectedContext = ALL_CONTEXTS) {
  if (selectedContext === ALL_CONTEXTS) return items;
  return items.filter((item) => !item.context || item.context === selectedContext);
}

export function getVocabularyItems(unit, selectedContext = ALL_CONTEXTS) {
  if (!unit?.sections) return [];

  const vocabulary = unit.sections
    .filter((section) => section.type === "vocabulary")
    .flatMap((section) => section.vocabulary.map((item) => ({ ...item, sectionTitle: section.title })));

  return filterByContext(vocabulary, selectedContext);
}
