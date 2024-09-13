const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require("./american-to-british-titles.js")
const britishOnly = require('./british-only.js')

const reverseDict = (obj) => {
    return Object.assign(
        {},
        ...Object.entries(obj).map(([k,v]) => ({ [v]: k }))
    );
}

class Translator {
    
    toBritish(text) {
        const dictionary = { ...americanOnly, ...americanToBritishSpelling};
        const titles = americanToBritishTitles;
        const timeRegex = /([1-9]|1[012]):[0-5][0-9]/g;
        const translated = this.translate(
            text,
            dictionary,
            titles,
            timeRegex,
            "toBritish"
        );
        if(!translated) {
            return text;
        }

        return translated;
       
    }

    toAmerican(text) {
        const dictionary = {...britishOnly, ...reverseDict(americanToBritishSpelling)}
        const titles = reverseDict(americanToBritishTitles);
        const timeRegex = /([1-9]|1[012]).[0-5][0-9]/g;
        const translated = this.translate(
            text,
            dictionary,
            titles,
            timeRegex,
            "toAmerican"
        );
        if(!translated) {
            return text;
        }
        return translated;
    }

    translate(text, dict, titles, timeRegex, locale) {
        const lowerText = text.toLowerCase();
        const matchesMap = {};
    
        // Chercher d'abord les titres/honorifiques
        Object.entries(titles).forEach(([k, v]) => {
            if (lowerText.includes(k)) {
                matchesMap[k] = v.charAt(0).toUpperCase() + v.slice(1);
            }
        });
    
        // Filtrer les mots avec des espaces depuis le dictionnaire
        const wordsWithSpace = Object.fromEntries(
            Object.entries(dict).filter(([k, v]) => k.includes(" "))
        );
    
        // Chercher les phrases avec des espaces dans le texte
        Object.keys(wordsWithSpace).forEach(phrase => {
            if (lowerText.includes(phrase.toLowerCase())) {
                matchesMap[phrase] = wordsWithSpace[phrase];
            }
        });
    
        // Chercher les mots individuels
        lowerText.match(/(\w+([-'])(\w+)?['-]?(\w+))|\w+/g).forEach((word) => {
            if (dict[word]) matchesMap[word] = dict[word];
        });
    
        // Chercher les correspondances pour les heures
        const matchedTimes = lowerText.match(timeRegex);
        if (matchedTimes) {
            matchedTimes.forEach((e) => {
                if (locale === "toBritish") {
                    matchesMap[e] = e.replace(":", ".");
                } else {
                    matchesMap[e] = e.replace(".", ":");
                }
            });
        }
    
        if (Object.keys(matchesMap).length === 0) return null;
    
        const translation = this.replaceAll(text, matchesMap);
        const translationWithHighlight = this.replaceAllWithHighlight(text, matchesMap);
    
        return [translation, translationWithHighlight];
    }
    

    replaceAll(text, matchesMap) {
        //matchesMap : {fibers: fibres}
        //text: You need to eat fibers

        const regex = new RegExp(Object.keys(matchesMap).join("|"), "gi");
        return text.replace(regex, (matched) => matchesMap[matched.toLowerCase()]);
    }

    replaceAllWithHighlight(text, matchesMap) {
        const regex = new RegExp(Object.keys(matchesMap).join("|"), "gi");
        return text.replace(regex, (matched) => {
            return `<span class="highlight">${
                matchesMap[matched.toLowerCase()]
            }</span>`;
        });
    }
}

module.exports = Translator;