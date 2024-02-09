const express = require("express");
const app = express();
const multer = require("multer");
const cors = require("cors")
const fs = require("fs");

const dotenv = require("dotenv")
app.use(express.static('client/build'));

dotenv.config()
const path = require('path');
var mammoth = require("mammoth");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });


app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
});

app.post("/upload", upload.single("file"), uploadFiles);

function uploadFiles(req, res) {
    const filePath = req.file.path;
    processDocxContents(filePath, res);
}


const processDocxContents = (filePath, res) => {

    var options = {
        styleMap: [
            "u => u"
        ]
    };

    mammoth.convertToHtml({ path: filePath, }, options).then((result) => {
        const html = result.value;

        res.send(html);

        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(err);
                return;
            }

        });

    }).catch((err) => {
        console.error(err);
        res.status(500).send('Error processing file');
    });
};

const port = process.env.PORT

app.listen(process.env.port || 4000, () => {
    console.log(`Server started... ${port}`);
});