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
        nameImage = Date.now() + ".png";
        cb(null, nameImage);
    },
    limits: {
        fileSize: 1024 * 1024 *2,
        files: 2,
    }
});

function fileFilter(req, file, cb) {
    if (file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(new Error('K phai duoi png!'));
    }
}

var upload = multer({storage: storage, fileFilter: fileFilter});
//======================================
mongoose.connect(db).catch(err => {
    console.log("loi" + err.message);
});
// khai bao Schema
const DbOnTap = new mongoose.Schema({
    _tieuDe: "string", _noiDung: "string", _ngayNhap: "string", _image: "Array"
});
const SanPham = mongoose.model("SanPhams", DbOnTap);
/* GET home page. */
// router.get('/', function (req, res, next) {
//     res.render('index', {title: 'No', message: ""});
//     // res.render('submit', { title: 'No' });
// });
router.get('/Add', function (req, res, next) {
    res.render('Add', {title: 'Add', message: ""});
});
/* GET list page. */
router.get('/', function (req, res, next) {
    SanPham.find({}, function (err, data) {
        if (err == null) {
            res.render('index', {title: 'Home', data: data});
        } else {
            console.log(err.message);
            res.render('index', {title: 'Home', data: null});
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
    SanPham.findOne({_id: _id}, function (err, data) {
            if (err == null) {
                res.render('update', {title: 'Update', data: data});
            } else {
                res.send(err.message);
            }
        }
    )
    res.render('update', {title: 'Update', message: ""});
});
// add student if suscces go to ListAll page
router.post('/Add', upload.array("profile_pic", 2), function (req, res, next) {
    let _tieuDe = req.body.tieuDe;
    let _noiDung = req.body.noiDung;
    let _ngayNhap = req.body.ngayNhap;
    let _file = req.files;
    let _namefile = [];
    // console.log(_file);
    // ==========validate
    if (!_tieuDe) {
        const err = new Error("Chua nhap tieu de!");
        return next(err);
    }
    //
    if (!_noiDung) {
        const err = new Error("Chua nhap noi dung!");
        return next(err);
    }
    if (!_ngayNhap) {
        const err = new Error("Chua nhap ngay nhap!");
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
        const data = new SanPham({
            _tieuDe: _tieuDe, _noiDung: _noiDung, _ngayNhap: _ngayNhap, _image: _namefile
        });
        data.save(function (err) {
            if (err == null) {
                // res.render('index', {title: 'ListAll', message: mess});
                res.redirect("/");
            } else {
                res.render("Add", {title: "Add", message: err.message});
            }
        })
    }

});
// get student with id
router.post("/getStudent", function (req, res,) {
    let _id = req.body.id;
    SanPham.findOne({_id: _id}, function (err, data) {
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
    SanPham.deleteOne({_id: _id}, function (err) {
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
    let _tieuDe = req.body.tieuDe;
    let _noiDung = req.body.noiDung;
    let _ngayNhap = req.body.ngayNhap;
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
    SanPham.updateOne({_id: _id}, {
        _tieuDe: _tieuDe,
        _noiDung: _noiDung,
        _ngayNhap: _ngayNhap,
        _image: _namefile
    }, function (err) {
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
    let _ngayNhap = req.body.timKiem;
    SanPham.findOne({_ngayNhap: _ngayNhap}, function (err, data) {
        if (err == null) {
            if (data == null) {
                res.render("Find", {title: "Find", data: null, message: "K tim thay san pham!"});
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
