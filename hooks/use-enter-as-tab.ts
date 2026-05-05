import type { KeyboardEvent } from "react"

const FOCUSABLE_SELECTOR = [
  'input:not([disabled]):not([type="hidden"])',
  "textarea:not([disabled])",
  'button:not([disabled]):not([aria-hidden="true"])',
  '[role="combobox"]:not([aria-disabled="true"])',
  '[tabindex]:not([tabindex="-1"])',
].join(", ")

function isVisible(el: HTMLElement) {
  return el.offsetParent !== null || el === document.activeElement
}

export function handleEnterAsTab(e: KeyboardEvent<HTMLElement>) {
  if (e.key !== "Enter") return
  if (e.shiftKey) return
  if (e.nativeEvent.isComposing) return

  const target = e.target as HTMLElement | null
  if (!target) return

  const tag = target.tagName
  const role = target.getAttribute("role")

  if (tag === "BUTTON" || role === "combobox") return
  if (tag !== "INPUT" && tag !== "TEXTAREA") return

  e.preventDefault()

  const container = target.closest<HTMLElement>("form, [data-enter-as-tab-root]")
  if (!container) return

  const focusables = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(isVisible)

  const idx = focusables.indexOf(target)
  if (idx !== -1 && idx < focusables.length - 1) {
    focusables[idx + 1].focus()
    return
  }

  const submit = document.querySelector<HTMLElement>("[data-submit-button]")
  submit?.focus()
}
