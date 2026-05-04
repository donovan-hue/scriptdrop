/**
 * Returns true when an env var is absent, empty, or still has the
 * placeholder value written by the project scaffolding.
 */
function isEnvKeyMissing(val) {
  return !val || val.startsWith('PENDIENTE') || val.trim() === '' || val === 'demo';
}

module.exports = { isEnvKeyMissing };
