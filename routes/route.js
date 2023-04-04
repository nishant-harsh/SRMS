const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('home');
  });
router.get('/adminLogin',async(req, res,next)=>{
    res.render('adminLogin');
});
router.post("/adminLogin",async(req, res,next)=>{
    req.flash("success","Welcome Back!!!")
    const redirectUrl=req.session.returnTo || "/adminDashboard"
    delete req.session.returnTo;
    res.redirect(redirectUrl);
});
router.get('/adminDashboard',async(req,res,next) => {
    res.render('adminDashboard');
});

router.get('/add_faculty',async(req,res) => {
    res.render('add_faculty');
});
router.post('/add_faculty' ,async(req,res,next) => {
    const { email } = req.body;
    // const count = await db.collection('staff').countDocuments({ email: email });
    if (count !== 0) {
      req.flash('error', 'Staff with that email already exists');
      res.redirect('/admin/addStaff');
    } else {
      const {
        dob,
        name,
        subject,
        contact,
      } = req.body;
  
      if (contact.length > 11) {
        req.flash('error', 'Enter a valid phone number');
        return res.redirect('/admin/addStaff');
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
      // await db.collection('staff').insertOne(newStaff);
      req.flash('success_msg', 'Staff added successfully');
      res.redirect('/manage_faculty');
    }
});

router.get('/manage_faculty',async(req,res,next) => {
    // const collection = db.collection('staff');
    // const results = await zeroParamPromise(collection);
    res.render('manage_faculty', {data: results});
});
router.post('/manage_faculty',async(req,res,next) => {
  const {
    old_email,
    email,
    dob,
    subject,
    name,
    contact,
  } = req.body;

  const password = dob.toString().split('-').join('');
  const hashedPassword = await hashing(password);
  const updatedStaff = {
    st_name: name,
    gender: gender,
    dob: dob,
    subject: subject,
    email: email,
    contact: contact,
    password: hashedPassword,
  };
  // const result = await db.collection('staff').updateOne(
  //   { email: old_email },
  //   { $set: updatedStaff }
  // );

  if (result.modifiedCount === 1) {
    req.flash('success_msg', 'Staff added successfully');
    res.redirect('/manage_faculty');
  } else {
    next(new Error('No records were modified'));
  }
});

router.get('/edit_faculty',async(req,res) => {
    const staffEmail = req.params.id;
    // const staffData = await db().collection('staff').findOne({ email: staffEmail });
    res.render('/manage_faculty', 
    // {staffData: staffData, page_name: 'Staff Settings',}
    );
});
router.post('/edit_faculty',async(req,res) => {
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

  // await db().collection('staff').updateOne(
  //   { email: old_email },
  //   {
  //     $set: {
  //       st_name: name,
  //       dob: dob,
  //       subject: subject,
  //       email: email,
  //       contact: contact,
  //       password: hashedPassword,
  //     },
  //   }
  // );
  req.flash('success_msg', 'Staff added successfully');
  res.redirect('/manage_faculty');
});

router.get('/professorLogin',async(req, res,next)=>{
  res.render('professorLogin');
});
router.post("/professorLogin",async(req, res,next)=>{
  req.flash("success","Welcome Back!!!")
  const redirectUrl=req.session.returnTo || "/professorDashboard"
  delete req.session.returnTo;
  res.redirect(redirectUrl);
});

router.get('/professorDashboard',async(req,res,next) => {
    res.render('professorDashboard');
});

router.get('/manage_student',async(req,res,next) => {
  res.render('manage_student');
});

router.get('/add_students',async(req,res,next) => {
   res.render('add_students');
});
router.post('/add_students',async(req,res,next) => {
  res.redirect('manage_student');
});

module.exports = router;

