// Importing required modules
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const { Sequelize, DataTypes, Op } = require("sequelize");

// Creating a Sequelize instance for connecting to the database
const sequelize = new Sequelize(
  "postgres://vhysdigu:nRV0kjVAAES4kWToPQlr7jaiyJ3WcCqu@heffalump.db.elephantsql.com/vhysdigu"
);

// Defining a Sequelize model for the "Items" table
const Items = sequelize.define("Items", {
  itemNum: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: DataTypes.STRING,
  body: DataTypes.STRING(5000),
  category: DataTypes.INTEGER,
  published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    set: function (value) {
      // Converting string values to boolean
      if (value === "true") value = true;
      if (value === "false") value = false;
      this.setDataValue("published", value);
    },
  },
  postDate: DataTypes.DATE,
  featureImage: {
    type: DataTypes.STRING(2000),
    allowNull: true
  },
  price: DataTypes.DOUBLE,
  userEmail: DataTypes.STRING
});

// Defining a Sequelize model for the "Categories" table
const Categories = sequelize.define("Categories", {
  CategoryId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  category: DataTypes.STRING(1000),
});

// Initializing the connection to the database
module.exports.initialize = () => {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(sequelize.authenticate())
      .then(() => {
        const {count,rows} = Items.findAndCountAll();       
        // if ((count === 0 && rows === 0) || (count === undefined && rows === undefined)){
        //   new Promise((res, rej) => {
        //     fs.readFile("./data/items.json", (err, data) => {
        //       res(JSON.parse(data));
        //     });
        //   }).then((parsData) => {
        //     for (var i = 0; i < parsData.length; i++) {
        //        Items.create(parsData[i]);              
        //     }
        //   });
        // }
      })
      .then(() => {
        new Promise((res, rej) => {
          fs.readFile("./data/categories.json", (err, data) => {
            res(JSON.parse(data));
          });
        }).then((parsData) => {
          const {count2,rows2} = Categories.findAndCountAll();       // faghat dafeye aval data ro az API mirize to elephanetSQL
          // if ((count2 === 0 && rows2 === 0) || (count2 === undefined && rows2 === undefined)){
          //   for (var i = 0; i < parsData.length; i++) {
          //     Categories.create({                      // age in ro active konam dobare misaze
          //       category: parsData[i].id,
          //       category: parsData[i].category,
          //     });
          //   }
          // }
        });
      })
      .then(resolve("connected To DB"))
      .catch((err) => reject("unable to connect DB, ", err));
  });
};

// Configuring cloudinary with API credentials
cloudinary.config({
  cloud_name: "dzcjhlt3n",
  api_key: "538441327917812",
  api_secret: "zZ4z3f-4BncIjkFUyuMba_xqefI",
});

// Fetching all items from the database
module.exports.getAllItems = function (userEmail) {
  return new Promise((res, rej) => {
    res(Items.findAll({
      where: {
        userEmail : userEmail
      }
    }));
    rej("couldn't get all items");
  });
};

// Fetching all categories from the database
module.exports.getCategories = function () {
  var promise = new Promise((resolve, reject) => {
    var res = Categories.findAll();
    resolve(res);
    reject("No result found");
  });
  return promise;
};

// Fetching all published items from the database
module.exports.getPublishedItems = function (userEmail) {
  return new Promise((resolve, reject) => {
    Items.findAll({
      where: {
        published: true,
        userEmail: userEmail
      },
    })
      .then((data) => resolve(data))
      .catch((err) => reject("no result found"));
  });
};

// Function to upload a file to cloudinary using a stream
streamUpload = (req) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream((error, result) => {
      // Resolving or rejecting the promise based on the upload result
      if (result) {
        resolve(result);
      } else {
        reject(error);
      }
    });
    streamifier.createReadStream(req.file.buffer).pipe(stream);
  });
};

// Async function to handle file upload using cloudinary
module.exports.upload = async function (req) {
  let result = await streamUpload(req);
  return result;
};

// Adding a new item to the database
module.exports.addItem = (itemData) => {
  itemData.published = itemData.published ? true : false;
  // Setting empty strings to null in the input data
  for (prop in itemData) {
    if (prop == "") prop = null;
  }
  console.log(itemData);
  // Async function to create a new record in the "Items" table
  return (async () => {
    const res = await Items.create(itemData);
    res.save();
  })();
};

// Fetching all items of a specific category from the database
module.exports.getItemByCategory = function (category_) {
  return new Promise((resolve, reject) => {
    resolve(
      Items.findAll({
        where: {
          category: category_,
        },
      })
    );
    reject("Unable to get category");
  });
};

// Fetching all items with postDate greater than or equal to a given date
module.exports.getItemsByMinDate = function (minDateStr) {
  return new Promise((resolve, reject) => {
    Items.findAll({
      where: {
        postDate: { [Op.gte]: minDateStr },
      },
    })
      .then((data) => resolve(data))
      .catch((err) => reject(err.message));
  });
};

// Fetching an item by its ID from the database
module.exports.getItemById = function (value) {
  return new Promise((res, rej) => {
    Items.findAll({
      where: {
        itemNum: value,
      },
    })
      .then((data) => res(data))
      .catch((err) => rej("no Item found"));
  });
};

// Updating an item in the database
module.exports.updateItem = (editedItem) => {

  for (prop in editedItem) {
    if (prop == "") prop = null;
  }
  
  // Updating the item in the "Items" table
  return new Promise((resolve, reject) => {
    Items.findAll({
      where:{
        itemNum: editedItem.itemNum
      },
    })
      .then((objects) =>{
        const object = objects[0];
        console.log("xxxxx",object)
        
        if (editedItem.featureImage){
          const regex = /\/upload\/v\d+\/([a-zA-Z0-9]+)\.\w+$/;
          var publicId = object.featureImage.match(regex);      // publicId is array. First index[0] is full match. from second index[1] it gives us result
          
          if (publicId && publicId[1]){
            cloudinary.uploader.destroy(publicId[1], (err,res) =>{      
              if (err){
                console.error("Error destroying image:", err);
                reject("Unable to destroy image");
              } else {
                console.log("Image destroy result:", res);
              }
            });
          }
        }
         
        return Items.update(editedItem, {              // It just update fields, doesn't remove any field
          where: {
            itemNum: editedItem.itemNum,
          },
        })
      })
      .then (() => {
        resolve("Object updated successfully");
      })
      .catch((error) => {
        console.error("Error updating object:", error);
        reject("Unable to update object");
      })
  })
};

// Reading files from the "public/images/photos" directory
module.exports.readFiles = (value) => {
  const resArr = new Promise((res, rej) => {
    var CloudImages = [];
    Items.findAll({
      where:{
        userEmail:value
      }
    })
    .then((Objects) => {
        for (var i = 0; i < Objects.length; i++) {
          CloudImages.push(Objects[i].dataValues.featureImage);
        }

      })
      .then(() => res(CloudImages));

  });
  return resArr;
};
