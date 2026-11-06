# God Mode

Activation still requires five seconds, 25 correct characters, no mistakes, and 1.5 seconds above the user's God Mode threshold. The costume and atmosphere stay earned until the session ends.

Letter breakup is an accelerator: correct keystrokes over the latest two seconds determine the target. Holding the threshold holds full breakup without a timer or a decaying acceleration bonus. Slowing down smoothly reassembles letters; speeding up scatters them again. A single registered CSS property interpolates all glyphs continuously, and React does not rebuild letters as pace changes. The typing passage and caret stay steady.

Preview effects opens an interactive pace slider. The preview holds until End preview or the start of a real test; it does not auto-expire. Muted sound and reduced-motion preferences are respected. Saved themes, sounds and companion settings are never overwritten.

The selective reversal script remains available: run node scripts/revert-god-mode.mjs --check to validate, or --apply only when the user asks to revert God Mode. Untimed practice, companion customization and the hidden-companion layout are preserved.
