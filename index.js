const express = require('express')
const app = express()
app.use(express.json({ extended: false }));
app.use(express.static('./views'));
app.set('view engine', 'ejs');
app.set('views', './views')


//aws
const AWS = require('aws-sdk');
const config = new AWS.Config({
    accessKeyId: 'AKIAYAYEIP73JB5T7GAX',
    secretAccessKey: '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',
    region: 'ap-southeast-1'
});
AWS.config = config;
const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'SinhVien';

//multer
const multer = require('multer');
const upload = multer();

//get list
app.get('/', (req, res) => {
    const params = {
        TableName: tableName,
    };

    docClient.scan(params, (err, data) => {
        if (err) {
            res.send('internal servser error !');
        } else {
            return res.render('index', { listSV: data.Items });
        }
    });
})

//dieu huong sang trang add
app.get("/add", (req, res) => {
    return res.render("add")
})

//add
app.post("/", upload.fields([]), (req, res) => {
    const { maSV, tenSV, gioiTinh, soDienThoai, email } = req.body;
    const params = {
        TableName: tableName,
        Item: {
            maSV,
            tenSV,
            gioiTinh,
            soDienThoai,
            email,
        }
    }

    docClient.put(params, (err, data) => {
        if (err) {
            console.log(err);
            throw new Error("internal servser error!");
        } else
            return res.redirect("/")
    })
})

//delete
app.post('/delete', upload.fields([]), (req, res) => {
    const listItems = Object.keys(req.body);

    if (listItems.length === 0) {
        res.redirect("/")
    }

    function onDelete(index) {
        const params = {
            TableName: tableName,
            Key: {
                "maSV": listItems[index],
            }
        };

        docClient.delete(params, (err, data) => {
            if (err) {
                return res.send('internal servser error!');
            } else {
                if (index > 0) {
                    onDelete(index - 1);
                } else {
                    return res.redirect('/');
                }
            }
        });
    }
    onDelete(listItems.length - 1);
});


//listen
app.listen(3000, () => {
    console.log(`Server running at port 3000`);
});