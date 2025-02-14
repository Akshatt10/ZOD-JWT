bcrypt = require("bcrypt");

const express = require("express");
const { UserModel, TodoModel } = require("./db");
const { auth, JWT_SECRET } = require("./auth");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const {z} = require("zod");

mongoose.connect("");

const app = express();
app.use(express.json());

app.post("/signup", async function(req, res) {

    const requiredbody = z.object({
        email: z.string().min(3).max(100).email(),
        password: z.string().min(6).max(100),
        name: z.string().min(2)
    });

    // const parsedData = requiredbody.parse(req.body);
    const parseDataWithSuccess = requiredbody.safeParse(req.body);

    if(!parseDataWithSuccess.success) {
        res.status(400).json({
            message: "Invalid data",
            error: parseDataWithSuccess.error
        });
        return;
    }

    
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    console.log(email, password, name);
    
    const hashedPassword = await bcrypt.hash(password, 5);
    console.log(hashedPassword);
    
    await UserModel.create({
        email: email,
        password: hashedPassword,
        name: name
    });
    
    res.json({
        message: "You are signed up"
    })
});


app.post("/signin", async function(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    const response = await UserModel.findOne({
        email: email,
        password: password,
    });

    if (response) {
        const token = jwt.sign({
            id: response._id.toString()
        }, JWT_SECRET);

        res.json({
            token
        })
    } else {
        res.status(403).json({
            message: "Incorrect creds"
        })
    }
});


app.post("/todo", auth, async function(req, res) {
    const userId = req.userId;
    const title = req.body.title;
    const done = req.body.done;

    await TodoModel.create({
        userId,
        title,
        done
    });

    res.json({
        message: "Todo created"
    })
});


app.get("/todos", auth, async function(req, res) {
    const userId = req.userId;

    const todos = await TodoModel.find({
        userId
    });

    res.json({
        todos
    })
});

app.listen(3000);