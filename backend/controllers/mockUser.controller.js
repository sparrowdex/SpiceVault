// const users = require('../mockData/users');

// // Get all users
// exports.getAllUsers = (req, res) => {
//   res.status(200).json(users);
// };

// // Get user by ID
// exports.getUserById = (req, res) => {
//   const id = parseInt(req.params.id);
//   const user = users.find(u => u.user_id === id);

//   if (user) {
//     res.status(200).json(user);
//   } else {
//     res.status(404).json({ message: "User not found" });
//   }
// };

// // Add new user
// exports.addUser = (req, res) => {
//   const newUser = req.body;
//   newUser.user_id = users.length + 1;
//   users.push(newUser);
//   res.status(201).json(newUser);
// };
