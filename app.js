const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");

//to post you must use bodyParser

app.use(express.static("assets"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

function calculate_gpa(data){

  let sum = 0;
  let credit = 0;

  data.courses.forEach((course) => {
    sum += course.gpa * course.credit;
    credit += course.credit;
  })

  let gpa = sum / credit;

  if(credit == 0) gpa = 0;

  data.gpax = gpa;
}

app.get("/", (req, res) => {
  res.end(fs.readFileSync("./instruction.html"));
});

//implement your api here
//follow instruction in http://localhost:8000/

app.get("/courses", (req, res) => {
  let buffer = fs.readFileSync("./myCourses.json");
  let data = JSON.parse(buffer);
  res.json(data)
})

app.get("/courses/:id", (req, res) => {
  let id = req.params.id
  let buffer = fs.readFileSync("./myCourses.json");
  let data = JSON.parse(buffer);

  let rtn_course = data.courses.find((value) => value.courseId == id);

  if(rtn_course) res.status(200)
                    .json(rtn_course);
  else res.status(404).json({key: "fail"})
})

app.delete("/courses/:id", (req, res) => {
  let id = req.params.id
  let buffer = fs.readFileSync("./myCourses.json");
  let data = JSON.parse(buffer);

  let rtn_course = data.courses.filter((value) => value.courseId != id);

  data.courses = rtn_course;
  calculate_gpa(data);
  fs.writeFileSync("./myCourses.json", JSON.stringify(data, null, 2));

  if(rtn_course) res.status(200)
                    .json(rtn_course);
  else res.status(404).json({key: "fail"})

})

app.post("/addCourse", (req, res) => {
  if(!req.query.courseId || !req.query.courseName || !req.query.credit || !req.query.gpa){
    res.status(422).send("fail");
  }
  else{
    let input = { courseId:+req.query.courseId, 
                  couresName: req.query.courseName,
                  credit: +req.query.credit, 
                  gpa: +req.query.gpa };

    let buffer = fs.readFileSync("./myCourses.json");
    let data = JSON.parse(buffer);

    data.courses.push(input);
    calculate_gpa(data);
    fs.writeFileSync("./myCourses.json", JSON.stringify(data, null, 2));
    
    res.status(201).send("success");

}
})

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`server started on port:${port}`));
