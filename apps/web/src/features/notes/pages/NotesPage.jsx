import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';

import { QUESTIONS_QUERY } from '@/features/questions/graphql/questionsQuery';
import { TOPICS_QUERY } from '@/features/topics/graphql/topicsQuery';

import { CREATE_NOTE_MUTATION } from '../graphql/createNoteMutation';
import { DELETE_NOTE_MUTATION } from '../graphql/deleteNoteMutation';
import { NOTES_QUERY } from '../graphql/notesQuery';
import { UPDATE_NOTE_MUTATION } from '../graphql/updateNoteMutation';

import styles from './NotesPage.module.css';

const emptyForm = {
  parentType: 'topic',
  parentId: '',
  body: '',
};

function toFormState(note) {
  return {
    parentType: note?.questionId ? 'question' : 'topic',
    parentId: note?.questionId ?? note?.topicId ?? '',
    body: note?.body ?? '',
  };
}

function resolveParentLabel(note, topics, questions) {
  if (note.questionId) {
    const question = questions.find((item) => item.id === note.questionId);
    return question ? `Question: ${question.prompt}` : 'Question';
  }

  const topic = topics.find((item) => item.id === note.topicId);
  return topic ? `Topic: ${topic.title}` : 'Topic';
}

export function NotesPage() {
  const {
    data: notesData,
    loading: notesLoading,
    error: notesError,
    refetch,
  } = useQuery(NOTES_QUERY);
  const { data: topicsData } = useQuery(TOPICS_QUERY);
  const { data: questionsData } = useQuery(QUESTIONS_QUERY);
  const [createNote, { loading: creating }] = useMutation(CREATE_NOTE_MUTATION);
  const [updateNote, { loading: updating }] = useMutation(UPDATE_NOTE_MUTATION);
  const [deleteNote, { loading: deleting }] = useMutation(DELETE_NOTE_MUTATION);

  const [formState, setFormState] = useState(emptyForm);
  const [editingNote, setEditingNote] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formError, setFormError] = useState('');
  const [operationError, setOperationError] = useState('');
  const [selectedParentType, setSelectedParentType] = useState('all');

  const topics = topicsData?.topics ?? [];
  const questions = questionsData?.questions ?? [];
  const notes = notesData?.notes ?? [];

  const visibleNotes = useMemo(() => {
    const filtered =
      selectedParentType === 'all'
        ? notes
        : notes.filter((note) =>
            selectedParentType === 'topic' ? Boolean(note.topicId) : Boolean(note.questionId)
          );

    return [...filtered].sort((a, b) => a.body.localeCompare(b.body));
  }, [notes, selectedParentType]);

  function resetForm() {
    setEditingNote(null);
    setFormState(emptyForm);
    setFormError('');
  }

  function startEdit(note) {
    setEditingNote(note);
    setFormState(toFormState(note));
    setFormError('');
    setOperationError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');
    setOperationError('');

    if (!formState.parentId) {
      setFormError('Parent is required.');
      return;
    }

    if (!formState.body.trim()) {
      setFormError('Note body is required.');
      return;
    }

    const input =
      formState.parentType === 'topic'
        ? { topicId: formState.parentId, body: formState.body.trim() }
        : { questionId: formState.parentId, body: formState.body.trim() };

    try {
      if (editingNote) {
        await updateNote({
          variables: {
            id: editingNote.id,
            input: {
              body: formState.body.trim(),
            },
          },
        });
      } else {
        await createNote({
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
        'Unable to save note.';

      setOperationError(message);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) {
      return;
    }

    setOperationError('');

    try {
      await deleteNote({
        variables: {
          id: deleteTarget.id,
        },
      });

      await refetch();
      setDeleteTarget(null);

      if (editingNote?.id === deleteTarget.id) {
        resetForm();
      }
    } catch (requestError) {
      const message =
        requestError?.graphQLErrors?.[0]?.message ||
        requestError?.message ||
        'Unable to delete note.';

      setOperationError(message);
    }
  }

  const isSubmitting = creating || updating;

  if (notesLoading) {
    return (
      <section className={styles.page}>
        <div className={styles.loadingState}>Loading notes...</div>
      </section>
    );
  }

  if (notesError) {
    return (
      <section className={styles.page}>
        <div className={styles.error} role="alert">
          Unable to load notes.
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Notes</p>
        <h1 className={styles.title}>Capture study notes quickly</h1>
        <p className={styles.lead}>
          Attach notes to a topic or a question, then update or remove them without leaving the
          study session.
        </p>
      </header>

      <div className={styles.layout}>
        <section className={styles.panel} aria-labelledby="note-form-title">
          <h2 className={styles.panelTitle} id="note-form-title">
            {editingNote ? 'Edit note' : 'Create note'}
          </h2>

          <form className={styles.fieldGrid} onSubmit={handleSubmit} noValidate>
            {(formError || operationError) && (
              <p className={styles.error} role="alert">
                {formError || operationError}
              </p>
            )}

            <label className={styles.field}>
              <span className={styles.label}>Parent type</span>
              <select
                className={styles.select}
                value={formState.parentType}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    parentType: event.target.value,
                    parentId: '',
                  }))
                }
              >
                <option value="topic">Topic</option>
                <option value="question">Question</option>
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Parent</span>
              <select
                className={styles.select}
                value={formState.parentId}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, parentId: event.target.value }))
                }
              >
                <option value="">Select a {formState.parentType}</option>
                {formState.parentType === 'topic'
                  ? topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.title}
                      </option>
                    ))
                  : questions.map((question) => (
                      <option key={question.id} value={question.id}>
                        {question.prompt}
                      </option>
                    ))}
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Body</span>
              <textarea
                className={styles.textarea}
                value={formState.body}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, body: event.target.value }))
                }
                placeholder="Short reminder, explanation, or answer draft"
              />
            </label>

            <div className={styles.actions}>
              <button className={styles.button} type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingNote ? 'Update note' : 'Create note'}
              </button>

              {editingNote ? (
                <button className={styles.secondaryButton} type="button" onClick={resetForm}>
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className={styles.listPanel} aria-labelledby="notes-list-title">
          <h2 className={styles.sectionTitle} id="notes-list-title">
            Your notes
          </h2>

          <div className={styles.filters}>
            <label className={styles.field}>
              <span className={styles.label}>Filter by parent type</span>
              <select
                className={styles.select}
                value={selectedParentType}
                onChange={(event) => setSelectedParentType(event.target.value)}
              >
                <option value="all">All notes</option>
                <option value="topic">Topic notes</option>
                <option value="question">Question notes</option>
              </select>
            </label>
          </div>

          {!visibleNotes.length ? (
            <div className={styles.emptyState}>
              {selectedParentType === 'all' ? 'No notes yet.' : 'No notes for this filter yet.'}
            </div>
          ) : (
            <div className={styles.list}>
              {visibleNotes.map((note) => (
                <article key={note.id} className={styles.item}>
                  <div className={styles.itemHeader}>
                    <div>
                      <h3 className={styles.itemTitle}>{note.body}</h3>
                      <div className={styles.meta}>
                        <span className={styles.pill}>{note.topicId ? 'topic' : 'question'}</span>
                        <span>{resolveParentLabel(note, topics, questions)}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.itemActions}>
                    <button
                      className={styles.secondaryButton}
                      type="button"
                      onClick={() => startEdit(note)}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.dangerButton}
                      type="button"
                      onClick={() => setDeleteTarget(note)}
                    >
                      Delete
                    </button>
                  </div>

                  {deleteTarget?.id === note.id ? (
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
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
