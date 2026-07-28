const VALID_PROGRESS_STATUSES = ['new', 'learning', 'reviewing', 'done'];

export function validateProgressStatus(status) {
  if (status === undefined) return;

  if (!VALID_PROGRESS_STATUSES.includes(status)) {
    const error = new Error('Invalid progress status');
    error.extensions = { code: 'BAD_USER_INPUT' };
    throw error;
  }
}

export function validateDeadline(deadline) {
  if (deadline === undefined || deadline === null) return;

  const isoDateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!isoDateOnlyPattern.test(deadline)) {
    const error = new Error('Invalid deadline date');
    error.extensions = { code: 'BAD_USER_INPUT' };
    throw error;
  }

  const parsed = new Date(`${deadline}T00:00:00.000Z`);

  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== deadline) {
    const error = new Error('Invalid deadline date');
    error.extensions = { code: 'BAD_USER_INPUT' };
    throw error;
  }
}

export function validateProgressInput(input) {
  validateProgressStatus(input.status);
  validateDeadline(input.deadline);
}
