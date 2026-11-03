// Phrasebook content: exactly 15 phrases. `say` is what the voice reads aloud.
(function () {
    const categories = {
        essentials: { name: "Essentials" },
        dining: { name: "Eating & Drinking" }
    };
    const categoryOrder = ["essentials", "dining"];

    // `sound` is a rough English-speaker pronunciation; CAPITALS = stressed syllable
    // (Czech always stresses the first syllable).
    const phrases = [
        { id: 1, category: "essentials", english: "Hello / Good day", czech: "Dobrý den", sound: "DOH-bree den" },
        { id: 2, category: "essentials", english: "Thank you", czech: "Děkuji", sound: "DYEH-kwee" },
        { id: 3, category: "essentials", english: "Please / You're welcome", czech: "Prosím", sound: "PRO-seem" },
        { id: 4, category: "essentials", english: "Excuse me / Sorry", czech: "Promiňte", sound: "PRO-min-yteh" },
        { id: 5, category: "essentials", english: "Yes / No", czech: "Ano / Ne", sound: "AH-no / neh", say: "Ano. Ne." },
        { id: 6, category: "essentials", english: "Do you speak English?", czech: "Mluvíte anglicky?", sound: "MLOO-vee-teh AHN-glits-kih" },
        { id: 7, category: "essentials", english: "Where is the toilet?", czech: "Kde je toaleta?", sound: "gdeh yeh TOH-ah-leh-tah" },

        { id: 8, category: "dining", english: "Table for two, please", czech: "Stůl pro dva, prosím", sound: "stool pro dvah, PRO-seem" },
        { id: 9, category: "dining", english: "The menu, please", czech: "Jídelní lístek, prosím", sound: "YEE-del-nyee LEES-tek, PRO-seem" },
        { id: 10, category: "dining", english: "I'll have this one, please", czech: "Dám si tohle, prosím", sound: "dahm see TOH-hleh, PRO-seem" },
        { id: 11, category: "dining", english: "Water, please", czech: "Vodu, prosím", sound: "VO-doo, PRO-seem" },
        { id: 12, category: "dining", english: "A beer, please", czech: "Pivo, prosím", sound: "PIH-vo, PRO-seem" },
        { id: 13, category: "dining", english: "It's delicious!", czech: "Je to výborné!", sound: "yeh to VEE-bor-neh" },
        { id: 14, category: "dining", english: "Cheers!", czech: "Na zdraví!", sound: "nah ZDRAH-vee" },
        { id: 15, category: "dining", english: "The bill, please", czech: "Platit, prosím", sound: "PLAH-tyit, PRO-seem" }
    ];

    // The exact text spoken for a phrase. Recordings are keyed by this string.
    const speechText = (p) => p.say || p.czech;
    // Every distinct text that needs a recording (used by tools/generate-audio.mjs).
    const allSpeechTexts = () => [...new Set(phrases.map(speechText))];

    globalThis.PHRASEBOOK = { categories, categoryOrder, phrases, speechText, allSpeechTexts };
})();
