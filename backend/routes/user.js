const express = require('express');
const router  = express.Router();
const User = require('../models/User');
const QRCode = require('../models/QRCode');
const ConnectedDevice = require('../models/ConnectedDevice');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QR = require('qrcode');
const user_jwt = require('../middleware/user_jwt');

router.get('/', user_jwt, async(req, res, next) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        
        if(!user){
            return res.status(400).json({
                success: false,
                msg: 'User not exists go & register to continue.'
            });
        }

        return res.status(200).json({
            success: true,
            user: user
        });

    } catch(err){
        console.log(err.message);
        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
        next();
    }   
});

router.post('/register', async(req, res, next) =>{
    const {userName, email, password} = req.body;

    try{
        // Validate user input
        if (!(userName && email && password)) {
            return res.status(400).json({
                success: false,
                msg: 'All input is required'
            });
        }

        // Check if the user already exist in database
        let user_exist = await User.findOne({email: email});
        
        if(user_exist){
            return res.json({
                success: false,
                msg: 'User already exist'
            });
        }

        let user = new User();
        
        user.userName = userName;
        user.email = email;

        // Encrypt user password
        const salt = await bcryptjs.genSalt(10);
        user.password = await bcryptjs.hash(password, salt);
        
        await user.save();
        
        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, process.env.jwtUserSecret, {
            expiresIn: 360000
        }, (err, token) => {
            if(err){
                throw err;
            } 

            // return new user
            return res.status(200).json({
                success: true,
                token: token
            });
        });
    } catch(err){
        console.log(err.message);

        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
        next();
    }
});

router.post('/login', async(req, res, next) => {
    const {email, password} = req.body;

    try{
        // Validate user input
        if (!(email && password)) {
            return res.status(400).json({
                success: false,
                msg: 'All input is required'
            });
        }

        // Validate if user exist in our database
        let user = await User.findOne({email: email});
      
        if(!user){
            return res.status(400).json({
                success: false,
                msg: 'User not exists go & register to continue.'
            });
        }

        let isMatch = await bcryptjs.compare(password, user.password);
        
        if(!isMatch){
            return res.status(400).json({
                success: false,
                msg: 'Invalid Password'
            });
        }

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, process.env.jwtUserSecret, {
            expiresIn: 360000
        }, (err, token) => {
            if(err){
                throw err;
            } 
            
            return res.status(200).json({
                success: true,
                msg: 'User logged in',
                token: token,
                user: user
            });
        });
    } catch(err){
        console.log(err.message);

        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
        next();
    }
});

router.post("/qr/generate", async (req, res, next) => {
    try {
        const { userId } = req.body;

        // Validate user input
        if (!userId) {
            return res.status(400).json({
                success: false,
                msg: 'User Id is required'
            });
        }
  
        const user = await User.findById(userId);
    
        // Validate is user exist
        if (!user) {
            return res.status(400).json({
                success: false,
                msg: 'User not found'
            });
        }
  
        const qrExist = await QRCode.findOne({ userId });
    
        // If qr exist, update disable to true and then create a new qr record
        if (!qrExist) {
            await QRCode.create({ userId });
        } else {
            await QRCode.findOneAndUpdate({ userId }, { $set: { disabled: true } });
            await QRCode.create({ userId });
        }
  
        const payload = {
            user: {
                id: user.id,
                email: user.email
            }
        }

        jwt.sign(payload, process.env.jwtUserSecret, {
            expiresIn: 360000
        }, (err, encryptedData) => {
            if(err){
                throw err;
            } 

            // Generate QR Code
            QR.toDataURL(encryptedData, (qrCodeError, dataImage) => {
                if(qrCodeError){
                    throw qrCodeError;
                } 

                // Return QR Code
                return res.status(200).json({
                    success: true,
                    msg: 'QR Code Generated',
                    dataImage: dataImage
                });
            });
        });
    } catch (err) {
        console.log(err.message);

        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
        next();
    }
}); 

router.post("/qr/scan", async (req, res) => {
    try {
      const { token, deviceInformation } = req.body;
      console.log("token: " + token);
      console.log("deviceInformation: " + deviceInformation);
      
      if (!token && !deviceInformation) {
        return res.status(400).json({
            success: false,
            msg: 'Token and deviceInformation is required'
        });
      }
                                                                      
      const decoded = jwt.verify(token, process.env.jwtUserSecret);
      console.log("decoded: " + decoded);
      console.log("user id: " + decoded.userId);

      const qrCode = await QRCode.findOne({
        userId: decoded.userId,
        disabled: false,
      });

      console.log("qrCode: " + qrCode);
  
      if (!qrCode) {
        res.status(400).send("QR Code not found");
      }
  
      const connectedDeviceData = {
        userId: decoded.userId,
        qrCodeId: qrCode._id,
        deviceName: deviceInformation.deviceName,
        deviceModel: deviceInformation.deviceModel,
        deviceOS: deviceInformation.deviceOS,
        deviceVersion: deviceInformation.deviceVersion,
      };
  
      const connectedDevice = await ConnectedDevice.create(connectedDeviceData);
  
      // Update qr code
      await QRCode.findOneAndUpdate(
        { _id: qrCode._id },
        {
          isActive: true,
          connectedDeviceId: connectedDevice._id,
          lastUsedDate: new Date(),
        }
      );
  
      // Find user
      const user = await User.findById(decoded.userId);
  
      // Create token
      const authToken = jwt.sign({ user_id: user._id }, process.env.jwtUserSecret, {
        expiresIn: "2h",
      });
  
      // Return token
      return res.status(200).json({ token: authToken });
    } catch (err) {
      console.log(err);
    }
});  

module.exports = router;