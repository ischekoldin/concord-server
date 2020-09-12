const users = [];

const addUser = ({id, name, room}) => {
    name = name.trim();
    room = room.trim();

    const existingUser = users.find((user) => user.room === room && user.name === name);

    if (existingUser) {
        return {error: 'Username is taken'};
    }

    const user = { id, name, room, isTyping: false };
    users.push(user);

    return { user };
};


const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
};

const getUser = (id) => users.find((user) => user.id === id);

const setUserIsTyping = (id, isTyping) => {

    // to set status of a user as typing we fetch his index from the array and set the status
    const user = getUser(id);
    const userIndex = users.indexOf(user);
    users[userIndex].isTyping = !!isTyping;

    // also we return the modified user
    return user
};





const getUsersInRoom = (room) => users.filter((user) => user.room === room);


module.exports = {addUser, removeUser, getUser, getUsersInRoom, setUserIsTyping};