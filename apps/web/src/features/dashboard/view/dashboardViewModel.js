const STATUS_LABELS = {
  new: 'New',
  learning: 'Learning',
  reviewing: 'Reviewing',
  done: 'Done',
};

const TYPE_LABELS = {
  topic: 'Topic',
  question: 'Question',
};

export function buildDashboardViewModel(summary) {
  const totals = summary?.totals ?? {
    topics: 0,
    questions: 0,
    notes: 0,
    completedTopics: 0,
    completedQuestions: 0,
    overdueItems: 0,
    reviewItems: 0,
  };

  const topicsByStatus = normalizeStatusCounts(summary?.topicsByStatus);
  const questionsByStatus = normalizeStatusCounts(summary?.questionsByStatus);
  const overdueItems = normalizeItems(summary?.overdueItems, 'overdue');
  const reviewItems = normalizeItems(summary?.reviewItems, 'review');
  const upcomingDeadlines = normalizeItems(summary?.upcomingDeadlines, 'upcoming');

  return {
    totals,
    topicsByStatus,
    questionsByStatus,
    overdueItems,
    reviewItems,
    upcomingDeadlines,
    attentionCount: totals.overdueItems + totals.reviewItems,
  };
}

function normalizeStatusCounts(items = []) {
  return items.map((item) => ({
    ...item,
    label: STATUS_LABELS[item.status] ?? item.status,
  }));
}

function normalizeItems(items = [], priority) {
  return [...items]
    .sort((a, b) => sortByDeadline(a.deadline, b.deadline))
    .map((item) => ({
      ...item,
      typeLabel: TYPE_LABELS[item.type] ?? item.type,
      priority,
      deadlineLabel: item.deadline ? `Due ${item.deadline}` : 'No deadline',
      statusLabel: STATUS_LABELS[item.status] ?? item.status,
    }));
}

function sortByDeadline(left, right) {
  if (!left && !right) {
    return 0;
  }

  if (!left) {
    return 1;
  }

  if (!right) {
    return -1;
  }

  return new Date(left) - new Date(right);
}
