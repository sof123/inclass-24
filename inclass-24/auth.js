var redis = requires('redis').createClient(process.env.REDIS_URL)

module.exports = app => {
     app.get('/:user?', index)
     app.put('/headline', putHeadline)
     app.get('/headlines/:user?', getHeadlineUser)
     app.get('/email/:user?', getEmailUser)
     app.put('/email', putEmail)
     app.post('/login', login)
     app.post('/register', register)
}



var database = []

var sid = []




function login(req, res){
  var username = req.body.username;
  var password = req.body.password;
  if (!username || !password){
    res.sendStatus(400)
    return
  }
  var userObj = getUser(username)
  //compare with salt
  if (!userObj || md5(userObj.password.concat(userObj.salt)) !== md5(password.concat(userObj.salt))){
    res.sendStatus(401)
    return
  }

  //save cookie
  res.cookie(cookieKey, generateCode(userObj),
    {maxAge: 3600*1000, httpOnly: true})

  //map sid to user
  var msg = {username: username, result: 'sucess'}
  sid.push(username)
  redis.himset(sid.length-1, userObj)

  res.send(msg)
  redis.hgetall(sid, function(err, userObj){
	console.log(sid + ' mapped to ' + userObj)
})
}

function getUser(username){
  for (var i = 0; i < database.length;i++){
    if (database[i].username == username){
      return database[i]
    }
  }
  return {}
}

function generateCode(obj)
{
  return 12345
}

function register(req, res){
  var username = req.body.username;
  var password = req.body.password;
  var salt = "thesaltthesaltsaltysalt"

  database.push({username: username, salt: salt, hash: md5(password.concat(salt))})



  var userObj = {username: username, password: password}


  res.cookie(cookieKey, generateCode(userObj),
    {maxAge: 3600*1000, httpOnly: true})

  var msg = {username: username, result: 'sucess'}
  res.send(msg)
}