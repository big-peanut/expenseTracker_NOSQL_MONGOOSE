const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const forgotPasswordSchema = new Schema({
    active: {
        type: Boolean,
        default: true,
    },
    expiresby: {
        type: Date,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
    },
});

const Forgotpwd = mongoose.model('Forgotpwd', forgotPasswordSchema);

module.exports = Forgotpwd;
