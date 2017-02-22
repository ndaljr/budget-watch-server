import db from '../models';
import validator from 'validator';
import isEmpty from 'lodash/isEmpty';

const signupController = {};

function validateInput(data){
    const { username, password, passwordConfirm, email } = data;
    const errors = {};
    if(validator.isEmpty(username)){
        errors.username = 'username is required';
    }
    if(username.length < 5 ){
        errors.username = 'username should be a minimum length of 5 characters';
    }
    if(password.length < 8){
        errors.password = 'password should be a minimum length of 8 characters';
    }
    if(passwordConfirm.length < 8){
        errors.passwordConfirm = 'username should be a minimum length of 8 characters';
    }
    if(validator.isEmpty(password)){
        errors.password = 'password is required';
    }
    if(validator.isEmpty(passwordConfirm)){
        errors.passwordConfirm = 'password is required';
    }
    if(!validator.equals(password,passwordConfirm)){
        errors.password = 'passwords must match';
        errors.passwordConfirm = 'passwords must match';
    }
    if(!validator.isEmail(email)){
        errors.email = 'must be a valid email address';
    }
    return db.User.find({$or:[{ username: username }, { email: email }]}).then(user =>{
        if(user.length > 0){
            user = user[0];
            if(user.username === username ){
                errors.username = 'user exists';
            }        
            if(user.email === email){
                errors.email = 'email exists';
            }
        } 
        return {
            isValid: isEmpty(errors),
            errors
        }; 
    });
}

signupController.post = function(req,res){
    validateInput(req.body).then(({errors, isValid})=>{
        const { username, password, email } = req.body;
        if(isValid){
            const user = new db.User({
                username: username,
                email: email,
                // use bcrypt here
                password: password
            });
            user.save().then(newUser =>{
                console.log(newUser);
                res.json({
                    sucess: true,
                    user: newUser
                });
            }).catch(err =>{
                res.status(500).json({
                    error: err
                });
            });
        } else {
            res.json({ errors });
        }
    }).catch(err => {
        res.status(500).json({
            error: err
        });
    });

};

export default signupController;