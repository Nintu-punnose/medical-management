var express = require('express');
var router = express.Router();

const bcrypt = require('bcrypt');
const {User,Medicine} = require('../models/medModel');



const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userEmail) {
    return next();
  }
  res.redirect('/login');
};


router.get('/register', function(req, res) {
  res.render('Register',{error:[]});
});


router.get("/login",function(req,res){
  res.render("Login",{error:[]})
})



router.post("/createuser",function(req,res){
  const{name,email,password} = req.body;

  User.findOne({email}).then(email=>{
    if(email){
      res.render("Register",{error:"email already exist"})
    }
    return bcrypt.hash(password,10)
  }).then(hashpassword=>{
     
    const user = new User({
      name,
      email,
      password:hashpassword
    })  
    
    user.save().then(()=>{
      res.redirect("Login")
    })
  })
})


router.post("/login",function(req,res){
  const{email,password} = req.body

  console.log("email "+email)
  console.log("password "+password)

  let user

  User.findOne({email}).then(email=>{
    if(!email){
      res.render("Login",{ error: "Invalid Email" })
    }
    user = email
    return bcrypt.compare(password, email.password);
  })
  .then(password=>{
    if(!password){
      res.render("Login",{ error: "Invalid Password" })
    }
    req.session.userId = user._id;
    req.session.userEmail = user.email;

    res.redirect("/index")
  })
})


router.get("/index",isAuthenticated,function(req,res){
  email = req.session.userEmail || null;
  res.render("index",{email:email,error:[]})
})



router.post("/addmedicine", function(req, res) {
  const { name, price, stock } = req.body;
  const user = req.session.userId;

  const dateInIST = new Date();
  const created_date = dateInIST.toLocaleString();

  
  const count = Medicine.countDocuments({ userId: user });

  count
    .then(count => {
      if (count >= 5) {
         return res.render("index", { error: "You can only add a maximum of 5 medicines." });
      }
      else{
          const medicine = new Medicine({
          name,
          price,
          stock,
          date: created_date,
          userId: user
        });
         return medicine.save().then(()=>{
          res.redirect('view')
         })
      }
    })
});



// router.get("/view",isAuthenticated,function(req,res){
//   userId = req.session.userId

//   const { page = 1, limit = 4 } = req.query; 

//   const options = {
//     page: parseInt(page, 10),
//     limit: parseInt(limit, 10),
//   };

  
//   Medicine.paginate({userId:userId}, options)
//   .then(result => {
//     res.render('view', { products: result.docs, pagination: result,email:req.session.userEmail });
//   })
//   .catch(error => {
//     console.error(error);
//     res.status(500).send('Internal Server Error');
//   });

  
// })


router.get("/view", async function (req, res) {
  try {
    const userId = req.session.userId;
    const { page = 1, limit = 4 } = req.query;

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    const result = await Medicine.paginate({ userId: userId }, options);

    res.render("view", {
      products: result.docs,  
      pagination: result,     
      email: req.session.userEmail, 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});




router.post("/Editmedicine",function(req,res){
  const {id,name,price,stock} = req.body;
  Medicine.findByIdAndUpdate(id,{name:name,price:price,stock:stock}).then(()=>{
    res.redirect("/view")
  })
})

router.post("/Delmedicine",function(req,res){
  const id = req.body.deleteid;
  console.log(id)
  Medicine.findByIdAndDelete(id).then(()=>{
    res.redirect("/view")
  })
})


router.get("/allmed",function(req,res){
  Medicine.find()
  .then(result => {
    res.render('allmed', { products: result});
  })
})


// Live search route
router.get("/search", function(req, res) {
  const searchQuery = req.query.name || ''; // Get search query from request
  const userId = req.session.userId;

  // Search medicines by name, case insensitive
  Medicine.find({
    userId: userId,
    name: { $regex: searchQuery, $options: 'i' } // Regex search, case-insensitive
  })
  .then(result => {
    res.json(result); // Return search results as JSON
  })
  .catch(error => {
    console.error(error);
    res.status(500).send('Internal Server Error');
  });
});


router.post("/logout",function(req,res){
  console.log(req.session.userEmail)
  req.session.destroy((err) =>{
    if (err){
      console.log(err);
      res.send('Error')

    }else{
      console.log("session destroyed sucessfully")
      res.redirect('/login')
    }
  });
})


module.exports = router;
