const { users } = require('../../models'); 
const { generateAccessToken } = require('../tokenFunction/index');
const crypto = require('crypto')

module.exports = async(req, res) => {
  // TODO: 회원가입 구현
  const { name, email, password } = req.body;
  if(!name || !email || !password){
    return res.status(422).send('insufficient parameters supplied')
  }
  const userData1 = await users.findOne({ where: { email } });
  const userData2 = await users.findOne({ where: { name } });
  console.log('email', email)
  console.log('name', name)

  if(userData1 && userData2){
    return res.status(202).json({ message: '현재 이메일 및 사용자 이름을 사용하고 있습니다.' })
  }
  else if(userData1){
    res.status(202).json({
      message: '이메일 사용중입니다.'
    })
  }
  else if(userData2){
    res.status(202).json({
      message: '이름이 존재합니다.'
    })    
  }
  else{
    const createSalt = () => crypto.randomBytes(64).toString("hex");

    const createHashedPassword = (password) => {
      const salt = createSalt();

      const hashedPassword = crypto
        .pbkdf2Sync(password, salt, 1, 64, "sha512")
        .toString("hex");
      return { hashedPassword, salt };
    };

    const { hashedPassword, salt } = createHashedPassword(password);

    await users.create({
      email,
      name,
      password: hashedPassword,
      salt
    })
    .then((data) => {
      console.log('✅ data: ', data)
      delete data.dataValues.password;
      delete data.dataValues.salt;
      res.status(200).json({ message : 'ok' })
    })
  }

};



