/**
 * Shared CSS + boot script for Strong's HTML WebViews (per-section copy cards).
 * Used by HtmlTemplate (strongCopyUi) and MultipleStrongsContentBottomSheet.
 */
export function strongCopyDefinitionCss(colors: {
  text: string;
  background: string;
  border?: string;
  notification: string;
}): string {
  return `
                /* Strong cards: simple border frame + quiet copy control (previous style) */
                .strong-def-sections {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .strong-def-section {
                    display: flex;
                    flex-direction: row;
                    align-items: flex-start;
                    gap: 14px;
                    padding: 16px;
                    border-radius: 14px;
                    border: 1px solid ${colors.border || colors.text}26;
                    background: ${colors.background};
                    -webkit-tap-highlight-color: transparent;
                }
                .strong-def-section-body {
                    flex: 1;
                    min-width: 0;
                    -webkit-user-select: text;
                    user-select: text;
                }
                .strong-copy-section {
                    flex-shrink: 0;
                    align-self: flex-start;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    box-sizing: border-box;
                    width: 40px;
                    height: 40px;
                    margin: 0;
                    padding: 0;
                    border-radius: 10px;
                    border: 1px solid ${colors.border || colors.text}33;
                    background: transparent;
                    color: ${colors.text};
                    opacity: 0.72;
                    cursor: pointer;
                    -webkit-tap-highlight-color: transparent;
                    user-select: none;
                    -webkit-user-select: none;
                    transition: opacity 0.12s ease, background 0.12s ease, border-color 0.12s ease, color 0.12s ease;
                }
                .strong-copy-section svg {
                    display: block;
                    flex-shrink: 0;
                }
                .strong-copy-section:active {
                    opacity: 1;
                    background: ${colors.notification}14;
                    border-color: ${colors.notification}44;
                    color: ${colors.notification};
                }`;
}

/** Runs on load: wire copy buttons + report height to RN */
export const strongCopyDefinitionBootScript = `
(function () {
  function postCopy(text) {
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: "strongCopy", text: text || "" })
      );
    }
  }
  document.querySelectorAll(".strong-copy-section").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var card = btn.closest(".strong-def-section");
      var body = card && card.querySelector(".strong-def-section-body");
      if (body) postCopy(body.innerText);
    });
  });
  if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: "strongHeight",
        height: document.body.scrollHeight,
      })
    );
  }
})();
`;
