import express from "express";
import mysql from "mysql";

const app = express();
const port = 4000;

app.use(express.json());
app.use(express.urlencoded());

const connection = mysql.createConnection({
  host: "localhost",
  database: "downStream",
  user: "root",
  password: "root",
});

app.get("/post", function connectioncheck(req, res) {
  console.log("Connected to the front end");
});

//add a new user
app.post("/signup", function addUser(req, res) {
  const name = req.body.name;
  const surname = req.body.surname;
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const date_of_birth = req.body.date_of_birth;
  const country = req.body.country;
  //first check to see if the username is already in use
  connection.query(
    "SELECT * FROM Users WHERE Email = ?",
    [email],
    function (err, results) {
      if (err) throw err;
      if (results.length > 0) {
        return res.send({ message: "Email already in use" });
      }
      //if username is not taken adds new user to database
      else {
        connection.query(
          "INSERT INTO Users (Name, Surname, Username, Password, Email, Date_of_birth, Country) \
                                                    VALUES (?, ?, ?, ?, ?, ?, ?)",
          [name, surname, username, password, email, date_of_birth, country],
          function (err, results) {
            if (err) throw err;
            res.send(results);
          }
        );
      }
    }
  );
});

//logs in user
app.post("/login", function login(req, res) {
  const email = req.body.email;
  const password = req.body.password;
  connection.query(
    "SELECT * from Users WHERE Email = ? AND Password =? ",
    [email, password],
    function (err, results) {
      if (err) throw err;
      //checks to see if username and password are in the database
      if (results.length <= 0) {
        return res.send({ message: "Incorrect email or password" });
        // converts the message into an object that we can display on the frontend
      } else {
        res.send(results);
      }
    }
  );
});

// displays Name and favourites
app.get("/profile", function profile(req, res) {
  connection.query(
    "SELECT Name, Title_id FROM Users INNER JOIN Favourites on User_id = id WHERE User_id = 1;",
    function (err, results) {
      if (err) throw err;
      else {
        return res.send(results);
      }
    }
  );
});

// Displays username on Search page (via Platform.js)
app.get("/search", function search(req, res) {
  connection.query(
    "SELECT Name, Username FROM Users;",
    function (err, results) {
      if (err) throw err;
      else {
        return res.send(results);
      }
    }
  );
});

// Adds title to favourites on heart icon click
app.post("/results", function addToFavourites(req, res) {
  const user_id = req.body.user_id;
  const title_id = req.body.title_id;
  connection.query(
    "SELECT * FROM Favourites WHERE Title_id = ?",
    [title_id],
    function (err, results) {
      if (err) throw err;
      if (results.length > 0) {
        return res.send({ message: "Alrady added" });
      } else {
        connection.query(
          "INSERT INTO Favourites (User_id, Title_id) \
          VALUES(?, ?)",
          [user_id, title_id],
          function (err, results) {
            if (err) throw err;
            res.send(results);
          }
        );
      }
    }
  );
});

// Supposed to remove favourites on heart icon click
app.delete("/results", function deleteFromFavourites(req, res) {
  const title_id = req.body.title_id;
  connection.query(
    "SELECT * FROM Favourites WHERE Title_id = ?",
    [title_id],
    function (err, results) {
      if (err) throw err;
      if (results.length < 1) {
        return res.send({ message: "Doesn't exist" });
      } else {
        connection.query(
          "DELETE FROM Favourites WHERE Title_id = ?",
          [title_id],
          function (err, results) {
            if (err) throw err;
          }
        );
      }
    }
  );
});

app.listen(port, function () {
  console.log(`Listening on port ${port}...`);
});
