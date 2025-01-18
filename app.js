const express =require('express');
const app= express();

const cookieParser=require('cookie-parser');
const path=require('path');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');

app.set('view engine','ejs');
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,'public')));
app.use(cookieParser());

const userModel=require('./models/user');

app.get('/',(req,res)=>{
  res.render("index");
});



app.post('/create',(req,res)=>{
  const {username,email,password,age}=req.body;

  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(password, salt, async function(err, hash) {
      if(!err){
        const user = await userModel.create({username,email,password:hash,age});
        res.render('newAccount',{message:"yes"});
      }else{
        res.render('newAccount',{message:"no"});
      }

    });
  }); 
});

app.get('/login',(req,res)=>{
  res.render('login');
})

app.post('/login',async (req,res)=>{
  let user=await userModel.findOne({email:req.body.email});
  if(!user) return res.send("something went wrong");
  bcrypt.compare(req.body.password,user.password,(err,result)=>{
    if(result){
      let token=jwt.sign({email:user.email},"secret");
      res.cookie("token",token);
      // console.log(res.cookie.token);
      res.send("You logged in");
    }
    else res.send("something is wrong");
  });
});

app.get('/logout',(req,res)=>{
  res.cookie("token","");
  console.log(res.cookie.token);
  res.redirect('/');
});
app.listen(3000);