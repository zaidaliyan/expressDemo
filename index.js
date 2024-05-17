const express = require('express')
const fs = require('fs')
const app = express();
const jwt = require('jsonwebtoken')
app.use(express.json())
app.get('/', (req, res) => {
    res.send("Hello World")
})

//display all the data

app.get('/api/students', (req, res) => {
    fs.readFile('./students.json', (err, data) => {
        if (err) throw err;
        res.json(JSON.parse(data));
    })
})

//display id specific data

app.get('/api/students/:id', (req, res) => {
    let data = fs.readFileSync('./students.json')
    data = JSON.parse(data)
    let student = data.filter((student) => {
        return student.id == parseInt(req.params.id)
    })
    if (student) {
        res.json(student)
    }
    else {
        res.status(404).send("Student not found")
    }
})

//add data to file

app.post('/api/students', (req, res) => {
    let data = fs.readFileSync('./students.json')
    data = JSON.parse(data)
    let student = {
        "id": data.length + 1,
        "name": req.body.name,
        "age": req.body.age
    }
    data.push(student)
    fs.writeFileSync('./students.json', JSON.stringify(data))
    res.status(200).json(student)
})

//update the data in the file using the id

app.patch('/api/students/:id', (req, res) => {
    try {
        let data = fs.readFileSync('./students.json', 'utf8');
        let students = JSON.parse(data);

        let studentIndex = students.findIndex((student) => {
            return student.id === parseInt(req.params.id);
        });

        if (studentIndex !== -1) {
            // Update student information
            if (req.body.name) students[studentIndex].name = req.body.name;
            if (req.body.age) students[studentIndex].age = req.body.age;

            // Write updated data back to the file
            fs.writeFileSync('./students.json', JSON.stringify(students, null));

            res.json(students[studentIndex]);
        } else {
            res.status(404).send(`Student with id ${req.params.id} not found`);
        }
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

//delete the data specific to id

app.delete('/api/students/:id', (req, res) => {
    try {
        let data = fs.readFileSync('./students.json', 'utf8');
        let students = JSON.parse(data);

        let studentIndex = students.findIndex((student) => {
            return student.id === parseInt(req.params.id);
        });

        if (studentIndex !== -1) {
            // delete the student using the index and splice operation
            students.splice(studentIndex, 1)

            // Write updated data back to the file
            fs.writeFileSync('./students.json', JSON.stringify(students, null));

            res.send(`Student with id: ${req.params.id} deleted successfully`);
        } else {
            res.status(404).send(`Student with id ${req.params.id} not found`);
        }
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});



//streams

app.get('/api/streams', (req, res) => {
    let readStream = fs.createReadStream('./students.json')
    let writeStream = fs.createWriteStream('./writestream.json')
    readStream.on('data', function (chunk) {
        writeStream.write(chunk)
    })
    res.send('Data written')
})

//pipe

app.get('/api/pipe', (req, res) => {
    fs.createReadStream('./writestream.json').pipe(res)
})

//jwt

app.post('/api/login', (req, res) => {
    const user = {
        uname: req.body.uname,
        pass: req.body.pass
    }
    jwt.sign({ user }, "Secret Key", (err, token) => {
        res.status(200).json({ token })
    })
})
function verifyToken(req,res,next){
    token=req.headers.authorization.split(' ')[1]
    req.token=token;
    next();
}
app.post('/api/profile',verifyToken, (req, res) => {
    const token = req.token
    jwt.verify(token, "Secret Key", (err, decoded) => {
        if (err) {
            res.status(401).json({ message: "Invalid Token" })
        } else {
            res.status(200).json({ message: "Welcome", user: decoded.user })
        }
    })
})

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})

