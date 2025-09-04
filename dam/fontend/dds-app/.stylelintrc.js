module.exports = {
  extends: ["stylelint-config-standard", "stylelint-config-recess-order"],
  plugins: ["stylelint-scss"],
  defaultSeverity: "warning",
  rules: {
    // 校验规则略
    'no-descending-specificity': null,
    'no-duplicate-selectors': null,
    'font-family-no-missing-generic-family-keyword': null,
    'block-no-empty': null,
    'no-empty-source': null,
    'at-rule-no-unknown': null,
    'unit-no-unknown': null,
    'no-invalid-position-at-import-rule': null,
    'declaration-block-single-line-max-declarations': null,
    'rule-empty-line-before': null,
    'max-empty-lines': null,
    'declaration-empty-line-before': null
  },
};
