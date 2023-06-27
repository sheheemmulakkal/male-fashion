const userSchema = require( '../models/userModel') 
const verificationController = require( './verificationControllers')
const bcrypt = require( 'bcryptjs' )




module.exports = {

    // Getting user login page
    getUserLogin : ( req, res ) => {

        res.render( 'auth/userLogin', {
            err: req.flash('error')
        })

    },

    // User Loging in 
    doUserLogin : async ( req, res ) => {

        try {
            userData = await userSchema.findOne( { email : req.body.email } )
            if( userData && userData.isAdmin !== 1 ) {
                // Checking is user is blocked
                    if( userData.isBlocked === false ) {
                    const password = await bcrypt.compare( req.body.password, userData.password)
                    if( password ) {
                        if( userData.isVerified ) {
                            req.session.user = userData._id
                            res.redirect( '/shop' )
                        } else {
                            const newOtp = verificationController.sendEmail(req.body.email, req.body.lastName)
                            const otpUpdate = await userSchema.updateOne({email : req.body.email},{
                                $set :{ 'token.otp' : newOtp , 'token.generatedTime' : new Date()}
                            })
                            req.session.unVerfiedMail = req.body.email
                            res.redirect( '/otp-verification')
                        }
                        // For Incorrect password
                    } else {
                        req.flash('error', 'Incorrect Password')
                        res.redirect( '/login')
                    }
                } else {
                    const password = await bcrypt.compare( req.body.password, userData.password)
                    if( password ) {
                        // If user is blocked
                        req.flash('error','Blocked user')
                        res.redirect( '/login')
                    } else {
                        // FOr incorrect password 
                        req.flash('error', 'Incorrect Password')
                        res.redirect( '/login')
                    }
                }
            } else {
                // Incorrect Username
                req.flash('error', 'Incorrect email')
                res.redirect( '/login' )
            }

        } catch ( err ) {
            console.log( err.message );
        }

    },

    // UserLogout
    doUserLogout : ( req, res ) => {

        req.session.destroy()
        res.redirect( '/login' )
    },
    

    // Getting user signup page
    getUserSignup : ( req, res ) => {

        res.render( 'auth/userSignup', {err: req.flash('userExist')})
    },

    // User Signing Up
    doUserSignup : async ( req, res ) => {

        try {

            // Checking is there any existing user
            const userData = await userSchema.findOne( {email : req.body.email} )
            
            // If existing user
            if( userData ) {

                req.flash('userExist', 'User already exist...')
                return res.redirect( '/signup' )

            } else { 

                    const otp = verificationController.sendEmail(req.body.email)    

                    const password = await bcrypt.hash( req.body.password, 12)

                    const user = new userSchema( {
                        firstName : req.body.firstName,
                        lastName : req.body.lastName,
                        email : req.body.email,
                        mobile : req.body.mobile,
                        password : password,
                        token : {
                            otp : otp,
                            generatedTime : new Date()
                        }
                    })

                const userData = await user.save()

                req.session.unVerfiedMail = req.body.email

                res.redirect( '/otp-verification' )

            }

        }catch( err ) {
            console.log(err.message);
        }
    },

    // Signup Verification

    signupVerification : async ( req,res ) => {

       try {

        const enterTime = new Date()

        // console.log(req.body);
        let { val1, val2, val3, val4, val5, val6 } = req.body
        userOtp = val1 + val2 + val3 + val4 + val5 + val6
        
        // console.log(req.session.unVerfiedMail);

        // Checking otp in database
        const otpCheck = await userSchema.findOne({email: req.session.unVerfiedMail, 'token.otp' : userOtp })

        // If Otp matched
        if( otpCheck ) { 

            //Calculating the expire of the OTP
            const timeDiff =  (new Date(enterTime) - otpCheck.token.generatedTime) / 1000 / 60
            if( timeDiff <= 60 ) {

                // If expiry time is valid setting isVerified as true
                const verify = await userSchema.updateOne({ email : otpCheck.email } , { $set : {isVerified : true} })

                req.session.user = otpCheck._id
                req.session.unVerfiedMail = null

               res.redirect('/shop')


               // If TimedOut
            } else {
                console.log('timout');
                res.redirect( '/otp-verification' )
            }

            // If not OTP in database
        } else {
            console.log('otp not matched');
            res.redirect('/otp-verification')
        }
        
       } catch (error) {
        console.log(error.messge);
       }

    },

    //Signup OTP verification page getting
    getSignupOtp : ( req, res ) => {

        res.render('auth/signup-otp')
    },

    // Getting admin login page
    getAdminLogin :  ( req, res ) => {

        res.render ( 'auth/adminLogin', {
            err : false
        })

    },

    // Admin loging in 
    doAdminLogin : async ( req, res ) => {

        try {

            const adminData = await userSchema.findOne( { email : req.body.email } )

            if( adminData && adminData.isAdmin == 1 ) {
                const password = await bcrypt.compare( req.body.password, adminData.password )

                if( password ) {

                    req.session.admin = adminData._id
                    res.redirect( '/admin' )

                } else {

                    res.render('auth/adminLogin', {
                        err : 'Incorrect Password'
                    })
                }

            } else {

                res.render( 'auth/adminLogin', {
                    err: 'Incorrect Email'
                } )
            }

        } catch ( error ) {
            console.log(error.message);
        }

    },

    doAdminLogout : ( req, res ) => {

        req.session.destroy()
        res.redirect ( '/admin/login' )
    }

}