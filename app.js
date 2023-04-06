const express=require('express');
const path=require('path');
const mongoose=require('mongoose');
const { User, Subject, Semester, Result } = require('./models/srms');
const ejsMate=require('ejs-mate');
const session=require('express-session');
const flash=require('connect-flash');
const methodOverride=require('method-override');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const { ObjectId } = require('mongodb');
// const routes = require('./routes/route');

mongoose.connect('mongodb://localhost:27017/srms',{
    useNewUrlParser:true,
    useUnifiedTopology:true
});

const db=mongoose.connection;
db.on('error',console.error.bind(console,"connection error"));
db.once("open",()=>{
    console.log("Database connected");
});


const app = express();

app.engine("ejs",ejsMate);
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname, 'views'));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname+'/public')));


const sessionConfig={
    secret:'itisasecret',
    resave:false,
    saveUninitialized:true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));
app.use(flash());

app.use((req,res,next)=>{
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app.use('/', routes);

app.get('/',(req, res) => {
    res.render('home');
})


app.get('/professorRegister',async(req, res) => {
    res.render('professorRegister');
})
app.post('/professorRegister',async(req, res)=>{
    const { username, email, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        const userId=registeredUser._id;
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Dashboard');
            res.redirect(`/professorDashboard/${userId}`);
        })
})
app.get('/professorLogin',async(req, res)=>{
    res.render('professorLogin');
})
app.post('/professorLogin', passport.authenticate('local', { failureRedirect: '/professorLogin' }), (req, res) => {
    // If authentication is successful, redirect to the teacher's dashboard page with the teacher's ID in the URL
    res.redirect('/professorDashboard/' + req.user._id);
  });
app.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
 });
app.get('/professorDashboard/:id',async(req,res)=>{
    const profId=req.params.id;
    res.render('professorDashboard',{profId:profId});
})
app.get('/professorDashboard/:id/manageStudents',async(req,res)=>{
    const profId=req.params.id;
    const professor=await User.findById(profId);
    const subjectObject=professor.subjects[0];
    const subId=subjectObject._id;
    const subject=await Subject.findById(subjectObject._id);
    console.log(subject);
    const students=subject.grades;
    const temp=[];
    const marks=[];
    for(let stud of students){
        const tempStud=await User.findById(stud.student);
        temp.push(tempStud);
    }
    for(let mark of subject.grades){
        marks.push(mark.grade);
    }
    res.render('manageStudents',{temp,subject,marks,profId,subId});
})
// app.get('/professorDashboard/:id/manageStudents/:studId/:subId/editGrade',async(req,res) =>{
//     const professorId=req.params.id;
//     const subjectId=req.params.gradeId;
//     const studentId=req.params.studId;
//     const student=await User.findById(studentId);
//     res.render('editGrade',{professorId,subjectId,studentId,student});
// })
// app.put('/professorDashboard/:id/manageStudents/:studId/:subId', async (req, res) => {
//     // const professorId=req.params.id;
//     // const subjectId=req.params.gradeId;
//     // const studentId=req.params.studId;
//     // const student=await User.findById(studentId);
//     // const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
//     // res.redirect(`/professorDashboard/:id/manageStudents`);
//     res.send(req.body);
// })
app.get('/addSubjects',async(req, res) => {
   const sub=new Subject({name: "subject1"});
   await sub.save();
   res.render('home');
})

app.get('/studentRegister',async(req, res) => {
    res.render('studentRegister');
})
app.post('/studentRegister',async(req, res)=>{
    const { username, email, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        const userId=registeredUser._id;
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Dashboard');
            res.redirect(`/studentResult/${userId}`);
        })
})
app.get('/studentLogin',async(req, res)=>{
    res.render('studentLogin');
})
app.post('/studentLogin', passport.authenticate('local', { failureRedirect: '/studentLogin' }), (req, res) => {
    // If authentication is successful, redirect to the teacher's dashboard page with the teacher's ID in the URL
    res.redirect('/studentResult/' + req.user._id);
  });
app.get('/add_faculty',async(req,res) => {
     res.render('add_faculty');
});
app.post('/add_faculty',function(req, res, next) => {
     const { email } = req.body;
     const count = await db.collection('staff').countDocuments({ email: email });
    if (count !== 0) {
      req.flash('error', 'Staff with that email already exists');
      res.redirect('/add_faculty');
    } else {
      const {
        dob,
        name,
        subject,
        contact,
      } = req.body;
  
      if (contact.length > 11) {
        req.flash('error', 'Enter a valid phone number');
        return res.redirect('/add_faculty');
      }
  
      const password = dob.toString().split('-').join('');
      const hashedPassword = await bcrypt.hash(password, 8);
  
      const newStaff = {
        st_id: uuidv4(),
        st_name: name,
        dob: dob,
        subject: subject,
        email: email,
        contact: contact,
        password: hashedPassword,
      };
       await db.collection('staff').insertOne(newStaff);
      req.flash('success_msg', 'Staff added successfully');
      res.redirect('/manage_faculty');
    }
});
app.get('/manage_faculty',async(req,res) => {
    const collection = db.collection('staff');
    const results = await zeroParamPromise(collection);
    res.render('manage_faculty', {data: results});
});
app.get('/edit_faculty',async(req,res) => {
    const staffEmail = req.params.id;
     const staffData = await db().collection('staff').findOne({ email: staffEmail });
    res.render('/manage_faculty', {staffData: staffData,});
});
app.post('/edit_faculty',async(req,res,next) => {
    const {
    old_email,
    email,
    dob,
    name,
    subject,
    contact,
  } = req.body;

  const password = dob.toString().split('-').join('');
  const hashedPassword = await bcrypt.hash(password, 8);

  await db().collection('staff').updateOne(
    { email: old_email },
    {
      $set: {
        st_name: name,
        dob: dob,
        subject: subject,
        email: email,
        contact: contact,
        password: hashedPassword,
      },
    }
  );
  req.flash('success_msg', 'Data modified successfully');
  res.redirect('/manage_faculty');
});
app.get('/manage_student',async(req,res,next) => {
  const results = await Student.find({});
  res.render('/manage_student', {data: results});
});
app.get('/add_students',async(req,res,next) => {
   res.render('add_students');
});
app.post('/add_students',async(req,res,next) => {
  res.redirect('manage_student');
});
app.get('/logout', async(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
   
 });
// app.get('/studentResult/:id', async (req, res)=>{
//     const studId=req.params.id;
//     const subjectId=[];
//     const studentData=await User.findById(studId);
//     for(let id of studentData.subjects){
//         subjectId.push(id);
//     }
//     console.log(subjectId);
//     let gradesArray=[];
//     for(let id of subjectId){
//         const temp=await Subject.findById(id).populate('grades.student');
//         let grades=temp.grades;
//         // console.log(grades);
//         let tempRes={};
//         let flag=false;
//         for(let grade of grades){
//             if(grade.student._id==studId){
//                 tempRes={subject:id,grade:grade.grade};
//                 flag=true;
//                 break;
//             }
//         }
//         if(flag)
//         gradesArray.push(tempRes);
//     }
//     console.log(gradesArray);
//     const result=new Result({cgpa: 9.94,grades:gradesArray,student:studId});
//     await result.save();
//     res.send("fuck");
// })

app.get('/studentResult/:id',async(req,res) => {
    const studId=req.params.id;
    const result=await Result.findOne({student:studId}).populate('grades.subject');
    console.log(result);
    const subjectsWithGrades = result.grades.map(grade => {
            const subjectGrade = grade.grade;
             const subjectName = grade.subject.name;
              
             return { name: subjectName, grade: subjectGrade };
           });
              
              
         const cgpa=result.cgpa;
                  
         res.render('studentResult',{studId,subjectsWithGrades,cgpa});
})
app.listen(3000, ()=>console.log('listening on port'));



// 



//  app.get('/studentResult/:id',async(req,res)=>{
//     const studId=req.params.id;
//     let result = await Result.find({});
//     let studRes={};
//     let i=0;
//     for(i=0;i<result.length;i++){
//         if(result[i].student==studId){
//             studRes=result[i];
//             break;
//         }
//     }
//     if(i==result.length)res.send("No result");
//     else{
//     studRes=await studRes.populate('grades.subject');
//     const subjectsWithGrades = studRes.grades.map(grade => {
//         const subjectGrade = grade.grade;
//         const subjectName = grade.subject.name;
      
//         return { name: subjectName, grade: subjectGrade };
//       });
      
      
//     const cgpa=studRes.cgpa;
          
//     res.render('studentResult',{studId,subjectsWithGrades,cgpa});
//     }
// });
