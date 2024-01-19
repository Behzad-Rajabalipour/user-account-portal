const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");         // hash(encrypt) mikone paswword ro


const userSchema = new mongoose.Schema({
    "userName": {
        type: String,
        unique: true
    },
    "password": String,
    "email": String,
    "loginHistory": [{
        "dateTime": Date,
        "userAgent": String
    }]
});

//--------------------------------------------------------------------
// load data at init
let User;
exports.initialize = () =>{
    return new Promise((resolve,reject)=>{          // dakhele Promise minevisim ke badan betunim .then() behesh bedim, Async
        let db = mongoose.createConnection("mongodb+srv://behzad:22HXzhWfZBeNd2iE@cluster0.3qqi9f5.mongodb.net/"); // farghe .connect ba .createConnection () ine ke 2vomi age hata vojod nadashte bashe misazash
        db.on('error',(err)=>{
            console.log("xxxxx",err)
            reject(err);
        })
        db.on('open',()=>{
            User = db.model("Users",userSchema);      // dadeha va keshi mishe mirize to User. esme table to db, Users hast
            resolve("connected to mongodb");
        })
    })
}

//--------------------------------------------------------------------
// 1.encrypt kardande password 2.Register user
exports.registerUser = (userData) =>{
    return new Promise ((resolve,reject)=>{         // Promise zadim ke badesh betunim .then() bezarim
        if (userData.password != userData.password2){
            reject ("Passwords are not match");
        }
        else{
            bcrypt.hash(userData.password, 10, function(err,hash){          // be andazeye 10 round hash mikone
                if (err) reject ("error encrypt password");
                else{
                    userData.password = hash;
                    let newUser = new User(userData);
                    newUser.save()              // chon loginHistory behesh nemidim default Null mizare. call back yani javabi ke bar migarde
                    .then (res=> resolve())
                    .catch((err)=>{
                        if (err.code === 11000) reject ("User Name already exist");
                        else reject ("There was an error creating the user " + err);   
                    })
                }
            })
        }
    })
}

//--------------------------------------------------------------------
exports.checkUser = (userData) =>{
    return new Promise((resolve, reject)=>{
        User.find({userName: userData.userName})                // mirize to yel array, chon ma userName tekrari nadarim pas hatman in array 1 khune dare
        .exec()
        .then(users =>{
            bcrypt.compare(userData.password , users[0].password)           // har 2 pass, ham uni ke az db miyad ham uni ke user input mikone, hash hastan
            .then(res => {
                if (res === true){
                    users[0].loginHistory.push({dateTime: (new Date()).toString(), userAgent:userData.userAgent});
                    User.updateMany(                                            // update db
                            {userName:users[0].userName},                       // in user
                            {$set:{loginHistory: users[0].loginHistory}},       // change kon ina ro
                            {multi:false}                                       // multi record update nakon
                        )
                        .exec()
                        .then(()=>{resolve(users[0])})
                }
                else{
                    reject ("Wrong Password for user: " + userData.userName);
                }
            })
        })
        .catch(()=>{
            reject("Unable to find user: " + userData.userName);
        })
    })
}

