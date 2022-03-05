const genrateMessages = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

const genrateLocation = (username, url) => {
    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    genrateMessages,
    genrateLocation
}