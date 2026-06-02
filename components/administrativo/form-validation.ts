'use client';

export const GENERIC_FORM_ERROR_MESSAGE = 'Por favor, rellena este campo de manera correcta.';

type Control = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function isControl(target: EventTarget | null): target is Control {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

export function setGenericInvalidMessage(target: EventTarget | null) {
  if (!isControl(target)) return;
  target.setCustomValidity(GENERIC_FORM_ERROR_MESSAGE);
}

export function clearInvalidMessage(target: EventTarget | null) {
  if (!isControl(target)) return;
  target.setCustomValidity('');
}

export function getControlKey(target: EventTarget | null): string {
  if (!isControl(target)) return '';
  return target.name || target.id || '';
}
