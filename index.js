const express = require("express");
const app = express();
const bodyParse = require("body-parser");
const session = require("express-session");
const connection = require("./database/connection");

const categoriesController = require("./categories/CategoriesController");
const articleController = require("./articles/ArticlesController");
const usersController = require("./user/UsersController");

const Article = require("./articles/Article");
const Category = require("./categories/Category");
const User = require("./user/User");
//View Engine
app.set('view engine', 'ejs');
//Sessions
app.use(session({
    secret: "bolinho",
    cookie: {maxAge: 600000}
}));    
//Static file
app.use(express.static('public'));
//Body Parser
app.use(bodyParse.urlencoded({extended: false}));
app.use(bodyParse.json());
//DataBase
connection
    .authenticate()
    .then(() => {
        console.log("Database connected.");
    })
    .catch((error) => {
        console.log(error);
    });
app.use("/", categoriesController);
app.use("/", articleController);
app.use("/", usersController);

//Home
app.get("/", (req, res) => {
   Article.findAll({
       order: [['id', 'desc']],
       limit: 4
   }).then(articles => {
       Category.findAll().then(categories => {
        res.render("home", {articles: articles, categories: categories});
       });
   });
});

//Article
app.get("/article/:slug", (req, res) => {
    var slug = req.params.slug;
    Article.findOne({
        where: {
            slug: slug
        }
    }).then(article => {
        Category.findAll().then(categories => {
               res.render("article", { article: article, categories: categories});
           });
    });
});

//Categories
app.get("/category/:slug", (req, res) => {
    var slug = req.params.slug;
    Category.findOne({
        where:{
            slug: slug
        },
        include: [{model: Article}]
    }).then( category => {
        if(category != undefined){
            Category.findAll().then(categories => {
                res.render("home", {articles: category.articles, categories: categories})
            }); 
        }else{
            res.redirect("/");
        }
    }).catch(error => {
        res.redirect("/");
    });
});

app.listen(3000, () => {
   console.log("Started.");
});