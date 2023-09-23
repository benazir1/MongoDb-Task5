const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

 require('dotenv').config();
 
const Mentor = require("./models/mentor");
const Student = require("./models/student");

const app = express();
const PORT = process.env.PORT;
const DB_URL =process.env.DB_URL;

app.use(bodyParser.json());//for parsing  JSON bodies

//connect to MongoDB
mongoose
  .connect(DB_URL, {})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Could not connect to MongoDB", err));

  //create mentor
  app.post("/mentor",async(req,res)=>{
   try{
    const mentor = new Mentor(req.body);
    await mentor.save();
    res.send(mentor)
   }
   catch(error){
    res.status(400).send(error);
   }
  });
//create student
  app.post("/student",async(req,res)=>{
    try{
     const student = new Student(req.body);
     await student.save();
     res.send(student)
    }
    catch(error){
     res.status(400).send(error);
    }
   });

   //assign mentor to student
   app.post("/mentor/:mentorId/assign",async(req,res)=>{
    try{
    const mentor = await Mentor.findById(req.params.mentorId);
    const students = await Student.find({_id: {$in: req.body.students}});
    students.forEach((student) =>{
     student.cMentor = mentor._id;
     student.save();

    });
// A student who has a mentor should not be shown in List
 mentor.students = [

  ...mentor.students,
  ...students.map((student)=>student._id),
 ];
  await mentor.save();
  res.send(mentor);
 }
 catch(error){
  res.status(400).send(error);

 }
     });

     //assign or change a mentor
     app.put("/student/:studentId/assignMentor/:mentorId",async(req,res)=>{
      try{
      const student = await Student.findById(req.params.studentId);
      const nMentor = await Mentor.findById( req.params.mentorId);
      if (student.cMentor) {
        student.pMentor.push(student.cMentor);
      }
  
      student.cMentor = nMentor._id;
      await student.save();
      res.send(student);
    }
      catch(error){
    res.status(400).send(error);
  
   }
       });

       //Show all students for a particular mentor
       app.get("/mentor/:mentorId/students", async (req, res) => {
        try {
          const mentor = await Mentor.findById(req.params.mentorId).populate(
            "students"
          );
          res.send(mentor.students);
        } catch (error) {
          res.status(400).send(error);
        }
      });

      //show the previously assigned mentor for a particular student.
      app.get("/students/:studentId/mentor", async (req, res) => {
        try {
          const student = await Student.findById(req.params.studentId).populate(
            "pMentor"
          );
          res.send(student.pMentor);
        } catch (error) {
          res.status(400).send(error);
        }
      });
  app.listen(PORT, () => {
    console.log("Server is running on PORT:", PORT);
  });