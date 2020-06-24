const express = require("express");
const router = express.Router();
const Category = require("../categories/Category");
const Articles = require("./Article");
const slugify = require("slugify");
const adminAuth = require("../middlewares/adminAuth");

router.get("/admin/articles", adminAuth,(req, res) => {
    Articles.findAll({
        include: [{model: Category}],
        order: [['id', 'asc']]
    }).then(articles => {
        res.render("admin/articles/index", {articles: articles});
    })
});

router.get("/admin/articles/new", adminAuth, (req, res) => {
    Category.findAll().then(categories => {
        res.render("admin/articles/new", {categories: categories});
    });
});


router.post("/articles/save", adminAuth, (req, res) => {
    var title = req.body.title;
    var body = req.body.body;
    var category = req.body.category;

    Articles.create({
        title: title,
        slug: slugify(title),
        body: body,
        categoryId: category
    }).then(() => {
        res.redirect("/admin/articles");
    });
});

router.post("/articles/delete", adminAuth, (req, res) => {
    var id = req.body.id;
    if(id != undefined){
        if(!isNaN(id)){
            Articles.destroy({
               where: {
                   id: id
               }
            }).then(() => {
                res.redirect("/admin/articles");
            });
        }else{
            res.redirect("/admin/articles");
        };
    }else{
        res.redirect("/admin/articles");
    };
});

router.get("/admin/articles/edit/:id", adminAuth, (req, res) => {
    var id = req.params.id;
    if(isNaN(id)){
        res.redirect("/admin/articles");
    }
    Articles.findByPk(id, {
        include: [{model: Category}]
    }).then(article => {
        
        Category.findAll().then(categories => {
            if(article != undefined){
                res.render("admin/articles/edit", {article: article, categories: categories});
            }else{
                res.redirect("/admin/articles");
            }
        });
    }).catch(erro => {
        res.redirect("/admin/articles");
    });
});

router.post("/articles/update", adminAuth, (req, res) => {
    var id = req.body.id;
    var title = req.body.title;
    var body = req.body.body;
    var category = req.body.category;
    Articles.update({title: title, body: body, slug: slugify(title), categoryId: category}, {
        where:{
            id: id
        }
    }).then(() => {
        res.redirect("/admin/articles");
    });
});

router.get("/articles/page/:num", (req, res) => {
    var page = req.params.num;
    var offset;
    if(isNaN(page) || (page == 1)){
        offset = 0;
    }else{
        offset = (parseInt(page)- 1) * 4;
    }

    Articles.findAndCountAll({
        limit: 4,
        offset: offset,
        order:[['id', 'desc']]
    }).then(articles => {
        var next;
        if(offset + 4 > articles.count){
            next = false;
        }else{
            next = true;
        }
        var result = {
            page:parseInt(page),
            next: next,
            articles: articles
        }

        Category.findAll().then(categories => {
            res.render("admin/articles/page", {result: result, categories: categories});
        });
    });
});

module.exports = router;