var express = require('express');
var router = express.Router();

//
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({
    extended: true
}))
// ========================== ket noi db
const db = "mongodb+srv://danglh0603:Lehaidang123@cluster0.q4scs.mongodb.net/OnTap?retryWrites=true&w=majority";
const mongoose = require('mongoose');
// ========================== upload file
const multer = require('multer');
/* UPLOAD FILE*/
var nameImage = "";
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/')
    },
    filename: function (req, file, cb) {
        nameImage = Date.now() + ".jpg";
        cb(null, nameImage);
    },
    limits: {
        fileSize: 1024 * 200,
        files: 2,
    }
});

function fileFilter(req, file, cb) {
    if (file.mimetype === 'image/jpeg') {
        cb(null, true)
    } else {
        cb(new Error('K phai duoi jpg!'));
    }
}

var upload = multer({storage: storage, fileFilter: fileFilter});
//======================================
mongoose.connect(db).catch(err => {
    console.log("loi" + err.message);
});
// khai bao Schema
const DbOnTap = new mongoose.Schema({
    _id: "string", _email: "string", _diaChi: "string", _khoa: "string", _image: "Array"
});
const student = mongoose.model("Student", DbOnTap);
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'No', message: ""});
    // res.render('submit', { title: 'No' });
});
/* GET list page. */
router.get('/List', function (req, res, next) {
    student.find({}, function (err, data) {
        if (err == null) {
            res.render('ListAll', {title: 'ListAll', data: data});
        } else {
            console.log(err.message);
        }
    })
});
/* GET update page. */
router.get('/update', function (req, res, next) {
    res.render('update', {title: 'Update', message: ""});
    // res.render('submit', { title: 'No' });
});
//
router.post('/Update', function (req, res, next) {
    let _id = req.body.id;
    student.findOne({_id: _id}, function (err, data) {
            if (err == null) {
                res.render('update', {title: 'Update333', data: data});
            } else {
                res.send(err.message);
            }
        }
    )
    res.render('update', {title: 'Update', message: ""});
});
// add student if suscces go to ListAll page
router.post('/Add', upload.array("profile_pic", 2), function (req, res, next) {
    let _id = req.body.id;
    let _email = req.body.email;
    let _diaChi = req.body.diaChi;
    let _khoa = req.body.khoa;
    let _file = req.files;
    let _namefile = [];
    // console.log(_file);
    // ==========validate
    if (!_id) {
        const err = new Error("Chua nhap id!");
        return next(err);
    } else {
        student.findOne({_id: _id}, function (err, data) {
            if (data != null) {
                const err = new Error("ID da ton tai!");
                return next(err);
            }

        })
    }
    //
    if (!_email) {
        const err = new Error("Chua nhap email!");
        return next(err);
    }
    if (!_diaChi) {
        const err = new Error("Chua nhap dia chi!");
        return next(err);
    }
    if (!_khoa) {
        const err = new Error("Chua nhap khoa!");
        return next(err);
    }
    //
    for (var i = 0; i < _file.length; i++) {
        // console.log("ten: "+_file[i].filename);
        _namefile.push(_file[i].filename);
    }
    if (_file.length == 0) {
        const err = new Error("Chua chon file!");
        return next(err);
    } else {
        const data = new student({
            _id: _id, _email: _email, _diaChi: _diaChi, _khoa: _khoa, _image: _namefile
        });
        data.save(function (err) {
            if (err == null) {
                // res.render('index', {title: 'ListAll', message: mess});
                res.redirect("/List");
            } else {
                res.render("index", {title: "Add", message: err.message});
            }
        })
    }

});
// get student with id
router.post("/getStudent", function (req, res,) {
    let _id = req.body.id;
    student.findOne({_id: _id}, function (err, data) {
        if (err == null) {
            res.send({
                trangThai: 0, data: data
            });
        } else {
            res.send({
                trangThai: 1
            });
            console.log(err.message);
        }
    })
})
// delete student
router.post("/delete", function (req, res,) {
    let _id = req.body.id;
    student.deleteOne({_id: _id}, function (err) {
        if (err == null) {
            res.send({
                trangThai: 0
            });
        } else {
            res.send({
                trangThai: 1
            });
            console.log(err.message);
        }
    })
})
// update student
router.post("/updateStudent", upload.array("profile_pic", 2), function (req, res,) {
    let _id = req.body.id;
    let _email = req.body.email;
    let _diaChi = req.body.diaChi;
    let _khoa = req.body.khoa;
    let _file = req.files;
    let _namefile = [];
    //
    // if (!_id) {
    //     const err = new Error("Chua nhap id!");
    //     return next(err);
    // } else if (!_email) {
    //     const err = new Error("Chua nhap email!");
    //     return next(err);
    // } else if (!_diaChi) {
    //     const err = new Error("Chua nhap dia chi!");
    //     return next(err);
    // } else if (!_khoa) {
    //     const err = new Error("Chua nhap khoa!");
    //     return next(err);
    // } else if (_file.length == 0) {
    //     const err = new Error("Chua chon file!");
    //     return next(err);
    // }
    for (let i = 0; i < _file.length; i++) {
        _namefile.push(_file[i].filename);
    }
    student.updateOne({_id: _id}, {_email: _email, _diaChi: _diaChi, _khoa: _khoa, _image: _namefile}, function (err) {
        if (err == null) {
            res.redirect("/List");
        } else {
            res.send(err.message);
            console.log("loi update1 " + err.message);
        }
    })

})
// search
router.post("/Find", function (req, res,) {
    let _id = req.body.timKiem;
    student.findOne({_id: _id}, function (err, data) {
        if (err == null) {
            if (data == null) {
                res.render("Find", {title: "Find", data: null, message: "K tim thay!"});
            } else {
                res.render("Find", {title: "Find", data: data, message: "Da tim thay!"});
            }
        } else {
            res.send({
                trangThai: 1
            });
            console.log(err.message);
        }
    })
})


module.exports = router;
