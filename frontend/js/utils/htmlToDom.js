/**
 * Convertie une chaine de caractère html en element DOM
 * @param {*} htmlString
 * @returns un élément DOM
 */
function createElementFromHTML(htmlString) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    // Change this to div.childNodes to support multiple top-level nodes
    return div.firstChild;
}

export {
    createElementFromHTML
}