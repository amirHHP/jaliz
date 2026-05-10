const translations = {
  en: { morning_greeting: "Good morning, Sarah! 🪴" },
  fa: { morning_greeting: "صبح بخیر، سارا! 🪴" }
}
const language = "fa"
const key = "morning_greeting"
console.log(translations[language][key] || translations.en[key])
