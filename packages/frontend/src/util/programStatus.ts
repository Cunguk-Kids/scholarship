export const getProgramStatus = (program: {
  startAt?: string;
  endAt?: string;
}): 'soon' | 'active' | 'vote' | 'done' => {
  const now = new Date();

  const start = program.startAt ? new Date(program.startAt) : undefined;
  const end = program.endAt ? new Date(program.endAt) : undefined;

  if (start && now < start) return 'soon';
  if (start && end && now >= start && now < end) return 'active';
  // if (end && vote && now >= end && now < vote) return 'vote';
  // if (vote && now >= vote) return 'done';

  return 'soon'; // fallback
};