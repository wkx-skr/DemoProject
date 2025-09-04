import translations from './translations'
let upperTranslations = {}
for (let key in translations) {
  upperTranslations[key.toUpperCase()] = translations[key]
}

export default function customTranslate (template, replacements) {
  replacements = replacements || {}

  // Translate
  template = upperTranslations[template.toUpperCase()] || template

  // Replace
  return template.replace(/{([^}]+)}/g, function (_, key) {
    return replacements[key] || '{' + key + '}'
  })
}
