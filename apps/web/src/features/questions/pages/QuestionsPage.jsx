import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';

import { TOPICS_QUERY } from '@/features/topics/graphql/topicsQuery';

import { CREATE_QUESTION_MUTATION } from '../graphql/createQuestionMutation';
import { DELETE_QUESTION_MUTATION } from '../graphql/deleteQuestionMutation';
import { QUESTIONS_QUERY } from '../graphql/questionsQuery';
import { UPDATE_QUESTION_MUTATION } from '../graphql/updateQuestionMutation';

import styles from './QuestionsPage.module.css';

const STATUS_OPTIONS = ['new', 'learning', 'reviewing', 'done'];

const emptyForm = {
  topicId: '',
  prompt: '',
  answer: '',
  status: 'new',
  deadline: '',
};

function formatDateInputValue(value) {
  return value ? value.slice(0, 10) : '';
}

function toFormState(question) {
  return {
    topicId: question?.topicId ?? '',
    prompt: question?.prompt ?? '',
    answer: question?.answer ?? '',
    status: question?.status ?? 'new',
    deadline: formatDateInputValue(question?.deadline),
  };
}

function toMutationInput(formState) {
  return {
    topicId: formState.topicId,
    prompt: formState.prompt.trim(),
    answer: formState.answer.trim() || null,
    deadline: formState.deadline || null,
  };
}

function humanizeDeadline(deadline) {
  return deadline || 'No deadline';
}

export function QuestionsPage() {
  const {
    data: questionsData,
    loading: questionsLoading,
    error: questionsError,
    refetch,
  } = useQuery(QUESTIONS_QUERY);
  const { data: topicsData } = useQuery(TOPICS_QUERY);
  const [createQuestion, { loading: creating }] = useMutation(CREATE_QUESTION_MUTATION);
  const [updateQuestion, { loading: updating }] = useMutation(UPDATE_QUESTION_MUTATION);
  const [deleteQuestion, { loading: deleting }] = useMutation(DELETE_QUESTION_MUTATION);

  const [formState, setFormState] = useState(emptyForm);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formError, setFormError] = useState('');
  const [operationError, setOperationError] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('all');

  const topics = topicsData?.topics ?? [];
  const questions = questionsData?.questions ?? [];

  const selectedTopic = useMemo(() => {
    if (selectedTopicId === 'all') {
      return null;
    }

    return topics.find((topic) => topic.id === selectedTopicId) ?? null;
  }, [selectedTopicId, topics]);

  const visibleQuestions = useMemo(() => {
    const filtered =
      selectedTopicId === 'all'
        ? questions
        : questions.filter((question) => question.topicId === selectedTopicId);

    return [...filtered].sort((a, b) => a.prompt.localeCompare(b.prompt));
  }, [questions, selectedTopicId]);

  function resetForm() {
    setEditingQuestion(null);
    setFormState(emptyForm);
    setFormError('');
  }

  function startEdit(question) {
    setEditingQuestion(question);
    setFormState(toFormState(question));
    setFormError('');
    setOperationError('');
    setSelectedTopicId(question.topicId);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');
    setOperationError('');

    if (!formState.topicId) {
      setFormError('Topic is required.');
      return;
    }

    if (!formState.prompt.trim()) {
      setFormError('Question prompt is required.');
      return;
    }

    const input = toMutationInput(formState);

    try {
      if (editingQuestion) {
        await updateQuestion({
          variables: {
            id: editingQuestion.id,
            input: {
              prompt: input.prompt,
              answer: input.answer,
              status: formState.status,
              deadline: input.deadline,
            },
          },
        });
      } else {
        await createQuestion({
          variables: {
            input,
          },
        });
      }

      await refetch();
      resetForm();
    } catch (requestError) {
      const message =
        requestError?.graphQLErrors?.[0]?.message ||
        requestError?.message ||
        'Unable to save question.';

      setOperationError(message);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) {
      return;
    }

    setOperationError('');

    try {
      await deleteQuestion({
        variables: {
          id: deleteTarget.id,
        },
      });

      await refetch();
      setDeleteTarget(null);

      if (editingQuestion?.id === deleteTarget.id) {
        resetForm();
      }
    } catch (requestError) {
      const message =
        requestError?.graphQLErrors?.[0]?.message ||
        requestError?.message ||
        'Unable to delete question.';

      setOperationError(message);
    }
  }

  const isSubmitting = creating || updating;

  if (questionsLoading) {
    return (
      <section className={styles.page}>
        <div className={styles.loadingState}>Loading questions...</div>
      </section>
    );
  }

  if (questionsError) {
    return (
      <section className={styles.page}>
        <div className={styles.error} role="alert">
          Unable to load questions.
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Questions</p>
        <h1 className={styles.title}>Practice questions by topic</h1>
        <p className={styles.lead}>
          Track prompts, short answers, progress, and deadlines without leaving the study flow.
        </p>
      </header>

      <div className={styles.layout}>
        <section className={styles.panel} aria-labelledby="question-form-title">
          <h2 className={styles.panelTitle} id="question-form-title">
            {editingQuestion ? 'Edit question' : 'Create question'}
          </h2>

          <form className={styles.fieldGrid} onSubmit={handleSubmit} noValidate>
            {(formError || operationError) && (
              <p className={styles.error} role="alert">
                {formError || operationError}
              </p>
            )}

            <label className={styles.field}>
              <span className={styles.label}>Topic</span>
              <select
                className={styles.select}
                value={formState.topicId}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, topicId: event.target.value }))
                }
              >
                <option value="">Select a topic</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.title}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Prompt</span>
              <textarea
                className={styles.textarea}
                value={formState.prompt}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, prompt: event.target.value }))
                }
                placeholder="How would you explain event loop behavior?"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Answer</span>
              <textarea
                className={styles.textarea}
                value={formState.answer}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, answer: event.target.value }))
                }
                placeholder="Optional short answer or notes"
              />
            </label>

            {editingQuestion ? (
              <label className={styles.field}>
                <span className={styles.label}>Status</span>
                <select
                  className={styles.select}
                  value={formState.status}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, status: event.target.value }))
                  }
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <p className={styles.muted}>Status defaults to new when you create a question.</p>
            )}

            <label className={styles.field}>
              <span className={styles.label}>Deadline</span>
              <input
                className={styles.input}
                type="date"
                value={formState.deadline}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, deadline: event.target.value }))
                }
              />
            </label>

            <div className={styles.actions}>
              <button className={styles.button} type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Saving...'
                  : editingQuestion
                    ? 'Update question'
                    : 'Create question'}
              </button>

              {editingQuestion ? (
                <button className={styles.secondaryButton} type="button" onClick={resetForm}>
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className={styles.listPanel} aria-labelledby="questions-list-title">
          <h2 className={styles.sectionTitle} id="questions-list-title">
            Your questions
          </h2>

          <div className={styles.filters}>
            <label className={styles.field}>
              <span className={styles.label}>Filter by topic</span>
              <select
                className={styles.select}
                value={selectedTopicId}
                onChange={(event) => setSelectedTopicId(event.target.value)}
              >
                <option value="all">All topics</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {selectedTopic ? (
            <p className={styles.muted}>Showing questions for {selectedTopic.title}.</p>
          ) : null}

          {!visibleQuestions.length ? (
            <div className={styles.emptyState}>
              {selectedTopicId === 'all'
                ? 'No questions yet.'
                : 'No questions for the selected topic yet.'}
            </div>
          ) : (
            <div className={styles.list}>
              {visibleQuestions.map((question) => {
                const topicTitle =
                  topics.find((topic) => topic.id === question.topicId)?.title ?? 'Unknown topic';

                return (
                  <article key={question.id} className={styles.item}>
                    <div className={styles.itemHeader}>
                      <div>
                        <h3 className={styles.itemTitle}>{question.prompt}</h3>
                        <div className={styles.meta}>
                          <span className={styles.pill}>{question.status}</span>
                          <span>{humanizeDeadline(question.deadline)}</span>
                          <span>{topicTitle}</span>
                        </div>
                      </div>
                    </div>

                    {question.answer ? <p className={styles.muted}>{question.answer}</p> : null}

                    <div className={styles.itemActions}>
                      <button
                        className={styles.secondaryButton}
                        type="button"
                        onClick={() => startEdit(question)}
                      >
                        Edit
                      </button>
                      <button
                        className={styles.dangerButton}
                        type="button"
                        onClick={() => setDeleteTarget(question)}
                      >
                        Delete
                      </button>
                    </div>

                    {deleteTarget?.id === question.id ? (
                      <div className={styles.itemActions}>
                        <button
                          className={styles.dangerButton}
                          type="button"
                          onClick={handleDeleteConfirm}
                          disabled={deleting}
                        >
                          {deleting ? 'Deleting...' : 'Confirm delete'}
                        </button>
                        <button
                          className={styles.secondaryButton}
                          type="button"
                          onClick={() => setDeleteTarget(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
