import UserModel from "../models/users.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export function signup(req, res) {
  const hashedPwd = bcrypt.hashSync(req.body.user_password, 10);
  const userBody = {
    name: req.body.user_name,
    email: req.body.user_email,
    photo: req.body.photo,
    location: req.body.location,
    password: hashedPwd
  };

  UserModel.create(userBody)
    .then(newUser => {
      const photo = req.body.photo;
      const userData = {
        username: req.body.user_name,
        email: req.body.user_email,
        location: req.body.location
      };

      const token = jwt.sign(userData, "secret", { expiresIn: "1w" });

      return res.json({ token: token, user: { ...userData, photo } });
    })
    .catch(err => {
      res.status(403).json({ error: err });
    });
}

export function login(req, res) {
  UserModel.findOne({ email: req.body.user_email })
    .then((user: any) => {
      if (!user) {
        return res.json({ error: "wrong email" });
      }

      bcrypt.compare(req.body.user_password, user.password, (err, result) => {
        if (!result) {
          return res.json({
            error: `wrong password for ${req.body.user_email}`
          });
        }

        const photo = user.photo;
        const userData = {
          username: user.name,
          email: user.email,
          location: user.location
        };

        const token = jwt.sign(userData, "secret", { expiresIn: "1w" });

        return res.json({ token: token, user: { ...userData, photo } });
      });
    })
    .catch(err => handleError(err, res));
}

function handleError(err, res) {
  return res.status(400).json(err);
}
