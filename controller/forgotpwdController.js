const uuid = require('uuid');
const Sib = require('sib-api-v3-sdk');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv')
const Users = require('../models/users');
const Forgotpassword = require('../models/forgotpwd');

dotenv.config()

const forgotpassword = async (req, res, next) => {
    try {
        const email = req.body.email;
        const user = await Users.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'No user exists', success: false });
        }

        const id = uuid.v4();

        // Instead of providing id explicitly, let Mongoose generate the ObjectId for the _id field
        const newForgotPassword = new Forgotpassword({
            active: true,
            expiresby: null,
            userId: user._id,
        });

        await newForgotPassword.save();

        const client = Sib.ApiClient.instance;
        const apiKey = client.authentications['api-key'];
        apiKey.apiKey = process.env.BREVO_API_KEY;

        const transEmailApi = new Sib.TransactionalEmailsApi();

        const sender = {
            email: 'sandeepsundarlenka22@gmail.com',
        };
        const reciever = [
            {
                email: email,
            },
        ];

        transEmailApi.sendTransacEmail({
            sender,
            to: reciever,
            subject: 'Reset password',
            textContent: 'Email sent to reset your password',
            htmlContent: `<a href="http://localhost:3000/password/resetpassword/${newForgotPassword._id}">Reset password</a>`,
        });
        res.json({});
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err, success: false });
    }
};

const resetpassword = async (req, res) => {
    try {
        const _id = req.params.id;
        console.log(_id)
        const forgotpasswordrequest = await Forgotpassword.findOne({ _id });
        console.log(forgotpasswordrequest)
        if (!forgotpasswordrequest) {
            return res.status(404).json({ message: 'Forgot password request not found', success: false });
        }

        await forgotpasswordrequest.updateOne({ active: false });
        res.status(200).send(`
            <html>
                <script>
                    function formsubmitted(e) {
                        e.preventDefault();
                        console.log('called');
                    }
                </script>

                <form action="/password/updatepassword/${_id}" method="get">
                    <label for="newpassword">Enter New password</label>
                    <input name="newpassword" type="password" required></input>
                    <button>reset password</button>
                </form>
            </html>
        `);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err, success: false });
    }
};

const updatepassword = async (req, res) => {
    try {
        const { newpassword } = req.query;
        const { resetpasswordid } = req.params;

        const resetpasswordrequest = await Forgotpassword.findOne({ _id: resetpasswordid });
        console.log(resetpasswordrequest._id)
        if (!resetpasswordrequest) {
            return res.status(404).json({ message: 'Reset password request not found', success: false });
        }

        const user = await Users.findOne({ _id: resetpasswordrequest.userId });
    
        if (!user) {
            return res.status(404).json({ message: 'No user exists', success: false });
        }

        const saltRounds = 10;
        const hash = await bcrypt.hash(newpassword, saltRounds);

        await user.updateOne({ password: hash });

        return res.status(201).json({ message: 'Successfully updated the new password', success: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err, success: false });
    }
};

module.exports = {
    forgotpassword,
    resetpassword,
    updatepassword,
};