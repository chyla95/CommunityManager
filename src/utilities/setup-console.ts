import { CriticalSystemError } from "../errors/critical-system-error";

let isConsoleConfigured = false;

const _errorPrefix: string = "🔴 Error:";
const _warnPrefix: string = "🟡 Warning:";
const _infoPrefix: string = "🔵 Info:";
const _logPrefix: string = "🟢 Log:";

export const setupConsole = () => {
  if (isConsoleConfigured) {
    throw new CriticalSystemError("The Console Is Already Configured - You Cannot Re-Configure It!");
  }
  isConsoleConfigured = true;

  const _error = console.error;
  console.error = function () {
    Array.prototype.unshift.call(arguments, _errorPrefix);
    _error.apply(console, [...arguments]);
  };

  const _warning = console.warn;
  console.warn = function () {
    Array.prototype.unshift.call(arguments, _warnPrefix);
    _warning.apply(console, [...arguments]);
  };

  const _log = console.log;
  console.log = function () {
    Array.prototype.unshift.call(arguments, _logPrefix);
    _log.apply(console, [...arguments]);
  };

  const _info = console.info;
  console.info = function () {
    Array.prototype.unshift.call(arguments, _infoPrefix);
    _info.apply(console, [...arguments]);
  };
};
