const {check, validationResult} = require('express-validator');

      exports.validateUser = [
      check('name')
      .trim()
      .escape()
      .not()
      .isEmpty()
      .withMessage('User name can not be empty!')
      .bail()
      .isLength({min: 3})
      .withMessage('Minimum 3 characters required!')
      .bail(),
      check('email')
      .trim()
      .normalizeEmail()
      .not()
      .isEmpty()
      .withMessage('Invalid email address!')
      .bail(),
      (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty())
      return res.status(422).json({errors: errors.array()});
      next();
      },
      ];


// exports.validateProduct = () => [
//       check('name')
//       .trim()
//       .escape()
//       .not()
//       .isEmpty()
//       .withMessage("Name field cannot be empty"),
//       (req, res, next) => {
//             const errors = validationResult(req);

//             if(!errors.isEmpty()) return res.json({ errors: errors.array()}); //This could be re-written as below

//               if(!errors.isEmpty()) {
//                const errorsMessages = errors.array().map((error) => error.msg);
//                return res.status(400).json(errorsMessages);
      //}
//             next();
//       }
// ]
