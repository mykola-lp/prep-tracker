import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';

import { CREATE_TOPIC_MUTATION } from '../graphql/createTopicMutation';
import { DELETE_TOPIC_MUTATION } from '../graphql/deleteTopicMutation';
import { TOPICS_QUERY } from '../graphql/topicsQuery';
import { UPDATE_TOPIC_MUTATION } from '../graphql/updateTopicMutation';

import { ScreenState } from '@/components/ScreenState';

import styles from './TopicsPage.module.css';

const STATUS_OPTIONS = ['new', 'learning', 'reviewing', 'done'];

const emptyForm = {
  title: '',
  description: '',
  status: 'new',
  deadline: '',
};

function formatDateInputValue(value) {
  if (!value) {
    return '';
  }

  return value.slice(0, 10);
}

function toInputValue(topic) {
  return {
    title: topic?.title ?? '',
    description: topic?.description ?? '',
    status: topic?.status ?? 'new',
    deadline: formatDateInputValue(topic?.deadline),
  };
}

function toMutationInput(formState) {
  return {
    title: formState.title.trim(),
    description: formState.description.trim() || null,
    deadline: formState.deadline || null,
  };
}

function humanizeDeadline(deadline) {
  if (!deadline) {
    return 'No deadline';
  }

  return deadline;
}

export function TopicsPage() {
  const { data, loading, error, refetch } = useQuery(TOPICS_QUERY);
  const [createTopic, { loading: creating }] = useMutation(CREATE_TOPIC_MUTATION);
  const [updateTopic, { loading: updating }] = useMutation(UPDATE_TOPIC_MUTATION);
  const [deleteTopic, { loading: deleting }] = useMutation(DELETE_TOPIC_MUTATION);

  const [formState, setFormState] = useState(emptyForm);
  const [editingTopic, setEditingTopic] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formError, setFormError] = useState('');
  const [operationError, setOperationError] = useState('');

  const topics = data?.topics ?? [];

  const sortedTopics = useMemo(() => {
    return [...topics].sort((a, b) => a.title.localeCompare(b.title));
  }, [topics]);

  function resetForm() {
    setEditingTopic(null);
    setFormState(emptyForm);
    setFormError('');
  }

  function startEdit(topic) {
    setEditingTopic(topic);
    setFormState(toInputValue(topic));
    setFormError('');
    setOperationError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');
    setOperationError('');

    if (!formState.title.trim()) {
      setFormError('Topic title is required.');
      return;
    }

    const input = toMutationInput(formState);

    try {
      if (editingTopic) {
        await updateTopic({
          variables: {
            id: editingTopic.id,
            input: {
              ...input,
              status: formState.status,
            },
          },
        });
      } else {
        await createTopic({
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
        'Unable to save topic.';

      setOperationError(message);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) {
      return;
    }

    setOperationError('');

    try {
      await deleteTopic({
        variables: {
          id: deleteTarget.id,
        },
      });

      await refetch();
      setDeleteTarget(null);

      if (editingTopic?.id === deleteTarget.id) {
        resetForm();
      }
    } catch (requestError) {
      const message =
        requestError?.graphQLErrors?.[0]?.message ||
        requestError?.message ||
        'Unable to delete topic.';

      setOperationError(message);
    }
  }

  const isSubmitting = creating || updating;

  return (
    <section className={styles.page}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Topics</p>
          <h1 className={styles.title}>Manage your study roadmap</h1>
          <p className={styles.lead}>
            Create topics, update their status and deadlines, and remove anything you no longer
            need.
          </p>
        </div>
      </header>

      <div className={styles.layout}>
        <section className={styles.panel} aria-labelledby="topic-form-title">
          <h2 className={styles.panelTitle} id="topic-form-title">
            {editingTopic ? 'Edit topic' : 'Create topic'}
          </h2>

          <form className={styles.fieldGrid} onSubmit={handleSubmit} noValidate>
            {(formError || operationError) && (
              <p className={styles.error} role="alert">
                {formError || operationError}
              </p>
            )}

            <label className={styles.field}>
              <span className={styles.label}>Title</span>
              <input
                className={styles.input}
                type="text"
                value={formState.title}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="System design fundamentals"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Description</span>
              <textarea
                className={styles.textarea}
                value={formState.description}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="What you want to learn, revise, or practice"
              />
            </label>

            {editingTopic ? (
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
              <p className={styles.muted}>Status defaults to new when you create a topic.</p>
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
                {isSubmitting ? 'Saving...' : editingTopic ? 'Update topic' : 'Create topic'}
              </button>

              {editingTopic ? (
                <button className={styles.secondaryButton} type="button" onClick={resetForm}>
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className={styles.listPanel} aria-labelledby="topics-list-title">
          <h2 className={styles.sectionTitle} id="topics-list-title">
            Your topics
          </h2>

          {loading ? (
            <ScreenState
              layout="inline"
              tone="loading"
              title="Loading topics..."
              message="Fetching your topics and progress details."
            />
          ) : null}

          {error ? (
            <ScreenState
              layout="inline"
              tone="error"
              title="Unable to load topics."
              message="Check your connection and try again. If the problem continues, refresh the page."
            />
          ) : null}

          {!loading && !error && sortedTopics.length === 0 ? (
            <ScreenState
              layout="inline"
              tone="empty"
              title="No topics yet."
              message="Create your first topic to start organizing prep."
            />
          ) : null}

          {!loading && !error && sortedTopics.length > 0 ? (
            <div className={styles.list}>
              {sortedTopics.map((topic) => (
                <article key={topic.id} className={styles.topicCard}>
                  <div className={styles.topicHeader}>
                    <div>
                      <h3 className={styles.topicTitle}>{topic.title}</h3>
                      <div className={styles.topicMeta}>
                        <span className={styles.pill}>{topic.status}</span>
                        <span>{humanizeDeadline(topic.deadline)}</span>
                      </div>
                    </div>
                  </div>

                  {topic.description ? (
                    <p className={styles.topicDescription}>{topic.description}</p>
                  ) : (
                    <p className={styles.muted}>No description provided.</p>
                  )}

                  <div className={styles.topicActions}>
                    <button
                      className={styles.secondaryButton}
                      type="button"
                      onClick={() => startEdit(topic)}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.dangerButton}
                      type="button"
                      onClick={() => setDeleteTarget(topic)}
                    >
                      Delete
                    </button>
                  </div>

                  {deleteTarget?.id === topic.id ? (
                    <div className={styles.deleteNotice}>
                      <p className={styles.muted}>
                        Delete <strong>{topic.title}</strong>? This action cannot be undone.
                      </p>

                      <div className={styles.deleteActions}>
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
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
}
