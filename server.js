/**
 * Created by suenpeng on 2017/3/8.
 */
const express = require("express");
const static = require("express-static");
const mysql = require("mysql");
const bodyParser = require('body-parser')
let server = express();
server.use(bodyParser.urlencoded({
  extended: false
}));
server.listen(3366);

//连接数据库
let db = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "a123456",
  database: "vue_admin"
});


db.connect(function (err) {
  if (err) {
    console.log(err);
    return;
  }
});
//注册:
server.post("/add", (req, res) => {
  let username = req.query.username;
  let password = req.query.password;
  db.query(`SELECT * FROM user WHERE username='${username}'`, (err, data) => {
    if (err) {
      res.send({
        code: 1,
        msg: "数据库查询错误"
      });
      res.end();
    } else {
      if (data.length > 0) {
        res.send({
          code: 1,
          msg: "用户名已存在"
        });
        res.end();
      } else {
        db.query(
          `insert into user (username,password,token) values ('${username}','${password}','1')`,
          (err, data) => {
            if (err) {
              res.send({
                code: 1,
                msg: "添加失败"
              });
              res.end();
            } else {
              res.send({
                code: 0
              });
              res.end();
            }
          }
        );
      }
    }
  });
});
//登陆:
server.post("/api/login", (req, res) => {
  db.query(
    `select * from login where username='${req.body.username}'`,
    (err, data) => {
      if (err) {
        res.send({
          code: 1,
          msg: "链接数据库失败"
        });
        res.end();
      } else {
        if (data.length == 0) {
          res.send({
            code: 1,
            msg: "没有这个人"
          });
          res.end();
        } else {
          if (data[0].password == req.body.password) {
            res.send({
              code: 0,
              err: "",
              data: {
                token: data[0].token
              }
            });
            res.end();
          } else {
            res.send({
              code: 1,
              msg: "用户名或者密码错误"
            });
            res.end();
          }
        }
      }
    }
  );
});

// 获取用户权限
server.get("/api/info", (req, res) => {
  let token = req.query.token;
  db.query(`SELECT * FROM info WHERE token='${token}'`, (err, data) => {
    if (err) {
      res.send({
        code: 2,
        msg: "数据库查询错误"
      });
      res.end();
    } else {

      if (data.length > 0) {
        data[0].roles = data[0].roles.split(",");
        res.send({
          code: 0,
          msg: "success",
          data: data[0]
        });
        res.end();
      } else {
        res.send({
          code: 1,
          msg: "用户不存在"
        });
      }
    }
  });
});
// appinfo 添加小程序
server.post("/api/appinfo", (req, res) => {
  let appid = req.body.appid;
  let appname = req.body.appname;

  db.query(`SELECT * FROM appinfo WHERE appid='${appid}'`, (err, data) => {
    if (err) {
      res.send({
        code: 2,
        msg: "数据库查询错误"
      });
      res.end();
    } else {
      if (data.length > 0) {
        res.send({
          code: 1,
          msg: "小程序已存在"
        });
        res.end();
      } else {
        db.query(
          `insert into appinfo (appid,appname,id) values ('${appid}','${appname}','1')`,
          (err, data) => {
            if (err) {
              res.send({
                code: 1,
                msg: "添加失败"
              });
              res.end();
            } else {
              res.send({
                code: 0,
                msg: "添加成功"
              });
              res.end();
            }
          }
        );
      }
    }
  });
});
// 获取小程序
server.get("/api/appinfo", (req, res) => {
  let pageindex = Number(req.query.pageindex);
  let pagesize = Number(req.query.pagesize);
  console.log(pageindex, pagesize)
  db.query(`SELECT * FROM appinfo limit ${pageindex-1}, ${pagesize}`, (err, data) => {
    console.log(data)
    if (err) {
      res.send({
        code: 2,
        msg: "数据库查询错误"
      });
      res.end();
    } else {
      if (data.length > 0) {
        // db.query(`SELECT COUNT(*) FROM appinfo`, (err, data) => {})
        res.send({
          code: 0,
          msg: "查询成功",
          data: data
        });
        res.end();
      } else {
        res.send({
          code: 0,
          msg: "暂无小程序"
        });
        res.end();
      }
    }
  });
});
console.log("服务开启:3366");
server.use(express.static("www"));