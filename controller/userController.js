const Users = require('../models/users')
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken')

const secretkey = "sandeepsundarlenka";

exports.signup = async (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    const existingUser = await Users.findOne({ email: email });

    if (existingUser) {
        return res.status(400).json({ error: "Email already registered. Please login" })
    }
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    const users = new Users({ name: name, email: email, password: hash });

    try {
        const data = await users.save();
        console.log('user created');
        res.status(201).json({ datavalues: data });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to sign up" })
    }
};

function generateAccessToken(id, name) {
    return jwt.sign({ id: id, name: name }, secretkey);
}

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const existingUser = await Users.findOne({ email: email });
        
        
        if (!existingUser) {
            return res.status(404).json({ error: "Email not registered. Please sign up" });
        }

        const result = await bcrypt.compare(password, existingUser.password);
        
        if (result) {
            const token = generateAccessToken(existingUser._id, existingUser.name);
            return res.status(200).json({ message: "User login successful", token: token });
        } else {
            return res.status(400).json({ error: "Incorrect password" });
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Failed to login" });
    }
};

exports.getuser = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await Users.findById(userId);

        if (user) {
            res.json({ user: user });
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to fetch user" });
    }
};

