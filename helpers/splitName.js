exports.getFirstName = (string) => {
    let name = string.trim();
    return name.includes(" ") ? name.split(" ")[1] : name;
}