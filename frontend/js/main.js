document.addEventListener('DOMContentLoaded', () => {
  if (typeof BlikMatrix !== 'undefined') BlikMatrix.init('matrixCanvas');
  if (typeof BlikNodeGrid !== 'undefined') BlikNodeGrid.init('nodeGrid');
  if (typeof BlikNav !== 'undefined') BlikNav.init();
  if (typeof BlikTerminal !== 'undefined') BlikTerminal.init();
  if (typeof BlikProjects !== 'undefined') BlikProjects.init();
  if (typeof BlikPromptLab !== 'undefined') BlikPromptLab.init();
  if (typeof BlikContent !== 'undefined') BlikContent.init();
  if (typeof BlikContact !== 'undefined') BlikContact.init();
  if (typeof BlikSocials !== 'undefined') BlikSocials.init();
  if (typeof BlikTheme !== 'undefined') BlikTheme.init();
  if (typeof BlikI18n !== 'undefined') BlikI18n.init();
  if (typeof BlikVisits !== 'undefined') BlikVisits.init();
  if (typeof BlikAIGuide !== 'undefined') BlikAIGuide.init();
  if (typeof BlikBlog !== 'undefined') BlikBlog.init();
});
