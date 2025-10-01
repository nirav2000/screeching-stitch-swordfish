// Create a visual keyboard for note interaction
function createKeyboard() {
    const keyboardContainer = document.getElementById("keyboard");
    const keys = ["a", "w", "s", "e", "d", "f", "t", "g", "y", "h", "u", "j", "k", "o"];

    keys.forEach(key => {
        const button = document.createElement("button");
        button.innerText = key.toUpperCase();
        button.addEventListener("click", () => handleButtonClick(noteKeyMap[key]));
        keyboardContainer.appendChild(button);
    });
}