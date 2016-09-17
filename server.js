var express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    path = require('path'),
    bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, './static')));
app.set("views", path.join(__dirname, "./views"));
app.set("view engine", "ejs");
mongoose.connect("mongodb://localhost/messsage_board");
var Schema = mongoose.Schema;

// creating the Post model
var PostSchema = new mongoose.Schema({
  name: {type:String, required: true, minlength:4},
  message: {type:String, required: true},
  comments: [{type: Schema.Types.ObjectId, ref:'Comment'}]
}, {timestamps: true});
mongoose.model("Post", PostSchema);
var Post = mongoose.model("Post");

// Creating the Comment Schema
var CommentSchema = new mongoose.Schema({
  _post: {type: Schema.Types.ObjectId, ref:'Post'},
  name: {type: String, required:true, minlength:1},
  comment: {type: String, required: true, maxlength:250}
}, {timestamps: true});
mongoose.model("Comment",CommentSchema);
var Comment = mongoose.model("Comment");


// Render the index page and show the posts
app.get('/', function(req, res){
  Post.find({})
    .populate('comments')
    .exec(function(eer, posts){
    if(eer){
      console.log("Post all Error", eer);
    } else{
      console.log("+++++++ Postsing all post", posts);
      res.render('index', {posts: posts});
    }
  });
});



//Create a new POST
app.post('/message', function(req, res){
  console.log(req.body);
  var post = new Post({name:req.body.name, message: req.body.message});
  post.save(function(err){
    if(err){
      console.log(err, "===Something went wrong====");
    } else
    console.log("===========Successful entry ==========");
  });
  res.redirect("/");
});
// Comment on a post
app.post("/comment/:id", function(req, res){
  Post.findOne({_id: req.params.id}, function(err,post){
    console.log(post);
    if(err){
      console.log("error in finding Post");
    }else{
      var comment = new Comment(req.body);
      //set the reference
      console.log(comment);
      comment._post = post._id;
      post.comments.push(comment);
      comment.save(function(err){
        if(!err){
          post.save(function(err){
            if(err) {
              console.log("Error at Post.Save");
            }else{
              res.redirect("/");
            }
          });
        console.log("error on Comment.save");
        }
      });
    }
  });
});

app.listen(8000, function(){
  console.log("listenning on port 8000");
});
