const { users } = require('../../models');
const crypto = require("crypto");
const { generateAccessToken, sendAccessToken } = require('../tokenFunction/index');

module.exports = async (req, res) => {
  // TODO: 로그인 정보를 통해 사용자 인증 후 토큰 전달
  // console.log(req.body)
  const { email, password } = req.body    
  const makeHashedPassword = (email, password) =>
  new Promise(async (resolve, reject) => {
    const salt = await users
      .findOne({
        attributes: ["salt"],
        raw: true,
        where: {
          email,
        },
      })
      .then((result) => {
        console.log('result: ', result)
        if (!result) {
          return "";
        }
        console.log("result:", result.salt);
        return result.salt;
      });
    crypto.pbkdf2(password, salt, 1, 64, "sha512", (err, key) => {
      if (err) reject(err);
      resolve(key.toString("hex"));
    });
  });
  const hashedPassword = await makeHashedPassword(email, password);

  users
  .findOne({
    where: {
      email,
      password: hashedPassword,
    },
  })
  .then((data) => {
    if (!data) {
      return res.status(202).json({ message: "invalid token" });
    } else {
      delete data.dataValues.password;
      delete data.dataValues.salt;
      const accessToken = generateAccessToken(data.dataValues);
      console.log(accessToken)
      sendAccessToken(res, accessToken);
      res.status(200).json({ accessToken: accessToken, message: "ok" });
    }
  })
  // .catch((err) => {
  //   return res.status(500).send("Interner server Error");
  // });

};
