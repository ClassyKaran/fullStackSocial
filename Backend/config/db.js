

// module.exports = {
//   mongoURI:"mongodb+srv://karanrajput:karanrajput@cluster0.sirchf4.mongodb.net/minisocial?retryWrites=true&w=majority&appName=minisocial"
// };

module.exports = {
  mongoURI:process.env.MONGO_URI,
};

// console.log("MongoDB URI:", process.env.MONGO_URI );