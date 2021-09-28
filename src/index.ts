function component() {
    const newContent = document.createTextNode("Hi there and greetings!");
    return newContent;
}

document.body.appendChild(component());
