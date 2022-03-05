const users = []

//function to store user when a new user join 

const addUser = ({ id, username, room }) => {
    //clean the data
    //removing spaces
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if (!username || !room) {
        return {
            error: 'username and room are required'
        }
    }

    //check for exisiting user
    const existingUser = users.find(user => {
        return user.username === username && user.room === room
    })

    //validate username
    if (existingUser) {
        return {
            error: 'username already taken'
        }
    }

    //storing user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

//removing a user when a user disconnects
const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

//get a usre by it's id
const getUser = (id) => {
    const match = users.find(user => user.id === id)
    return match
}

//get user in a room
const getUsersInRoom = (room) => {
    const userInRoom = users.filter(user => user.room === room)
    return userInRoom

}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}