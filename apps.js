
require('dotenv').config();
const express = require('express');
const app = express();
const ejs = require('ejs');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const moment = require('moment');
const Grid = require('gridfs-stream');
const { Readable } = require('stream');
const multer = require('multer');

const corsOptions = {
    origin: 'http://localhost:3001/', // Replace with your React application's domain
    methods: 'GET,POST', // Allow only specified methods
    allowedHeaders: 'Content-Type,Authorization', // Allow only specified headers
    credentials: true // Allow credentials (cookies, authorization headers)
};

app.set('views', path.join(__dirname, 'views'));

app.use(express.static("public"));
app.use(express.static("src"));
app.use(express.static("views"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Methods", "*"); // Replace "*" with allowed methods
    next();
});
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Headers", "*"); // Customize as needed
    next();
});


app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/qwertDB');
const conn = mongoose.connection;

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
});

const projectSchema = new mongoose.Schema({
    mentorName: String,
    mentorEmail: String,
    mentorContact: Number,
    mentorExper: String,
    projName: String,
    projId: Number,
    projDesc: String,
    teamSize: Number,
    member1: String,
    member1Email: String,
    member1Contact: Number,
    member1Exper: String,
    member2: String,
    member2Email: String,
    member2Contact: Number,
    member2Exper: String,
    member3: String,
    member3Email: String,
    member3Contact: Number,
    member3Exper: String,
    FormattedDate1: String,
})

const infoSchema = new mongoose.Schema({
    name: String,
    branch: String,
    gender: String,
    bio: String,
    experience: String,
    persEmail: String,
    github: String,
    linkedin: String,
    work: [{
        workTitle: String,
        workContent: String,
    }],
    skills: [{ skill: String }],
})

const completeSchema = new mongoose.Schema({
    _id: String,
    mentorName: String,
    mentorEmail: String,
    mentorContact: Number,
    mentorExper: String,
    projName: String,
    projId: Number,
    projDesc: String,
    teamSize: Number,
    member1: String,
    member1Email: String,
    member1Contact: Number,
    member1Exper: String,
    member2: String,
    member2Email: String,
    member2Contact: Number,
    member2Exper: String,
    member3: String,
    member3Email: String,
    member3Contact: Number,
    member3Exper: String,
    FormattedDate1: String,
    remarks: String,
})

const videoSchema = new mongoose.Schema({
    parentId: String,
    fieldname: String,
    originalname: String,
    encoding: String,
    mimetype: String,
    destination: String,
    filename: String,
    path: String,
    size: Number
})

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

const Project = new mongoose.model("Project", projectSchema);

const Info = new mongoose.model("Info", infoSchema);

const Complete = new mongoose.model("Complete", completeSchema);

const Video = new mongoose.model("Video", videoSchema);


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        const uniqueSiffix = Date.now();
        return cb(null, uniqueSiffix + '-' + file.originalname);
    },
});

const upload1 = multer({ storage });



let gfs;
conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('videos');
});

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set('client', path.join(__dirname, 'client')); // New line
app.use(express.static(path.join(__dirname, 'client')));

app.set('TTC', path.join(__dirname, 'TTC')); // New line
app.use(express.static(path.join(__dirname, 'TTC')));
app.set('login', path.join(__dirname, 'login')); // New line
app.use(express.static(path.join(__dirname, 'login')));
app.set('FINAL', path.join(__dirname, 'FINAL')); // New line
app.use(express.static(path.join(__dirname, 'FINAL')));


function isAuthenticated(req,res,next){
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect("/login")
    }
}


app.get('/', (req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, 'TTC') })
})


app.get('/register', (req, res) => {
    
    passport.authenticate('local', { successRedirect: '/home', failureRedirect: '/login' })
    // res.render("login");
})

app.get('/login', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.log(err)
            res.render('login')
        } else {
            res.render('login')
        }
    });
})

app.get('/views/login', function (req, res, next) {
    req.logout((err) => {
        if (err) {
            console.log(err)
            res.render('login')
        } else {
            res.render('login')
        }
    });
});


app.get("/home",isAuthenticated, (req, res) => {
    res.sendFile('index2.html', { root: path.join(__dirname, 'TTC') })
})


app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const user = await User.register({ username, email }, password);
        passport.authenticate("local")(req, res, function () {
            res.redirect("/home");
        });
    } catch (err) {
        console.log(err);
        res.redirect("/register");
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (user && (await user.authenticate(password))) {
            req.login(user, (err) => {
                if (err) {
                    console.log(err);
                    res.redirect('/login');
                } else {
                    res.redirect('/home');
                }
            });
        } else {
            res.redirect('/login');
        }
    } catch (err) {
        console.log(err);
        res.redirect('/login');
    }
});

app.post('/update/:id',isAuthenticated, async (req, res) => {

    try {
        const id = req.params.id;
        // var { name, branch, bio, experience, gender, age, persEmail, github, linkedin, workTitle, workContent } = req.body;
        // const info = new Info({
        //     name: name,
        //     branch: branch,
        //     age: age,
        //     gender: gender,
        //     bio: bio,
        //     experience: experience,
        //     persEmail: persEmail,
        //     github: github,
        //     linkedin: linkedin,
        //     work:[{workTitle:workTitle,workContent:workContent}]
            
        // })
        // info.save();
        // res.redirect("/section1");

        // var { name, branch, bio, experience,Gender, Age, persEmail, github, linkedin } = req.body;

        // const updatedData = await Info.findByIdAndUpdate(id, {
        //     Name: name,
        //     Branch: branch,
        //     Bio: bio,
        //     Age: Age,
        //     Gender: Gender,
        //     Experience: experience,
        //     email: persEmail,
        //     github: github,
        //     linkedin: linkedin
        // }, { new: true });

        const updateObj = Object.fromEntries(Object.entries(req.body).filter(([key, value]) => value));

        const updatedData= await Info.findByIdAndUpdate(id,updateObj, { new: true });

        console.log('Updated document:', updatedData);
        res.redirect('/section1');
    } catch (error) {
        console.error('Error updating data in MongoDB:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.post("/submit",isAuthenticated, (req, res) => {
    var mentorName = req.body.mentor;
    var mentorEmail = req.body.mentorEmail;
    var mentorContact = req.body.mentorContact;
    var mentorExper = req.body.mentorExper;
    var projName = req.body.projName;
    var projId = req.body.projId;
    var projDesc = req.body.projDesc;
    var teamSize = req.body.teamSize;
    var member1 = req.body.member1;
    var member1Email = req.body.member1Email;
    var member1Contact = req.body.member1Contact;
    var member1Exper = req.body.member1Exper;
    var member2 = req.body.member2;
    var member2Email = req.body.member2Email;
    var member2Contact = req.body.member2Contact;
    var member2Exper = req.body.member2Exper;
    var member3 = req.body.member3;
    var member3Email = req.body.member3Email;
    var member3Contact = req.body.member3Contact;
    var member3Exper = req.body.member3Exper;
    var FormattedDate1 = moment().format('MMMM Do YYYY');
    const project = new Project({
        mentorName: mentorName,
        mentorEmail: mentorEmail,
        mentorContact: mentorContact,
        mentorExper: mentorExper,
        projName: projName,
        projId: projId,
        projDesc: projDesc,
        teamSize: teamSize,
        member1: member1,
        member1Email: member1Email,
        member1Contact: member1Contact,
        member1Exper: member1Exper,
        member2: member2,
        member2Email: member2Email,
        member2Contact: member2Contact,
        member2Exper: member2Exper,
        member3: member3,
        member3Email: member3Email,
        member3Contact: member3Contact,
        member3Exper: member3Exper,
        FormattedDate1: FormattedDate1
    })
    project.save();
    res.redirect("/section1");
})

app.get('/delete/:id',isAuthenticated, async (req, res) => {
    const id = req.params.id;
    try {
        await Project.findByIdAndDelete(id);
        console.log('Deleted document with ID ${id}');
        res.redirect('/section1');
    } catch (error) {
        console.error('Error deleting data from MongoDB:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/delete2/:id',isAuthenticated, async (req, res) => {
    const id = req.params.id;
    try {
        await Complete.findByIdAndDelete(id);
        console.log('Deleted document with ID ${id}');
        res.redirect('/section1');
    } catch (error) {
        console.error('Error deleting data from MongoDB:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/project/:id',isAuthenticated, async (req, res) => {
    const id = req.params.id;
    try {
        const project = await Project.findById(id);
        res.render('project', {
            _id: project.id,
            mentorName: project.mentorName,
            mentorEmail: project.mentorEmail,
            mentorContact: project.mentorContact,
            mentorExper: project.mentorExper,
            projName: project.projName,
            projId: project.projId,
            projDesc: project.projDesc,
            teamSize: project.teamSize,
            member1: project.member1,
            member1Email: project.member1Email,
            member1Contact: project.member1Contact,
            member1Exper: project.member1Exper,
            member2: project.member2,
            member2Email: project.member2Email,
            member2Contact: project.member2Contact,
            member2Exper: project.member2Exper,
            member3: project.member3,
            member3Email: project.member3Email,
            member3Contact: project.member3Contact,
            member3Exper: project.member3Exper,
            FormattedDate1: project.FormattedDate1
        });

    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
})

app.post('/save/:id',isAuthenticated, async (req, res) => {
    const id = req.params.id;

    var remarks = req.body.remarks;
    var FormattedDate1 = moment().format('MMMM Do YYYY');
    const project = await Project.findById(id);
    const complete = new Complete({
        _id: project.id,
        mentorName: project.mentorName,
        mentorEmail: project.mentorEmail,
        mentorContact: project.mentorContact,
        mentorExper: project.mentorExper,
        projName: project.projName,
        projId: project.projId,
        projDesc: project.projDesc,
        teamSize: project.teamSize,
        member1: project.member1,
        member1Email: project.member1Email,
        member1Contact: project.member1Contact,
        member1Exper: project.member1Exper,
        member2: project.member2,
        member2Email: project.member2Email,
        member2Contact: project.member2Contact,
        member2Exper: project.member2Exper,
        member3: project.member3,
        member3Email: project.member3Email,
        member3Contact: project.member3Contact,
        member3Exper: project.member3Exper,
        FormattedDate1: FormattedDate1,
        remarks: remarks,
    })
    complete.save();
    await Project.findByIdAndDelete(id);
    res.redirect('/section1');
})

app.get('/save2/:id',isAuthenticated, async (req, res) => {
    const id = req.params.id;
    var FormattedDate1 = moment().format('MMMM Do YYYY');
    const complete = await Complete.findById(id);
    const project = new Project({
        _id: complete.id,
        mentorName: complete.mentorName,
        mentorEmail: complete.mentorEmail,
        mentorContact: complete.mentorContact,
        mentorExper: complete.mentorExper,
        projName: complete.projName,
        projId: complete.projId,
        projDesc: complete.projDesc,
        teamSize: complete.teamSize,
        member1:complete.member1,
        member1Email: complete.member1Email,
        member1Contact: complete.member1Contact,
        member1Exper: complete.member1Exper,
        member2: complete.member2,
        member2Email: complete.member2Email,
        member2Contact: complete.member2Contact,
        member2Exper: complete.member2Exper,
        member3: complete.member3,
        member3Email: complete.member3Email,
        member3Contact: complete.member3Contact,
        member3Exper: complete.member3Exper,
        FormattedDate1: FormattedDate1,
    })
    project.save();
    await Complete.findByIdAndDelete(id);
    res.redirect('/section1');
})


app.post('/updateProj/:id',isAuthenticated, async (req, res) => {

    try {
        const id = req.params.id;
        const updateObj = Object.fromEntries(Object.entries(req.body).filter(([key, value]) => value));

        await Project.findByIdAndUpdate(id, updateObj, { new: true });

        res.redirect('/project/' + id);
    } catch (error) {
        console.error('Error updating data in MongoDB:', error);
        res.status(500).send('Internal Server Error');
    }

})

app.post('/updateCompleteProj/:id',isAuthenticated, async (req, res) => {

    try {
        const id = req.params.id;
        const updateObj = Object.fromEntries(Object.entries(req.body).filter(([key, value]) => value));

        await Complete.findByIdAndUpdate(id, updateObj, { new: true });

        res.redirect('/complete/' + id);
    } catch (error) {
        console.error('Error updating data in MongoDB:', error);
        res.status(500).send('Internal Server Error');
    }

})


app.get('/complete/:id',isAuthenticated, async (req, res) => {
    const id = req.params.id;
    try {
        const complete = await Complete.findById(id);
        const videos = await Video.find({});
        res.render('complete', {
            _id: complete.id,
            mentorName: complete.mentorName,
            mentorEmail: complete.mentorEmail,
            mentorContact: complete.mentorContact,
            mentorExper: complete.mentorExper,
            projName: complete.projName,
            projId: complete.projId,
            projDesc: complete.projDesc,
            teamSize: complete.teamSize,
            member1: complete.member1,
            member1Email: complete.member1Email,
            member1Contact: complete.member1Contact,
            member1Exper: complete.member1Exper,
            member2: complete.member2,
            member2Email: complete.member2Email,
            member2Contact: complete.member2Contact,
            member2Exper: complete.member2Exper,
            member3: complete.member3,
            member3Email: complete.member3Email,
            member3Contact: complete.member3Contact,
            member3Exper: complete.member3Exper,
            FormattedDate1: complete.FormattedDate1,
            remarks: complete.remarks, videos
        });

    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
})


app.post('/work/:id',isAuthenticated, async (req, res) => {
    const id = req.params.id;
    const work = await Info.findById(id)

    const workTitle= req.body.workTitle;
    const workContent= req.body.workContent;

    work.work.push({workTitle:workTitle,workContent:workContent});
    await work.save();

    res.redirect('/section1');
})

app.get('/deleteWork/:id',isAuthenticated, async(req,res)=>{
    const id = req.params.id;
    try {
        await Info.findOneAndUpdate(
            {},
            {$pull: {work: {_id: id}}},
            {new: true}
        );


        console.log('Deleted document with ID ${id}');
        res.redirect('/section1');
    } catch (error) {
        console.error('Error deleting data from MongoDB:', error);
        res.status(500).send('Internal Server Error');
    }
})

app.post('/saveText',isAuthenticated, async(req,res)=>{

    try {
        const inputText = req.body.mySlider;
        let skill = await Info.findOne({});
    
    skill.skills.push({skill:inputText});
    await skill.save();
    res.redirect("/section1")
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
})

app.get('/deleteText/:id',isAuthenticated,async(req,res)=>{
    const id = req.params.id;
    try {
        await Info.findOneAndUpdate(
            {},
            {$pull: {skills: {_id: id}}},
            {new: true}
        );
        console.log('Deleted document with ID ${id}');
        res.redirect('/section1');
    } catch (error) {
        console.error('Error deleting data from MongoDB:', error);
        res.status(500).send('Internal Server Error');
    }
})

app.post('/getProjects', async(req,res)=>{
    let payload =   req.body.payload.trim();
    let payload2 =   req.body.payload.trim();
    let search = await Project.find({projName: {$regex: new RegExp('^'+payload+'.*','i')}}).exec();
    let search2 = await Complete.find({projName: {$regex: new RegExp('^'+payload2+'.*','i')}}).exec();
   
    res.send({payload: search,payload2: search2});
})

app.post('/getData',isAuthenticated, async(req,res)=>{
    
    try {
        let payload =   req.body.skill;
        let skill = await Info.findOne({});
    
    skill.skills.push({skill:payload});
    await skill.save();

    const skill2 = await Info.findOne({"skills.skill":payload},{ 'skills.$': 1 });
    
    const skill3 = skill2.skills[0]._id;

    const skillId = skill3.toString();
    
    console.log(skill3);
    res.send({response:payload, _id:skillId})
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
})

app.get('/section1',isAuthenticated, cors(), async (req, res) => {
    try {
        const infos = await Info.find({});
        const projects = await Project.find({});
        const completes = await Complete.find({});

        let countProj = 0;
        let countComplete = 0;

        for(var i=0;i<projects.length;i++){
            countProj++;
        }
        for(var i=0;i<completes.length;i++){
            countComplete++;
        }

        res.render('dashboard', { infos, projects, completes ,countProj,countComplete});
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/section2',isAuthenticated, cors(), async (req, res) => {
    try {
        const infos = await Info.find({});
        const projects = await Project.find({});
        const completes = await Complete.find({});

        res.render('dashboard', { infos, projects, completes });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/dashboard',isAuthenticated, cors(), async (req, res) => {
    try {
        const infos = await Info.find({});
        const projects = await Project.find({});
        const completes = await Complete.find({});

        let countProj = 0;
        let countComplete = 0;

        for(var i=0;i<projects.length;i++){
            countProj++;
        }
        for(var i=0;i<completes.length;i++){
            countComplete++;
        }

        res.render('dashboard', { infos, projects, completes ,countProj,countComplete});
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
});



app.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            console.log(err)
            res.sendFile('index.html', { root: path.join(__dirname, 'TTC') })
        } else {
            res.sendFile('index.html', { root: path.join(__dirname, 'TTC') })
        }
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
})